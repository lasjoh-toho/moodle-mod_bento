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
 * Approve/un-approve individual student submissions — only meaningful (and
 * only reachable) when bento.submissionvisibility is 'moderated'; in 'auto'
 * mode every submission is already visible to every student and there's
 * nothing here to moderate.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/lib.php');

$id = required_param('id', PARAM_INT);

$cm = get_coursemodule_from_id('bento', $id, 0, false, MUST_EXIST);
$course = get_course($cm->course);
$bento = $DB->get_record('bento', ['id' => $cm->instance], '*', MUST_EXIST);

require_login($course, true, $cm);
$context = context_module::instance($cm->id);
bento_require_current_schema();
require_capability('mod/bento:moderatesubmissions', $context);

if (!$bento->allowstudentsubmissions) {
    throw new moodle_exception('submissionsnotenabled', 'mod_bento');
}

$PAGE->set_url('/mod/bento/moderate.php', ['id' => $cm->id]);
$PAGE->set_title(format_string($bento->name) . ' — ' . get_string('moderatesubmissions', 'mod_bento'));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($context);
$PAGE->set_cm($cm, $course);
$PAGE->set_pagelayout('incourse');

$toggleid = optional_param('toggle', 0, PARAM_INT);
if ($toggleid) {
    require_sesskey();
    $submission = $DB->get_record('bento_submissions', ['id' => $toggleid, 'bentoid' => $bento->id], '*', MUST_EXIST);
    $submission->status = $submission->status === 'approved' ? 'pending' : 'approved';
    $submission->timemodified = time();
    $DB->update_record('bento_submissions', $submission);
    redirect(new moodle_url('/mod/bento/moderate.php', ['id' => $cm->id]));
}

echo $OUTPUT->header();
echo $OUTPUT->heading(format_string($bento->name) . ' — ' . get_string('moderatesubmissions', 'mod_bento'));

if ($bento->submissionvisibility !== 'moderated') {
    echo $OUTPUT->notification(get_string('notmoderated', 'mod_bento'), 'info');
    echo $OUTPUT->footer();
    exit;
}

$submissions = $DB->get_records_sql(
    "SELECT s.*, u.firstname, u.lastname
       FROM {bento_submissions} s
       JOIN {user} u ON u.id = s.userid
      WHERE s.bentoid = :bentoid
   ORDER BY u.lastname, u.firstname",
    ['bentoid' => $bento->id]
);

if (empty($submissions)) {
    echo $OUTPUT->notification(get_string('nosubmissionsyet', 'mod_bento'), 'info');
    echo $OUTPUT->footer();
    exit;
}

$table = new html_table();
$table->head = [get_string('fullname'), get_string('status'), '', get_string('lastmodified', 'mod_bento')];
$table->attributes['class'] = 'generaltable';

foreach ($submissions as $s) {
    $approved = $s->status === 'approved';
    $badge = html_writer::tag('span', get_string($approved ? 'statusapproved' : 'statuspending', 'mod_bento'),
        ['class' => 'badge ' . ($approved ? 'badge-success' : 'badge-warning')]);
    $toggleurl = new moodle_url('/mod/bento/moderate.php', ['id' => $cm->id, 'toggle' => $s->id, 'sesskey' => sesskey()]);
    $togglebutton = html_writer::link($toggleurl, get_string($approved ? 'unapprove' : 'approve', 'mod_bento'),
        ['class' => 'btn btn-sm ' . ($approved ? 'btn-outline-secondary' : 'btn-success')]);
    $presenturl = new moodle_url('/mod/bento/submission.php', ['id' => $cm->id, 'submissionid' => $s->id]);
    $presentlink = html_writer::link($presenturl, get_string('present', 'mod_bento'), ['class' => 'btn btn-sm btn-outline-primary ml-1']);

    $table->data[] = [
        fullname($s),
        $badge,
        $togglebutton . $presentlink,
        userdate($s->timemodified),
    ];
}

echo html_writer::table($table);
echo $OUTPUT->footer();
