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
 * Opens a bento instance straight into present mode.
 *
 * Deliberately NOT a normal themed Moodle page — the Bento app is a complete
 * standalone HTML document (same file the standalone editor/converter tools
 * in this project produce), and nesting a full <html> document inside a
 * theme's own <html> would just be broken markup. So this bypasses
 * $OUTPUT->header()/footer() entirely and outputs the app directly, the same
 * way the plain .bento.html file does when opened from disk. Editing (for
 * those with the capability) is a separate page — see edit.php, reached via
 * this activity's settings/gear menu (lib.php's bento_extend_settings_navigation()).
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/lib.php');

$id = required_param('id', PARAM_INT); // course module id

$cm = get_coursemodule_from_id('bento', $id, 0, false, MUST_EXIST);
$course = get_course($cm->course);
$bento = $DB->get_record('bento', ['id' => $cm->instance], '*', MUST_EXIST);

require_login($course, true, $cm);
$context = context_module::instance($cm->id);
require_capability('mod/bento:view', $context);

bento_view($bento, $course, $cm, $context);

$shellpath = __DIR__ . '/asset/bento-shell.html';
$shell = file_get_contents($shellpath);
if ($shell === false) {
    throw new moodle_exception('shellmissing', 'mod_bento');
}

$jsonforembed = str_replace('<', '\u003c', $bento->document);

$html = preg_replace(
    '/(<script[^>]*id=["\']bento-doc["\'][^>]*>)([\s\S]*?)(<\/script>)/',
    '$1' . str_replace('$', '\\$', $jsonforembed) . '$3',
    $shell,
    1
);

// Auto-launch present mode (main.ts already supports this — it checks
// location.hash === '#present' once its bundle runs) and set the tab title.
// Injected right after <head> so it runs as early as possible, well before
// the (much larger) app bundle further down parses.
$title = format_string($bento->name);
$bootstrap = '<script>location.hash = "present"; document.title = ' . json_encode($title) . ';</script>';
$html = preg_replace('/<head[^>]*>/', '$0' . str_replace('$', '\\$', $bootstrap), $html, 1);

header('Content-Type: text/html; charset=utf-8');
header('X-Frame-Options: SAMEORIGIN');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
echo $html;
die;
