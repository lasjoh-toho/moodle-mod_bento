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
 * The actual size ceiling (bytes) that applies to ONE activity's saves —
 * the smaller of its own maxdocumentsize (mod_form.php, megabytes) and the
 * site-wide absolutemaxdocumentsize admin setting (settings.php), so a
 * teacher raising their own activity's limit can never exceed what the
 * admin allows site-wide, only ever tighten it further. Falls back to the
 * admin's own value alone if the activity row somehow doesn't have its own
 * (a pre-upgrade row db/upgrade.php hasn't backfilled yet, say) — never to
 * BENTO_MAX_DOCUMENT_BYTES itself, which stays a separate, unconditional
 * outer safety cap regardless of either setting.
 *
 * @param object $bento a full `bento` table row (needs ->maxdocumentsize,
 *   and ->maxstudentdocumentsize when $forstudentsubmission is true)
 * @param bool $forstudentsubmission true for a student's own submission
 *   (bento_submissions) — uses the activity's own maxstudentdocumentsize
 *   instead of maxdocumentsize when that's genuinely set (>0); falls back
 *   to the SAME maxdocumentsize the teacher's own document uses otherwise,
 *   so an activity that's never touched this separate setting keeps
 *   exactly the single-limit behaviour it always had. false (the default)
 *   is the teacher's own document, or a draft deck — always maxdocumentsize.
 * @return int effective ceiling in bytes
 */
function bento_effective_max_document_bytes(object $bento, bool $forstudentsubmission = false): int {
    $absolutemb = (int) (get_config('mod_bento', 'absolutemaxdocumentsize') ?: 20);
    $studentmb = (int) ($bento->maxstudentdocumentsize ?? 0);
    $ownmb = ($forstudentsubmission && $studentmb > 0) ? $studentmb : (int) ($bento->maxdocumentsize ?? $absolutemb);
    $effectivemb = ($ownmb > 0) ? min($ownmb, $absolutemb) : $absolutemb;
    return $effectivemb * 1024 * 1024;
}

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

    bento_safe_grade_item_update($bento);
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
    if (isset($bento->document) && $bento->document === '__bento_saved_via_ajax__') {
        // Set by bentoconvert.js's own submit handler for the common case:
        // the document was already saved via the mod_bento_save_document
        // web service, in the same submit, before this form POST even
        // happened (see mod_form.php's own comment on this field for the
        // full flow). Unsetting rather than assigning the sentinel through
        // means update_record() below never touches `document` at all,
        // leaving whatever the AJAX save already wrote — into file storage,
        // per save_document.php's own teacher-edit branch — in place.
        unset($bento->document);
    } else if (isset($bento->document)) {
        // A genuine document arrived here directly (bentoconvert.js's own
        // AJAX-first path didn't run — its fallback branch, or a JS
        // failure) — must go into file storage too, not just the text
        // column, whenever this row already has (or is gaining) content
        // there. Otherwise bento_get_document() would keep preferring a
        // now-stale file over this fresh write, silently discarding
        // whatever the person just saved through this path.
        $bento->document = bento_validate_document($bento->document);
        $cm = get_coursemodule_from_instance('bento', $bento->id, 0, false, MUST_EXIST);
        $context = context_module::instance($cm->id);
        bento_put_document($context, $bento->id, $bento->document);
        $bento->documentinfilestore = 1;
    }

    $DB->update_record('bento', $bento);

    bento_safe_grade_item_update($bento);
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
 * Whether a decoded document has the minimum structure every consumer
 * downstream assumes without checking again — format/slides (already
 * checked everywhere this mattered) AND size (wasn't, until a document
 * missing it got through this exact gap, got stored, and crashed the
 * editor entirely on next open with "This file could not start" — size
 * isn't optional in bento/slides' own type, but nothing server-side was
 * actually enforcing that before this). The one place every document-
 * structure check across this plugin (both save webservices, plus
 * bento_validate_document() right below) now goes through, so a future
 * gap like this only ever needs fixing once.
 *
 * @param mixed $decoded json_decode()'d document, or anything else
 * @return bool
 */
function bento_document_has_valid_structure($decoded): bool {
    return is_array($decoded)
        && ($decoded['format'] ?? null) === 'bento/slides'
        && !empty($decoded['slides'])
        && isset($decoded['size']['width'], $decoded['size']['height'])
        && is_numeric($decoded['size']['width'])
        && is_numeric($decoded['size']['height']);
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
    if (!bento_document_has_valid_structure($decoded)) {
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

/**
 * The <meta name="bento-moodle-config"> tag that tells Bento's own Save
 * button (editor/moodle.ts) it's running inside this Moodle activity and
 * should save via mod_bento_save_document instead of normal local-file
 * behaviour. Originally only edit.php ever needed this — now view.php and
 * submission.php also inject it, but ONLY for whichever document the
 * current viewer is actually entitled to edit (see those files' own
 * comments), so opening the activity and pressing Escape to edit+save
 * directly still works for whoever owns that document, without opening the
 * door to editing something that isn't theirs.
 *
 * @param int $cmid
 * @param int $deckid
 * @param int[] $playlistdeckids ordered ids of OTHER decks to play through
 *   after this document's own last slide — see view.php's own visible-
 *   decks query for how this list is built. Empty means "just this one
 *   document", same as before this parameter existed.
 * @return string
 */
function bento_moodle_config_meta(int $cmid, int $deckid = 0, array $playlistdeckids = []): string {
    global $CFG;
    $moodleconfig = [
        'cmid' => $cmid,
        'sesskey' => sesskey(),
        'wwwroot' => $CFG->wwwroot,
        'savetimeout' => (int) (get_config('mod_bento', 'savetimeout') ?: 600),
    ];
    if ($deckid > 0) {
        $moodleconfig['deckid'] = $deckid;
    }
    if ($playlistdeckids) {
        $moodleconfig['playlist'] = array_map(function (int $id) use ($cmid): array {
            return ['url' => (new moodle_url('/mod/bento/deck.php', ['id' => $cmid, 'deckid' => $id]))->out(false)];
        }, $playlistdeckids);
    }
    // json_encode's default escaping already turns '<' into '\u003c' inside
    // string values — safe to drop straight into an HTML attribute — but the
    // attribute itself still needs its own quotes escaped, and any literal
    // '$' neutralised too: every caller drops this straight into a
    // preg_replace() REPLACEMENT string, where '$' has its own special
    // meaning (backreferences).
    $configattr = str_replace('$', '\\$', htmlspecialchars(json_encode($moodleconfig), ENT_QUOTES, 'UTF-8'));
    return '<meta name="bento-moodle-config" content="' . $configattr . '">';
}

/**
 * A small, fixed-position toolbar injected directly into the raw page
 * (view.php/edit.php/submission.php splice the whole Bento app in as one
 * page, no Moodle navigation chrome at all — Escape from present mode
 * there previously landed in Bento's own minimal read-only player, or the
 * live editor, with no way back to anything Moodle-side built in: not the
 * course, not a way to add/organize material, and no visible indication
 * that manage.php's own tiles even exist). z-index deliberately far above
 * anything Bento's own present-mode overlay uses, so it stays visible and
 * clickable through present mode too, not just the player card/editor.
 *
 * Two compact icon buttons, not text pills — the previous text-label pills
 * covered the slide name input field at the top of the editor. Both
 * labels moved into their own tooltips instead.
 *
 * @param moodle_url $backtarget where "×" points
 * @param string $backlabel its own tooltip text
 * @param int $cmid this activity's own course-module id
 * @param bool $caneditmaster whether "+" (leads to manage.php) should show
 *   at all — a student viewing the classic single document has no use for
 *   the tile importer, which is teacher/master-document only
 * @return string
 */
function bento_toolbar_html(moodle_url $backtarget, string $backlabel, int $cmid, bool $caneditmaster): string {
    $btnstyle = 'display:flex;align-items:center;justify-content:center;width:36px;height:36px;'
        . 'font:600 18px/1 system-ui, -apple-system, sans-serif;text-decoration:none;';
    $wrapstyle = 'position:fixed;top:6px;left:14px;z-index:2147483647;display:flex;'
        . 'border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.25);backdrop-filter:blur(10px);';

    $buttons = '<a href="' . s($backtarget->out(false)) . '" title="' . s($backlabel) . '" '
        . 'style="' . $btnstyle . 'background:rgba(255,255,255,.85);color:#14161c;">&times;</a>';

    if ($caneditmaster) {
        $manageurl = new moodle_url('/mod/bento/manage.php', ['id' => $cmid]);
        $buttons .= '<a href="' . s($manageurl->out(false)) . '" title="' . s(get_string('managepresentation', 'mod_bento')) . '" '
            . 'style="' . $btnstyle . 'background:#f7a600;color:#3a2a00;">+</a>';
    }

    // Hidden automatically while present mode's own overlay is showing (a
    // lightweight poll for .bento-present-overlay — present mode already
    // has its own exit gesture, and this toolbar isn't meant to appear
    // there at all, only once back in the actual editor/viewer).
    return '<div id="mod-bento-toolbar" style="' . $wrapstyle . '">' . $buttons . '</div>'
        . '<script>(function(){var l=document.getElementById("mod-bento-toolbar");'
        . 'setInterval(function(){l.style.display=document.querySelector(".bento-present-overlay")?"none":"flex";},250);'
        . '})();</script>';
}

/**
 * A small fixed banner telling a student their submission is now
 * read-only because bento.duedate has passed — injected the same way as
 * bento_toolbar_html(), for the same reason (edit.php splices the whole
 * app in as one raw page, no Moodle chrome to hang a notification off of).
 *
 * @param int $duedate
 * @return string
 */
function bento_deadline_passed_banner_html(int $duedate): string {
    $when = userdate($duedate);
    $text = get_string('deadlinepassednotice', 'mod_bento', $when);
    return '<div style="position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:2147483647;'
        . 'font:600 13px system-ui, -apple-system, sans-serif;color:#5c3a00;background:rgba(255,236,196,.95);'
        . 'backdrop-filter:blur(10px);padding:8px 16px;border-radius:999px;'
        . 'box-shadow:0 2px 10px rgba(0,0,0,.25);">' . s($text) . '</div>';
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
 * @param context $context this activity's own module context
 * @return stdClass the (possibly just-created) submission row
 */
function bento_get_or_create_submission(int $bentoid, int $userid, context $context): stdClass {
    $existing = bento_get_submission($bentoid, $userid);
    if ($existing) {
        return $existing;
    }
    return bento_create_submission($bentoid, $userid, bento_blank_document(), $context);
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
 * @param context $context this activity's own module context
 * @return stdClass the newly created submission row
 */
function bento_create_submission(int $bentoid, int $userid, string $document, context $context): stdClass {
    global $DB;
    $now = time();
    $record = (object) [
        'bentoid' => $bentoid,
        'userid' => $userid,
        'document' => '', // never populated — documentinfilestore below means this is never read anyway
        'documentinfilestore' => 1,
        'status' => 'pending',
        'timecreated' => $now,
        'timemodified' => $now,
    ];
    $record->id = $DB->insert_record('bento_submissions', $record);
    bento_put_document($context, $record->id, bento_validate_document($document), BENTO_SUBMISSION_FILEAREA);
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
 * Defensive wrapper around bento_grade_item_update() — grade_update()
 * (Moodle core) is a genuine dml_write_exception risk, confirmed live: it's
 * the one operation every "Fehler beim Schreiben der Datenbank" incident
 * traced so far actually has in common (bento_add_instance, bento_update_
 * instance, and promote_deck.php all call this — unlike bento_touch_
 * coursemodule(), which was only ever part of SOME of them). A failure
 * here means the gradebook's own item for this activity is now out of
 * sync with what was just saved — a real, visible problem, logged clearly
 * — but it must never be allowed to turn an otherwise-successful document
 * save into a reported failure, same reasoning bento_touch_coursemodule()
 * already uses elsewhere in this file.
 *
 * @param stdClass $bento
 * @param mixed $grades
 * @return void
 */
function bento_safe_grade_item_update(stdClass $bento, $grades = null): void {
    try {
        bento_grade_item_update($bento, $grades);
    } catch (\Throwable $e) {
        error_log('[bento] bento_grade_item_update(bentoid=' . ($bento->id ?? '?') . ') failed, ignoring: ' . get_class($e) . ': ' . $e->getMessage());
    }
}

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
 * Adds "Bearbeiten" (manage.php — the tile importer, not the bare slide
 * editor directly) and "Bewerten" (grade.php) links to the activity's
 * settings/gear menu — this IS the "open a new Moodle page from edit
 * mode" entry point teachers use; view.php itself always stays the plain
 * immersive present-mode page every user (including teachers, previewing)
 * lands on. Pointing this at manage.php rather than edit.php directly is
 * deliberate: manage.php is where new/demo/import/paste-and-distribute
 * and every existing draft deck actually live, previously reachable ONLY
 * via the full Activity Settings form buried among name/due-date/grading
 * — genuinely the same easy-to-miss detour as editing any other Moodle
 * activity's own text field, and the whole reason this entry point exists
 * at all rather than just relying on Settings. Clicking the existing
 * document there still opens edit.php exactly as before (unchanged
 * bentoconvert.js click behavior) — this only moves WHERE that click
 * starts from.
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
            new moodle_url('/mod/bento/manage.php', ['id' => $cm->id]),
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
 * File-storage details for a stored bento document — one shared component/
 * filearea for every row, itemid is what actually distinguishes them (see
 * bento_get_document()'s own doc comment for the full read/write scheme).
 */
define('BENTO_DOCUMENT_COMPONENT', 'mod_bento');
define('BENTO_DOCUMENT_FILEAREA', 'document');
/** Student submissions get their OWN filearea — fully separate from the
 *  main document's. bento_submissions.id and bento.id come from separate
 *  auto-increment sequences, so nothing inherently rules out them landing
 *  on the same numeric value; it's the distinct filearea itself that
 *  rules a collision out, not the itemid values. Also matters for the
 *  privacy provider's own file-deletion step (see classes/privacy/
 *  provider.php), which needs to delete exactly a user's own submission
 *  files and nothing else. */
define('BENTO_SUBMISSION_FILEAREA', 'submission');
/** Draft decks get their OWN filearea too, for the same reason as
 *  submissions above — bento.id and bento_decks.id come from separate
 *  auto-increment sequences, so nothing inherently rules out them ever
 *  landing on the same numeric value; keeping every document TYPE in its
 *  own filearea is what actually rules a collision out, not the itemid
 *  values themselves. */
define('BENTO_DECK_FILEAREA', 'deck');
/** The single filename every document's own stored_file uses — content
 *  type/identity is entirely carried by (component, filearea, itemid), not
 *  the filename, so this never needs to vary. */
define('BENTO_DOCUMENT_FILENAME', 'document.json');

/**
 * Reads a row's current document content — from its file-storage entry if
 * `$infilestore` is set (the current, post-migration path every fresh save
 * now writes through), falling back to the legacy `$legacytext` column
 * otherwise (a row db/upgrade.php's own migration step hasn't touched yet,
 * or one that predates this whole mechanism). The ONE place that decides
 * which of the two a caller actually reads from — every other function in
 * this plugin should call this rather than reading `document`/
 * `documentinfilestore` off a row directly, so the fallback logic only
 * ever needs to exist once.
 *
 * @param context $context this activity's own module context
 * @param bool $infilestore the row's own documentinfilestore column
 * @param int $itemid the row's own id — see bento_put_document()'s own doc
 *   comment for why this doubles as the file-storage itemid directly,
 *   with nothing separate to look up
 * @param string|null $legacytext the row's own (legacy) document column
 * @param string $filearea which filearea this row's own file lives in —
 *   BENTO_DOCUMENT_FILEAREA (the default) for a `bento` row,
 *   BENTO_SUBMISSION_FILEAREA for a `bento_submissions` row
 * @return string the document JSON — '' if genuinely empty/missing either way
 */
function bento_get_document(context $context, bool $infilestore, int $itemid, ?string $legacytext, string $filearea = BENTO_DOCUMENT_FILEAREA): string {
    if ($infilestore) {
        $fs = get_file_storage();
        $file = $fs->get_file($context->id, BENTO_DOCUMENT_COMPONENT, $filearea, $itemid, '/', BENTO_DOCUMENT_FILENAME);
        if ($file) {
            return $file->get_content();
        }
        // Flag set but the file itself is somehow gone (manually deleted
        // file storage, a botched migration) — fall through to whatever
        // legacy text is still there rather than returning nothing at all.
    }
    return $legacytext ?? '';
}

/**
 * Writes `$content` as a row's current document, via Moodle's File API —
 * every FRESH save (as opposed to a row db/upgrade.php's migration step
 * touches) goes through this, never the legacy text column directly.
 *
 * Moodle's stored files are content-addressed and immutable: there is no
 * "edit this file's bytes in place" — updating means deleting the old
 * stored_file for this itemid (if any) and creating a new one.
 *
 * @param context $context this activity's own module context
 * @param int $itemid a stable identifier for WHICH document this is within
 *   this context — for `bento` rows, the row's own id (predictable,
 *   already unique — (contextid, component, filearea, itemid) together is
 *   what Moodle's file storage actually keys on, and contextid alone
 *   already uniquely identifies one activity, so there's never a
 *   collision risk here worth generating a random id to avoid)
 * @param string $content the document JSON to store
 * @param string $filearea which filearea to write into — see bento_get_
 *   document()'s own doc comment for the two current values
 */
function bento_put_document(context $context, int $itemid, string $content, string $filearea = BENTO_DOCUMENT_FILEAREA): void {
    $fs = get_file_storage();
    $existing = $fs->get_file($context->id, BENTO_DOCUMENT_COMPONENT, $filearea, $itemid, '/', BENTO_DOCUMENT_FILENAME);
    if ($existing) {
        $existing->delete();
    }
    $fs->create_file_from_string([
        'contextid' => $context->id,
        'component' => BENTO_DOCUMENT_COMPONENT,
        'filearea' => $filearea,
        'itemid' => $itemid,
        'filepath' => '/',
        'filename' => BENTO_DOCUMENT_FILENAME,
    ], $content);
}

/**
 * Updates course_modules.timemodified directly for this activity's own
 * course-module row. save_document.php's own webservice writes straight to
 * the `bento` table (and, via bento_put_document() above, file storage) —
 * it never goes through Moodle's own update_module()/course/modedit.php
 * workflow, which is the only thing that would otherwise keep this column
 * current. Left stale, "last modified" as shown by Moodle core's own
 * activity chooser and several block/report views (anything reading
 * course_modules.timemodified rather than this plugin's own bento.
 * timemodified) kept reflecting the last time someone saved the ACTIVITY
 * SETTINGS FORM specifically, not the last time anyone actually saved the
 * presentation through the editor — for an activity edited far more often
 * through the editor than through its own settings, that could read days
 * or weeks stale despite genuinely current content.
 *
 * Deliberately NOT called from the student-submission path in save_
 * document.php: a student saving their own submission shouldn't make the
 * ACTIVITY itself look modified to the teacher — only the teacher's own
 * document (or a draft deck) actually changing should.
 *
 * @param int $cmid this activity's own course_modules id
 */
function bento_touch_coursemodule(int $cmid): void {
    global $DB;
    // This is a cosmetic "last modified" timestamp update — the actual
    // document has already been saved successfully by the time this
    // runs (it's always called last, after the real save). A failure
    // here must never turn an otherwise-successful save into a reported
    // failure — traced directly to a real incident where this exact
    // call threw a dml_write_exception for one specific activity, taking
    // down every save attempt (document, drafts, everything) even though
    // the actual document write itself worked fine every time.
    try {
        $DB->set_field('course_modules', 'timemodified', time(), ['id' => $cmid]);
    } catch (\Throwable $e) {
        error_log('[bento] bento_touch_coursemodule(' . $cmid . ') failed, ignoring: ' . get_class($e) . ': ' . $e->getMessage());
    }
}

/**
 * The import/merge widget markup — used by mod_form.php (inside the
 * activity settings form) AND manage.php (a plain themed page, reachable
 * directly without going through the settings form at all). The EXISTING
 * document (if there is a genuine one — not just the single-blank-slide
 * default) is embedded as a JSON <script> block so bentoconvert.js can
 * seed it as the first card, mergeable with anything newly dropped here.
 * Existing DRAFTS (bento_decks) are seeded too, each as its own separate
 * card, never force-merged into the main one.
 *
 * @param string $existingjson raw JSON from the current document, or ''
 * @param int $courseid
 * @param int $cmid 0 for a brand-new activity that doesn't exist yet
 * @param array $decks bento_decks rows for this activity (empty for a
 *   brand-new activity, which has no bentoid yet to look any up under)
 * @param int $documentvisible the row's own documentvisible flag (0/1/2,
 *   three-state) — 1 (visible to everyone) for a brand-new activity,
 *   which has nothing to hide yet
 * @param ?context $context this activity's own module context — required
 *   whenever $decks is non-empty (to read each one's own document through
 *   file storage), null only valid for a brand-new activity (empty $decks)
 * @param bool $lazyload true to embed only lightweight metadata (title,
 *   slide count, byte size) per card instead of each one's own full
 *   document — the corresponding action (download, split-into-parts)
 *   lazy-fetches the real content on demand via lazydoc.php only once
 *   genuinely needed. ONLY safe when nothing on the page needs the full
 *   document just to submit — mod_form.php's own hidden document field
 *   needs the actual content to save the form correctly, so it must
 *   always pass false here regardless of whether the activity already
 *   exists; only manage.php (no such hidden field — every save there is
 *   its own explicit per-card AJAX action) opts in.
 * @param int $maxbytes the effective per-document size limit for this
 *   activity/caller — see bento_effective_max_document_bytes(); 0 lets
 *   the client fall back to its own default rather than warn against a
 *   limit of zero. Exposed to the client purely so the size already
 *   shown per card (bentoFormatBytes()) can warn BEFORE a save is ever
 *   attempted, rather than only via save_deck.php/save_document.php's
 *   own hard rejection at save time.
 * @return string HTML
 */
function bento_render_importer(string $existingjson, int $courseid, int $cmid, array $decks = [], int $documentvisible = 1, ?context $context = null, bool $lazyload = false, int $maxbytes = 0): string {
    global $USER;
    $seed = '';
    $decoded = $existingjson !== '' ? json_decode($existingjson, true) : null;
    $isrealdoc = is_array($decoded)
        && ($decoded['format'] ?? null) === 'bento/slides'
        && !empty($decoded['slides'])
        && !(count($decoded['slides']) === 1 && empty($decoded['slides'][0]['elements']));
    if ($isrealdoc && $lazyload) {
        // Metadata-only (manage.php) — only lightweight data, not the full
        // document (which can be MBs of embedded images) on every single
        // page load regardless of whether anyone ever opens this card.
        $seed = '<script type="application/json" id="mod-bento-existing-doc-meta">' . json_encode([
            'title' => $decoded['title'] ?? '',
            'slideCount' => count($decoded['slides']),
            'byteSize' => strlen($existingjson),
        ]) . '</script>';
    } else if ($isrealdoc) {
        // mod_form.php's own hidden document field needs the FULL content
        // to actually save the form correctly on submit — never safe to
        // switch this to metadata-only, regardless of whether the
        // activity already exists.
        $seed = '<script type="application/json" id="mod-bento-existing-doc">'
            . json_encode($decoded) . '</script>';
    }

    $deckseed = '';
    foreach ($decks as $deck) {
        $deckdoc = $context ? bento_get_document($context, (bool) $deck->documentinfilestore, $deck->id, $deck->document, BENTO_DECK_FILEAREA) : $deck->document;
        $deckdecoded = json_decode($deckdoc, true);
        if (!is_array($deckdecoded) || ($deckdecoded['format'] ?? null) !== 'bento/slides') {
            continue; // skip anything that somehow isn't valid rather than breaking the whole page over one bad row
        }
        if ($lazyload) {
            // Lightweight metadata only — see the main document's own
            // comment above for the full reasoning.
            $deckseed .= '<script type="application/json" class="mod-bento-deck-seed" data-deckid="' . (int) $deck->id . '" data-name="' . s($deck->name ?? '') . '" data-visible="' . ((int) ($deck->visible ?? 0)) . '" data-title="' . s($deckdecoded['title'] ?? '') . '" data-slidecount="' . count($deckdecoded['slides']) . '" data-bytesize="' . strlen($deckdoc) . '"></script>';
        } else {
            $deckseed .= '<script type="application/json" class="mod-bento-deck-seed" data-deckid="' . (int) $deck->id . '" data-name="' . s($deck->name ?? '') . '" data-visible="' . ((int) ($deck->visible ?? 0)) . '">'
                . json_encode($deckdecoded) . '</script>';
        }
    }

    return '
        <div class="mod-bento-importer" id="mod-bento-importer" data-courseid="' . $courseid . '" data-cmid="' . $cmid . '" data-candeck="1" data-termsagreed="' . (bento_has_agreed_current_terms((int) $USER->id) ? '1' : '0') . '" data-documentvisible="' . (int) $documentvisible . '" data-savetimeout="' . (int) (get_config('mod_bento', 'savetimeout') ?: 600) . '" data-maxbytes="' . $maxbytes . '">
            ' . $seed . $deckseed . '
            <div class="mod-bento-tiles has-paste' . ($isrealdoc ? ' has-edit' : '') . '">
                <button type="button" class="mod-bento-tile mod-bento-tile-new" id="mod-bento-newbtn" data-hasdoc="' . ($isrealdoc ? '1' : '0') . '">
                    <span class="mod-bento-tile-title" id="mod-bento-newbtn-title">' . get_string('playtile', 'mod_bento') . '</span>
                    <span class="mod-bento-tile-sub" id="mod-bento-newbtn-sub">' . ($isrealdoc ? get_string('playtilesub', 'mod_bento') : get_string('newtilesub', 'mod_bento')) . '</span>
                </button>' . ($isrealdoc ? '
                <button type="button" class="mod-bento-tile mod-bento-tile-edit" id="mod-bento-editbtn">
                    <span class="mod-bento-tile-title">' . get_string('edittile', 'mod_bento') . '</span>
                    <span class="mod-bento-tile-sub">' . get_string('edittilesub', 'mod_bento') . '</span>
                </button>' : '') . '
                <button type="button" class="mod-bento-tile mod-bento-tile-demo" id="mod-bento-demobtn">
                    <span class="mod-bento-tile-title">' . get_string('demotile', 'mod_bento') . '</span>
                    <span class="mod-bento-tile-sub">' . get_string('demotilesub', 'mod_bento') . '</span>
                </button>
                <div class="mod-bento-tile mod-bento-tile-import mod-bento-drop" id="mod-bento-drop" tabindex="0">
                    <span class="mod-bento-tile-arrow" aria-hidden="true">&#8595;</span>
                    <span class="mod-bento-tile-title">' . get_string('droppptxhere', 'mod_bento') . '</span>
                    <span class="mod-bento-tile-sub">' . get_string('droppptxsub', 'mod_bento') . '</span>
                    <input type="file" id="mod-bento-file" accept=".pptx,.ppt,.json,.html,.htm" multiple style="display:none">
                </div>
                <button type="button" class="mod-bento-tile mod-bento-tile-paste" id="mod-bento-pastetile">
                    <span class="mod-bento-tile-title">' . get_string('pastetile', 'mod_bento') . '</span>
                    <span class="mod-bento-tile-sub">' . get_string('pastetilesub', 'mod_bento') . '</span>
                </button>
                <button type="button" class="mod-bento-newpart-btn" id="mod-bento-newpart-btn"><span class="mod-bento-newpart-plus">+</span><span class="mod-bento-newpart-label">' . get_string('newparttile', 'mod_bento') . '</span></button>
            </div>
            <h4 class="mod-bento-playback-heading">' . get_string('playbacksectionheading', 'mod_bento') . '</h4>
            <div class="mod-bento-items" id="mod-bento-items"></div>
        </div>';
}


/**
 * Serves the introduction's embedded files (standard mod_intro pattern).
 *
 * The presentation document's own file-storage entries (BENTO_DOCUMENT_
 * FILEAREA, written by bento_put_document()) are NOT served through this
 * callback at all — view.php/edit.php read them directly via
 * bento_get_document() and inline the content server-side, same as they
 * always did with the legacy text column. This stays the intro-attachments
 * path it always was.
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

/**
 * The suggested starting terms-of-use text — set as the ACTUAL config
 * value once, by db/install.php, rather than passed as the admin_setting's
 * own constructor default (which would show the raw, unrendered markup as
 * a plain "Default: …" caption under the settings field — see settings.php's
 * own doc comment on why that matters). Kept here as a plain function
 * rather than inline in install.php so it's easy to find/update in one
 * place regardless of which caller needs it.
 *
 * @return string
 */
function bento_default_termsofuse(): string {
    return <<<HTML
<p><em>Hinweis: Dieser Text spiegelt die rechtliche Situation für geschlossene Lernumgebungen in Bildungseinrichtungen in Deutschland wider. Passen Sie diesen gegebenenfalls an.</em></p>

<h3>Nutzungsordnung und Leitfaden für Medien und Präsentationen in Moodle</h3>
<p>Diese Nutzungsordnung regelt den rechtssicheren Umgang mit Medien, Bildern und Präsentationen auf der Lernplattform Moodle.</p>

<h4>1. Grundsätze für die Nutzung im Bildungsumfeld (§ 60a und § 51 UrhG)</h4>
<ul>
<li><strong>Pädagogische Zielsetzung:</strong> Die Nutzung fremder Medien, Bilder und Dateien ist ausschließlich erlaubt, wenn sie der Veranschaulichung im Unterricht oder der kritischen und wissenschaftlichen Untersuchung dient.</li>
<li><strong>Gebot der Verhältnismäßigkeit:</strong> Der Umfang der verwendeten Medien muss durch den jeweiligen Lehr- oder Lernzweck gerechtfertigt sein. Es dürfen nur so viele Medien eingebunden werden, wie für das Verständnis des Themas erforderlich sind.</li>
<li><strong>Nutzung im Kursspektrum:</strong> Medien von geringem Umfang sowie Einzelwerke (z. B. Fotos oder Karikaturen) dürfen vollständig eingebunden werden, solange der Zugriff auf den jeweiligen passwortgeschützten Moodle-Kurs beschränkt bleibt.</li>
</ul>

<h4>2. Pflicht zur Quellenangabe und Verbot des Entfernens (§ 63 UrhG)</h4>
<ul>
<li><strong>Zwingender Quellennachweis:</strong> Alle in Präsentationen verwendeten Medien müssen mit einem vollständigen Quellennachweis versehen sein (Urheber, Originalquelle, exakte URL und Abrufdatum).</li>
<li><strong>Verbot des Entfernens:</strong> Es ist ausdrücklich untersagt, bereits im Bild oder auf der Webseite vorhandene Quellenangaben, Wasserzeichen, Urhebervermerke oder Lizenzhinweise zu entfernen oder zu überdecken.</li>
<li><strong>Creative Commons (TULLU-Regel):</strong> Bei frei lizenzierten Inhalten sind Titel, Urheber, Lizenz, Link zum Material und Link zur Lizenz anzugeben. Bei Inhalten unter CC0 oder Public Domain wird eine Angabe dringend empfohlen.</li>
</ul>

<h4>3. Einbindung von Medien und technische Abwicklung</h4>
<ul>
<li><strong>Einbettung per URL (Inline-Linking und Framing):</strong> Werden externe Bilder oder Medien per URL direkt in den Editor eingebunden, bleiben sie primär auf den Quellservern gespeichert und werden beim Aufruf durch den Browser der Teilnehmenden geladen.</li>
<li><strong>Zulässigkeit der Quellen:</strong> Das Verlinken und Einbetten ist nur zulässig, wenn die Inhalte auf der Quellwebseite öffentlich frei zugänglich sind und dort rechtmäßig zur Verfügung gestellt werden.</li>
<li><strong>Verbotene Quellen:</strong> Es ist untersagt, Inhalte aus offensichtlich rechtswidrigen Quellen (z. B. Raubkopien) einzubinden oder Bezahlschranken (Paywalls) sowie Logins zu umgehen.</li>
</ul>

<h4>4. Private Speicherung durch Schülerinnen, Schüler und Studierende</h4>
<ul>
<li><strong>Recht auf Privatkopie (§ 53 UrhG):</strong> Lernende sind berechtigt, in Moodle erstellte Präsentationen und Unterrichtsmaterialien auf ihren privaten Endgeräten (z. B. Laptop, Tablet oder USB-Stick) dauerhaft zu speichern.</li>
<li><strong>Lernfortschritt und Portfolio:</strong> Diese Speicherung dient ausschließlich der persönlichen Dokumentation des Lernfortschritts sowie der Vor- und Nachbereitung des Unterrichts.</li>
<li><strong>Verbot der Weiterverbreitung:</strong> Eine Veröffentlichung dieser Dateien außerhalb von Moodle (z. B. auf Social-Media-Plattformen, privaten Blogs oder der öffentlichen Schulwebseite) ist ohne explizite Zustimmung der Rechteinhaber strikt untersagt.</li>
</ul>

<h4>5. Bearbeitung von Medien und Erhalt des Sinngehalts (§ 62 UrhG)</h4>
<ul>
<li><strong>Zulässige Anpassungen:</strong> Das Beschneiden, Freistellen, Maskieren oder Hervorheben von Medien ist gestattet, sofern es dem Didaktik- oder Zitatzweck dient (z. B. Fokussierung auf das Detail einer Karikatur).</li>
<li><strong>Erhalt des Sinns:</strong> Die ursprüngliche Aussage, der Kontext und die Kernaussage des Werks dürfen durch die Bearbeitung keinesfalls verfälscht oder ins Gegenteil verkehrt werden.</li>
<li><strong>Kennzeichnungspflicht:</strong> Jede Bearbeitung oder Ausschnittsbildung muss in der Präsentation oder der Quellenangabe eindeutig gekennzeichnet werden (z. B. durch den Zusatz „Ausschnitt aus [...]“).</li>
</ul>

<h4>6. Haftung und Plattformverantwortung</h4>
<ul>
<li><strong>Nutzerverantwortung:</strong> Für die Rechtmäßigkeit der eingebundenen Inhalte haften die jeweiligen Nutzerinnen und Nutzer (Lehrkräfte, Dozierende, Schülerinnen, Schüler und Studierende).</li>
<li><strong>Haftungsausschluss des Betreibers:</strong> Die Moodle-Administration und die bereitstellende Institution haften als Hosting-Provider nicht präventiv für die von Nutzenden eingestellten Inhalte. Sie sind jedoch verpflichtet, rechtswidrige Inhalte nach Kenntnisnahme unverzüglich zu entfernen (Notice-and-Takedown-Verfahren).</li>
</ul>

<h4>Kurz-Anleitung für Nutzer (Checkliste)</h4>
<ul>
<li>Zweck prüfen: Verwendest du das Bild wirklich zur Veranschaulichung oder Untersuchung deines Themas? Achte auf Verhältnismäßigkeit!</li>
<li>Quellen prüfen: Verwende nur Bilder aus legalen, öffentlich zugänglichen Quellen (keine Paywalls, keine Raubkopien).</li>
<li>Quellenangaben behalten: Lösche oder überdecke niemals bestehende Urheberhinweise oder Wasserzeichen auf Bildern.</li>
<li>Quellenangabe erstellen: Stelle sicher, dass bei jedem Bild Urheber, Quelle, Link und Lizenz (bei CC-Bildern) angegeben sind.</li>
<li>Ausschnitte kennzeichnen: Wenn du ein Bild zuschneidest, verfälsche nicht die Aussage und schreibe „Ausschnitt aus [...]“ dazu.</li>
<li>Nutzung im Kurs belassen: Speichere deine Präsentationen nur innerhalb des geschlossenen Moodle-Kurses.</li>
<li>Privat speichern erlaubt: Du darfst deine Präsentationen zur Nachbereitung und Dokumentation deines Lernfortschritts auf deinen eigenen Geräten speichern.</li>
<li>Nicht öffentlich teilen: Lade Präsentationen mit fremden Bildern niemals auf Social Media, YouTube oder öffentlichen Webseiten hoch.</li>
</ul>
HTML;
}

/**
 * Whether the given user has already agreed to the CURRENT terms-of-use
 * text — compares against a hash of the live setting, so editing the
 * wording later naturally invalidates everyone's prior agreement without
 * needing a manually-managed version number anywhere.
 *
 * @param int $userid
 * @return bool
 */
function bento_has_agreed_current_terms(int $userid): bool {
    global $DB;
    $terms = trim((string) get_config('mod_bento', 'termsofuse'));
    if ($terms === '') {
        return true; // nothing configured — nothing to agree to
    }
    $currenthash = sha1($terms);
    $agreed = $DB->get_field('bento_agreements', 'termshash', ['userid' => $userid]);
    return $agreed === $currenthash;
}

/**
 * Redirects to terms.php (which returns here via $returnurl once agreed)
 * if termsofuse is configured and this user hasn't agreed to the CURRENT
 * wording yet. Call this from every page that actually shows Bento
 * content to a real (non-guest) user — guests are handled separately by
 * bento_require_not_guest(), since agreeing to terms isn't meaningful for
 * an anonymous session anyway.
 *
 * @param moodle_url $returnurl where to send the user back to once they agree
 * @return void
 */
function bento_require_terms_agreed(moodle_url $returnurl): void {
    global $USER;
    if (isguestuser() || !isloggedin()) {
        return; // guest-access pages enforce their own separate restriction
    }
    if (bento_has_agreed_current_terms((int) $USER->id)) {
        return;
    }
    redirect(new moodle_url('/mod/bento/terms.php', ['returnurl' => $returnurl->out_as_local_url(false)]));
}

/**
 * Blocks guest/unauthenticated access outright — used unconditionally for
 * anything student-submission-related (per policy, always logged-in-only
 * regardless of course guest-access settings) and conditionally for the
 * teacher's own master presentation when that instance's own `loginonly`
 * flag is set.
 *
 * @return void
 */
function bento_require_not_guest(): void {
    if (isguestuser() || !isloggedin()) {
        throw new require_login_exception(get_string('guestaccessdenied', 'mod_bento'));
    }
}
