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
use invalid_parameter_exception;

/**
 * mod_bento_save_deck — saves ONE draft deck, kept separate from
 * bento.document (the presentation students/anyone actually sees) rather
 * than being force-merged into it. Lets a teacher work on a next version
 * privately while the current one stays visible — see bento_decks' own
 * table comment in install.xml for the full reasoning.
 *
 * deckid=0 creates a new draft (appended after every existing one for
 * this activity); a positive deckid updates that existing row's own
 * document/name in place. Always mod/bento:edit only — drafts are a
 * teacher/master-document concept, students' own submissions don't have
 * an equivalent (mod_bento_save_document already covers their one row).
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class save_deck extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'cmid' => new external_value(PARAM_INT, 'course module id'),
            'deckid' => new external_value(PARAM_INT, '0 to create a new draft, or an existing draft\'s own id to update it'),
            'name' => new external_value(PARAM_TEXT, 'teacher-facing label for this draft', VALUE_DEFAULT, ''),
            'document' => new external_value(PARAM_RAW, 'the full bento/slides JSON document'),
        ]);
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'ok' => new external_value(PARAM_BOOL, 'true if saved'),
            'deckid' => new external_value(PARAM_INT, 'the draft\'s own id — the same one passed in, or the newly created one'),
            'timemodified' => new external_value(PARAM_INT, 'server timestamp of the save'),
        ]);
    }

    /**
     * @param int $cmid
     * @param int $deckid
     * @param string $name
     * @param string $document raw JSON
     * @return array
     */
    public static function execute($cmid, $deckid, $name, $document): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), [
            'cmid' => $cmid,
            'deckid' => $deckid,
            'name' => $name,
            'document' => $document,
        ]);

        $cm = get_coursemodule_from_id('bento', $params['cmid'], 0, false, MUST_EXIST);
        $context = context_module::instance($cm->id);
        self::validate_context($context);
        bento_require_current_schema();
        require_capability('mod/bento:edit', $context);

        $bento = $DB->get_record('bento', ['id' => $cm->instance], '*', MUST_EXIST);

        $decoded = json_decode($params['document'], true);
        if (!is_array($decoded) || ($decoded['format'] ?? null) !== 'bento/slides' || empty($decoded['slides'])) {
            throw new invalid_parameter_exception('Not a valid bento/slides document.');
        }
        $maxbytes = bento_effective_max_document_bytes($bento);
        if (strlen($params['document']) > $maxbytes) {
            throw new invalid_parameter_exception('Document too large (max ' . round($maxbytes / 1024 / 1024, 1) . ' MB for this activity).');
        }
        unset($decoded['readonly']);
        $now = time();
        $cleandocument = json_encode($decoded);
        $cleanname = trim($params['name']) !== '' ? trim($params['name']) : null;

        if ($params['deckid'] > 0) {
            $existing = $DB->get_record('bento_decks', ['id' => $params['deckid'], 'bentoid' => $cm->instance], '*', MUST_EXIST);
            $DB->update_record('bento_decks', (object) [
                'id' => $existing->id,
                'name' => $cleanname,
                'document' => $cleandocument,
                'timemodified' => $now,
            ]);
            return ['ok' => true, 'deckid' => (int) $existing->id, 'timemodified' => $now];
        }

        $maxsort = (int) $DB->get_field_sql(
            'SELECT COALESCE(MAX(sortorder), 0) FROM {bento_decks} WHERE bentoid = ?',
            [$cm->instance]
        );
        $newid = $DB->insert_record('bento_decks', (object) [
            'bentoid' => $cm->instance,
            'sortorder' => $maxsort + 1,
            'name' => $cleanname,
            'document' => $cleandocument,
            'timecreated' => $now,
            'timemodified' => $now,
        ]);

        return ['ok' => true, 'deckid' => (int) $newid, 'timemodified' => $now];
    }
}
