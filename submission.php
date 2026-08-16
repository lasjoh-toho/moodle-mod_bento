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
 * The submission's OWN owner gets the full live editor directly (edit+save
 * right there, same convenience view.php gives a teacher for the master
 * document) — anyone else viewing it (a classmate, or a teacher via
 * mod/bento:viewallsubmissions) always gets it read-only, no exceptions.
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
bento_require_not_guest(); // per policy: student submissions are always logged-in-only, regardless of course guest-access settings

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

// Only force read-only for viewers who AREN'T this submission's owner —
// this page is reachable for classmates' (or, with viewall, any student's)
// submissions too, and editing/saving into someone else's work must never
// be possible regardless of who's looking, even a teacher browsing via
// viewall. The owner themselves gets the full live editor directly instead
// (meta tag included, below) — same reasoning as view.php's teacher case:
// opening it and being able to edit+save right there, no separate "Edit"
// page detour, is the whole point of Bento over e.g. a PowerPoint file in
// Moodle. bento_validate_document() strips readonly for edit.php/the
// master document for the same reason, on the teacher's copy.
if (!$isowner) {
    $decoded = json_decode($submission->document, true);
    if (is_array($decoded)) {
        $decoded['readonly'] = true;
        $submission->document = json_encode($decoded);
    }
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
$headinject = $isowner ? bento_moodle_config_meta((int) $cm->id) . $bootstrap : $bootstrap;
$html = preg_replace('/<head[^>]*>/', '$0' . str_replace('$', '\\$', $headinject), $html, 1);

$backlink = bento_toolbar_html(new moodle_url('/mod/bento/view.php', ['id' => $cm->id]), get_string('backtogallery', 'mod_bento'), (int) $cm->id, false);
$html = preg_replace('/<body[^>]*>/', '$0' . str_replace('$', '\\$', $backlink), $html, 1);


header('Content-Type: text/html; charset=utf-8');
header('X-Frame-Options: SAMEORIGIN');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
echo $html;
die;
