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

namespace mod_bento\external;

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/mod/bento/lib.php');

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_value;
use core_external\external_single_structure;
use context_module;

/**
 * mod_bento_set_document_visible — toggles bento.documentvisible, a flag
 * entirely separate from Moodle's own course_modules.visible (which this
 * never touches). See install.xml's own documentvisible comment for the
 * full read/write scheme: this only affects whether view.php's own
 * classic/master-document display shows the presentation or a plain "not
 * currently available" message instead — the activity itself, and (for
 * allowstudentsubmissions=1 activities) the submission gallery and every
 * student's own submission, stay exactly as reachable as they already
 * were regardless of this flag.
 *
 * Deliberately its own small webservice rather than folded into save_
 * document.php: toggling this is a single-field flip that shouldn't need
 * — or risk — re-validating/re-writing the entire document alongside it.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class set_document_visible extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'cmid' => new external_value(PARAM_INT, 'course module id'),
            'visible' => new external_value(PARAM_INT, '0 = hidden, 1 = visible to everyone, 2 = visible only when the viewer can edit the master document (a teacher)'),
        ]);
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'ok' => new external_value(PARAM_BOOL, 'true if updated'),
        ]);
    }

    /**
     * @param int $cmid
     * @param int $visible 0, 1, or 2 — see execute_parameters() for meaning
     * @return array
     */
    public static function execute($cmid, $visible): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), [
            'cmid' => $cmid,
            'visible' => $visible,
        ]);
        if ($params['visible'] < 0 || $params['visible'] > 2) {
            throw new \invalid_parameter_exception('visible must be 0, 1, or 2');
        }

        $cm = get_coursemodule_from_id('bento', $params['cmid'], 0, false, MUST_EXIST);
        $context = context_module::instance($cm->id);
        self::validate_context($context);
        bento_require_current_schema();
        require_capability('mod/bento:edit', $context);

        $DB->set_field('bento', 'documentvisible', $params['visible'], ['id' => $cm->instance]);
        bento_touch_coursemodule($cm->id);

        return ['ok' => true];
    }
}
