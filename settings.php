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
 *    step at all, the plugin's original behaviour. Defaults to a generic
 *    media/copyright usage policy for a Moodle context — every institution
 *    using this plugin should read through and adapt it (jurisdiction,
 *    house rules, actual legal basis) rather than relying on the shipped
 *    wording as-is; it is a starting point, not legal advice.
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

    $defaultterms = <<<HTML
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

    $settings->add(new admin_setting_confightmleditor(
        'mod_bento/termsofuse',
        get_string('settings_termsofuse', 'mod_bento'),
        get_string('settings_termsofuse_desc', 'mod_bento'),
        $defaultterms
    ));
}
