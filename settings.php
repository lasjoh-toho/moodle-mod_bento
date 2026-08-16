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
 * Site-wide admin settings for mod_bento.
 *
 * Two independent things live here:
 *  - imageproxyenabled: a single master switch for image_proxy.php (which
 *    ALSO checks mod/bento:usebentoproxy per-role — this setting and that
 *    capability are two separate gates, both have to allow it). WHICH
 *    roles hold the capability itself is set the standard Moodle way,
 *    under Site administration → Users → Permissions → Define roles —
 *    not duplicated here, since Moodle has no supported way for a plugin's
 *    own settings.php to embed that role-capability matrix without
 *    diverging from the one Define Roles itself shows.
 *  - termsofuse: if non-empty, every entry point (view.php, edit.php,
 *    submission.php, submission_new.php) requires the current user to have
 *    agreed to this exact text (via terms.php) before serving anything —
 *    see bento_require_terms_agreed() in lib.php. Empty means no agreement
 *    step at all, the plugin's original behaviour.
 *
 *    Deliberately constructed with an EMPTY default here rather than the
 *    full suggested text: admin_setting_confightmleditor (like most
 *    admin_setting_* types) shows its own constructor default as a plain,
 *    unrendered "Default: …" caption under the field for comparison — for
 *    a long block of markup that means literal <h3>/<ul>/<li> tags shown
 *    as visible text, not a helpful preview. The suggested text still
 *    ends up as the ACTUAL starting value on a fresh install — see
 *    bento_default_termsofuse() in lib.php, set once via db/install.php
 *    instead, which has no such display side effect.
 *
 *  - absolutemaxdocumentsize: a hard site-wide ceiling (megabytes) no
 *    individual activity's own "Maximale Dokumentgröße" setting (mod_
 *    form.php) can exceed, regardless of what a teacher sets there —
 *    see bento_effective_max_document_bytes() in lib.php, which is what
 *    actually enforces this (both bounds, together) on every save.
 *  - savetimeout: how long (seconds) the EDITOR's own client-side save
 *    request waits for Moodle to respond before giving up and showing a
 *    timeout error, rather than hanging indefinitely with no feedback —
 *    read by edit.php into the same bento-moodle-config meta tag the
 *    cmid/sesskey/wwwroot already travel in, consumed by moodle.ts.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($ADMIN->fulltree) {
    $settings->add(new admin_setting_configcheckbox(
        'mod_bento/imageproxyenabled',
        get_string('settings_imageproxyenabled', 'mod_bento'),
        get_string('settings_imageproxyenabled_desc', 'mod_bento'),
        0
    ));

    $settings->add(new admin_setting_confightmleditor(
        'mod_bento/termsofuse',
        get_string('settings_termsofuse', 'mod_bento'),
        get_string('settings_termsofuse_desc', 'mod_bento'),
        ''
    ));

    $settings->add(new admin_setting_configtext(
        'mod_bento/absolutemaxdocumentsize',
        get_string('settings_absolutemaxdocumentsize', 'mod_bento'),
        get_string('settings_absolutemaxdocumentsize_desc', 'mod_bento'),
        20,
        PARAM_INT
    ));

    $settings->add(new admin_setting_configtext(
        'mod_bento/savetimeout',
        get_string('settings_savetimeout', 'mod_bento'),
        get_string('settings_savetimeout_desc', 'mod_bento'),
        600,
        PARAM_INT
    ));
}
