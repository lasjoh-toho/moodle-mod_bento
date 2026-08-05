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
 * mod_bento_save_document — called by Bento's own Save button (editor/
 * moodle.ts) whenever it detects a mod/bento context.
 *
 * WHICH document this writes to is decided entirely server-side from the
 * calling user's OWN capabilities — never from anything the client sends —
 * exactly mirroring edit.php's own branch (see that file's comment):
 *
 *  - mod/bento:edit → the shared master document (bento.document).
 *  - otherwise, mod/bento:submit + allowstudentsubmissions on → the
 *    caller's OWN row in bento_submissions, found via (bentoid, userid) —
 *    never a client-supplied submission id, so there's no way for one
 *    student's request to end up writing into another student's row.
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
        global $DB, $USER;

        $params = self::validate_parameters(self::execute_parameters(), [
            'cmid' => $cmid,
            'document' => $document,
        ]);

        $cm = get_coursemodule_from_id('bento', $params['cmid'], 0, false, MUST_EXIST);
        $context = context_module::instance($cm->id);
        self::validate_context($context);

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
        $cleandocument = json_encode($decoded);

        if (has_capability('mod/bento:edit', $context)) {
            $DB->update_record('bento', (object) [
                'id' => $cm->instance,
                'document' => $cleandocument,
                'timemodified' => $now,
            ]);
            return ['ok' => true, 'timemodified' => $now];
        }

        require_capability('mod/bento:submit', $context);
        $bento = $DB->get_record('bento', ['id' => $cm->instance], '*', MUST_EXIST);
        if (!$bento->allowstudentsubmissions) {
            throw new \moodle_exception('submissionsnotenabled', 'mod_bento');
        }

        $existing = $DB->get_record('bento_submissions', ['bentoid' => $bento->id, 'userid' => $USER->id]);
        if ($existing) {
            $DB->update_record('bento_submissions', (object) [
                'id' => $existing->id,
                'document' => $cleandocument,
                'timemodified' => $now,
            ]);
        } else {
            $DB->insert_record('bento_submissions', (object) [
                'bentoid' => $bento->id,
                'userid' => $USER->id,
                'document' => $cleandocument,
                'status' => 'pending',
                'timecreated' => $now,
                'timemodified' => $now,
            ]);
        }

        return ['ok' => true, 'timemodified' => $now];
    }
}
