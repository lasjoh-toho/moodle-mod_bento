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
$string['visibility'] = 'Visibility';
$string['gradepublished'] = 'Published';
$string['gradedraft'] = 'Draft';
$string['publish'] = 'Publish';
$string['unpublish'] = 'Un-publish';
$string['draftgradeexplainer'] = 'An entered grade starts as a draft and is invisible to the student. Only clicking "Publish" makes it visible in the gradebook.';

$string['studentsubmissions'] = 'Student presentations';
$string['allowstudentsubmissions'] = 'Students create their own presentations';
$string['allowstudentsubmissions_help'] = 'When enabled, each student creates (or imports) their own Bento presentation within this activity and can only ever edit that one, own presentation. When disabled (default), the activity works as before: a single presentation the teacher creates, shared by everyone.';
$string['submissionvisibility'] = 'Visibility to other students';
$string['submissionvisibility_help'] = 'Controls whether students can automatically see other students\' presentations, or whether a teacher must approve each one first. Every student can always see and edit their own presentation regardless of this setting.';
$string['submissionvisibility_auto'] = 'Automatic — everyone sees every submitted presentation';
$string['submissionvisibility_moderated'] = 'Only visible once approved by a teacher';
$string['mypresentation'] = 'My presentation';
$string['editmypresentation'] = 'Edit my presentation';
$string['presentmypresentation'] = 'Present my presentation';
$string['createmypresentation'] = 'Create my presentation';
$string['nosubmissionyet'] = 'You haven\'t created your own presentation here yet.';
$string['classmatepresentations'] = 'Other students\' presentations';
$string['nosubmissionsvisible'] = 'No other students\' presentations are currently visible to you.';
$string['nosubmissionsyet'] = 'No presentations have been submitted yet.';
$string['present'] = 'View';
$string['statusapproved'] = 'Approved';
$string['statuspending'] = 'Awaiting approval';
$string['approve'] = 'Approve';
$string['unapprove'] = 'Un-approve';
$string['moderatesubmissions'] = 'Approve submissions';
$string['notmoderated'] = 'This activity is set to automatic visibility — there\'s nothing to approve here, every submitted presentation is already visible to everyone.';
$string['lastmodified'] = 'Last modified';
$string['created'] = 'Created';
$string['submissionsnotenabled'] = 'Student presentations aren\'t enabled for this activity.';
$string['submissionnotvisible'] = 'This presentation isn\'t visible to you (yet).';
$string['schemaoutofdate'] = 'The installed Bento plugin files (version {$a->code}) are newer than the database (last upgraded to version {$a->installed}). This happens when the plugin files were updated but the matching database upgrade hasn\'t run yet. As an administrator, please visit "Site administration → Notifications" to complete it.';

$string['bento:addinstance'] = 'Add a new Bento presentation';
$string['bento:view'] = 'View a Bento presentation';
$string['bento:edit'] = 'Edit a Bento presentation\'s slides';
$string['bento:grade'] = 'Grade a Bento presentation';
$string['bento:submit'] = 'Create and edit one\'s own Bento presentation';
$string['bento:viewallsubmissions'] = 'View every submitted presentation, regardless of approval';
$string['bento:moderatesubmissions'] = 'Approve submitted presentations';

$string['privacy:metadata'] = 'The teacher\'s own shared presentation document (table bento) is activity content, not personal data. What IS personal data: manually-entered grades (bento_grades) and — once student presentations are enabled — each student\'s own created presentation (bento_submissions), both declared separately below.';
$string['privacy:metadata:bento_grades'] = 'A manually-entered grade (and optional short feedback note) for one student on one Bento presentation activity.';
$string['privacy:metadata:bento_grades:userid'] = 'The student the grade belongs to.';
$string['privacy:metadata:bento_grades:grade'] = 'The grade entered by the teacher.';
$string['privacy:metadata:bento_grades:feedback'] = 'Optional short feedback note entered by the teacher.';
$string['privacy:metadata:bento_grades:published'] = 'Whether the grade is currently visible (published) to the student, or still hidden as a draft.';
$string['privacy:metadata:bento_grades:timemodified'] = 'When the grade was last changed.';
$string['privacy:metadata:bento_submissions'] = 'A student\'s own Bento presentation created within this activity.';
$string['privacy:metadata:bento_submissions:userid'] = 'The student this presentation belongs to.';
$string['privacy:metadata:bento_submissions:document'] = 'The content of the student\'s created presentation.';
$string['privacy:metadata:bento_submissions:status'] = 'Whether the presentation has been approved for other students to see.';
$string['privacy:metadata:bento_submissions:timecreated'] = 'When the presentation was created.';
$string['privacy:metadata:bento_submissions:timemodified'] = 'When the presentation was last modified.';
$string['privacy:gradesubcontext'] = 'Grade';
$string['privacy:submissionsubcontext'] = 'My presentation';

$string['eventcoursemoduleviewed'] = 'Bento presentation viewed';
