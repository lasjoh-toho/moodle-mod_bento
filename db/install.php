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
 * Runs once, immediately after install.xml's tables are created on a
 * brand-new install (never again afterward, and never on an upgrade of an
 * existing install). Its only job: seed 'termsofuse' with a suggested
 * starting text — see bento_default_termsofuse() in lib.php for why this
 * happens here instead of as the admin_setting's own constructor default
 * in settings.php.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

function xmldb_bento_install() {
    require_once(__DIR__ . '/../lib.php');
    set_config('termsofuse', bento_default_termsofuse(), 'mod_bento');
    return true;
}
