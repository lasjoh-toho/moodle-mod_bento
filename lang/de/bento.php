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

$string['studentsubmissions'] = 'Präsentationen der Lernenden';
$string['allowstudentsubmissions'] = 'Lernende legen eigene Präsentationen an';
$string['allowstudentsubmissions_help'] = 'Ist das aktiviert, legt sich jede/r Lernende eine eigene Bento-Präsentation innerhalb dieser Aktivität an (neu oder per Import) und kann ausschließlich diese eigene Präsentation bearbeiten. Ist das deaktiviert (Standard), gibt es wie bisher nur die eine, von der Lehrkraft erstellte Präsentation für alle.';
$string['submissionvisibility'] = 'Sichtbarkeit für andere Lernende';
$string['submissionvisibility_help'] = 'Legt fest, ob Lernende die Präsentationen anderer Lernender automatisch sehen können, oder ob diese erst von einer Lehrkraft freigegeben werden müssen. Die eigene Präsentation kann jede/r Lernende immer sehen und bearbeiten, unabhängig von dieser Einstellung.';
$string['submissionvisibility_auto'] = 'Automatisch — alle sehen alle eingereichten Präsentationen';
$string['submissionvisibility_moderated'] = 'Erst nach Freigabe durch die Lehrkraft sichtbar';
$string['mypresentation'] = 'Meine Präsentation';
$string['editmypresentation'] = 'Meine Präsentation bearbeiten';
$string['presentmypresentation'] = 'Meine Präsentation ansehen';
$string['createmypresentation'] = 'Präsentation anlegen';
$string['nosubmissionyet'] = 'Du hast hier noch keine eigene Präsentation angelegt.';
$string['classmatepresentations'] = 'Präsentationen anderer Lernender';
$string['nosubmissionsvisible'] = 'Aktuell sind keine Präsentationen anderer Lernender sichtbar.';
$string['nosubmissionsyet'] = 'Es wurden noch keine Präsentationen eingereicht.';
$string['present'] = 'Ansehen';
$string['statusapproved'] = 'Freigegeben';
$string['statuspending'] = 'Wartet auf Freigabe';
$string['approve'] = 'Freigeben';
$string['unapprove'] = 'Freigabe zurückziehen';
$string['moderatesubmissions'] = 'Einreichungen freigeben';
$string['notmoderated'] = 'Diese Aktivität ist auf automatische Sichtbarkeit eingestellt — hier gibt es nichts freizugeben, alle eingereichten Präsentationen sind bereits für alle sichtbar.';
$string['lastmodified'] = 'Zuletzt geändert';
$string['submissionsnotenabled'] = 'Für diese Aktivität sind keine eigenen Präsentationen von Lernenden aktiviert.';
$string['submissionnotvisible'] = 'Diese Präsentation ist für dich (noch) nicht sichtbar.';

$string['bento:addinstance'] = 'Eine neue Bento-Präsentation hinzufügen';
$string['bento:view'] = 'Eine Bento-Präsentation ansehen';
$string['bento:edit'] = 'Die Folien einer Bento-Präsentation bearbeiten';
$string['bento:grade'] = 'Eine Bento-Präsentation bewerten';
$string['bento:submit'] = 'Eine eigene Bento-Präsentation anlegen und bearbeiten';
$string['bento:viewallsubmissions'] = 'Alle eingereichten Präsentationen ansehen, unabhängig von der Freigabe';
$string['bento:moderatesubmissions'] = 'Eingereichte Präsentationen freigeben';

$string['privacy:metadata'] = 'Das gemeinsame Präsentationsdokument der Lehrkraft (Tabelle bento) ist Inhalt der Aktivität, keine personenbezogenen Daten. Personenbezogen sind: manuell eingetragene Bewertungen (bento_grades) und — sobald eigene Präsentationen von Lernenden aktiviert sind — die von jeder/jedem Lernenden selbst angelegte Präsentation (bento_submissions), beide unten separat deklariert.';
$string['privacy:metadata:bento_grades'] = 'Eine manuell eingetragene Bewertung (und optionale kurze Rückmeldung) für eine:n Schüler:in bei einer Bento-Präsentation.';
$string['privacy:metadata:bento_grades:userid'] = 'Die Schülerin/der Schüler, zu dem die Bewertung gehört.';
$string['privacy:metadata:bento_grades:grade'] = 'Die von der Lehrkraft eingetragene Bewertung.';
$string['privacy:metadata:bento_grades:feedback'] = 'Optionale kurze Rückmeldung der Lehrkraft.';
$string['privacy:metadata:bento_grades:timemodified'] = 'Wann die Bewertung zuletzt geändert wurde.';
$string['privacy:metadata:bento_submissions'] = 'Die von einer/einem Lernenden selbst angelegte Bento-Präsentation innerhalb dieser Aktivität.';
$string['privacy:metadata:bento_submissions:userid'] = 'Die Schülerin/der Schüler, der diese Präsentation gehört.';
$string['privacy:metadata:bento_submissions:document'] = 'Der Inhalt der von der/dem Lernenden angelegten Präsentation.';
$string['privacy:metadata:bento_submissions:status'] = 'Ob die Präsentation für andere Lernende freigegeben wurde.';
$string['privacy:metadata:bento_submissions:timecreated'] = 'Wann die Präsentation angelegt wurde.';
$string['privacy:metadata:bento_submissions:timemodified'] = 'Wann die Präsentation zuletzt geändert wurde.';
$string['privacy:gradesubcontext'] = 'Bewertung';
$string['privacy:submissionsubcontext'] = 'Meine Präsentation';

$string['eventcoursemoduleviewed'] = 'Bento-Präsentation angesehen';
