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
require_once(__DIR__ . '/lib.php');

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
        if (!empty($this->current->documentinfilestore) && !empty($this->current->id)) {
            $existing = bento_get_document($this->context, true, (int) $this->current->id, $existing);
        }
        $mform->addElement('html', $this->render_importer($existing));

        // Holds the JSON the widget produces (whichever single card remains
        // after any merging) — a plain textarea kept visually hidden rather
        // than type="hidden" so there's no practical length limit in any
        // browser.
        //
        // Left EMPTY on submit for the common case (an existing activity):
        // bentoconvert.js's own submit handler saves the document via the
        // mod_bento_save_document web service directly — the same AJAX
        // path every per-card Save button already uses — before letting
        // the rest of this form submit normally, rather than embedding a
        // large, image-heavy presentation a second time inside this form's
        // own POST body on every single settings save. Still falls back to
        // filling this field the old way (syncDocField(), right before
        // submit) when there's no cmid yet — a brand-new activity being
        // created for the first time has nothing to save a document
        // AGAINST yet, so the AJAX path isn't available until after this
        // first save creates the activity row.
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

        $mform->addElement('advcheckbox', 'allowstudentpaste', get_string('allowstudentpaste', 'mod_bento'));
        $mform->setDefault('allowstudentpaste', 0);
        $mform->addHelpButton('allowstudentpaste', 'allowstudentpaste', 'mod_bento');
        $mform->hideIf('allowstudentpaste', 'allowstudentsubmissions', 'notchecked');

        // Not gated behind allowstudentsubmissions — applies to the teacher's
        // own presentation too, not just student submissions. Defaults to the
        // admin's own absolute ceiling (settings.php), so a fresh activity
        // starts already at the site-wide value rather than some separate
        // hardcoded default the two could silently drift apart from. A
        // teacher can only ever set this LOWER than the admin's own limit,
        // never higher — bento_effective_max_document_bytes() in lib.php
        // always takes the smaller of the two, enforced on every save.
        $mform->addElement('text', 'maxdocumentsize', get_string('maxdocumentsize', 'mod_bento'));
        $mform->setType('maxdocumentsize', PARAM_INT);
        $mform->setDefault('maxdocumentsize', (int) (get_config('mod_bento', 'absolutemaxdocumentsize') ?: 20));
        $mform->addHelpButton('maxdocumentsize', 'maxdocumentsize', 'mod_bento');

        // A SEPARATE ceiling for student submissions specifically — left
        // empty/0 (the default), a submission uses the SAME limit as the
        // field above; only shown when submissions are actually enabled,
        // matching every other submissions-only field's own hideIf here.
        $mform->addElement('text', 'maxstudentdocumentsize', get_string('maxstudentdocumentsize', 'mod_bento'));
        $mform->setType('maxstudentdocumentsize', PARAM_INT);
        $mform->setDefault('maxstudentdocumentsize', 0);
        $mform->addHelpButton('maxstudentdocumentsize', 'maxstudentdocumentsize', 'mod_bento');
        $mform->hideIf('maxstudentdocumentsize', 'allowstudentsubmissions', 'notchecked');

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
     * Thin wrapper around bento_render_importer() (lib.php) — the shared
     * version manage.php's own standalone page now uses too, so this
     * markup only ever needs maintaining in one place.
     *
     * @param string $existingjson raw JSON from the `document` field, or ''
     * @return string HTML
     */
    private function render_importer(string $existingjson): string {
        global $COURSE, $DB;
        $decks = !empty($this->_cm)
            ? $DB->get_records('bento_decks', ['bentoid' => $this->_cm->instance], 'sortorder ASC')
            : [];
        $documentvisible = isset($this->current->documentvisible) ? (int) $this->current->documentvisible : 1;
        return bento_render_importer($existingjson, (int) $COURSE->id, (int) ($this->_cm->id ?? 0), $decks, $documentvisible, $this->context);
    }

    public function data_preprocessing(&$defaultvalues) {
        parent::data_preprocessing($defaultvalues);
        if (empty($defaultvalues['document'])) {
            $defaultvalues['document'] = bento_blank_document();
        }
    }

    public function validation($data, $files) {
        $errors = parent::validation($data, $files);
        $absolutemax = (int) (get_config('mod_bento', 'absolutemaxdocumentsize') ?: 20);
        if (isset($data['maxdocumentsize'])) {
            if ($data['maxdocumentsize'] < 1) {
                $errors['maxdocumentsize'] = get_string('maxdocumentsize_toosmall', 'mod_bento');
            } else if ($data['maxdocumentsize'] > $absolutemax) {
                $errors['maxdocumentsize'] = get_string('maxdocumentsize_exceedsabsolute', 'mod_bento', $absolutemax);
            }
        }
        // 0 is explicitly valid here (means "no separate limit, use
        // maxdocumentsize above") — unlike maxdocumentsize's own <1 check,
        // 0 has a real meaning for this field rather than being an
        // invalid size.
        if (isset($data['maxstudentdocumentsize']) && $data['maxstudentdocumentsize'] > 0) {
            if ($data['maxstudentdocumentsize'] > $absolutemax) {
                $errors['maxstudentdocumentsize'] = get_string('maxdocumentsize_exceedsabsolute', 'mod_bento', $absolutemax);
            }
        }
        return $errors;
    }
}
