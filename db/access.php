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
 * Capability definitions for mod_bento.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$capabilities = [

    'mod/bento:addinstance' => [
        'riskbitmask' => RISK_XSS,
        'captype' => 'write',
        'contextlevel' => CONTEXT_COURSE,
        'archetypes' => [
            'editingteacher' => CAP_ALLOW,
            'manager' => CAP_ALLOW,
        ],
        'clonepermissionsfrom' => 'moodle/course:manageactivities',
    ],

    'mod/bento:view' => [
        'captype' => 'read',
        'contextlevel' => CONTEXT_MODULE,
        'archetypes' => [
            'student' => CAP_ALLOW,
            'teacher' => CAP_ALLOW,
            'editingteacher' => CAP_ALLOW,
            'manager' => CAP_ALLOW,
        ],
    ],

    // Deliberately separate from addinstance: a non-editing teacher role
    // could plausibly get "edit the deck" without "add/remove the activity
    // from the course" — kept as two capabilities rather than one so that
    // distinction is available even though the default archetypes below
    // grant both together.
    'mod/bento:edit' => [
        'riskbitmask' => RISK_XSS,
        'captype' => 'write',
        'contextlevel' => CONTEXT_MODULE,
        'archetypes' => [
            'teacher' => CAP_ALLOW,
            'editingteacher' => CAP_ALLOW,
            'manager' => CAP_ALLOW,
        ],
    ],

    'mod/bento:grade' => [
        'captype' => 'write',
        'contextlevel' => CONTEXT_MODULE,
        'archetypes' => [
            'teacher' => CAP_ALLOW,
            'editingteacher' => CAP_ALLOW,
            'manager' => CAP_ALLOW,
        ],
    ],

    // Create/edit ONE'S OWN submission when the activity has student
    // submissions turned on (bento.allowstudentsubmissions). Deliberately
    // does not imply mod/bento:edit or vice versa — a student with this
    // capability can never touch the teacher's own master document, and a
    // teacher editing the master document doesn't need this at all.
    'mod/bento:submit' => [
        'riskbitmask' => RISK_XSS,
        'captype' => 'write',
        'contextlevel' => CONTEXT_MODULE,
        'archetypes' => [
            'student' => CAP_ALLOW,
        ],
    ],

    // Bypasses the "moderated" visibility restriction — sees every
    // student's submission regardless of its approval status. A teacher
    // reviewing work needs this even before anything's been approved.
    'mod/bento:viewallsubmissions' => [
        'captype' => 'read',
        'contextlevel' => CONTEXT_MODULE,
        'archetypes' => [
            'teacher' => CAP_ALLOW,
            'editingteacher' => CAP_ALLOW,
            'manager' => CAP_ALLOW,
        ],
    ],

    // Approve/un-approve individual submissions in "moderated" visibility
    // mode (moderate.php). Kept separate from viewallsubmissions so a
    // reviewer role could plausibly see everything without also being able
    // to change what other students get to see — the default archetypes
    // below happen to grant both together, same reasoning as edit/grade above.
    'mod/bento:moderatesubmissions' => [
        'riskbitmask' => RISK_XSS,
        'captype' => 'write',
        'contextlevel' => CONTEXT_MODULE,
        'archetypes' => [
            'teacher' => CAP_ALLOW,
            'editingteacher' => CAP_ALLOW,
            'manager' => CAP_ALLOW,
        ],
    ],

    // Fetches an externally-referenced image (from pasted HTML) through
    // this SERVER, sidestepping a browser's own CORS restriction — see
    // image_proxy.php's own doc comment for the full mechanism. Worth
    // being deliberate about who gets this: it makes the Moodle server
    // itself issue an HTTP request to a URL the USER supplies (SSRF
    // protections limit it to public addresses, but it's still server-
    // initiated outbound traffic under that user's action). Off entirely
    // while the plugin's own "Bildproxy aktivieren" admin setting is
    // switched off, regardless of who holds this capability.
    'mod/bento:useimageproxy' => [
        'captype' => 'read',
        'contextlevel' => CONTEXT_MODULE,
        'archetypes' => [
            'teacher' => CAP_ALLOW,
            'editingteacher' => CAP_ALLOW,
            'manager' => CAP_ALLOW,
        ],
    ],

];
