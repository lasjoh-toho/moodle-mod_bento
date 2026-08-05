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
 * Manual grading — a plain table, one row per enrolled student. There is no
 * auto-score for a presentation, so this is the whole grading UI (reachable
 * from the activity's settings/gear menu, "Bewerten").
 *
 * Entering or changing a grade NEVER makes it visible to the student by
 * itself — every grade starts (or stays) a draft, tracked by
 * bento_grades.published, until the separate "Veröffentlichen" action next
 * to that row is clicked. Under the hood this still pushes straight into
 * the real Moodle gradebook on every save (so grade history, exports, and
 * everything else that reads grade_grade sees it) — it's that specific
 * student's OWN grade_grade row that stays hidden until published, via
 * bento_set_grade_visibility() in lib.php. The grade_item itself (shared by
 * the whole class) is never hidden — only individual students' own grades.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/lib.php');
require_once($CFG->libdir . '/gradelib.php');

$id = required_param('id', PARAM_INT);

$cm = get_coursemodule_from_id('bento', $id, 0, false, MUST_EXIST);
$course = get_course($cm->course);
$bento = $DB->get_record('bento', ['id' => $cm->instance], '*', MUST_EXIST);

require_login($course, true, $cm);
$context = context_module::instance($cm->id);
bento_require_current_schema();
require_capability('mod/bento:grade', $context);

$PAGE->set_url('/mod/bento/grade.php', ['id' => $cm->id]);
$PAGE->set_title(format_string($bento->name) . ' — ' . get_string('gradepresentation', 'mod_bento'));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($context);
$PAGE->set_cm($cm, $course);
$PAGE->set_pagelayout('incourse');

$gradevalue = (int) $bento->grade;
$ungraded = $gradevalue === 0;
$isscale = $gradevalue < 0;

if ($ungraded) {
    echo $OUTPUT->header();
    echo $OUTPUT->heading(format_string($bento->name));
    echo $OUTPUT->notification(get_string('nogradetype', 'mod_bento'), 'info');
    echo $OUTPUT->continue_button(new moodle_url('/mod/bento/view.php', ['id' => $cm->id]));
    echo $OUTPUT->footer();
    exit;
}

if ($isscale) {
    // This simple panel only has a plain numeric input, meaningful for
    // point grading — scale-based grading (a negative `grade` value, per
    // Moodle's own convention) uses the standard gradebook's own grading
    // interface instead, which already knows how to render the chosen
    // scale's labels.
    echo $OUTPUT->header();
    echo $OUTPUT->heading(format_string($bento->name));
    echo $OUTPUT->notification(get_string('scalegradenotsupported', 'mod_bento'), 'info');
    $gradebookurl = new moodle_url('/grade/report/grader/index.php', ['id' => $course->id]);
    echo $OUTPUT->continue_button($gradebookurl);
    echo $OUTPUT->footer();
    exit;
}

// ---- quick publish/un-publish toggle — separate from the grade-entry form below ----
$toggleid = optional_param('publishtoggle', 0, PARAM_INT);
if ($toggleid) {
    require_sesskey();
    $existing = $DB->get_record('bento_grades', ['bentoid' => $bento->id, 'userid' => $toggleid]);
    if ($existing) {
        $existing->published = $existing->published ? 0 : 1;
        $existing->timemodified = time();
        $DB->update_record('bento_grades', $existing);
        bento_set_grade_visibility($bento, $toggleid, (bool) $existing->published);
    }
    redirect(new moodle_url('/mod/bento/grade.php', ['id' => $cm->id]));
}

// ---- handle grade/feedback form submission ----
if ($data = data_submitted()) {
    require_sesskey();

    $grademax = max(1, (int) $bento->grade);
    $now = time();
    foreach ($data as $key => $value) {
        if (strpos($key, 'grade_') !== 0) {
            continue;
        }
        $userid = (int) substr($key, strlen('grade_'));
        if (!$userid) {
            continue;
        }
        $value = trim((string) $value);
        $existing = $DB->get_record('bento_grades', ['bentoid' => $bento->id, 'userid' => $userid]);
        if ($value === '') {
            if ($existing) {
                $DB->delete_records('bento_grades', ['id' => $existing->id]);
            }
            continue;
        }
        $grade = (float) str_replace(',', '.', $value);
        $grade = max(0, min($grademax, $grade));
        $feedback = trim((string) ($data->{'feedback_' . $userid} ?? ''));

        $record = (object) [
            'bentoid' => $bento->id,
            'userid' => $userid,
            'grader' => $USER->id,
            'grade' => $grade,
            'feedback' => $feedback,
            // Entering/changing a grade never publishes it by itself —
            // a brand-new grade starts as a draft (published=0); an
            // EXISTING grade's own publish state carries over untouched,
            // whatever it already was, so correcting a typo in an
            // already-published mark doesn't silently re-hide it.
            'published' => $existing->published ?? 0,
            'timemodified' => $now,
        ];
        if ($existing) {
            $record->id = $existing->id;
            $DB->update_record('bento_grades', $record);
        } else {
            $DB->insert_record('bento_grades', $record);
        }
    }
    bento_update_grades($bento);
    redirect(
        new moodle_url('/mod/bento/grade.php', ['id' => $cm->id]),
        get_string('gradessaved', 'mod_bento'),
        null,
        \core\output\notification::NOTIFY_SUCCESS
    );
}

