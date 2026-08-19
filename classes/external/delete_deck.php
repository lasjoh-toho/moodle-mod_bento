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
 * mod_bento_delete_deck — removes one draft deck outright. Never touches
 * bento.document (the published one) — that's not a "deck" this endpoint
 * can reach at all, by design; removing the published presentation isn't
 * something this action is for.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class delete_deck extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'cmid' => new external_value(PARAM_INT, 'course module id'),
            'deckid' => new external_value(PARAM_INT, 'the draft to remove'),
        ]);
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'ok' => new external_value(PARAM_BOOL, 'true if removed'),
        ]);
    }

    /**
     * @param int $cmid
     * @param int $deckid
     * @return array
     */
    public static function execute($cmid, $deckid): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), [
            'cmid' => $cmid,
            'deckid' => $deckid,
        ]);

        $cm = get_coursemodule_from_id('bento', $params['cmid'], 0, false, MUST_EXIST);
        $context = context_module::instance($cm->id);
        self::validate_context($context);
        bento_require_current_schema();
        require_capability('mod/bento:edit', $context);

        // get_record with MUST_EXIST also confirms this draft actually
        // belongs to THIS activity, not just any id a caller might supply.
        $deck = $DB->get_record('bento_decks', ['id' => $params['deckid'], 'bentoid' => $cm->instance], '*', MUST_EXIST);
        // No-op if this deck never actually migrated to file storage —
        // delete_area_files() with a specific itemid is a safe no-op when
        // nothing's there.
        get_file_storage()->delete_area_files($context->id, BENTO_DOCUMENT_COMPONENT, BENTO_DECK_FILEAREA, $deck->id);
        $DB->delete_records('bento_decks', ['id' => $deck->id]);

        return ['ok' => true];
    }
}
