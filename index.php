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
 * Standard "list all instances of this activity in the course" page.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/lib.php');

$courseid = required_param('id', PARAM_INT);
$course = get_course($courseid);

require_course_login($course);
$context = context_course::instance($course->id);

$PAGE->set_url('/mod/bento/index.php', ['id' => $courseid]);
$PAGE->set_title(format_string($course->shortname) . ': ' . get_string('modulenameplural', 'mod_bento'));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($context);
$PAGE->set_pagelayout('incourse');

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('modulenameplural', 'mod_bento'));

$instances = get_all_instances_in_course('bento', $course);

if (empty($instances)) {
    notice(get_string('nobento', 'mod_bento'), new moodle_url('/course/view.php', ['id' => $course->id]));
    echo $OUTPUT->footer();
    exit;
}

$table = new html_table();
$table->head = [get_string('name')];
$table->attributes['class'] = 'generaltable mod_index';

foreach ($instances as $inst) {
    $link = html_writer::link(
        new moodle_url('/mod/bento/view.php', ['id' => $inst->coursemodule]),
        format_string($inst->name),
        $inst->visible ? [] : ['class' => 'dimmed']
    );
    $table->data[] = [$link];
}

echo html_writer::table($table);
echo $OUTPUT->footer();
