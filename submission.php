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
 * Present-mode viewer for ONE student's submission — the per-submission
 * equivalent of what view.php always did for the single shared document
 * before student submissions existed. Same raw-full-page approach (see
 * view.php's own comment for why).
 *
 * Access: the submission's own owner always gets in; anyone else needs
 * mod/bento:viewallsubmissions (teachers) OR the instance's
 * submissionvisibility to be 'auto' AND the submission's status to be
 * 'approved' if it's 'moderated'.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/lib.php');

$id = required_param('id', PARAM_INT); // course module id
$submissionid = required_param('submissionid', PARAM_INT);

$cm = get_coursemodule_from_id('bento', $id, 0, false, MUST_EXIST);
$course = get_course($cm->course);
$bento = $DB->get_record('bento', ['id' => $cm->instance], '*', MUST_EXIST);

require_login($course, true, $cm);
$context = context_module::instance($cm->id);
bento_require_current_schema();
require_capability('mod/bento:view', $context);

if (!$bento->allowstudentsubmissions) {
    throw new moodle_exception('submissionsnotenabled', 'mod_bento');
}

$submission = $DB->get_record('bento_submissions', ['id' => $submissionid, 'bentoid' => $bento->id], '*', MUST_EXIST);

$isowner = (int) $submission->userid === (int) $USER->id;
$viewall = has_capability('mod/bento:viewallsubmissions', $context);
if (!$isowner && !$viewall) {
    $visibletome = $bento->submissionvisibility !== 'moderated' || $submission->status === 'approved';
    if (!$visibletome) {
        throw new moodle_exception('submissionnotvisible', 'mod_bento');
    }
}

bento_view($bento, $course, $cm, $context);

$shellpath = __DIR__ . '/asset/bento-shell.html';
$shell = file_get_contents($shellpath);
if ($shell === false) {
    throw new moodle_exception('shellmissing', 'mod_bento');
}

// Force read-only before embedding — this page is a VIEWER, reachable for
// classmates' submissions too, not just one's own. Without this, exiting
// present mode (Escape) would drop into Bento's full live editor with no
// Moodle save wiring at all (only edit.php injects that) — at best a
// confusing dead-end Save button, at worst a route to editing someone
// else's work that just silently fails to persist instead of being
// blocked outright. bento_validate_document() strips this flag for
// edit.php/the master document for the opposite reason (that one must
// always be the full editor) — this is the deliberate inverse of that.
$decoded = json_decode($submission->document, true);
if (is_array($decoded)) {
    $decoded['readonly'] = true;
    $submission->document = json_encode($decoded);
}

$jsonforembed = str_replace('<', '\u003c', $submission->document);

$html = preg_replace(
    '/(<script[^>]*id=["\']bento-doc["\'][^>]*>)([\s\S]*?)(<\/script>)/',
    '$1' . str_replace('$', '\\$', $jsonforembed) . '$3',
    $shell,
    1
);

$owneruser = $DB->get_record('user', ['id' => $submission->userid], '*', MUST_EXIST);
$title = format_string($bento->name) . ' — ' . fullname($owneruser);
$bootstrap = '<script>location.hash = "present"; document.title = ' . json_encode($title) . ';</script>';
$html = preg_replace('/<head[^>]*>/', '$0' . str_replace('$', '\\$', $bootstrap), $html, 1);

header('Content-Type: text/html; charset=utf-8');
header('X-Frame-Options: SAMEORIGIN');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
echo $html;
die;
