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
 * "Anlegen oder importieren" for a student's own submission — the exact
 * same drag/drop/merge widget mod_form.php uses for the teacher's master
 * document (bentoconvert.js), reused here on a plain themed page instead
 * of inside an mform. Submitting creates the student's ONE submission row
 * (bento_get_or_create_submission enforces the one-per-student rule) and
 * sends them straight into the full editor (edit.php) to keep working on
 * it slide-by-slide.
 *
 * Only reachable while nothing exists for this user yet — once a
 * submission exists, view.php's own "Bearbeiten" link goes straight to
 * edit.php instead; this page redirects there itself if visited again.
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
require_capability('mod/bento:submit', $context);
bento_require_not_guest(); // per policy: student submissions are always logged-in-only, regardless of course guest-access settings
bento_require_terms_agreed(new moodle_url('/mod/bento/submission_new.php', ['id' => $id]));

if (!$bento->allowstudentsubmissions) {
    throw new moodle_exception('submissionsnotenabled', 'mod_bento');
}

$editurl = new moodle_url('/mod/bento/edit.php', ['id' => $cm->id]);

// Already have one — nothing to create, go straight to editing it.
if (bento_get_submission($bento->id, $USER->id)) {
    redirect($editurl);
}

if ($data = data_submitted()) {
    require_sesskey();
    $document = required_param('document', PARAM_RAW);
    bento_create_submission($bento->id, $USER->id, $document);
    redirect($editurl);
}

$PAGE->set_url('/mod/bento/submission_new.php', ['id' => $cm->id]);
$PAGE->set_title(format_string($bento->name) . ' — ' . get_string('createmypresentation', 'mod_bento'));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($context);
$PAGE->set_cm($cm, $course);
$PAGE->set_pagelayout('incourse');
$PAGE->requires->js(new moodle_url('/mod/bento/bentoconvert.js'));
$PAGE->requires->strings_for_js([
    'pastetile', 'pastetilesub', 'pastestep1title', 'pastestep1desc', 'pastecatcherplaceholder',
    'pastestep2title', 'pastestep2desc', 'pasteviewtoggle', 'pastectxendslide', 'pastectxtogglemode',
    'pastegeneratebtn', 'newtile', 'newtilesub', 'playtile', 'playtilesub',
], 'mod_bento');
$PAGE->requires->js(new moodle_url('/mod/bento/bentopaste.js'));

echo $OUTPUT->header();
echo $OUTPUT->heading(format_string($bento->name) . ' — ' . get_string('createmypresentation', 'mod_bento'));

echo html_writer::start_tag('form', ['method' => 'post', 'action' => new moodle_url('/mod/bento/submission_new.php', ['id' => $cm->id])]);
echo html_writer::empty_tag('input', ['type' => 'hidden', 'name' => 'sesskey', 'value' => sesskey()]);

echo '
    <div class="mod-bento-importer" id="mod-bento-importer" data-courseid="' . (int) $course->id . '">
        <p class="form-text text-muted mod-bento-edithint">' . get_string('editusehint', 'mod_bento') . '</p>
        <div class="mod-bento-tiles">
            <button type="button" class="mod-bento-tile mod-bento-tile-new" id="mod-bento-newbtn" data-hasdoc="0">
                <span class="mod-bento-tile-title" id="mod-bento-newbtn-title">' . get_string('newtile', 'mod_bento') . '</span>
                <span class="mod-bento-tile-sub" id="mod-bento-newbtn-sub">' . get_string('newtilesub', 'mod_bento') . '</span>
            </button>
            <button type="button" class="mod-bento-tile mod-bento-tile-demo" id="mod-bento-demobtn">
                <span class="mod-bento-tile-title">' . get_string('demotile', 'mod_bento') . '</span>
                <span class="mod-bento-tile-sub">' . get_string('demotilesub', 'mod_bento') . '</span>
            </button>
            <div class="mod-bento-tile mod-bento-tile-import mod-bento-drop" id="mod-bento-drop" tabindex="0">
                <span class="mod-bento-tile-title">' . get_string('droppptxhere', 'mod_bento') . '</span>
                <span class="mod-bento-tile-sub">' . get_string('droppptxsub', 'mod_bento') . '</span>
                <input type="file" id="mod-bento-file" accept=".pptx,.ppt,.json,.html,.htm" multiple style="display:none">
            </div>
            <button type="button" class="mod-bento-tile mod-bento-tile-paste" id="mod-bento-pastetile">
                <span class="mod-bento-tile-title">' . get_string('pastetile', 'mod_bento') . '</span>
                <span class="mod-bento-tile-sub">' . get_string('pastetilesub', 'mod_bento') . '</span>
            </button>
        </div>
        <div class="mod-bento-items" id="mod-bento-items"></div>
    </div>';

echo html_writer::tag('textarea', s(bento_blank_document()), [
    'id' => 'id_document', 'name' => 'document', 'style' => 'display:none',
]);

echo html_writer::empty_tag('input', [
    'type' => 'submit', 'class' => 'btn btn-primary mt-3', 'value' => get_string('createmypresentation', 'mod_bento'),
]);
echo html_writer::end_tag('form');

echo $OUTPUT->footer();
