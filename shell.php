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
 * Returns the plugin's own empty Bento shell (asset/bento-shell.html) —
 * the same editor view.php/edit.php embed documents into. bentoconvert.js
 * splices a card's document into it for downloads and local previews, so
 * a downloaded .bento.html carries exactly the editor the activity runs.
 *
 * Contains no document data; a login is still required so this stays an
 * endpoint of the site, not a public download.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__ . '/../../config.php');

require_login();

$shellpath = __DIR__ . '/asset/bento-shell.html';
if (!is_readable($shellpath)) {
    throw new moodle_exception('shellmissing', 'mod_bento');
}

header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
// Revalidate on every use: after a plugin update the next download must
// carry the new shell, never a cached one.
header('Cache-Control: private, no-cache');
header('ETag: "' . md5_file($shellpath) . '"');
header('Content-Length: ' . filesize($shellpath));
readfile($shellpath);
die;
