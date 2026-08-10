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
$string['droppptxhere'] = 'Präsentation importieren';
$string['droppptxsub'] = 'Erlaubte Dateitypen: .pptx, .json (bento/slides), .html/.bento.html. Wird komplett im Browser umgewandelt — mehrere Dateien lassen sich ablegen und über ✚ verbinden, genau wie im eigenständigen Konverter. Vorher per Ziehen sortieren, falls die Reihenfolge wichtig ist. So lassen, um das bereits Gespeicherte zu behalten.';
$string['editusehint'] = 'Nutze „Präsentation bearbeiten" im Einstellungsmenü dieser Aktivität für Änderungen an einzelnen Folien — eine Datei hier abzulegen verbindet sie stattdessen mit dem bereits Gespeicherten.';
$string['pastetile'] = 'Inhalte auf Folien verteilen';
$string['pastetilesub'] = 'Hier können Sie Inhalte, die Sie beispielsweise aus einem Word-Dokument kopiert haben, auf mehrere Folien aufteilen.';
$string['newtile'] = 'Neu: Leere Präsentation';
$string['newtilesub'] = 'Beginnt mit einer einzelnen leeren Folie';
$string['playtile'] = 'Abspielen';
$string['playtilesub'] = 'Öffnet die aktuell gespeicherte Präsentation';
$string['demotile'] = 'Demo/Tutorial';
$string['demotilesub'] = 'Feature-Tour als Präsentation — öffnet direkt, ohne etwas zu verändern';
$string['pastestep1title'] = 'Text einfügen';
$string['pastestep1desc'] = 'Text aus einer Webseite oder einem PDF kopieren, dann hier mit Strg+V (Cmd+V auf dem Mac) einfügen. Bilder im kopierten Inhalt werden mit übernommen — diese Moodle-Version holt sie über die eigene Seite (keine Sicherheitsbeschränkung wie beim eigenständigen Konverter).';
$string['pastecatcherplaceholder'] = 'Hier klicken und einfügen…';
$string['pastestep2title'] = 'Text bearbeiten';
$string['pastestep2desc'] = 'Cursor irgendwo in den Text setzen — ein kleines Menü über der Schreibmarke lässt eine Folie enden oder zwischen Folieninhalt und Zusatztext wechseln, ab genau dieser Stelle. Nichts wurde automatisch erkannt.';
$string['pasteviewtoggle'] = 'Folienansicht';
$string['pastectxendslide'] = '▪ Folie endet hier';
$string['pastectxtogglemode'] = '↕ Wechsel Folientext/Zusatztext';
$string['pastegeneratebtn'] = 'Zur Präsentation hinzufügen';

$string['editpresentation'] = 'Präsentation bearbeiten';
$string['gradepresentation'] = 'Bewerten';
$string['backtoview'] = 'Zurück zur Präsentation';
$string['backtogallery'] = 'Zurück zur Übersicht';
$string['backtocourse'] = 'Zurück zum Kurs';
$string['backtoactivitysettings'] = 'Zurück zu den Aktivitätseinstellungen';
$string['savetomoodle'] = '💾 In Moodle speichern';
$string['saving'] = 'Speichert…';
$string['saved'] = '✓ Gespeichert';

$string['nogradetype'] = 'Die Bewertung ist für diese Aktivität deaktiviert — stelle in den Einstellungen eine maximale Punktzahl ein, um Schüler:innen zu bewerten.';
$string['scalegradenotsupported'] = 'Diese Aktivität ist auf Skalen-Bewertung eingestellt. Dieses einfache Panel unterstützt nur Punkte — für Skalen bitte die normale Bewertungsseite im Kurs-Notenbuch benutzen.';
$string['gradessaved'] = 'Bewertungen gespeichert.';
$string['nostudents'] = 'Es sind noch keine Schüler:innen mit Zugriff auf diese Aktivität eingeschrieben.';
$string['nobento'] = 'Es gibt noch keine Bento-Präsentationen in diesem Kurs.';
$string['shellmissing'] = 'Die mitgelieferte Bento-App-Datei fehlt in dieser Plugin-Installation.';
$string['visibility'] = 'Sichtbarkeit';
$string['gradepublished'] = 'Veröffentlicht';
$string['gradedraft'] = 'Entwurf';
$string['publish'] = 'Veröffentlichen';
$string['unpublish'] = 'Zurückziehen';
$string['draftgradeexplainer'] = 'Eine eingetragene Bewertung ist zunächst nur ein Entwurf und für die/den Lernende:n unsichtbar. Erst ein Klick auf „Veröffentlichen“ macht sie im Notenbuch sichtbar.';

