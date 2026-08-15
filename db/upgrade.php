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

    require_once(__DIR__ . '/../lib.php');
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

    $field = new xmldb_field('duedate', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0', 'submissionvisibility');
    if (!$dbman->field_exists($table, $field)) {
        $dbman->add_field($table, $field);
    }

    $field = new xmldb_field('duedatevisible', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '1', 'duedate');
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

    // ---- draft/publish grading: one new column on bento_grades ----
    $table = new xmldb_table('bento_grades');
    $field = new xmldb_field('published', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '0', 'feedback');
    if (!$dbman->field_exists($table, $field)) {
        $dbman->add_field($table, $field);
        // Grades entered before this column existed were already pushed
        // straight into the gradebook, visible — leave them exactly as
        // visible as they already were rather than retroactively hiding
        // existing marks the moment this upgrade runs. Only grades entered
        // from here on default to the new draft-first behaviour (the
        // column's own DEFAULT '0' above, used for any row inserted after
        // this point).
        $DB->set_field('bento_grades', 'published', 1, []);
    }

    // ---- per-instance login-only flag: one new column on `bento` ----
    $table = new xmldb_table('bento');
    $field = new xmldb_field('loginonly', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '0', 'duedatevisible');
    if (!$dbman->field_exists($table, $field)) {
        $dbman->add_field($table, $field);
    }

    // ---- per-instance student-paste-tile flag: one new column on `bento` ----
    $table = new xmldb_table('bento');
    $field = new xmldb_field('allowstudentpaste', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '0', 'loginonly');
    if (!$dbman->field_exists($table, $field)) {
        $dbman->add_field($table, $field);
    }

    // ---- new table: site-wide terms-of-use agreement, one row per user ----
    $table = new xmldb_table('bento_agreements');
    if (!$dbman->table_exists($table)) {
        $table->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
        $table->add_field('userid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);
        $table->add_field('termshash', XMLDB_TYPE_CHAR, '40', null, XMLDB_NOTNULL, null, null);
        $table->add_field('timemodified', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');

        $table->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
        $table->add_index('userid_uix', XMLDB_INDEX_UNIQUE, ['userid']);

        $dbman->create_table($table);
    }

    // ---- termsofuse used to be passed as the admin_setting's own
    // constructor default (settings.php), which Moodle falls back to for
    // get_config() even when nothing was ever explicitly saved — so an
    // install that only ever saw that fallback value now needs it written
    // as a REAL config row here, or it would silently go empty the moment
    // that constructor default is removed (see settings.php's own doc
    // comment on why it was removed: it also showed as raw, unrendered
    // markup in that page's "Default: …" caption). A real config value
    // set here or by db/install.php on a fresh install always takes
    // priority over any constructor default regardless, so this is a
    // no-op for anyone who already explicitly saved something (their own
    // choice, empty or not, is left exactly as-is). ----
    if (get_config('mod_bento', 'termsofuse') === false) {
        set_config('termsofuse', bento_default_termsofuse(), 'mod_bento');
    }

    // ---- new table: draft decks, kept separate from bento.document ----
    $table = new xmldb_table('bento_decks');
    if (!$dbman->table_exists($table)) {
        $table->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
        $table->add_field('bentoid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);
        $table->add_field('sortorder', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '1');
        $table->add_field('name', XMLDB_TYPE_CHAR, '255', null, null, null, null);
        $table->add_field('document', XMLDB_TYPE_TEXT, null, null, XMLDB_NOTNULL, null, null);
        $table->add_field('timecreated', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $table->add_field('timemodified', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');

        $table->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
        $table->add_index('bentoid-sortorder', XMLDB_INDEX_NOTUNIQUE, ['bentoid', 'sortorder']);

        $dbman->create_table($table);
    }

    // ---- per-instance max document size (MB): one new column on `bento` ----
    // Existing rows get 20 (install.xml's own default), matching the
    // absolutemaxdocumentsize admin setting's own constructor default —
    // this is a fresh field with nothing sensible to backfill it from, so
    // "whatever a brand-new activity would already start at" is the least
    // surprising choice for anyone upgrading.
    $table = new xmldb_table('bento');
    $field = new xmldb_field('maxdocumentsize', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '20', 'allowstudentpaste');
    if (!$dbman->field_exists($table, $field)) {
        $dbman->add_field($table, $field);
    }

    return true;
}
