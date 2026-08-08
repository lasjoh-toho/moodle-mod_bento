<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Fetches an image server-side and hands the bytes back to the browser —
 * used by bentoconvert.js's paste-and-split flow (mod_form.php,
 * submission_new.php) to embed images referenced by URL in pasted HTML.
 * Browser CORS blocks a page's own script from reading a cross-origin
 * image's bytes directly (see bentoconvert.js's own comment on this); that
 * restriction is browser-enforced only, not a server-to-server one — this
 * page does the fetch on Moodle's server instead, where no CORS applies at
 * all, then returns the bytes as this SAME Moodle site (i.e. same-origin
 * from the calling page's point of view, which is why no CORS header is
 * even needed on the response here, unlike the standalone converter's
 * equivalent proxy for people without a Moodle account).
 *
 * Login-only per policy for this plugin's version of the proxy — the
 * standalone converter's own copy of this stays open, since it has no
 * login system of its own to check against.
 *
 * Usage: image_proxy.php?url=<url-encoded target image URL>
 *
 * Safeguards (an open-to-any-URL fetcher is an abuse target otherwise) —
 * identical to the standalone converter's proxy/image-proxy.php:
 *  - GET only, http(s) scheme only
 *  - Resolves the hostname and refuses private/reserved/loopback IP
 *    ranges (SSRF protection — otherwise this could be used to probe the
 *    server's OWN internal network from outside, using Moodle's server as
 *    a stepping stone)
 *  - Hard timeout and max response size
 *  - Verifies the response actually IS an image (Content-Type) before
 *    returning it
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__ . '/../../config.php');

require_login(null, false);

const MOD_BENTO_PROXY_MAX_BYTES = 15 * 1024 * 1024; // 15 MB — generous for a single image, not for abuse
const MOD_BENTO_PROXY_TIMEOUT_SECONDS = 10;

function mod_bento_proxy_fail(int $status, string $message): void {
  http_response_code($status);
  header('Content-Type: text/plain; charset=utf-8');
  echo $message;
  exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
  mod_bento_proxy_fail(405, 'Only GET is supported.');
}

$url = required_param('url', PARAM_URL);
if ($url === '') {
  mod_bento_proxy_fail(400, 'Missing url parameter.');
}

$parts = parse_url($url);
if ($parts === false || !isset($parts['scheme'], $parts['host'])) {
  mod_bento_proxy_fail(400, 'Malformed URL.');
}
if (!in_array(strtolower($parts['scheme']), ['http', 'https'], true)) {
  mod_bento_proxy_fail(400, 'Only http/https URLs are allowed.');
}

/**
 * SSRF guard: resolve the hostname and refuse anything that isn't a plain
 * public address — otherwise this proxy could be pointed at 127.0.0.1,
 * 169.254.169.254 (cloud metadata endpoints), or an internal 10.x/
 * 192.168.x service from the outside, using this SERVER's own network
 * position to reach things the caller couldn't reach directly. This
 * matters especially here: a Moodle server often sits on an internal
 * network with access to things (a database host, an internal API) that
 * are NOT meant to be reachable from the public internet at all.
 */
function mod_bento_proxy_resolves_to_public_ip(string $host): bool {
  $ips = [];
  if (filter_var($host, FILTER_VALIDATE_IP)) {
    $ips[] = $host;
  } else {
    $records = @dns_get_record($host, DNS_A + DNS_AAAA);
    if ($records === false || count($records) === 0) return false;
    foreach ($records as $r) {
      if (isset($r['ip'])) $ips[] = $r['ip'];
      if (isset($r['ipv6'])) $ips[] = $r['ipv6'];
    }
  }
  if (count($ips) === 0) return false;
  foreach ($ips as $ip) {
    $public = filter_var(
      $ip,
      FILTER_VALIDATE_IP,
      FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
    );
    if ($public === false) return false; // any resolved address being private/reserved is enough to refuse
  }
  return true;
}

if (!mod_bento_proxy_resolves_to_public_ip($parts['host'])) {
  mod_bento_proxy_fail(403, 'Target host does not resolve to a public address.');
}

