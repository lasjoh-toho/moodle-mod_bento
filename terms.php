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
 * Terms-of-use agreement — a site-wide page (no particular course/module
 * context, since the 'termsofuse' setting itself is site-wide), reached
 * via bento_require_terms_agreed()'s redirect from every actual content
 * page. Recording agreement here and returning to $returnurl is the
 * entire job of this page.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/lib.php');

require_login(null, false);
bento_require_not_guest();

$returnurlraw = optional_param('returnurl', '/', PARAM_LOCALURL);
$returnurl = new moodle_url($returnurlraw);

$terms = trim((string) get_config('mod_bento', 'termsofuse'));
if ($terms === '') {
    // Nothing configured to agree to at all — nothing for this page to do.
    redirect($returnurl);
}

$PAGE->set_url(new moodle_url('/mod/bento/terms.php', ['returnurl' => $returnurlraw]));
$PAGE->set_context(context_system::instance());
$PAGE->set_title(get_string('agreetermstitle', 'mod_bento'));
$PAGE->set_pagelayout('standard');

if (optional_param('agree', 0, PARAM_INT) && confirm_sesskey()) {
    global $DB, $USER;
    $hash = sha1($terms);
    $existing = $DB->get_record('bento_agreements', ['userid' => $USER->id]);
    if ($existing) {
        $existing->termshash = $hash;
        $existing->timemodified = time();
        $DB->update_record('bento_agreements', $existing);
    } else {
        $DB->insert_record('bento_agreements', [
            'userid' => $USER->id,
            'termshash' => $hash,
            'timemodified' => time(),
        ]);
    }
    redirect($returnurl);
}

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('agreetermstitle', 'mod_bento'));
echo html_writer::tag('p', get_string('agreetermsintro', 'mod_bento'));
echo html_writer::div(format_text($terms, FORMAT_HTML), 'mod-bento-terms-text');

echo html_writer::start_tag('form', ['method' => 'post', 'action' => new moodle_url('/mod/bento/terms.php')]);
echo html_writer::empty_tag('input', ['type' => 'hidden', 'name' => 'sesskey', 'value' => sesskey()]);
echo html_writer::empty_tag('input', ['type' => 'hidden', 'name' => 'returnurl', 'value' => $returnurlraw]);
echo html_writer::empty_tag('input', ['type' => 'hidden', 'name' => 'agree', 'value' => '1']);
echo html_writer::tag('button', get_string('agreetermsbutton', 'mod_bento'), ['type' => 'submit', 'class' => 'btn btn-primary']);
echo html_writer::end_tag('form');

echo $OUTPUT->footer();
