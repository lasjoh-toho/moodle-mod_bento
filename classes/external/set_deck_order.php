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
use core_external\external_multiple_structure;
use context_module;

/**
 * mod_bento_set_deck_order — sets the FULL playback order of every deck in
 * one call, from an ordered list of deck ids (1-based sortorder assigned in
 * list order). General-purpose replacement for a plain two-way swap: this
 * is what both the ⇧ "move up" button AND drag-and-drop reordering in
 * manage.php's own tile-import view actually persist through — a drag can
 * move an item across several positions at once, which a simple swap
 * can't correctly express, only a full reorder can.
 *
 * The main document (bento.document, conceptually always sortorder 0 — see
 * install.xml's own bento_decks table comment) is never part of this list;
 * only decks reorder among themselves.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class set_deck_order extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'cmid' => new external_value(PARAM_INT, 'course module id'),
            'deckids' => new external_multiple_structure(
                new external_value(PARAM_INT, 'deck id'),
                'every deck belonging to this activity, in the new desired playback order'
            ),
        ]);
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'ok' => new external_value(PARAM_BOOL, 'true if reordered'),
        ]);
    }

    /**
     * @param int $cmid
     * @param int[] $deckids
     * @return array
     */
    public static function execute($cmid, $deckids): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), [
            'cmid' => $cmid,
            'deckids' => $deckids,
        ]);

        $cm = get_coursemodule_from_id('bento', $params['cmid'], 0, false, MUST_EXIST);
        $context = context_module::instance($cm->id);
        self::validate_context($context);
        bento_require_current_schema();
        require_capability('mod/bento:edit', $context);

        $sortorder = 1;
        foreach ($params['deckids'] as $deckid) {
            // bentoid match required on every single one — same reasoning
            // as every other deck webservice in this plugin: never let
            // one activity's own edit capability touch a deck belonging
            // to a different one, even if it's just skipped rather than
            // erroring on a mismatch.
            $deck = $DB->get_record('bento_decks', ['id' => $deckid, 'bentoid' => $cm->instance], 'id', IGNORE_MISSING);
            if (!$deck) {
                continue;
            }
            $DB->set_field('bento_decks', 'sortorder', $sortorder, ['id' => $deck->id]);
            $sortorder++;
        }
        bento_touch_coursemodule($cm->id);

        return ['ok' => true];
    }
}
