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
 * Returns one deck's own raw document JSON — nothing else, no page chrome.
 * Deliberately its own plain GET endpoint rather than a webservice call:
 * this is what present.ts's own onReachedEnd hook fetches, lazily, only
 * once actually reached while playing through a sequence of visible
 * decks (see view.php's own playlist construction) — a plain GET is the
 * simplest, cheapest thing that could possibly work for that, no sesskey
 * or POST body required.
 *
 * Same visibility rule as view.php's own playlist: only ever serves a
 * deck that is BOTH the right activity's own AND currently marked
 * visible — this is not a general "read any deck's content" endpoint,
 * even for someone with edit rights, since a hidden draft's content
 * shouldn't be fetchable by guessing its id.
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

// Same per-viewer visibility rule as view.php's own playlist
// construction: state 1 (visible to everyone) always qualifies; state 2
// (visible only when a teacher is presenting) only qualifies for
// whoever can edit the master document. Never state 0 (hidden) for
// anyone — this is not a general "read any deck's content" endpoint,
// even for someone with edit rights, since a hidden draft's content
// shouldn't be fetchable by guessing its id.
$caneditmaster = has_capability('mod/bento:edit', $context);
$visiblestatesforviewer = $caneditmaster ? [1, 2] : [1];
list($visinsql, $visinparams) = $DB->get_in_or_equal($visiblestatesforviewer, SQL_PARAMS_QM);
$deck = $DB->get_record_select(
    'bento_decks',
    "id = ? AND bentoid = ? AND visible $visinsql",
    array_merge([$deckid, $cm->instance], $visinparams),
    '*',
    MUST_EXIST
);

header('Content-Type: application/json; charset=utf-8');
header('X-Frame-Options: SAMEORIGIN');
echo bento_get_document($context, (bool) $deck->documentinfilestore, $deck->id, $deck->document, BENTO_DECK_FILEAREA);
