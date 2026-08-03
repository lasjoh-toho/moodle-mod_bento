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

namespace mod_bento\privacy;

defined('MOODLE_INTERNAL') || die();

use core_privacy\local\metadata\collection;
use core_privacy\local\request\approved_contextlist;
use core_privacy\local\request\approved_userlist;
use core_privacy\local\request\contextlist;
use core_privacy\local\request\userlist;
use core_privacy\local\request\writer;
use core_privacy\local\request\helper;

/**
 * Privacy provider for mod_bento.
 *
 * The stored presentation document itself (table `bento`) is shared
 * per-activity content, not personal data — the only personal data this
 * plugin owns is the manually-entered grade/feedback in `bento_grades`.
 * Completion and grade-history are core Moodle systems with their own
 * providers; we only need to account for our own table here.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class provider implements
    \core_privacy\local\metadata\provider,
    \core_privacy\local\request\plugin\provider,
    \core_privacy\local\request\core_userlist_provider {

    public static function get_metadata(collection $collection): collection {
        $collection->add_database_table('bento_grades', [
            'userid' => 'privacy:metadata:bento_grades:userid',
            'grade' => 'privacy:metadata:bento_grades:grade',
            'feedback' => 'privacy:metadata:bento_grades:feedback',
            'timemodified' => 'privacy:metadata:bento_grades:timemodified',
        ], 'privacy:metadata:bento_grades');

        return $collection;
    }

    public static function get_contexts_for_userid(int $userid): contextlist {
        $sql = "SELECT ctx.id
                  FROM {context} ctx
                  JOIN {course_modules} cm ON cm.id = ctx.instanceid AND ctx.contextlevel = :contextlevel
                  JOIN {modules} m ON m.id = cm.module AND m.name = 'bento'
                  JOIN {bento} b ON b.id = cm.instance
                  JOIN {bento_grades} bg ON bg.bentoid = b.id
                 WHERE bg.userid = :userid";

        $params = ['contextlevel' => CONTEXT_MODULE, 'userid' => $userid];

        $contextlist = new contextlist();
        $contextlist->add_from_sql($sql, $params);
        return $contextlist;
    }

    public static function get_users_in_context(userlist $userlist): void {
        $context = $userlist->get_context();
        if (!$context instanceof \context_module) {
            return;
        }
        $sql = "SELECT bg.userid
                  FROM {course_modules} cm
                  JOIN {bento} b ON b.id = cm.instance
                  JOIN {bento_grades} bg ON bg.bentoid = b.id
                 WHERE cm.id = :cmid";
        $userlist->add_from_sql('userid', $sql, ['cmid' => $context->instanceid]);
    }

    public static function export_user_data(approved_contextlist $contextlist): void {
        global $DB;

        $user = $contextlist->get_user();
        foreach ($contextlist->get_contexts() as $context) {
            if (!$context instanceof \context_module) {
                continue;
            }
            $cm = get_coursemodule_from_id('bento', $context->instanceid);
            if (!$cm) {
                continue;
            }
            $bento = $DB->get_record('bento', ['id' => $cm->instance]);
            $grade = $DB->get_record('bento_grades', ['bentoid' => $cm->instance, 'userid' => $user->id]);
            if (!$grade) {
                continue;
            }
            $data = (object) [
                'grade' => $grade->grade,
                'feedback' => $grade->feedback,
                'timemodified' => \core_privacy\local\request\transform::datetime($grade->timemodified),
            ];
            writer::with_context($context)->export_data(
                [get_string('modulename', 'mod_bento')],
                $data
            );
        }
    }

    public static function delete_data_for_all_users_in_context(\context $context): void {
        global $DB;
        if (!$context instanceof \context_module) {
            return;
        }
        $cm = get_coursemodule_from_id('bento', $context->instanceid);
        if (!$cm) {
            return;
        }
        $DB->delete_records('bento_grades', ['bentoid' => $cm->instance]);
    }

    public static function delete_data_for_user(approved_contextlist $contextlist): void {
        global $DB;
        $user = $contextlist->get_user();
        foreach ($contextlist->get_contexts() as $context) {
            if (!$context instanceof \context_module) {
                continue;
            }
            $cm = get_coursemodule_from_id('bento', $context->instanceid);
            if (!$cm) {
                continue;
            }
            $DB->delete_records('bento_grades', ['bentoid' => $cm->instance, 'userid' => $user->id]);
        }
    }

    public static function delete_data_for_users(approved_userlist $userlist): void {
        global $DB;
        $context = $userlist->get_context();
        if (!$context instanceof \context_module) {
            return;
        }
        $cm = get_coursemodule_from_id('bento', $context->instanceid);
        if (!$cm) {
            return;
        }
        foreach ($userlist->get_userids() as $userid) {
            $DB->delete_records('bento_grades', ['bentoid' => $cm->instance, 'userid' => $userid]);
        }
    }
}
