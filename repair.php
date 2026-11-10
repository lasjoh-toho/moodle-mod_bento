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

/**
 * Carries out one repair offered by manage.php's health check
 * (bento_health_issues() in lib.php), then returns to manage.php.
 *
 * Every write goes through bento_put_document(), so the version a repair
 * replaces becomes the backup — "restore previous" after a repair swaps
 * straight back. Only deleting a part is final (its row and files go).
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/lib.php');

$id = required_param('id', PARAM_INT);
$action = required_param('action', PARAM_ALPHA);
$deckid = optional_param('deckid', 0, PARAM_INT);
$group = optional_param('group', '', PARAM_SEQUENCE);

$cm = get_coursemodule_from_id('bento', $id, 0, false, MUST_EXIST);
$course = get_course($cm->course);
$bento = $DB->get_record('bento', ['id' => $cm->instance], '*', MUST_EXIST);

require_login($course, true, $cm);
$context = context_module::instance($cm->id);
bento_require_current_schema();
require_capability('mod/bento:edit', $context);
require_sesskey();

$returnurl = new moodle_url('/mod/bento/manage.php', ['id' => $cm->id]);
$now = time();

/**
 * Writes a document into the main document or a part, keeping the old one as backup.
 *
 * @param int $deckid 0 = main document
 * @param string $json the document
 */
$write = function (int $deckid, string $json) use ($DB, $context, $bento, $now, $cm) {
    if ($deckid > 0) {
        $deck = $DB->get_record('bento_decks', ['id' => $deckid, 'bentoid' => $bento->id], '*', MUST_EXIST);
        bento_put_document($context, $deck->id, $json, BENTO_DECK_FILEAREA);
        $DB->update_record('bento_decks', (object) ['id' => $deck->id, 'documentinfilestore' => 1, 'timemodified' => $now]);
    } else {
        bento_put_document($context, $bento->id, $json);
        $DB->update_record('bento', (object) ['id' => $bento->id, 'documentinfilestore' => 1, 'timemodified' => $now]);
    }
    bento_touch_coursemodule($cm->id);
};
$deleteDeck = function (int $deckid) use ($DB, $context, $bento) {
    $deck = $DB->get_record('bento_decks', ['id' => $deckid, 'bentoid' => $bento->id], '*', MUST_EXIST);
    get_file_storage()->delete_area_files($context->id, BENTO_DOCUMENT_COMPONENT, BENTO_DECK_FILEAREA, $deck->id);
    $DB->delete_records('bento_decks', ['id' => $deck->id]);
};
$area = $deckid > 0 ? BENTO_DECK_FILEAREA : BENTO_DOCUMENT_FILEAREA;
$itemid = $deckid > 0 ? (int) $DB->get_field('bento_decks', 'id', ['id' => $deckid, 'bentoid' => $bento->id], MUST_EXIST) : (int) $bento->id;

switch ($action) {
    case 'restoreprev':
        $backup = bento_get_document_backup($context, $itemid, $area);
        if (!$backup || !bento_document_has_valid_structure(json_decode($backup->get_content(), true))) {
            redirect($returnurl, get_string('health_nobackup', 'mod_bento'), null, \core\output\notification::NOTIFY_ERROR);
        }
        $write($deckid, $backup->get_content());
        break;

    case 'dropprev':
        $backup = bento_get_document_backup($context, $itemid, $area);
        if ($backup) {
            $backup->delete();
        }
        break;

    case 'resetmain':
        $write(0, bento_blank_document());
        break;

    case 'deletedeck':
        $deleteDeck($deckid);
        break;

    case 'fixfile':
        // The row says "in file storage" but the file is gone: fall back to
        // the legacy text column when that still holds a deck, else empty.
        $row = $deckid > 0 ? $DB->get_record('bento_decks', ['id' => $itemid]) : $bento;
        $legacy = (string) ($row->document ?? '');
        $write($deckid, bento_document_has_valid_structure(json_decode($legacy, true)) ? $legacy : bento_blank_document());
        break;

    case 'keeponly':
        // One copy of a presentation stored several times stays; the other
        // parts are deleted and a main-document copy is emptied.
        $members = array_map('intval', explode(',', $group));
        if (!in_array($deckid, $members, true)) {
            throw new moodle_exception('invalidparameter', 'debug');
        }
        foreach ($members as $member) {
            if ($member === $deckid) {
                continue;
            }
            if ($member === 0) {
                $write(0, bento_blank_document());
                // The kept copy holds the same slides — the emptied main
                // document's backup would only be reported as a lost deck.
                $backup = bento_get_document_backup($context, (int) $bento->id);
                if ($backup) {
                    $backup->delete();
                }
            } else {
                $deleteDeck($member);
            }
        }
        break;

    default:
        throw new moodle_exception('invalidparameter', 'debug');
}

redirect($returnurl, get_string('health_done', 'mod_bento'), null, \core\output\notification::NOTIFY_SUCCESS);
