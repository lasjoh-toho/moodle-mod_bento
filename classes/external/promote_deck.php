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
 * mod_bento_promote_deck — swaps a draft into the published position
 * (bento.document, what students/anyone actually sees) and what was
 * PREVIOUSLY published becomes that same draft row's own new content.
 * A genuine swap, not a copy-then-discard: the total number of decks (one
 * published + however many drafts) never changes, and nothing is ever
 * silently lost — the person can always promote again to swap back.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class promote_deck extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'cmid' => new external_value(PARAM_INT, 'course module id'),
            'deckid' => new external_value(PARAM_INT, 'the draft to swap into the published position'),
        ]);
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'ok' => new external_value(PARAM_BOOL, 'true if swapped'),
            'timemodified' => new external_value(PARAM_INT, 'server timestamp of the swap'),
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

        $deck = $DB->get_record('bento_decks', ['id' => $params['deckid'], 'bentoid' => $cm->instance], '*', MUST_EXIST);
        $bento = $DB->get_record('bento', ['id' => $cm->instance], '*', MUST_EXIST);
        $now = time();

        // A real swap — the draft's own row keeps existing (same id,
        // sortorder, name), just with the OLD published content now
        // sitting in it, while bento.document gets the draft's content.
        // Nothing created, nothing deleted, nothing discarded.
        $DB->update_record('bento', (object) [
            'id' => $bento->id,
            'document' => $deck->document,
            'timemodified' => $now,
        ]);
        $DB->update_record('bento_decks', (object) [
            'id' => $deck->id,
            'document' => $bento->document,
            'timemodified' => $now,
        ]);

        bento_grade_item_update($bento);
        bento_update_calendar($bento);

        return ['ok' => true, 'timemodified' => $now];
    }
}