$string['studentsubmissions'] = 'Präsentationen der Lernenden';
$string['allowstudentsubmissions'] = 'Lernende legen eigene Präsentationen an';
$string['allowstudentsubmissions_help'] = 'Ist das aktiviert, legt sich jede/r Lernende eine eigene Bento-Präsentation innerhalb dieser Aktivität an (neu oder per Import) und kann ausschließlich diese eigene Präsentation bearbeiten. Ist das deaktiviert (Standard), gibt es wie bisher nur die eine, von der Lehrkraft erstellte Präsentation für alle.';
$string['submissionvisibility'] = 'Sichtbarkeit für andere Lernende';
$string['submissionvisibility_help'] = 'Legt fest, ob Lernende die Präsentationen anderer Lernender automatisch sehen können, oder ob diese erst von einer Lehrkraft freigegeben werden müssen. Die eigene Präsentation kann jede/r Lernende immer sehen und bearbeiten, unabhängig von dieser Einstellung.';
$string['submissionvisibility_auto'] = 'Automatisch — alle sehen alle eingereichten Präsentationen';
$string['submissionvisibility_moderated'] = 'Erst nach Freigabe durch die Lehrkraft sichtbar';
$string['duedate'] = 'Abgabetermin';
$string['duedate_help'] = 'Ab diesem Zeitpunkt kann eine/ein Lernende:r ihre/seine eigene Präsentation nicht mehr bearbeiten oder speichern — die Präsentation bleibt einsehbar, wird aber schreibgeschützt. Betrifft nie die Lehrkraft. Leer lassen (Häkchen bei "Aktivieren" entfernen) für keine Frist.';
$string['duedatevisible'] = 'Abgabetermin sichtbar';
$string['duedatevisible_help'] = 'Ob der Abgabetermin selbst den Lernenden auf der Übersichtsseite angezeigt wird (unabhängig davon, dass die Frist so oder so durchgesetzt wird).';
$string['duedateinfo'] = 'Abgabetermin: {$a}';
$string['duedatepassedinfo'] = 'Abgabetermin ({$a}) ist bereits verstrichen — Präsentationen sind jetzt schreibgeschützt.';
$string['deadlinepassed'] = 'Der Abgabetermin für diese Aktivität ist verstrichen — Änderungen können nicht mehr gespeichert werden.';
$string['deadlinepassednotice'] = 'Abgabetermin ({$a}) verstrichen — nur noch ansehen, nicht mehr bearbeitbar.';
$string['gradebeforeeditwarning'] = '⚠ Präsentation wurde nach dieser Bewertung noch einmal geändert.';
$string['mypresentation'] = 'Meine Präsentation';
$string['editmypresentation'] = 'Meine Präsentation bearbeiten';
$string['presentmypresentation'] = 'Meine Präsentation ansehen';
$string['presentmasterpresentation'] = 'Präsentation ansehen';
$string['createmypresentation'] = 'Präsentation anlegen';
$string['nosubmissionyet'] = 'Du hast hier noch keine eigene Präsentation angelegt.';
$string['nosubmission'] = 'Noch keine Präsentation angelegt.';
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
$string['created'] = 'Angelegt';
$string['submissionsnotenabled'] = 'Für diese Aktivität sind keine eigenen Präsentationen von Lernenden aktiviert.';
$string['submissionnotvisible'] = 'Diese Präsentation ist für dich (noch) nicht sichtbar.';
$string['schemaoutofdate'] = 'Die installierten Bento-Plugin-Dateien (Version {$a->code}) sind neuer als die Datenbank (zuletzt aktualisiert auf Version {$a->installed}). Das passiert, wenn die Plugin-Dateien aktualisiert wurden, das Datenbank-Upgrade dazu aber noch nicht gelaufen ist. Bitte als Administrator:in „Website-Administration → Benachrichtigungen“ aufrufen, um das nachzuholen.';

$string['bento:addinstance'] = 'Eine neue Bento-Präsentation hinzufügen';
$string['bento:view'] = 'Eine Bento-Präsentation ansehen';
$string['bento:edit'] = 'Die Folien einer Bento-Präsentation bearbeiten';
$string['bento:grade'] = 'Eine Bento-Präsentation bewerten';
$string['bento:submit'] = 'Eine eigene Bento-Präsentation anlegen und bearbeiten';
$string['bento:viewallsubmissions'] = 'Alle eingereichten Präsentationen ansehen, unabhängig von der Freigabe';
$string['bento:moderatesubmissions'] = 'Eingereichte Präsentationen freigeben';
$string['bento:usebentoproxy'] = 'Erlaubt es, den Proxy zu nutzen, um Bilder von per Copy-Paste in Präsentationen eingefügten Webinhalten direkt mit Quellenangaben übernehmen zu können. Die umgeht CORS (Cross-Origin Resource Sharing) Einschränkungen, die dies im Browser verhindern. Nur wirksam, solange der Bild-Proxy auch in den Plugin-Einstellungen aktiviert ist.';