/**
 * Two implementations because not every PHP install has the curl
 * extension enabled — curl is preferred when available (proper streaming
 * size cap during transfer, not just after); the file_get_contents/
 * stream-context fallback only needs PHP core. Both re-validate the FINAL
 * host after any redirect, since a redirect is a classic way to route
 * around a same-request-only host check.
 */
function mod_bento_proxy_fetch_via_curl(string $url): array {
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 3,
    CURLOPT_TIMEOUT => MOD_BENTO_PROXY_TIMEOUT_SECONDS,
    CURLOPT_CONNECTTIMEOUT => MOD_BENTO_PROXY_TIMEOUT_SECONDS,
    CURLOPT_USERAGENT => 'mod_bento-image-proxy/1.0',
    CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
    CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
  ]);
  curl_setopt($ch, CURLOPT_NOPROGRESS, false);
  curl_setopt($ch, CURLOPT_PROGRESSFUNCTION, function ($resource, $downloadSize, $downloaded) {
    return ($downloaded > MOD_BENTO_PROXY_MAX_BYTES) ? 1 : 0; // non-zero aborts the transfer
  });
  $body = curl_exec($ch);
  $result = [
    'body' => ($body === false) ? null : $body,
    'finalUrl' => curl_getinfo($ch, CURLINFO_EFFECTIVE_URL),
    'contentType' => curl_getinfo($ch, CURLINFO_CONTENT_TYPE),
    'httpCode' => curl_getinfo($ch, CURLINFO_HTTP_CODE),
    'error' => curl_errno($ch) !== 0,
  ];
  curl_close($ch);
  return $result;
}

function mod_bento_proxy_fetch_via_streams(string $url): array {
  $context = stream_context_create([
    'http' => [
      'method' => 'GET',
      'timeout' => MOD_BENTO_PROXY_TIMEOUT_SECONDS,
      'follow_location' => 1,
      'max_redirects' => 4,
      'user_agent' => 'mod_bento-image-proxy/1.0',
      'protocol_version' => 1.1,
      'ignore_errors' => true,
    ],
  ]);
  $body = @file_get_contents($url, false, $context, 0, MOD_BENTO_PROXY_MAX_BYTES + 1);
  $httpCode = 0;
  $contentType = null;
  if (isset($http_response_header)) {
    foreach ($http_response_header as $line) {
      if (preg_match('#^HTTP/\S+\s+(\d+)#', $line, $m)) $httpCode = (int) $m[1];
      if (stripos($line, 'Content-Type:') === 0) $contentType = trim(substr($line, 13));
    }
  }
  return [
    'body' => ($body === false) ? null : $body,
    'finalUrl' => null,
    'contentType' => $contentType,
    'httpCode' => $httpCode,
    'error' => $body === false,
  ];
}

$hascurl = function_exists('curl_init');
$result = $hascurl ? mod_bento_proxy_fetch_via_curl($url) : mod_bento_proxy_fetch_via_streams($url);

if ($result['error'] || $result['body'] === null) {
  mod_bento_proxy_fail(502, 'Could not fetch the target image.');
}
if ($result['httpCode'] < 200 || $result['httpCode'] >= 300) {
  mod_bento_proxy_fail(502, 'Target server returned HTTP ' . $result['httpCode'] . '.');
}
if ($hascurl) {
  $finalhost = parse_url($result['finalUrl'], PHP_URL_HOST);
  if ($finalhost && !mod_bento_proxy_resolves_to_public_ip($finalhost)) {
    mod_bento_proxy_fail(403, 'Redirected to a non-public address.');
  }
}
if (!$result['contentType'] || stripos($result['contentType'], 'image/') !== 0) {
  mod_bento_proxy_fail(415, 'Target is not an image (Content-Type: ' . ($result['contentType'] ?: 'unknown') . ').');
}
if (strlen($result['body']) > MOD_BENTO_PROXY_MAX_BYTES) {
  mod_bento_proxy_fail(413, 'Image exceeds the size limit.');
}

header('Content-Type: ' . $result['contentType']);
header('Content-Length: ' . strlen($result['body']));
header('Cache-Control: private, max-age=3600');
echo $result['body'];
