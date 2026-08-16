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
 * "Verteilen/Importieren" for the TEACHER's own master document — the
 * direct counterpart to submission_new.php's own student-facing page.
 * Before this existed, the only way to reach these same tiles (new/demo/
 * import/paste-and-distribute, plus every existing draft deck as its own
 * card) was via the full Activity Settings form (course/modedit.php),
 * buried among name/description/due-date/grading and everything else —
 * genuinely the same detour as changing any other Moodle activity's own
 * text field, and just as easy to miss. This page shows exactly the same
 * bento_render_importer() widget mod_form.php's own settings form does,
 * on its own plain themed page, reachable directly from view.php/edit.php's
 * own toolbar.
 *
 * Clicking the existing-document tile behaves exactly as it already does
 * inside the settings form (see bentoconvert.js's own newBtn handler):
 * saves via AJAX, then opens edit.php. Importing/creating something new
 * does the same once generated. Nothing about the underlying save/merge
 * behaviour changes here — only where the tiles themselves are reachable
 * from.
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
require_capability('mod/bento:edit', $context); // teacher/master-document only — students have submission_new.php instead

$existing = bento_get_document($context, (bool) $bento->documentinfilestore, $bento->id, $bento->document);
$decks = $DB->get_records('bento_decks', ['bentoid' => $bento->id], 'sortorder ASC');

$decoded = json_decode($existing, true);
$hasrealdoc = is_array($decoded)
    && ($decoded['format'] ?? null) === 'bento/slides'
    && !empty($decoded['slides'])
    && !(count($decoded['slides']) === 1 && empty($decoded['slides'][0]['elements']));

$PAGE->set_url('/mod/bento/manage.php', ['id' => $cm->id]);
$PAGE->set_title(format_string($bento->name) . ' — ' . get_string('managepresentation', 'mod_bento'));
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
echo $OUTPUT->heading(format_string($bento->name) . ' — ' . get_string('managepresentation', 'mod_bento'));

// A second, explicit way to just PRESENT what's already there without
// opening the editor at all — the tile above behaves as "open in the
// editor" (see bentoconvert.js's own newBtn handler, unchanged here),
// which reads a little differently from what its own label ("Abspielen")
// suggests. This link is the literal "just show me the presentation"
// action for whoever only wants that.
if ($hasrealdoc) {
    $presenturl = new moodle_url('/mod/bento/view.php', ['id' => $cm->id, 'master' => 1]);
    echo html_writer::link($presenturl, get_string('presentmypresentation', 'mod_bento'), ['class' => 'btn btn-secondary mb-3']);
}

echo bento_render_importer($existing, (int) $course->id, (int) $cm->id, $decks);

echo $OUTPUT->footer();
