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
 * Library of interface functions and constants for module bento.
 *
 * Grading here is manual, not auto-scored (there's no "correct answer" to a
 * presentation) — this file only provisions the gradebook item; teachers
 * enter marks the usual way, either through the gradebook directly or the
 * small grading panel view.php shows to anyone with mod/bento:grade.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/** Longest bento/slides JSON we'll store — guards against a runaway upload. Matches LONGTEXT's practical limit with headroom. */
define('BENTO_MAX_DOCUMENT_BYTES', 60 * 1024 * 1024);

/**
 * Declares optional features this module supports.
 *
 * @param string $feature FEATURE_xx constant
 * @return mixed true/false, a string, or null if unknown
 */
function bento_supports($feature) {
    switch ($feature) {
        case FEATURE_MOD_INTRO:
            return true;
        case FEATURE_SHOW_DESCRIPTION:
            return true;
        case FEATURE_GRADE_HAS_GRADE:
            return true;
        case FEATURE_GRADE_OUTCOMES:
            return true;
        case FEATURE_COMPLETION_TRACKS_VIEWS:
            return true;
        case FEATURE_COMPLETION_HAS_RULES:
            return false; // view-tracking (above) covers "opened it"; no extra custom rule needed for v1.
        case FEATURE_BACKUP_MOODLE2:
            return false; // not implemented yet — see README "Known gaps".
        case FEATURE_MOD_PURPOSE:
            return defined('MOD_PURPOSE_CONTENT') ? MOD_PURPOSE_CONTENT : null;
        default:
            return null;
    }
}

/**
 * Saves a new instance (called when a teacher first adds the activity).
 *
 * @param stdClass $bento Data from mod_form.php
 * @param mod_bento_mod_form|null $mform
 * @return int the new instance id
 */
function bento_add_instance(stdClass $bento, $mform = null) {
    global $DB;

    $bento->timecreated = time();
    $bento->timemodified = $bento->timecreated;
    $bento->document = bento_validate_document($bento->document ?? '');

    $bento->id = $DB->insert_record('bento', $bento);

    bento_grade_item_update($bento);
    bento_update_calendar($bento);

    return $bento->id;
}

/**
 * Updates an existing instance.
 *
 * @param stdClass $bento Data from mod_form.php
 * @param mod_bento_mod_form|null $mform
 * @return bool true
 */
function bento_update_instance(stdClass $bento, $mform = null) {
    global $DB;

    $bento->timemodified = time();
    $bento->id = $bento->instance;
    if (isset($bento->document)) {
        $bento->document = bento_validate_document($bento->document);
    }

    $DB->update_record('bento', $bento);

    bento_grade_item_update($bento);
    bento_update_calendar($bento);

    return true;
}

/**
 * Deletes an instance.
 *
 * @param int $id instance id
 * @return bool true on success
 */
function bento_delete_instance($id) {
    global $DB;

    if (!$bento = $DB->get_record('bento', ['id' => $id])) {
        return false;
    }

    $DB->delete_records('bento_submissions', ['bentoid' => $id]);
    $DB->delete_records('bento_grades', ['bentoid' => $id]);
    $DB->delete_records('bento', ['id' => $id]);

    $bento->cmidnumber = null;
    bento_grade_item_delete($bento);

    return true;
}

/**
 * Returns a small object used for the course-page "recent activity" block.
 * Kept minimal for v1 — no per-user activity feed yet.
 *
 * @param stdClass $course
 * @param bool $viewfullnames
 * @param int $timestart
 * @return bool false (nothing reported for v1)
 */
function bento_print_recent_activity($course, $viewfullnames, $timestart) {
    return false;
}

/**
 * Keeps the plugin's calendar event (based on an optional due/duedate) current.
 * v1 has no due date field, so this is a no-op placeholder kept for forward
 * compatibility with mod_form should one be added later.
 *
 * @param stdClass $bento
 * @return void
 */
function bento_update_calendar(stdClass $bento): void {
    // No due date in v1 — nothing to schedule.
}

