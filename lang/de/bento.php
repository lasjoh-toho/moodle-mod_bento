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
 * Deutsche Sprachdatei für mod_bento.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$string['modulename'] = 'Bento-Präsentation';
$string['modulenameplural'] = 'Bento-Präsentationen';
$string['modulename_help'] = 'Eine Bento-Präsentation ist ein eigenständiges Folien-Deck, das Schüler:innen direkt im Präsentationsmodus öffnen. Lehrkräfte können mit einem PowerPoint-Import starten (komplett im Browser umgewandelt) oder mit einer leeren Präsentation, und danach Folie für Folie im vollen Bento-Editor bearbeiten.';
$string['pluginname'] = 'Bento-Präsentation';
$string['pluginadministration'] = 'Bento-Präsentation-Verwaltung';

$string['bentoname'] = 'Name';
$string['bentoname_help'] = 'Der Name, der für diese Aktivität auf der Kursseite angezeigt wird.';
$string['initialcontent'] = 'Präsentation';
$string['document'] = 'Dokument (intern)';
$string['droppptxhere'] = 'Eine .pptx-Datei hier ablegen';
$string['droppptxsub'] = 'Wird komplett im Browser umgewandelt — mehrere Dateien lassen sich ablegen und über ✚ verbinden, genau wie im eigenständigen Konverter. Vorher per Ziehen sortieren, falls die Reihenfolge wichtig ist. So lassen, um das bereits Gespeicherte zu behalten.';
$string['editusehint'] = 'Nutze „Präsentation bearbeiten" im Einstellungsmenü dieser Aktivität für Änderungen an einzelnen Folien — eine Datei hier abzulegen verbindet sie stattdessen mit dem bereits Gespeicherten.';

$string['editpresentation'] = 'Präsentation bearbeiten';
$string['gradepresentation'] = 'Bewerten';
$string['backtoview'] = 'Zurück zur Präsentation';
$string['savetomoodle'] = '💾 In Moodle speichern';
$string['saving'] = 'Speichert…';
$string['saved'] = '✓ Gespeichert';

$string['nogradetype'] = 'Die Bewertung ist für diese Aktivität deaktiviert — stelle in den Einstellungen eine maximale Punktzahl ein, um Schüler:innen zu bewerten.';
$string['scalegradenotsupported'] = 'Diese Aktivität ist auf Skalen-Bewertung eingestellt. Dieses einfache Panel unterstützt nur Punkte — für Skalen bitte die normale Bewertungsseite im Kurs-Notenbuch benutzen.';
$string['gradessaved'] = 'Bewertungen gespeichert.';
$string['nostudents'] = 'Es sind noch keine Schüler:innen mit Zugriff auf diese Aktivität eingeschrieben.';
$string['nobento'] = 'Es gibt noch keine Bento-Präsentationen in diesem Kurs.';
$string['shellmissing'] = 'Die mitgelieferte Bento-App-Datei fehlt in dieser Plugin-Installation.';

$string['bento:addinstance'] = 'Eine neue Bento-Präsentation hinzufügen';
$string['bento:view'] = 'Eine Bento-Präsentation ansehen';
$string['bento:edit'] = 'Die Folien einer Bento-Präsentation bearbeiten';
$string['bento:grade'] = 'Eine Bento-Präsentation bewerten';

$string['privacy:metadata'] = 'Das Bento-Präsentation-Plugin selbst speichert keine personenbezogenen Daten — das Präsentationsdokument ist gemeinsamer Inhalt der ganzen Aktivität, nicht pro Schüler:in. Manuell eingetragene Bewertungen SIND personenbezogene Daten, sie liegen aber in einer eigenen Tabelle (bento_grades), separat unten deklariert.';
$string['privacy:metadata:bento_grades'] = 'Eine manuell eingetragene Bewertung (und optionale kurze Rückmeldung) für eine:n Schüler:in bei einer Bento-Präsentation.';
$string['privacy:metadata:bento_grades:userid'] = 'Die Schülerin/der Schüler, zu dem die Bewertung gehört.';
$string['privacy:metadata:bento_grades:grade'] = 'Die von der Lehrkraft eingetragene Bewertung.';
$string['privacy:metadata:bento_grades:feedback'] = 'Optionale kurze Rückmeldung der Lehrkraft.';
$string['privacy:metadata:bento_grades:timemodified'] = 'Wann die Bewertung zuletzt geändert wurde.';

$string['eventcoursemoduleviewed'] = 'Bento-Präsentation angesehen';
