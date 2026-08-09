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
 * The full Bento editor. Two different documents can land here depending
 * on capability and mode:
 *
 *  - mod/bento:edit (teachers): the ONE shared master document
 *    (bento.document) — unchanged from before student submissions existed.
 *  - mod/bento:submit, no mod/bento:edit, and bento.allowstudentsubmissions
 *    is on (students): their OWN row in bento_submissions, found-or-created
 *    via bento_get_or_create_submission() so this page never needs a
 *    separate id param — ownership is always "whichever row belongs to the
 *    logged-in user for this instance".
 *
 * Either way, Bento itself now knows how to save into Moodle natively: its
 * own Save button checks for a URL containing "mod/bento" and a
 * <meta name="bento-moodle-config"> tag (see editor/moodle.ts in the Bento
 * source), and posts to mod_bento_save_document itself when both are
 * present — that endpoint (classes/external/save_document.php) is what
 * actually decides WHICH of the two documents above gets written, using
 * the same capability check this file uses to decide which one to show.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/lib.php');

$id = required_param('id', PARAM_INT);

$cm = get_coursemodule_from_id('bento', $id, 0, false, MUST_EXIST);
$course = get_course($cm->course);
$bento = $DB->get_record('bento', ['id' => $cm->instance], '*', MUST_EXIST);

require_login($course, true, $cm);
$context = context_module::instance($cm->id);
bento_require_current_schema();

$caneditmaster = has_capability('mod/bento:edit', $context);
$pastdue = false;
if ($caneditmaster) {
    if (!empty($bento->loginonly)) {
        bento_require_not_guest();
    }
    $document = $bento->document;
    $ownerlabel = '';
} else {
    require_capability('mod/bento:submit', $context);
    bento_require_not_guest(); // a student's own submission is always logged-in-only, unconditionally
    if (!$bento->allowstudentsubmissions) {
        throw new moodle_exception('submissionsnotenabled', 'mod_bento');
    }
    $submission = bento_get_or_create_submission($bento->id, $USER->id);
    $document = $submission->document;
    $ownerlabel = ' — ' . get_string('mypresentation', 'mod_bento');
    $pastdue = $bento->duedate > 0 && time() > $bento->duedate;
    if ($pastdue) {
        $decoded = json_decode($document, true);
        if (is_array($decoded)) {
            $decoded['readonly'] = true;
            $document = json_encode($decoded);
        }
    }
}

bento_require_terms_agreed(new moodle_url('/mod/bento/edit.php', ['id' => $id]));

$shellpath = __DIR__ . '/asset/bento-shell.html';
$shell = file_get_contents($shellpath);
if ($shell === false) {
    throw new moodle_exception('shellmissing', 'mod_bento');
}

$jsonforembed = str_replace('<', '\u003c', $document);

$html = preg_replace(
    '/(<script[^>]*id=["\']bento-doc["\'][^>]*>)([\s\S]*?)(<\/script>)/',
    '$1' . str_replace('$', '\\$', $jsonforembed) . '$3',
    $shell,
    1
);

$title = format_string($bento->name) . $ownerlabel;

$configmeta = $pastdue ? '' : bento_moodle_config_meta((int) $cm->id);

$jstitle = json_encode($title . ' — Bearbeiten');
$titlescript = '<script>document.title = ' . str_replace('$', '\\$', $jstitle) . ';</script>';

$html = preg_replace('/<head[^>]*>/', '$0' . $configmeta . $titlescript, $html, 1);

if ($pastdue) {
    $banner = bento_deadline_passed_banner_html((int) $bento->duedate);
    $html = preg_replace('/<body[^>]*>/', '$0' . str_replace('$', '\\$', $banner), $html, 1);
}

// Same "back" convention as the corresponding audience already gets
// elsewhere — view.php's own teacher-facing back-link targets the course,
// submission.php's own back-link targets view.php (the gallery) — this
// page just never had one of its own before, regardless of which of the
// two documents/audiences it's currently showing.
$backtarget = $caneditmaster
    ? course_get_url($course)
    : new moodle_url('/mod/bento/view.php', ['id' => $cm->id]);
$backlabel = $caneditmaster ? get_string('backtocourse', 'mod_bento') : get_string('backtogallery', 'mod_bento');
$backlink = bento_back_link_html($backtarget, $backlabel);
$html = preg_replace('/<body[^>]*>/', '$0' . str_replace('$', '\\$', $backlink), $html, 1);

header('Content-Type: text/html; charset=utf-8');
header('X-Frame-Options: SAMEORIGIN');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
echo $html;
die;