/**
 * Validates/normalises a submitted bento/slides document before storage.
 * Falls back to a single-slide blank deck if the JSON is missing or malformed
 * — this can happen if a teacher saves the form before ever opening the
 * editor once (e.g. just naming the activity first).
 *
 * @param string $json raw JSON as submitted by the hidden form field
 * @return string a compact, validated bento/slides JSON string
 */
function bento_validate_document(string $json): string {
    $json = trim($json);
    if ($json === '' || strlen($json) > BENTO_MAX_DOCUMENT_BYTES) {
        return bento_blank_document();
    }
    $decoded = json_decode($json, true);
    if (!is_array($decoded) || ($decoded['format'] ?? null) !== 'bento/slides' || empty($decoded['slides'])) {
        return bento_blank_document();
    }
    // A Moodle-hosted activity is always meant to be editable in edit.php —
    // Bento's own main.ts checks doc.readonly to decide whether to show the
    // full editor (toolbar, Save button, the works) or a minimal read-only
    // "Present / Save a copy" card instead. An imported or merged source
    // file could carry this flag from wherever it came from; strip it
    // unconditionally so that quirk of a source file can never hide the
    // whole editor toolbar in a Moodle activity.
    unset($decoded['readonly']);
    return json_encode($decoded);
}

/**
 * A minimal valid bento/slides document — one empty slide.
 *
 * @return string
 */
function bento_blank_document(): string {
    return json_encode([
        'format' => 'bento/slides',
        'version' => 1,
        'docId' => bin2hex(random_bytes(8)),
        'title' => 'Neue Präsentation',
        'size' => ['width' => 1280, 'height' => 720],
        'theme' => [
            'background' => '#FFFFFF', 'color' => '#111111',
            'accent' => '#FF9E5E', 'fontFamily' => 'system-ui, sans-serif',
        ],
        'slides' => [
            ['id' => 's1', 'background' => '#FFFFFF', 'transition' => 'none', 'elements' => [], 'notes' => ''],
        ],
        'modified' => date('c'),
    ]);
}

/**
 * Guards against exactly the class of error just reported: the plugin's
 * CODE files updated (a fresh mod_bento.zip re-installed) while the
 * DATABASE schema hasn't caught up — Moodle's own upgrade step (Site
 * administration → Notifications) is a separate, easy-to-miss manual
 * action from updating the files themselves, and skipping it means code
 * touches a column/table that doesn't exist yet, surfacing as a cryptic
 * dmlreadexception with no obvious cause.
 *
 * Compares the code's own declared version (version.php) against what
 * Moodle recorded as the last successfully upgraded version for this
 * plugin (get_config, itself cached — this adds no real per-request cost)
 * and fails with a clear, actionable message instead of letting that raw
 * SQL error surface. Call this near the top of any entry point that
 * touches schema newer than the original v1 install — student
 * submissions, draft/publish grading.
 *
 * @return void
 * @throws moodle_exception if the code is ahead of the installed schema
 */
function bento_require_current_schema(): void {
    global $CFG;
    $plugin = new stdClass();
    require($CFG->dirroot . '/mod/bento/version.php');
    $codeversion = (int) $plugin->version;
    $installedversion = (int) get_config('mod_bento', 'version');
    if ($installedversion < $codeversion) {
        throw new moodle_exception('schemaoutofdate', 'mod_bento', '', (object) [
            'installed' => $installedversion,
            'code' => $codeversion,
        ]);
    }
}

// ---------------------------------------------------------------------
// Student submissions (bento.allowstudentsubmissions). Each enrolled
// student gets their OWN row in bento_submissions instead of everyone
// sharing bento.document — see that table's comment in install.xml, and
// submission.php / edit.php for where these get used.
// ---------------------------------------------------------------------

/**
 * Finds a student's own submission for this instance, if they already have
 * one. Never creates one — see bento_get_or_create_submission() for that.
 *
 * @param int $bentoid
 * @param int $userid
 * @return stdClass|false
 */
