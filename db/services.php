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
 * Web service definitions for mod_bento.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$functions = [
    'mod_bento_save_document' => [
        'classname'   => 'mod_bento\external\save_document',
        'methodname'  => 'execute',
        'description' => 'Saves the current in-editor bento/slides document -- to the shared master document (mod/bento:edit) or to the calling user\'s own submission (mod/bento:submit, when student submissions are enabled), decided server-side.',
        'type'        => 'write',
        'ajax'        => true,
        'capabilities' => 'mod/bento:edit, mod/bento:submit',
    ],
    'mod_bento_save_deck' => [
        'classname'   => 'mod_bento\external\save_deck',
        'methodname'  => 'execute',
        'description' => 'Saves one draft deck, kept separate from the published bento.document rather than force-merged into it.',
        'type'        => 'write',
        'ajax'        => true,
        'capabilities' => 'mod/bento:edit',
    ],
    'mod_bento_create_empty_deck' => [
        'classname'   => 'mod_bento\external\create_empty_deck',
        'methodname'  => 'execute',
        'description' => 'Allocates a real, empty draft deck row with no client-supplied content, so a caller has a genuine deckid to write into before it has anything worth saving.',
        'type'        => 'write',
        'ajax'        => true,
        'capabilities' => 'mod/bento:edit',
    ],
    'mod_bento_delete_deck' => [
        'classname'   => 'mod_bento\external\delete_deck',
        'methodname'  => 'execute',
        'description' => 'Removes one draft deck outright.',
        'type'        => 'write',
        'ajax'        => true,
        'capabilities' => 'mod/bento:edit',
    ],
    'mod_bento_promote_deck' => [
        'classname'   => 'mod_bento\external\promote_deck',
        'methodname'  => 'execute',
        'description' => 'Swaps a draft deck into the published position (bento.document) -- a genuine swap, the previously-published content becomes that same draft row\'s own new content.',
        'type'        => 'write',
        'ajax'        => true,
        'capabilities' => 'mod/bento:edit',
    ],
    'mod_bento_set_document_visible' => [
        'classname'   => 'mod_bento\external\set_document_visible',
        'methodname'  => 'execute',
        'description' => 'Toggles whether the published document is currently shown (view.php\'s own classic/master-document display) -- separate from, and never touching, the activity\'s own Moodle visibility.',
        'type'        => 'write',
        'ajax'        => true,
        'capabilities' => 'mod/bento:edit',
    ],
    'mod_bento_set_deck_visible' => [
        'classname'   => 'mod_bento\external\set_deck_visible',
        'methodname'  => 'execute',
        'description' => 'Toggles one deck\'s own visible flag, independent of every other row\'s own visibility.',
        'type'        => 'write',
        'ajax'        => true,
        'capabilities' => 'mod/bento:edit',
    ],
    'mod_bento_set_deck_order' => [
        'classname'   => 'mod_bento\external\set_deck_order',
        'methodname'  => 'execute',
        'description' => 'Sets the full playback order of every deck from an ordered list of ids -- powers both the (up arrow) reorder button and drag-and-drop reordering.',
        'type'        => 'write',
        'ajax'        => true,
        'capabilities' => 'mod/bento:edit',
    ],
];
