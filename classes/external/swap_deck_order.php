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
 * mod_bento_swap_deck_order — swaps two decks' own sortorder values,
 * immediately committed. This is the whole mechanism behind the ⇧ "move up
 * in playback order" button in manage.php's own tile-import view: moving a
 * deck up swaps it with whichever deck currently sits one position ahead
 * of it. The main document (bento.document, conceptually always sortorder
 * 0 — see install.xml's own bento_decks table comment) is never touched
 * here; only decks reorder among themselves.
 *
 * Safe to commit immediately (unlike the old promote/publish mechanism
 * this replaced): a sortorder swap changes nothing about either deck's
 * own CONTENT, only where it falls in playback sequence — there is no
 * "which one is exclusively published" state left to collide over.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class swap_deck_order extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'cmid' => new external_value(PARAM_INT, 'course module id'),
            'deckid1' => new external_value(PARAM_INT, 'first deck'),
            'deckid2' => new external_value(PARAM_INT, 'second deck'),
        ]);
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'ok' => new external_value(PARAM_BOOL, 'true if swapped'),
        ]);
    }

    /**
     * @param int $cmid
     * @param int $deckid1
     * @param int $deckid2
     * @return array
     */
    public static function execute($cmid, $deckid1, $deckid2): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), [
            'cmid' => $cmid,
            'deckid1' => $deckid1,
            'deckid2' => $deckid2,
        ]);

        $cm = get_coursemodule_from_id('bento', $params['cmid'], 0, false, MUST_EXIST);
        $context = context_module::instance($cm->id);
        self::validate_context($context);
        bento_require_current_schema();
        require_capability('mod/bento:edit', $context);

        // bentoid match required on BOTH — same reasoning as every other
        // deck webservice in this plugin: never let one activity's own
        // edit capability touch a deck belonging to a different one.
        $deck1 = $DB->get_record('bento_decks', ['id' => $params['deckid1'], 'bentoid' => $cm->instance], 'id, sortorder', MUST_EXIST);
        $deck2 = $DB->get_record('bento_decks', ['id' => $params['deckid2'], 'bentoid' => $cm->instance], 'id, sortorder', MUST_EXIST);

        $DB->set_field('bento_decks', 'sortorder', $deck2->sortorder, ['id' => $deck1->id]);
        $DB->set_field('bento_decks', 'sortorder', $deck1->sortorder, ['id' => $deck2->id]);
        bento_touch_coursemodule($cm->id);

        return ['ok' => true];
    }
}