function bento_get_submission(int $bentoid, int $userid) {
    global $DB;
    return $DB->get_record('bento_submissions', ['bentoid' => $bentoid, 'userid' => $userid]);
}

/**
 * Finds a student's own submission, creating an empty one on first visit —
 * the "anlegen" (create) half of "anlegen oder importieren"; the "importieren"
 * half is the SAME import/merge widget mod_form.php already uses for the
 * teacher's own document, reused here (see submission_new.php).
 *
 * @param int $bentoid
 * @param int $userid
 * @return stdClass the (possibly just-created) submission row
 */
function bento_get_or_create_submission(int $bentoid, int $userid): stdClass {
    $existing = bento_get_submission($bentoid, $userid);
    if ($existing) {
        return $existing;
    }
    return bento_create_submission($bentoid, $userid, bento_blank_document());
}

/**
 * Creates a student's submission row outright with the given starting
 * document — used both for the blank-deck case above and for the "import a
 * .pptx/.json/.bento.html as my starting deck" flow (submission_new.php),
 * where the document is already known at creation time.
 *
 * New submissions always start 'pending' — meaningless in 'auto' visibility
 * mode (ignored entirely there) but the correct starting point in
 * 'moderated' mode: nothing is visible to classmates until a teacher
 * approves it, not even a just-created blank deck.
 *
 * @param int $bentoid
 * @param int $userid
 * @param string $document raw bento/slides JSON, NOT yet validated
 * @return stdClass the newly created submission row
 */
function bento_create_submission(int $bentoid, int $userid, string $document): stdClass {
    global $DB;
    $now = time();
    $record = (object) [
        'bentoid' => $bentoid,
        'userid' => $userid,
        'document' => bento_validate_document($document),
        'status' => 'pending',
        'timecreated' => $now,
        'timemodified' => $now,
    ];
    $record->id = $DB->insert_record('bento_submissions', $record);
    return $record;
}

/**
 * Every submission the given user is currently ALLOWED to see for this
 * instance — their own (always, regardless of status) plus classmates'
 * submissions per the instance's visibility setting: all of them if
 * 'auto', only 'approved' ones if 'moderated'. A user with
 * mod/bento:viewallsubmissions (teachers) bypasses the moderation filter
 * entirely and sees every submission, own or not.
 *
 * @param stdClass $bento
 * @param int $userid
 * @param bool $bypassmoderation true for anyone with mod/bento:viewallsubmissions
 * @return stdClass[] keyed by submission id, each with a joined-in ->fullname
 */
function bento_visible_submissions(stdClass $bento, int $userid, bool $bypassmoderation): array {
    global $DB;

    $userfields = \core_user\fields::for_name()->get_sql('u', false, '', '', false)->selects;
    $showallregardlessofstatus = $bypassmoderation || $bento->submissionvisibility !== 'moderated';
    $visibilitycondition = $showallregardlessofstatus ? '1 = 1' : "s.status = 'approved'";

    $sql = "SELECT s.*, {$userfields}
              FROM {bento_submissions} s
              JOIN {user} u ON u.id = s.userid
             WHERE s.bentoid = :bentoid
               AND (s.userid = :userid OR {$visibilitycondition})
          ORDER BY u.lastname, u.firstname";
    return $DB->get_records_sql($sql, ['bentoid' => $bento->id, 'userid' => $userid]);
}

// ---------------------------------------------------------------------
// Grading. Manual entry, same pattern as simple ungraded-by-default
// activities that still want a gradebook slot (e.g. mod_choice with
// grading enabled) — this module never computes a grade itself.
// ---------------------------------------------------------------------

/**
 * Creates/updates the grade_item for a bento instance.
 *
 * @param stdClass $bento object with at least id, course, name, grade
 * @param mixed $grades optional grade or array of grades to push through
 * @return int GRADE_UPDATE_OK or an error constant
 */
