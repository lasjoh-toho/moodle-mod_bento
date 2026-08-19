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

require_once($CFG->dirroot . '/mod/bento/lib.php');

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
 * The TEACHER's shared master document (table `bento`, the `document`
 * column) is per-activity content, not personal data. Two things ARE
 * personal data, both handled identically below: the manually-entered
 * grade/feedback in `bento_grades`, and — once student submissions are
 * enabled (bento.allowstudentsubmissions) — each student's OWN authored
 * presentation in `bento_submissions`, which is personal precisely because
 * it's their own created content, same reasoning as an assignment
 * submission's file content would be.
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
            'published' => 'privacy:metadata:bento_grades:published',
            'timemodified' => 'privacy:metadata:bento_grades:timemodified',
        ], 'privacy:metadata:bento_grades');

        $collection->add_database_table('bento_submissions', [
            'userid' => 'privacy:metadata:bento_submissions:userid',
            'document' => 'privacy:metadata:bento_submissions:document',
            'status' => 'privacy:metadata:bento_submissions:status',
            'timecreated' => 'privacy:metadata:bento_submissions:timecreated',
            'timemodified' => 'privacy:metadata:bento_submissions:timemodified',
        ], 'privacy:metadata:bento_submissions');

        return $collection;
    }

    public static function get_contexts_for_userid(int $userid): contextlist {
        $sql = "SELECT ctx.id
                  FROM {context} ctx
                  JOIN {course_modules} cm ON cm.id = ctx.instanceid AND ctx.contextlevel = :contextlevel
                  JOIN {modules} m ON m.id = cm.module AND m.name = 'bento'
                  JOIN {bento} b ON b.id = cm.instance
             LEFT JOIN {bento_grades} bg ON bg.bentoid = b.id AND bg.userid = :userid1
             LEFT JOIN {bento_submissions} bs ON bs.bentoid = b.id AND bs.userid = :userid2
                 WHERE bg.userid = :userid3 OR bs.userid = :userid4";

        $params = [
            'contextlevel' => CONTEXT_MODULE,
            'userid1' => $userid, 'userid2' => $userid, 'userid3' => $userid, 'userid4' => $userid,
        ];

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
                 WHERE cm.id = :cmid1
                 UNION
                SELECT bs.userid
                  FROM {course_modules} cm
                  JOIN {bento} b ON b.id = cm.instance
                  JOIN {bento_submissions} bs ON bs.bentoid = b.id
                 WHERE cm.id = :cmid2";
        $userlist->add_from_sql('userid', $sql, ['cmid1' => $context->instanceid, 'cmid2' => $context->instanceid]);
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

            $grade = $DB->get_record('bento_grades', ['bentoid' => $cm->instance, 'userid' => $user->id]);
            if ($grade) {
                writer::with_context($context)->export_data(
                    [get_string('modulename', 'mod_bento'), get_string('privacy:gradesubcontext', 'mod_bento')],
                    (object) [
                        'grade' => $grade->grade,
                        'feedback' => $grade->feedback,
                        'published' => (bool) $grade->published,
                        'timemodified' => \core_privacy\local\request\transform::datetime($grade->timemodified),
                    ]
                );
            }

            $submission = $DB->get_record('bento_submissions', ['bentoid' => $cm->instance, 'userid' => $user->id]);
            if ($submission) {
                // The document itself is exported as a title/slide-count
                // summary rather than the full JSON — the raw document can
                // be MBs of embedded images, which the export writer isn't
                // meant for; the presentation itself is still reachable to
                // the user directly inside the activity while their account
                // exists.
                $submissiondoc = bento_get_document($context, (bool) $submission->documentinfilestore, $submission->id, $submission->document, BENTO_SUBMISSION_FILEAREA);
                $decoded = json_decode($submissiondoc, true);
                $slidecount = is_array($decoded['slides'] ?? null) ? count($decoded['slides']) : 0;
                writer::with_context($context)->export_data(
                    [get_string('modulename', 'mod_bento'), get_string('privacy:submissionsubcontext', 'mod_bento')],
                    (object) [
                        'title' => $decoded['title'] ?? '',
                        'slidecount' => $slidecount,
                        'status' => $submission->status,
                        'timecreated' => \core_privacy\local\request\transform::datetime($submission->timecreated),
                        'timemodified' => \core_privacy\local\request\transform::datetime($submission->timemodified),
                    ]
                );
            }
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
        // Every submission for this activity is being wiped regardless of
        // which one it was — delete every file in the submission filearea
        // at once (no itemid) rather than looking up each row's own id
        // first just to delete them one at a time.
        get_file_storage()->delete_area_files($context->id, BENTO_DOCUMENT_COMPONENT, BENTO_SUBMISSION_FILEAREA);
        $DB->delete_records('bento_submissions', ['bentoid' => $cm->instance]);
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
            $submission = $DB->get_record('bento_submissions', ['bentoid' => $cm->instance, 'userid' => $user->id], 'id');
            if ($submission) {
                get_file_storage()->delete_area_files($context->id, BENTO_DOCUMENT_COMPONENT, BENTO_SUBMISSION_FILEAREA, $submission->id);
            }
            $DB->delete_records('bento_submissions', ['bentoid' => $cm->instance, 'userid' => $user->id]);
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
            $submission = $DB->get_record('bento_submissions', ['bentoid' => $cm->instance, 'userid' => $userid], 'id');
            if ($submission) {
                get_file_storage()->delete_area_files($context->id, BENTO_DOCUMENT_COMPONENT, BENTO_SUBMISSION_FILEAREA, $submission->id);
            }
            $DB->delete_records('bento_submissions', ['bentoid' => $cm->instance, 'userid' => $userid]);
        }
    }
}
