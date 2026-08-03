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
 * from the activity's settings/gear menu, "Bewerten"); grades entered here
 * are pushed straight into the course gradebook.
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

// ---- handle submission ----
if ($data = data_submitted()) {
    require_sesskey();
    require_capability('mod/bento:grade', $context);

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
        if ($value === '') {
            $DB->delete_records('bento_grades', ['bentoid' => $bento->id, 'userid' => $userid]);
            continue;
        }
        $grade = (float) str_replace(',', '.', $value);
        $grade = max(0, min($grademax, $grade));
        $feedback = trim((string) ($data->{'feedback_' . $userid} ?? ''));

        $existing = $DB->get_record('bento_grades', ['bentoid' => $bento->id, 'userid' => $userid]);
        $record = (object) [
            'bentoid' => $bento->id,
            'userid' => $userid,
            'grader' => $USER->id,
            'grade' => $grade,
            'feedback' => $feedback,
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

$users = get_enrolled_users($context, 'mod/bento:view', 0, 'u.*', 'u.lastname, u.firstname');
$existinggrades = $DB->get_records_menu('bento_grades', ['bentoid' => $bento->id], '', 'userid, grade');
$existingfeedback = $DB->get_records_menu('bento_grades', ['bentoid' => $bento->id], '', 'userid, feedback');

echo html_writer::start_tag('form', ['method' => 'post', 'action' => new moodle_url('/mod/bento/grade.php', ['id' => $cm->id])]);
echo html_writer::empty_tag('input', ['type' => 'hidden', 'name' => 'sesskey', 'value' => sesskey()]);

$table = new html_table();
$table->head = [
    get_string('fullname'),
    get_string('grade') . ' (' . get_string('maxgrade', 'grades') . ': ' . (int) $bento->grade . ')',
    get_string('feedback'),
];
$table->attributes['class'] = 'generaltable';

foreach ($users as $u) {
    $gradeval = $existinggrades[$u->id] ?? '';
    $feedbackval = $existingfeedback[$u->id] ?? '';
    $gradeinput = html_writer::empty_tag('input', [
        'type' => 'number', 'step' => '0.01', 'min' => '0', 'max' => (int) $bento->grade,
        'name' => 'grade_' . $u->id, 'value' => $gradeval, 'style' => 'width:6em',
    ]);
    $feedbackinput = html_writer::empty_tag('input', [
        'type' => 'text', 'name' => 'feedback_' . $u->id, 'value' => s($feedbackval), 'style' => 'width:100%',
    ]);
    $table->data[] = [fullname($u), $gradeinput, $feedbackinput];
}

echo html_writer::table($table);
echo html_writer::empty_tag('input', ['type' => 'submit', 'class' => 'btn btn-primary', 'value' => get_string('savechanges')]);
echo html_writer::end_tag('form');

if (empty($users)) {
    echo $OUTPUT->notification(get_string('nostudents', 'mod_bento'), 'info');
}

echo $OUTPUT->footer();