function bento_grade_item_update(stdClass $bento, $grades = null) {
    global $CFG;
    require_once($CFG->libdir . '/gradelib.php');

    $item = [];
    $item['itemname'] = clean_param($bento->name, PARAM_NOTAGS);

    $grade = isset($bento->grade) ? (int) $bento->grade : 0;
    if ($grade > 0) {
        $item['gradetype'] = GRADE_TYPE_VALUE;
        $item['grademax']  = $grade;
        $item['grademin']  = 0;
    } else if ($grade < 0) {
        // Moodle's standard convention: a negative grade field value means
        // "use scale id X", not "X points" — mixing these up (treating it as
        // a negative point max) is exactly the kind of malformed grade_item
        // that can surface later as an obscure database error, on ANY page
        // that subsequently reads this activity's grade item.
        $item['gradetype'] = GRADE_TYPE_SCALE;
        $item['scaleid']   = -$grade;
    } else {
        $item['gradetype'] = GRADE_TYPE_NONE;
    }

    if ($grades === 'reset') {
        $item['reset'] = true;
        $grades = null;
    }

    return grade_update('mod/bento', $bento->course, 'mod', 'bento', $bento->id, 0, $grades, $item);
}

/**
 * Removes the grade_item for a bento instance (called on delete).
 *
 * @param stdClass $bento
 * @return int GRADE_UPDATE_OK or an error constant
 */
function bento_grade_item_delete(stdClass $bento) {
    global $CFG;
    require_once($CFG->libdir . '/gradelib.php');

    return grade_update('mod/bento', $bento->course, 'mod', 'bento', $bento->id, 0, null, ['deleted' => 1]);
}

/**
 * Pushes one or all users' manually-entered grades into the gradebook,
 * AND sets each pushed grade's own hidden flag to match its `published`
 * column — the actual mechanism behind "note a grade, publish it later":
 * grade_update() alone would make a freshly-entered grade visible in the
 * gradebook immediately, same as any other activity; a per-grade
 * grade_grade->hidden flag (set via the documented set_hidden() API,
 * right after grade_update() has ensured the grade_grade row exists) is
 * what actually keeps a draft grade invisible to its student until this
 * plugin's own publish action flips it.
 *
 * @param stdClass $bento
 * @param int $userid 0 = all users
 * @return void
 */
function bento_update_grades(stdClass $bento, int $userid = 0): void {
    global $CFG, $DB;
    require_once($CFG->libdir . '/gradelib.php');

    $conditions = ['bentoid' => $bento->id];
    if ($userid) {
        $conditions['userid'] = $userid;
    }
    $grades = $DB->get_records('bento_grades', $conditions);
    $gradelist = [];
    foreach ($grades as $g) {
        $gradelist[$g->userid] = ['userid' => $g->userid, 'rawgrade' => $g->grade];
    }
    bento_grade_item_update($bento, $gradelist ?: null);

    foreach ($grades as $g) {
        bento_set_grade_visibility($bento, (int) $g->userid, (bool) $g->published);
    }
}

/**
 * Shows or hides ONE student's already-pushed grade in the real gradebook
 * — the grade_item itself (shared by every student) stays visible either
 * way; only that one student's own grade_grade row's hidden flag changes.
 * A no-op if the grade hasn't reached the gradebook yet (grade_update()
 * needs to run first — bento_update_grades() above always does both in
 * the right order).
 *
 * @param stdClass $bento
 * @param int $userid
 * @param bool $published true = visible to the student, false = hidden
 * @return void
 */
function bento_set_grade_visibility(stdClass $bento, int $userid, bool $published): void {
    global $CFG;
    require_once($CFG->libdir . '/grade/grade_item.php');
    require_once($CFG->libdir . '/grade/grade_grade.php');

    $gradeitem = grade_item::fetch([
        'courseid' => $bento->course, 'itemtype' => 'mod', 'itemmodule' => 'bento',
        'iteminstance' => $bento->id, 'itemnumber' => 0,
    ]);
    if (!$gradeitem) {
        return;
    }
    $gradegrade = grade_grade::fetch(['itemid' => $gradeitem->id, 'userid' => $userid]);
    if (!$gradegrade) {
        return;
    }
    $gradegrade->set_hidden($published ? 0 : 1);
}