// ---- render ----
echo $OUTPUT->header();
echo $OUTPUT->heading(format_string($bento->name) . ' — ' . get_string('gradepresentation', 'mod_bento'));
echo $OUTPUT->notification(get_string('draftgradeexplainer', 'mod_bento'), 'info');

$users = get_enrolled_users($context, 'mod/bento:view', 0, 'u.*', 'u.lastname, u.firstname');
$existinggrades = $DB->get_records('bento_grades', ['bentoid' => $bento->id], '', 'userid, grade, feedback, published');
$submissions = $bento->allowstudentsubmissions
    ? $DB->get_records('bento_submissions', ['bentoid' => $bento->id], '', 'userid, id, timecreated, timemodified')
    : [];

echo html_writer::start_tag('form', ['method' => 'post', 'action' => new moodle_url('/mod/bento/grade.php', ['id' => $cm->id])]);
echo html_writer::empty_tag('input', ['type' => 'hidden', 'name' => 'sesskey', 'value' => sesskey()]);

$table = new html_table();
$head = [get_string('fullname')];
if ($bento->allowstudentsubmissions) {
    $head[] = get_string('mypresentation', 'mod_bento');
}
$head[] = get_string('grade', 'grades') . ' (' . get_string('maxgrade', 'grades') . ': ' . (int) $bento->grade . ')';
$head[] = get_string('feedback');
$head[] = get_string('visibility', 'mod_bento');
$table->head = $head;
$table->attributes['class'] = 'generaltable';

foreach ($users as $u) {
    $existing = $existinggrades[$u->id] ?? null;
    $gradeval = $existing->grade ?? '';
    $feedbackval = $existing->feedback ?? '';
    $published = (bool) ($existing->published ?? false);

    $row = [fullname($u)];

    if ($bento->allowstudentsubmissions) {
        if (isset($submissions[$u->id])) {
            $sub = $submissions[$u->id];
            $link = html_writer::link(
                new moodle_url('/mod/bento/submission.php', ['id' => $cm->id, 'submissionid' => $sub->id]),
                get_string('present', 'mod_bento'),
                ['class' => 'btn btn-sm btn-outline-primary']
            );
            $dates = html_writer::tag('div',
                get_string('lastmodified', 'mod_bento') . ': ' . userdate($sub->timemodified),
                ['class' => 'text-muted small mt-1']
            );
            $cell = $link . $dates;
            if ($existing && $existing->timemodified < $sub->timemodified) {
                $cell .= html_writer::tag('div', get_string('gradebeforeeditwarning', 'mod_bento'),
                    ['class' => 'text-warning small mt-1']);
            }
            $row[] = $cell;
        } else {
            $row[] = html_writer::tag('span', get_string('nosubmission', 'mod_bento'), ['class' => 'text-muted']);
        }
    }

    $gradeinput = html_writer::empty_tag('input', [
        'type' => 'number', 'step' => '0.01', 'min' => '0', 'max' => (int) $bento->grade,
        'name' => 'grade_' . $u->id, 'value' => $gradeval, 'style' => 'width:6em',
    ]);
    $row[] = $gradeinput;

    $feedbackinput = html_writer::empty_tag('input', [
        'type' => 'text', 'name' => 'feedback_' . $u->id, 'value' => s($feedbackval), 'style' => 'width:100%',
    ]);
    $row[] = $feedbackinput;

    if ($existing) {
        $badge = html_writer::tag('span', get_string($published ? 'gradepublished' : 'gradedraft', 'mod_bento'),
            ['class' => 'badge ' . ($published ? 'badge-success' : 'badge-secondary')]);
        $toggleurl = new moodle_url('/mod/bento/grade.php', [
            'id' => $cm->id, 'publishtoggle' => $u->id, 'sesskey' => sesskey(),
        ]);
        $togglebutton = html_writer::link($toggleurl, get_string($published ? 'unpublish' : 'publish', 'mod_bento'),
            ['class' => 'btn btn-sm ml-1 ' . ($published ? 'btn-outline-secondary' : 'btn-success')]);
        $row[] = $badge . ' ' . $togglebutton;
    } else {
        $row[] = '';
    }

    $table->data[] = $row;
}

echo html_writer::table($table);
echo html_writer::empty_tag('input', ['type' => 'submit', 'class' => 'btn btn-primary', 'value' => get_string('savechanges')]);
echo html_writer::end_tag('form');

if (empty($users)) {
    echo $OUTPUT->notification(get_string('nostudents', 'mod_bento'), 'info');
}

echo $OUTPUT->footer();
