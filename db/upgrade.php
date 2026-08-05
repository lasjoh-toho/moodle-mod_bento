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
 * Upgrade steps for mod_bento.
 *
 * This plugin's build pipeline stamps version.php with a fresh timestamp on
 * every automated build (see the project's build.mjs) rather than hand-
 * incrementing a stable sequence — so upgrade steps here check for the
 * COLUMN/TABLE'S OWN existence (dbman::field_exists / table_exists) instead
 * of gating on an exact $oldversion threshold. Idempotent either way: safe
 * to run against an install that already has these, a stub 0.1.0 install
 * that doesn't, or anything in between.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

function xmldb_bento_upgrade($oldversion) {
    global $DB;

    $dbman = $DB->get_manager();

    // ---- student-submission mode: two new columns on `bento` ----
    $table = new xmldb_table('bento');

    $field = new xmldb_field('allowstudentsubmissions', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '0', 'grade');
    if (!$dbman->field_exists($table, $field)) {
        $dbman->add_field($table, $field);
    }

    $field = new xmldb_field('submissionvisibility', XMLDB_TYPE_CHAR, '20', null, XMLDB_NOTNULL, null, 'auto', 'allowstudentsubmissions');
    if (!$dbman->field_exists($table, $field)) {
        $dbman->add_field($table, $field);
    }

    // ---- new table: one student-authored document per student per instance ----
    $table = new xmldb_table('bento_submissions');
    if (!$dbman->table_exists($table)) {
        $table->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
        $table->add_field('bentoid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);
        $table->add_field('userid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);
        $table->add_field('document', XMLDB_TYPE_TEXT, null, null, null, null, null);
        $table->add_field('status', XMLDB_TYPE_CHAR, '20', null, XMLDB_NOTNULL, null, 'pending');
        $table->add_field('timecreated', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $table->add_field('timemodified', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');

        $table->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
        $table->add_key('bentoid', XMLDB_KEY_FOREIGN, ['bentoid'], 'bento', ['id']);
        $table->add_key('userid', XMLDB_KEY_FOREIGN, ['userid'], 'user', ['id']);
        $table->add_index('bentoid-userid', XMLDB_INDEX_UNIQUE, ['bentoid', 'userid']);

        $dbman->create_table($table);
    }

    return true;
}