/**
 * Adds "Bearbeiten" (edit.php) and "Bewerten" (grade.php) links to the
 * activity's settings/gear menu — this IS the "open a new Moodle page from
 * edit mode" entry point teachers use; view.php itself always stays the
 * plain immersive present-mode page every user (including teachers,
 * previewing) lands on.
 *
 * @param settings_navigation $settings
 * @param navigation_node $bentonode
 * @return void
 */
function bento_extend_settings_navigation(settings_navigation $settings, navigation_node $bentonode): void {
    global $PAGE, $DB;

    $cm = $PAGE->cm;
    if (!$cm) {
        return;
    }
    $context = context_module::instance($cm->id);

    if (has_capability('mod/bento:edit', $context)) {
        $bentonode->add(
            get_string('editpresentation', 'mod_bento'),
            new moodle_url('/mod/bento/edit.php', ['id' => $cm->id]),
            navigation_node::TYPE_SETTING,
            null,
            'bentoedit',
            new pix_icon('t/edit', '')
        );
    }
    if (has_capability('mod/bento:grade', $context)) {
        $bentonode->add(
            get_string('gradepresentation', 'mod_bento'),
            new moodle_url('/mod/bento/grade.php', ['id' => $cm->id]),
            navigation_node::TYPE_SETTING,
            null,
            'bentograde',
            new pix_icon('i/grades', '')
        );
    }
    if (has_capability('mod/bento:moderatesubmissions', $context)) {
        $bento = $DB->get_record('bento', ['id' => $cm->instance]);
        if ($bento && $bento->allowstudentsubmissions) {
            $bentonode->add(
                get_string('moderatesubmissions', 'mod_bento'),
                new moodle_url('/mod/bento/moderate.php', ['id' => $cm->id]),
                navigation_node::TYPE_SETTING,
                null,
                'bentomoderate',
                new pix_icon('i/check', '')
            );
        }
    }
}

// ---------------------------------------------------------------------
// Viewing / completion.
// ---------------------------------------------------------------------

/**
 * Marks the module viewed for completion purposes and triggers the
 * standard viewed event (feeds logs + "recent activity").
 *
 * @param stdClass $bento
 * @param stdClass $course
 * @param cm_info|stdClass $cm
 * @param context_module $context
 * @return void
 */
function bento_view(stdClass $bento, stdClass $course, $cm, context_module $context): void {
    $params = [
        'context' => $context,
        'objectid' => $bento->id,
    ];
    $event = \mod_bento\event\course_module_viewed::create($params);
    $event->add_record_snapshot('bento', $bento);
    $event->trigger();

    $completion = new completion_info($course);
    $completion->set_module_viewed($cm);
}

/**
 * Serves the introduction's embedded files (standard mod_intro pattern) —
 * the presentation document itself is never served this way, it's inlined
 * directly by view.php/edit.php.
 *
 * @param stdClass $course
 * @param cm_info $cm
 * @param context $context
 * @param string $filearea
 * @param array $args
 * @param bool $forcedownload
 * @param array $options
 * @return bool
 */
function bento_pluginfile($course, $cm, $context, $filearea, $args, $forcedownload, array $options = []) {
    if ($context->contextlevel != CONTEXT_MODULE) {
        return false;
    }
    require_course_login($course, true, $cm);
    if ($filearea !== 'intro') {
        return false;
    }
    $itemid = array_shift($args);
    $fs = get_file_storage();
    $relativepath = implode('/', $args);
    $fullpath = "/{$context->id}/mod_bento/intro/0/{$relativepath}";
    $file = $fs->get_file_by_hash(sha1($fullpath));
    if (!$file || $file->is_directory()) {
        return false;
    }
    send_stored_file($file, null, 0, $forcedownload, $options);
    return true;
}
