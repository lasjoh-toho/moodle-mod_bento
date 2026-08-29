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
 * mod_bento_create_empty_deck — allocates a real bento_decks row (one
 * blank slide, via bento_blank_document()) with NO client-supplied
 * document content, purely so a caller can get a genuine deckid to write
 * into before it has anything worth saving yet.
 *
 * This exists for exactly one caller: manage.php's own ✎ edit button on a
 * not-yet-saved item (a fresh import still sitting only in the browser).
 * Opening edit.php directly against that in-memory document — so it can
 * be trimmed down BEFORE ever being written — needs a real deckid up
 * front, precisely so that if the person saves from inside that editor
 * session, it writes into ITS OWN row rather than falling through to
 * deckid=0 (which save_document.php's own doc comment already documents
 * as the shared MASTER document) and silently overwriting whatever the
 * activity's published presentation already was.
 *
 * Deliberately takes no document content at all — the real (potentially
 * large) content is layered on top client-side via sessionStorage, same
 * as before; this call only ever needs to be fast and needs no size
 * validation of its own, since bento_blank_document() is a small fixed
 * constant, not client input.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class create_empty_deck extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'cmid' => new external_value(PARAM_INT, 'course module id'),
        ]);
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'deckid' => new external_value(PARAM_INT, 'the newly created draft\'s own id'),
        ]);
    }

    /**
     * @param int $cmid
     * @return array
     */
    public static function execute($cmid): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), ['cmid' => $cmid]);

        $cm = get_coursemodule_from_id('bento', $params['cmid'], 0, false, MUST_EXIST);
        $context = context_module::instance($cm->id);
        self::validate_context($context);
        bento_require_current_schema();
        require_capability('mod/bento:edit', $context);

        $now = time();
        $maxsort = (int) $DB->get_field_sql(
            'SELECT COALESCE(MAX(sortorder), 0) FROM {bento_decks} WHERE bentoid = ?',
            [$cm->instance]
        );
        $newid = $DB->insert_record('bento_decks', (object) [
            'bentoid' => $cm->instance,
            'sortorder' => $maxsort + 1,
            'name' => null,
            'document' => '', // never populated — documentinfilestore below means this is never read anyway
            'documentinfilestore' => 1,
            'timecreated' => $now,
            'timemodified' => $now,
        ]);
        bento_put_document($context, $newid, bento_blank_document(), BENTO_DECK_FILEAREA);
        bento_touch_coursemodule($cm->id);

        return ['deckid' => (int) $newid];
    }
}
