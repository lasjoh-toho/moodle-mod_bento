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
$string['droppptxhere'] = 'Import presentation';
$string['droppptxsub'] = 'Allowed file types: .pptx, .json (bento/slides), .html/.bento.html. Converted entirely in your browser — several files can be dropped and connected with ✚, same as the standalone converter. Drag to reorder first if order matters. Leave as-is to keep what\'s already saved.';
$string['pastetile'] = 'Distribute content across slides';
$string['pastetilesub'] = 'Split content you copied from, say, a Word document across several slides.';
$string['newtile'] = 'New: Blank presentation';
$string['newparttile'] = 'New empty part';
$string['playbacksectionheading'] = 'Available presentation elements';
$string['newtilesub'] = 'Starts with a single blank slide';
$string['playtile'] = 'Chained presentations playback';
$string['playtilesub'] = 'Shows the currently visible presentation';
$string['edittile'] = 'Edit';
$string['edittilesub'] = 'Opens the presentation in the editor';
$string['demotile'] = 'Demo/Tutorial';
$string['demotilesub'] = 'See how effects are made, and try things out with no consequences.';
$string['pastestep1title'] = 'Paste text';
$string['pastestep1desc'] = 'Copy text from a webpage or a PDF, then paste it here with Ctrl+V (Cmd+V on a Mac). Images in the copied content are carried over — this Moodle-integrated version fetches them through your own site (no cross-origin restriction, unlike the standalone converter).';
$string['pastecatcherplaceholder'] = 'Click here and paste…';
$string['pastestep2title'] = 'Edit text';
$string['pastestep2desc'] = 'Place the cursor anywhere in the text — a small menu above the caret lets you end a slide or switch between slide content and companion text, starting exactly there. Nothing was detected automatically. The pasted content becomes slides that can then be added to the presentation.';
$string['pasteviewtoggle'] = 'Slide view';
$string['pastectxendslide'] = '▪ End slide here';
$string['pastectxtogglemode'] = '↕ Switch slide/companion text';
$string['pastegeneratebtn'] = 'Create materials';

$string['editpresentation'] = 'Edit presentation';
$string['managepresentation'] = 'Import/Edit/Distribute/Configure visibility';
$string['moresettings'] = 'More settings';
$string['nopresentationvisible'] = 'No presentation is currently available.';
$string['gradepresentation'] = 'Grade';
$string['backtoview'] = 'Back to presentation';
$string['backtogallery'] = 'Back to overview';
$string['backtocourse'] = 'Back to course';
$string['backtoactivitysettings'] = 'Back to activity settings';
$string['backtomanage'] = 'Back to Distribute/Import';
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
$string['duedate'] = 'Due date';
$string['duedate_help'] = 'From this point on, a student can no longer edit or save their own presentation — it stays viewable but becomes read-only. Never affects the teacher. Leave the "Enable" checkbox unticked for no deadline.';
$string['duedatevisible'] = 'Due date visible';
$string['duedatevisible_help'] = 'Whether the due date itself is shown to students on the gallery page (independent of the deadline being enforced either way).';
$string['duedateinfo'] = 'Due date: {$a}';
$string['duedatepassedinfo'] = 'The due date ({$a}) has passed — presentations are now read-only.';
$string['deadlinepassed'] = 'The due date for this activity has passed — changes can no longer be saved.';
$string['deadlinepassednotice'] = 'Due date ({$a}) has passed — view only, no longer editable.';
$string['gradebeforeeditwarning'] = '⚠ Presentation was edited again after this grade was given.';
$string['mypresentation'] = 'My presentation';
$string['editmypresentation'] = 'Edit my presentation';
$string['presentmypresentation'] = 'Present my presentation';
$string['draftlabel'] = 'Draft: {$a}';
$string['untitleddraft'] = 'Untitled draft';
$string['presentmasterpresentation'] = 'View presentation';
$string['createmypresentation'] = 'Create my presentation';
$string['nosubmissionyet'] = 'You haven\'t created your own presentation here yet.';
$string['nosubmission'] = 'No presentation created yet.';
$string['classmatepresentations'] = 'Other students\' presentations';
$string['addassubmissiontile'] = 'Add as tile';
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
$string['bento:usebentoproxy'] = 'Allows using the proxy to bring in images from web content pasted into presentations via copy-paste, together with their source citations. Bypasses browser cross-origin (CORS) restrictions to do so. Only takes effect while the image proxy is also enabled in this plugin\'s own settings.';

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

