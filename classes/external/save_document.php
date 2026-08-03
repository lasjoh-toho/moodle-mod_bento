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

use external_api;
use external_function_parameters;
use external_value;
use external_single_structure;
use context_module;
use invalid_parameter_exception;

/**
 * mod_bento_save_document — called by the small "save" button edit.php
 * injects into the running Bento editor; reads window.bento.doc and posts
 * it here as plain JSON.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class save_document extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'cmid' => new external_value(PARAM_INT, 'course module id'),
            'document' => new external_value(PARAM_RAW, 'the full bento/slides JSON document'),
        ]);
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'ok' => new external_value(PARAM_BOOL, 'true if saved'),
            'timemodified' => new external_value(PARAM_INT, 'server timestamp of the save'),
        ]);
    }

    /**
     * @param int $cmid
     * @param string $document raw JSON
     * @return array
     */
    public static function execute($cmid, $document): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), [
            'cmid' => $cmid,
            'document' => $document,
        ]);

        $cm = get_coursemodule_from_id('bento', $params['cmid'], 0, false, MUST_EXIST);
        $context = context_module::instance($cm->id);
        self::validate_context($context);
        require_capability('mod/bento:edit', $context);

        $decoded = json_decode($params['document'], true);
        if (!is_array($decoded) || ($decoded['format'] ?? null) !== 'bento/slides' || empty($decoded['slides'])) {
            throw new invalid_parameter_exception('Not a valid bento/slides document.');
        }
        if (strlen($params['document']) > BENTO_MAX_DOCUMENT_BYTES) {
            throw new invalid_parameter_exception('Document too large.');
        }
        // See lib.php's bento_validate_document() for why: a Moodle-hosted
        // activity must always open in the full editor, never Bento's
        // minimal read-only player card.
        unset($decoded['readonly']);

        $now = time();
        $DB->update_record('bento', (object) [
            'id' => $cm->instance,
            'document' => json_encode($decoded),
            'timemodified' => $now,
        ]);

        return ['ok' => true, 'timemodified' => $now];
    }
}
