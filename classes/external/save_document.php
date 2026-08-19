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

namespace mod_bento\external;

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/mod/bento/lib.php');

// Moodle moved these out of the global namespace into core_external a
// while back; the old global-namespace names (external_api etc.) are what
// this whole file originally used, and they worked fine on older Moodle
// releases where a deprecated alias still existed — this particular
// install doesn't have that alias anymore, which is exactly what surfaced
// as a fatal "Class external_api not found" the moment this ran, silently
// AFTER the client had already shown a false "saved" toast (see moodle.ts
// for the matching client-side fix to that specific consequence).
use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_value;
use core_external\external_single_structure;
use context_module;
use invalid_parameter_exception;

/**
 * mod_bento_save_document — called by Bento's own Save button (editor/
 * moodle.ts) whenever it detects a mod/bento context.
 *
 * WHICH document this writes to is decided from the calling user's OWN
 * capabilities plus the optional deckid, exactly mirroring edit.php's own
 * branch (see that file's comment):
 *
 *  - deckid > 0 (requires mod/bento:edit) → that specific draft's own row
 *    in bento_decks — a client-supplied deckid is safe here precisely
 *    because get_record() below also filters on bentoid, so a request
 *    naming another activity's deck simply 404s rather than writing
 *    somewhere it shouldn't.
 *  - deckid = 0 and mod/bento:edit → the shared master document
 *    (bento.document).
 *  - deckid = 0 and mod/bento:submit only → the caller's OWN row in
 *    bento_submissions, found via (bentoid, userid) — never a client-
 *    supplied submission id, so there's no way for one student's request
 *    to end up writing into another student's row.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class save_document extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'cmid' => new external_value(PARAM_INT, 'course module id'),
            'document' => new external_value(PARAM_RAW, 'the full bento/slides JSON document'),
            'deckid' => new external_value(PARAM_INT, '0 for the published document, or a specific draft\'s own id', VALUE_DEFAULT, 0),
        ]);
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'ok' => new external_value(PARAM_BOOL, 'true if saved'),
            'timemodified' => new external_value(PARAM_INT, 'server timestamp of the save'),
            // Diagnostic only — see the timing instrumentation throughout
            // execute() below. Only meaningfully populated when this
            // request actually completes within whatever timeout the
            // CALLER itself enforces; a request slow enough to be aborted
            // client-side never gets this far regardless of what it's
            // set to, which is exactly the case this is meant to help
            // diagnose — see also the error_log() calls throughout
            // execute(), which land in the PHP error log independently
            // of whether the client ever received a response at all.
            'debugtimingms' => new external_value(PARAM_RAW, 'JSON-encoded per-step timing breakdown, ms', VALUE_DEFAULT, ''),
        ]);
    }

    /**
     * @param int $cmid
     * @param string $document raw JSON
     * @param int $deckid
     * @return array
     */
    public static function execute($cmid, $document, $deckid = 0): array {
        global $DB, $USER;

        // Per-step timing, logged to the PHP error log AS EACH STEP
        // COMPLETES (not batched at the end) — a request slow enough to
        // get aborted client-side (see moodle.ts's own 20s-default
        // AbortController) never sends a response back at all, so this
        // is the only way to see how far execute() actually got and
        // which specific step it was on when time ran out. Also
        // collected into $timing and returned in debugtimingms for the
        // (rarer, at the sizes prompting this) case where the request
        // does complete before the client gives up.
        $t0 = microtime(true);
        $timing = [];
        $mark = function (string $step) use (&$timing, &$t0) {
            $now = microtime(true);
            $ms = (int) round(($now - $t0) * 1000);
            $timing[$step] = $ms;
            error_log('[bento/save_document] ' . $step . ': ' . $ms . 'ms (cumulative)');
            $t0 = $now;
        };

        $params = self::validate_parameters(self::execute_parameters(), [
            'cmid' => $cmid,
            'document' => $document,
            'deckid' => $deckid,
        ]);
        $mark('validate_parameters');

        try {
            return self::execute_inner($params, $mark, $timing);
        } catch (\Throwable $e) {
            // The $mark() calls above already show, step by step, how far
            // execution got before this — but not WHAT was actually
            // thrown. A slow save (71s+ HTTP 200 with an error payload,
            // per this session's own reported incident) could be a PHP
            // execution-time limit, a database lock-wait timeout, a
            // dropped connection mid-write, or something else entirely —
            // genuinely different causes that all currently surface as
            // the same generic "Fehler beim Schreiben der Datenbank" to
            // whoever's saving. Logged here, then re-thrown UNCHANGED —
            // this never alters what the caller actually sees, only adds
            // a paper trail in the PHP error log for whichever one it
            // really was.
            error_log('[bento/save_document] EXCEPTION ' . get_class($e) . ': ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * The actual body of execute() — split out so the try/catch above can
     * wrap it as a whole without one giant indented block.
     *
     * @param array $params already-validated parameters
     * @param callable $mark the timing-logger closure from execute()
     * @param array $timing accumulated timing, by reference
     * @return array
     */
    private static function execute_inner(array $params, callable $mark, array &$timing): array {
        global $DB, $USER;

        $cm = get_coursemodule_from_id('bento', $params['cmid'], 0, false, MUST_EXIST);
        $mark('get_coursemodule_from_id');
        $context = context_module::instance($cm->id);
        self::validate_context($context);
        $mark('validate_context');
        bento_require_current_schema();
        $mark('require_current_schema');

        // Fetched here (not just in the student branch further down, as
        // before) — the size ceiling below is per-activity, so this is
        // needed regardless of which branch actually ends up writing.
        $bento = $DB->get_record('bento', ['id' => $cm->instance], '*', MUST_EXIST);
        $mark('get_record_bento');

        $decoded = json_decode($params['document'], true);
        $mark('json_decode');
        if (!bento_document_has_valid_structure($decoded)) {
            throw new invalid_parameter_exception('Not a valid bento/slides document.');
        }
        // Which branch this save will actually go through, decided the
        // same way the real branching further down does — needed here
        // first so the size check below applies the right ceiling (a
        // student's own separate maxstudentdocumentsize, when set,
        // rather than always the teacher/deck's own maxdocumentsize
        // regardless of who's actually saving).
        $isstudentsubmission = $params['deckid'] === 0 && !has_capability('mod/bento:edit', $context);
        $maxbytes = bento_effective_max_document_bytes($bento, $isstudentsubmission);
        if (strlen($params['document']) > $maxbytes) {
            throw new invalid_parameter_exception('Document too large (max ' . round($maxbytes / 1024 / 1024, 1) . ' MB for this activity).');
        }
        // See lib.php's bento_validate_document() for why: a Moodle-hosted
        // activity must always open in the full editor, never Bento's
        // minimal read-only player card. Only re-encoding when there's
        // actually something to strip (the common case never sets this at
        // all) avoids paying for json_encode() on the full document a
        // second time, on top of the json_decode() just above, purely to
        // reproduce a string that would otherwise come out byte-identical
        // to what was already validated.
        $now = time();
        if (array_key_exists('readonly', $decoded)) {
            unset($decoded['readonly']);
            $cleandocument = json_encode($decoded);
            $mark('json_encode_stripped_readonly');
        } else {
            $cleandocument = $params['document'];
        }

        if ($params['deckid'] > 0) {
            require_capability('mod/bento:edit', $context);
            $deck = $DB->get_record('bento_decks', ['id' => $params['deckid'], 'bentoid' => $cm->instance], '*', MUST_EXIST);
            $mark('get_record_deck');
            $DB->update_record('bento_decks', (object) [
                'id' => $deck->id,
                'document' => $cleandocument,
                'timemodified' => $now,
            ]);
            bento_touch_coursemodule($cm->id);
            $mark('update_record_deck');
            return ['ok' => true, 'timemodified' => $now, 'debugtimingms' => json_encode($timing)];
        }

        if (!$isstudentsubmission) {
            $mark('has_capability_edit');
            // Moodle's File API, not the `document` text column — see
            // lib.php's own bento_get_document()/bento_put_document() for
            // the full read/write scheme this is part of. The text column
            // is deliberately left as-is from here on (not synced to
            // match, not cleared) rather than dual-written on every save:
            // writing it too would mean still paying for one full-size
            // text UPDATE per save, undoing the entire point of moving off
            // it. It stays a static fallback for bento_get_document() to
            // fall through to if the file itself ever goes missing —
            // frozen at whatever this row's content was the moment it
            // first saved through this path, not kept current after that.
            bento_put_document($context, $cm->instance, $cleandocument);
            $mark('bento_put_document');
            $DB->update_record('bento', (object) [
                'id' => $cm->instance,
                'documentinfilestore' => 1,
                'timemodified' => $now,
            ]);
            bento_touch_coursemodule($cm->id);
            $mark('update_record_bento');
            return ['ok' => true, 'timemodified' => $now, 'debugtimingms' => json_encode($timing)];
        }

        require_capability('mod/bento:submit', $context);
        if (!$bento->allowstudentsubmissions) {
            throw new \moodle_exception('submissionsnotenabled', 'mod_bento');
        }
        if ($bento->duedate > 0 && time() > $bento->duedate) {
            // Catches a tab that was already open before the deadline passed
            // — the read-only flag edit.php sets on a fresh page load only
            // takes effect on THAT load, not retroactively for one already
            // open.
            throw new \moodle_exception('deadlinepassed', 'mod_bento');
        }

        $existing = $DB->get_record('bento_submissions', ['bentoid' => $bento->id, 'userid' => $USER->id]);
        $mark('get_record_submission');
        if ($existing) {
            bento_put_document($context, $existing->id, $cleandocument, BENTO_SUBMISSION_FILEAREA);
            $DB->update_record('bento_submissions', (object) [
                'id' => $existing->id,
                'documentinfilestore' => 1,
                'timemodified' => $now,
            ]);
        } else {
            $newid = $DB->insert_record('bento_submissions', (object) [
                'bentoid' => $bento->id,
                'userid' => $USER->id,
                'status' => 'pending',
                'timecreated' => $now,
                'timemodified' => $now,
            ]);
            bento_put_document($context, $newid, $cleandocument, BENTO_SUBMISSION_FILEAREA);
            $DB->set_field('bento_submissions', 'documentinfilestore', 1, ['id' => $newid]);
        }
        $mark('write_submission');

        return ['ok' => true, 'timemodified' => $now, 'debugtimingms' => json_encode($timing)];
    }
}