$string['settings_imageproxyenabled'] = 'Enable image proxy';
$string['settings_imageproxyenabled_desc'] = 'Allows fetching images from pasted webpage content through the Moodle server itself (bypasses the cross-origin restriction a specific website\'s own server would otherwise enforce against a direct browser fetch). Only takes effect together with the "mod/bento:usebentoproxy" capability — both have to allow it for a person to actually be able to use the proxy. Which roles hold that capability is set under Site administration → Users → Permissions → Define roles (filter for "usebentoproxy"). Disabled by default.';
$string['settings_termsofuse'] = 'Terms of use';
$string['settings_termsofuse_desc'] = 'When set, everyone must agree to this text (on its own page, before Bento itself is shown) before using it for the first time. Leave empty to skip the agreement step entirely. Changing this text later asks everyone to agree again.';
$string['settings_absolutemaxdocumentsize'] = 'Absolute maximum presentation size (MB)';
$string['settings_absolutemaxdocumentsize_desc'] = 'A hard, site-wide ceiling in megabytes — no single activity\'s own "Maximum document size" setting can exceed this, whatever is entered there. Refers to the presentation\'s actual JSON size (images, charts, etc. included), not the file on disk. Large, image-heavy presentations need correspondingly high values.';
$string['settings_savetimeout'] = 'Save timeout (seconds)';
$string['settings_savetimeout_desc'] = 'How long the editor waits for a response from Moodle before reporting the save as failed, rather than waiting indefinitely with no feedback. Larger presentations or a slower server may need a higher value.';
$string['settings_imagemaxdim'] = 'Maximum image edge length (pixels)';
$string['settings_imagemaxdim_desc'] = 'Images whose longer edge exceeds this are automatically downscaled on insert, before being embedded into the presentation.';
$string['settings_imagequality'] = 'Image quality when auto-downscaling (%)';
$string['settings_imagequality_desc'] = 'JPEG quality (1-100) used to re-encode downscaled images. Higher values mean better quality at a larger file size.';
$string['agreetermstitle'] = 'Terms of use';
$string['agreetermsintro'] = 'Before using Bento, please read the following terms of use and confirm that you have read and understood them.';
$string['agreetermsbutton'] = 'I have read and agree to the terms of use';
$string['agreetermsrequired'] = 'You must agree to the terms of use to continue.';
$string['loginonly'] = 'Visible to logged-in members only';
$string['loginonly_help'] = 'When enabled, this presentation is only visible to logged-in course members — even if the course itself allows guest access. Students\' own submitted presentations are always logged-in-only regardless of this setting, independently of it.';
$string['allowstudentpaste'] = 'Allow "Distribute content across slides" for students';
$string['allowstudentpaste_help'] = 'Allows students to paste content copied from websites or documents in while creating their own presentation. Disabled by default — copy-paste is tempting enough as a shortcut that this should be an explicit opt-in, rather than turned on automatically alongside student submissions in general. Best suited to a case where students have already worked with digital material of their own that their presentation is meant to build on.';
$string['maxdocumentsize'] = 'Maximum document size (MB)';
$string['maxdocumentsize_help'] = 'Size ceiling for this activity — refers to the presentation\'s actual size (images, charts, etc. included), not the file on disk. Applies to the teacher\'s own presentation and to student submissions, unless a separate limit is set for those below. Can only be set lower than the site-wide absolute ceiling, never higher.';
$string['maxdocumentsize_toosmall'] = 'Must be at least 1 MB.';
$string['maxdocumentsize_exceedsabsolute'] = 'Cannot exceed the site-wide absolute ceiling of {$a} MB.';
$string['maxstudentdocumentsize'] = 'Maximum document size for student submissions (MB)';
$string['maxstudentdocumentsize_help'] = 'A separate size ceiling specifically for student submissions. Leave empty or 0 to use "Maximum document size" above instead. Can only be set lower than the site-wide absolute ceiling, never higher.';
$string['guestaccessdenied'] = 'This presentation is only visible to logged-in course members.';
