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
 * Two entirely different pages depending on bento->allowstudentsubmissions:
 *
 *  - OFF (classic v1 behaviour): opens straight into present mode for the
 *    single teacher-authored deck — unchanged from before, see the raw-
 *    full-page approach comment further down.
 *  - ON: a normal themed Moodle page listing "my presentation" (create/
 *    import/edit) plus every classmate's submission this user is currently
 *    ALLOWED to see (bento_visible_submissions() in lib.php already applies
 *    the auto/moderated rule) — each opens in present mode via
 *    submission.php, the per-submission equivalent of what this file used
 *    to always do for the one shared document.
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
bento_require_current_schema();
require_capability('mod/bento:view', $context);

bento_view($bento, $course, $cm, $context);

if (!$bento->allowstudentsubmissions) {
    // ---- classic single-document present mode (v1 behaviour) ----
    $shellpath = __DIR__ . '/asset/bento-shell.html';
    $shell = file_get_contents($shellpath);
    if ($shell === false) {
        throw new moodle_exception('shellmissing', 'mod_bento');
    }

    // Whoever can edit this document gets the FULL live editor directly —
    // that's deliberate, not a leftover gap: opening the activity and being
    // able to edit+save right there (no separate "Edit" page detour) is the
    // whole point of Bento over e.g. a PowerPoint file in Moodle. Read-only
    // is only forced for everyone who canNOT edit it — a student in classic
    // (non-submission) mode — so exiting present mode there can't drop into
    // a live editor with no Moodle save wiring (see submission.php for the
    // full reasoning on that half).
    $caneditmaster = has_capability('mod/bento:edit', $context);
    if (!$caneditmaster) {
        $decoded = json_decode($bento->document, true);
        if (is_array($decoded)) {
            $decoded['readonly'] = true;
            $bento->document = json_encode($decoded);
        }
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
    // the (much larger) app bundle further down parses. The moodle-config
    // meta tag (editable viewers only) goes in the same spot.
    $title = format_string($bento->name);
    $bootstrap = '<script>location.hash = "present"; document.title = ' . json_encode($title) . ';</script>';
    $headinject = $caneditmaster ? bento_moodle_config_meta((int) $cm->id) . $bootstrap : $bootstrap;
    $html = preg_replace('/<head[^>]*>/', '$0' . str_replace('$', '\\$', $headinject), $html, 1);

    header('Content-Type: text/html; charset=utf-8');
    header('X-Frame-Options: SAMEORIGIN');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    echo $html;
    die;
}

// ---- student-submission mode: a normal themed gallery page ----
$PAGE->set_url('/mod/bento/view.php', ['id' => $cm->id]);
$PAGE->set_title(format_string($bento->name));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($context);
$PAGE->set_cm($cm, $course);
$PAGE->set_pagelayout('incourse');

$cansubmit = has_capability('mod/bento:submit', $context);
$viewall = has_capability('mod/bento:viewallsubmissions', $context);
$mine = bento_get_submission($bento->id, $USER->id);
$submissions = bento_visible_submissions($bento, $USER->id, $viewall);

echo $OUTPUT->header();
echo $OUTPUT->heading(format_string($bento->name));
if ($bento->intro) {
    echo $OUTPUT->box(format_module_intro('bento', $bento, $cm->id), 'generalbox mod_introbox');
}

if ($cansubmit) {
    echo html_writer::start_div('mod-bento-mine card mb-4');
    echo html_writer::start_div('card-body');
    echo html_writer::tag('h5', get_string('mypresentation', 'mod_bento'), ['class' => 'card-title']);
    if ($mine) {
        if ($bento->submissionvisibility === 'moderated') {
            $statusstr = $mine->status === 'approved'
                ? get_string('statusapproved', 'mod_bento')
                : get_string('statuspending', 'mod_bento');
            $badgeclass = $mine->status === 'approved' ? 'badge-success' : 'badge-warning';
            echo html_writer::tag('span', $statusstr, ['class' => 'badge ' . $badgeclass . ' mb-2']);
            echo html_writer::empty_tag('br');
        }
        echo html_writer::link(
            new moodle_url('/mod/bento/edit.php', ['id' => $cm->id]),
            get_string('editmypresentation', 'mod_bento'),
            ['class' => 'btn btn-primary mr-2']
        );
        echo html_writer::link(
            new moodle_url('/mod/bento/submission.php', ['id' => $cm->id, 'submissionid' => $mine->id]),
            get_string('presentmypresentation', 'mod_bento'),
            ['class' => 'btn btn-secondary']
        );
    } else {
        echo html_writer::tag('p', get_string('nosubmissionyet', 'mod_bento'), ['class' => 'text-muted']);
        echo html_writer::link(
            new moodle_url('/mod/bento/submission_new.php', ['id' => $cm->id]),
            get_string('createmypresentation', 'mod_bento'),
            ['class' => 'btn btn-primary']
        );
    }
    echo html_writer::end_div();
    echo html_writer::end_div();
}

$others = array_filter($submissions, fn($s) => (int) $s->userid !== (int) $USER->id);
echo $OUTPUT->heading(get_string('classmatepresentations', 'mod_bento'), 4);
if (empty($others)) {
    echo $OUTPUT->notification(get_string('nosubmissionsvisible', 'mod_bento'), 'info');
} else {
    echo html_writer::start_tag('div', ['class' => 'mod-bento-gallery row']);
    foreach ($others as $s) {
        $name = fullname($s);
        $pendingbadge = '';
        if ($bento->submissionvisibility === 'moderated' && $s->status !== 'approved' && $viewall) {
            // Only a moderator (viewall) sees this at all here — everyone
            // else's query already excluded non-approved classmates.
            $pendingbadge = html_writer::tag('span', get_string('statuspending', 'mod_bento'), ['class' => 'badge badge-warning ml-2']);
        }
        echo html_writer::start_tag('div', ['class' => 'col-md-4 mb-3']);
        echo html_writer::start_div('card h-100');
        echo html_writer::start_div('card-body');
        echo html_writer::tag('h6', s($name) . $pendingbadge, ['class' => 'card-title']);
        echo html_writer::link(
            new moodle_url('/mod/bento/submission.php', ['id' => $cm->id, 'submissionid' => $s->id]),
            get_string('present', 'mod_bento'),
            ['class' => 'btn btn-sm btn-outline-primary']
        );
        echo html_writer::end_div();
        echo html_writer::end_div();
        echo html_writer::end_tag('div');
    }
    echo html_writer::end_tag('div');
}

echo $OUTPUT->footer();