$string['privacy:metadata'] = 'Das gemeinsame Präsentationsdokument der Lehrkraft (Tabelle bento) ist Inhalt der Aktivität, keine personenbezogenen Daten. Personenbezogen sind: manuell eingetragene Bewertungen (bento_grades) und — sobald eigene Präsentationen von Lernenden aktiviert sind — die von jeder/jedem Lernenden selbst angelegte Präsentation (bento_submissions), beide unten separat deklariert.';
$string['privacy:metadata:bento_grades'] = 'Eine manuell eingetragene Bewertung (und optionale kurze Rückmeldung) für eine:n Schüler:in bei einer Bento-Präsentation.';
$string['privacy:metadata:bento_grades:userid'] = 'Die Schülerin/der Schüler, zu dem die Bewertung gehört.';
$string['privacy:metadata:bento_grades:grade'] = 'Die von der Lehrkraft eingetragene Bewertung.';
$string['privacy:metadata:bento_grades:feedback'] = 'Optionale kurze Rückmeldung der Lehrkraft.';
$string['privacy:metadata:bento_grades:published'] = 'Ob die Bewertung für die/den Lernende:n bereits sichtbar (veröffentlicht) ist, oder noch als Entwurf verborgen.';
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

$string['settings_imageproxyenabled'] = 'Bild-Proxy aktivieren';
$string['settings_imageproxyenabled_desc'] = 'Erlaubt es den Proxy zu nutzen, um Bilder von per Copy-Paste in Präsentationen eingefügten Webinhalten direkt mit Quellenangaben übernehmen zu können. Die umgeht CORS (Cross-Origin Resource Sharing) Einschränkungen, die dies im Browser verhindern. Wirkt nur zusätzlich zur Capability „mod/bento:usebentoproxy“ — beides muss zutreffen, damit eine Person den Proxy tatsächlich nutzen kann. Wer welche Rolle diese Capability hat, wird unter Website-Administration → Nutzer/innen → Berechtigungen → Rollen definieren festgelegt (Filter nach „usebentoproxy“). Standardmäßig deaktiviert.';
$string['settings_termsofuse'] = 'Nutzungsbedingungen';
$string['settings_termsofuse_desc'] = 'Wird hier ein Text eingetragen, muss jede Person diesem vor der ersten Nutzung von Bento zustimmen (auf einer eigenen Seite, bevor die eigentliche Präsentation angezeigt wird). Leer lassen, um komplett auf eine Zustimmungspflicht zu verzichten. Wird der Text hier später geändert, wird erneut um Zustimmung gebeten.';
$string['agreetermstitle'] = 'Nutzungsbedingungen';
$string['agreetermsintro'] = 'Bevor du Bento nutzen kannst, lies bitte die folgenden Nutzungsbedingungen und bestätige, dass du sie gelesen und verstanden hast.';
$string['agreetermsbutton'] = 'Ich habe die Nutzungsbedingungen gelesen und stimme zu';
$string['agreetermsrequired'] = 'Du musst den Nutzungsbedingungen zustimmen, um fortzufahren.';
$string['loginonly'] = 'Nur für eingeloggte Mitglieder sichtbar';
$string['loginonly_help'] = 'Ist diese Option aktiviert, ist diese Präsentation ausschließlich für eingeloggte Kursmitglieder sichtbar — auch wenn der Kurs selbst Gastzugang erlaubt. Eingereichte Präsentationen von Lernenden sind davon unabhängig ohnehin immer nur für eingeloggte Mitglieder sichtbar, unabhängig von dieser Einstellung.';
$string['allowstudentpaste'] = '„Inhalte auf Folien verteilen" für Lernende freigeben';
$string['allowstudentpaste_help'] = 'Erlaubt es Lernenden, beim Erstellen ihrer eigenen Präsentation Inhalte per Copy-Paste aus Webseiten oder Dokumenten einzufügen. Standardmäßig deaktiviert — Copy-Paste ist als Abkürzung verlockend genug, dass diese Möglichkeit bewusst freigegeben werden sollte, statt automatisch mit den Schüler-Einreichungen aktiviert zu sein.';
$string['guestaccessdenied'] = 'Diese Präsentation ist nur für eingeloggte Kursmitglieder sichtbar.';
