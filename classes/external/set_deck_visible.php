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
 * mod_bento_set_deck_visible — toggles one deck's own `visible` flag,
 * independent of every other row's own visibility (including bento.
 * documentvisible and every other deck's own flag). See install.xml's
 * own bento_decks.visible comment for the full read/write scheme: any
 * number of decks (plus bento.document itself, if its own documentvisible
 * is on) can be visible at once, played through in sortorder by view.php's
 * own playlist construction.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class set_deck_visible extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'cmid' => new external_value(PARAM_INT, 'course module id'),
            'deckid' => new external_value(PARAM_INT, 'the deck to toggle'),
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
     * @param int $deckid
     * @param int $visible 0, 1, or 2 — see execute_parameters() for meaning
     * @return array
     */
    public static function execute($cmid, $deckid, $visible): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), [
            'cmid' => $cmid,
            'deckid' => $deckid,
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

        // bentoid match required — same reasoning as every other deck
        // webservice in this plugin: never let one activity's own edit
        // capability touch a deck belonging to a different one.
        $DB->get_record('bento_decks', ['id' => $params['deckid'], 'bentoid' => $cm->instance], 'id', MUST_EXIST);
        $DB->set_field('bento_decks', 'visible', $params['visible'], ['id' => $params['deckid']]);
        bento_touch_coursemodule($cm->id);

        return ['ok' => true];
    }
}
