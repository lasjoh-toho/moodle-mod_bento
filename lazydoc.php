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
 * Returns one document's own raw JSON — the main document (deckid=0) or a
 * specific deck (deckid>0) — nothing else, no page chrome. Teacher-only
 * (mod/bento:edit) and deliberately NOT gated by visibility state at all,
 * unlike deck.php's own public-facing endpoint: manage.php's own card list
 * needs to lazy-load ANY card's own content on demand (download, split-
 * into-parts), including a hidden draft the teacher is still working on,
 * not just whatever's currently visible to a viewer.
 *
 * Plain GET rather than a webservice call — same reasoning as deck.php's
 * own doc comment: the simplest, cheapest thing that could possibly work,
 * no sesskey or POST body required for a pure read.
 *
 * bento_render_importer() (lib.php) now embeds only lightweight metadata
 * (title, slide count, byte size) per card at page load, rather than every
 * card's own full document (images and all) — this is what a card's own
 * download/split action fetches, lazily, only once actually needed.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/lib.php');

$id = required_param('id', PARAM_INT);
$deckid = required_param('deckid', PARAM_INT);

$cm = get_coursemodule_from_id('bento', $id, 0, false, MUST_EXIST);
$course = get_course($cm->course);

require_login($course, true, $cm);
$context = context_module::instance($cm->id);
bento_require_current_schema();
require_capability('mod/bento:edit', $context);

header('Content-Type: application/json; charset=utf-8');
header('X-Frame-Options: SAMEORIGIN');

if ($deckid > 0) {
    $deck = $DB->get_record('bento_decks', ['id' => $deckid, 'bentoid' => $cm->instance], '*', MUST_EXIST);
    echo bento_get_document($context, (bool) $deck->documentinfilestore, $deck->id, $deck->document, BENTO_DECK_FILEAREA);
} else {
    $bento = $DB->get_record('bento', ['id' => $cm->instance], '*', MUST_EXIST);
    echo bento_get_document($context, (bool) $bento->documentinfilestore, $bento->id, $bento->document);
}
