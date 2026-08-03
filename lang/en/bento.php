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
 * English language strings for mod_bento.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$string['modulename'] = 'Bento presentation';
$string['modulenameplural'] = 'Bento presentations';
$string['modulename_help'] = 'A Bento presentation is a self-contained slide deck students open directly in presentation mode. Teachers can start from a PowerPoint import (converted entirely in the browser) or a blank deck, then edit slide-by-slide in the full Bento editor.';
$string['pluginname'] = 'Bento presentation';
$string['pluginadministration'] = 'Bento presentation administration';

$string['bentoname'] = 'Name';
$string['bentoname_help'] = 'The name shown for this activity on the course page.';
$string['initialcontent'] = 'Presentation';
$string['document'] = 'Document (internal)';
$string['droppptxhere'] = 'Drop a .pptx file here';
$string['droppptxsub'] = 'Converted entirely in your browser — several files can be dropped and connected with ✚, same as the standalone converter. Drag to reorder first if order matters. Leave as-is to keep what\'s already saved.';
$string['editusehint'] = 'Use "Edit presentation" in this activity\'s settings menu for slide-by-slide changes — dropping a file here instead merges it with what\'s already saved.';

$string['editpresentation'] = 'Edit presentation';
$string['gradepresentation'] = 'Grade';
$string['backtoview'] = 'Back to presentation';
$string['savetomoodle'] = '💾 Save to Moodle';
$string['saving'] = 'Saving…';
$string['saved'] = '✓ Saved';

$string['nogradetype'] = 'Grading is turned off for this activity — set a maximum grade in its settings to grade students.';
$string['scalegradenotsupported'] = 'This activity is set to scale-based grading. This simple panel only handles point grading — use the course gradebook\'s own grading screen for scales.';
$string['gradessaved'] = 'Grades saved.';
$string['nostudents'] = 'No students are enrolled with access to this activity yet.';
$string['nobento'] = 'There are no Bento presentations in this course yet.';
$string['shellmissing'] = 'The bundled Bento application file is missing from this plugin install.';

$string['bento:addinstance'] = 'Add a new Bento presentation';
$string['bento:view'] = 'View a Bento presentation';
$string['bento:edit'] = 'Edit a Bento presentation\'s slides';
$string['bento:grade'] = 'Grade a Bento presentation';

$string['privacy:metadata'] = 'The Bento presentation plugin itself stores no personal data — the presentation document is shared content for the whole activity, not per-student. Manually-entered grades ARE personal data, but they live in this plugin\'s own bento_grades table, declared separately below.';
$string['privacy:metadata:bento_grades'] = 'A manually-entered grade (and optional short feedback note) for one student on one Bento presentation activity.';
$string['privacy:metadata:bento_grades:userid'] = 'The student the grade belongs to.';
$string['privacy:metadata:bento_grades:grade'] = 'The grade entered by the teacher.';
$string['privacy:metadata:bento_grades:feedback'] = 'Optional short feedback note entered by the teacher.';
$string['privacy:metadata:bento_grades:timemodified'] = 'When the grade was last changed.';

$string['eventcoursemoduleviewed'] = 'Bento presentation viewed';
