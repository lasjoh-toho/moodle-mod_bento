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
 *    ALSO checks mod/bento:useimageproxy per-role — this setting and that
 *    capability are two separate gates, both have to allow it).
 *  - termsofuse: if non-empty, every entry point (view.php, edit.php,
 *    submission.php, submission_new.php) requires the current user to have
 *    agreed to this exact text (via terms.php) before serving anything —
 *    see bento_require_terms_agreed() in lib.php. Empty means no agreement
 *    step at all, the plugin's original behaviour.
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
}
