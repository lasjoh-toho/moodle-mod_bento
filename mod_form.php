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
 * The main mod_bento configuration form — add/edit an activity.
 *
 * Naming, an import/merge widget for the starting document, and grading/
 * completion. The import widget (see bentoconvert.js, which now holds ALL of this — JSZip, the PPTX conversion, mergeDocs, AND the widget wiring itself, deliberately one file: two separate <script> tags here race on load order, same bug this project already hit once with JSZip vs the conversion logic — the
 * same drag/drop/merge logic as the standalone converter tool) stays
 * available on every save, not just when first creating the activity: the
 * currently-saved document is always shown as one of its cards too, so a
 * teacher can drop in another .pptx/.json/.bento.html later and merge it
 * with what's already there, exactly like connecting decks in the
 * standalone tool. Slide-by-slide editing itself still happens in edit.php's
 * full Bento editor — this form only ever produces a STARTING document.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/course/moodleform_mod.php');

class mod_bento_mod_form extends moodleform_mod {

    public function definition() {
        global $CFG, $PAGE;

        $mform = $this->_form;

        $mform->addElement('text', 'name', get_string('bentoname', 'mod_bento'), ['size' => '64']);
        $mform->setType('name', PARAM_TEXT);
        $mform->addRule('name', null, 'required', null, 'client');
        $mform->addRule('name', get_string('maximumchars', '', 255), 'maxlength', 255, 'client');
        $mform->addHelpButton('name', 'bentoname', 'mod_bento');

        $this->standard_intro_elements();

        // ---- initial content: import/merge widget, always available ----
        $mform->addElement('header', 'bentocontenthdr', get_string('initialcontent', 'mod_bento'));
        $mform->setExpanded('bentocontenthdr', true);

        $existing = isset($this->current->document) ? $this->current->document : '';
        $mform->addElement('html', $this->render_importer($existing));

        // Holds the JSON the widget produces (whichever single card remains
        // after any merging) — a plain textarea kept visually hidden rather
        // than type="hidden" so there's no practical length limit in any
        // browser. bentoconvert.js keeps this in sync on every change and again
        // right before submit.
        $mform->addElement('textarea', 'document', get_string('document', 'mod_bento'),
            ['rows' => 3, 'style' => 'display:none']);
        $mform->setType('document', PARAM_RAW);
        $mform->setDefault('document', $existing);

        $mform->addElement('advcheckbox', 'loginonly', get_string('loginonly', 'mod_bento'));
        $mform->setDefault('loginonly', 0);
        $mform->addHelpButton('loginonly', 'loginonly', 'mod_bento');

        // ---- student submissions: each learner gets their own deck instead ----
        $mform->addElement('header', 'bentosubmissionshdr', get_string('studentsubmissions', 'mod_bento'));

        $mform->addElement('advcheckbox', 'allowstudentsubmissions', get_string('allowstudentsubmissions', 'mod_bento'));
        $mform->setDefault('allowstudentsubmissions', 0);
        $mform->addHelpButton('allowstudentsubmissions', 'allowstudentsubmissions', 'mod_bento');

        $mform->addElement('date_time_selector', 'duedate', get_string('duedate', 'mod_bento'), ['optional' => true]);
        $mform->setDefault('duedate', 0);
        $mform->addHelpButton('duedate', 'duedate', 'mod_bento');
        $mform->hideIf('duedate', 'allowstudentsubmissions', 'notchecked');

        $mform->addElement('advcheckbox', 'duedatevisible', get_string('duedatevisible', 'mod_bento'));
        $mform->setDefault('duedatevisible', 1);
        $mform->addHelpButton('duedatevisible', 'duedatevisible', 'mod_bento');
        $mform->hideIf('duedatevisible', 'allowstudentsubmissions', 'notchecked');
        $mform->hideIf('duedatevisible', 'duedate[enabled]', 'notchecked');

        $mform->addElement('select', 'submissionvisibility', get_string('submissionvisibility', 'mod_bento'), [
            'auto' => get_string('submissionvisibility_auto', 'mod_bento'),
            'moderated' => get_string('submissionvisibility_moderated', 'mod_bento'),
        ]);
        $mform->setDefault('submissionvisibility', 'auto');
        $mform->addHelpButton('submissionvisibility', 'submissionvisibility', 'mod_bento');
        $mform->hideIf('submissionvisibility', 'allowstudentsubmissions', 'notchecked');

        // ---- grading, availability, common module settings ----
        $this->standard_grading_coursemodule_elements();
        $this->standard_coursemodule_elements();

        $this->add_action_buttons();

        $PAGE->requires->js(new \moodle_url('/mod/bento/bentoconvert.js'));
        $PAGE->requires->strings_for_js([
            'pastetile', 'pastetilesub', 'pastestep1title', 'pastestep1desc', 'pastecatcherplaceholder',
            'pastestep2title', 'pastestep2desc', 'pasteviewtoggle', 'pastectxendslide', 'pastectxtogglemode',
            'pastegeneratebtn', 'newtile', 'newtilesub', 'playtile', 'playtilesub',
        ], 'mod_bento');
        $PAGE->requires->js(new \moodle_url('/mod/bento/bentopaste.js'));
    }

    /**
     * The import/merge widget markup. The EXISTING document (if there is a
     * genuine one — not just the single-blank-slide default) is embedded as
     * a JSON &lt;script&gt; block so bentoconvert.js can seed it as the first
     * card, mergeable with anything newly dropped here.
     *
     * @param string $existingjson raw JSON from the `document` field, or ''
     * @return string HTML
     */
    private function render_importer(string $existingjson): string {
        global $COURSE;
        $seed = '';
        $decoded = $existingjson !== '' ? json_decode($existingjson, true) : null;
        $isrealdoc = is_array($decoded)
            && ($decoded['format'] ?? null) === 'bento/slides'
            && !empty($decoded['slides'])
            && !(count($decoded['slides']) === 1 && empty($decoded['slides'][0]['elements']));
        if ($isrealdoc) {
            // json_encode it back out (rather than reusing $existingjson
            // verbatim) purely to guarantee well-formed JSON reaches the
            // <script> block even if the stored value ever had trailing
            // whitespace or similar — the parsed/re-encoded form is safe.
            $seed = '<script type="application/json" id="mod-bento-existing-doc">'
                . json_encode($decoded) . '</script>';
        }

        return '
            <div class="mod-bento-importer" id="mod-bento-importer" data-courseid="' . (int) $COURSE->id . '">
                <p class="form-text text-muted mod-bento-edithint">' . get_string('editusehint', 'mod_bento') . '</p>
                ' . $seed . '
                <div class="mod-bento-tiles">
                    <button type="button" class="mod-bento-tile mod-bento-tile-new" id="mod-bento-newbtn" data-hasdoc="' . ($isrealdoc ? '1' : '0') . '">
                        <span class="mod-bento-tile-title" id="mod-bento-newbtn-title">' . ($isrealdoc ? get_string('playtile', 'mod_bento') : get_string('newtile', 'mod_bento')) . '</span>
                        <span class="mod-bento-tile-sub" id="mod-bento-newbtn-sub">' . ($isrealdoc ? get_string('playtilesub', 'mod_bento') : get_string('newtilesub', 'mod_bento')) . '</span>
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
    }

    public function data_preprocessing(&$defaultvalues) {
        parent::data_preprocessing($defaultvalues);
        if (empty($defaultvalues['document'])) {
            $defaultvalues['document'] = bento_blank_document();
        }
    }
}
