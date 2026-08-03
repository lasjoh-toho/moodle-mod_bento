# mod_bento — Bento presentation activity for Moodle

A Moodle activity module wrapping [Bento](https://bento.page): teachers add
the activity, optionally drop in a `.pptx` (converted entirely client-side —
same code as the standalone converter), then refine it slide-by-slide in the
full Bento editor. Students open the activity straight into presentation
mode — no editor chrome, just the deck.

## Install

1. Grab the latest `mod_bento.zip` from this repo's
   [Releases](../../releases) — already packaged with the correct internal
   structure for Moodle's uploader (a single top-level folder named `bento`).
2. Site administration → Plugins → Install plugins → upload the zip, or
   unzip it so you get `<moodle>/mod/bento/version.php` and visit
   Site administration → Notifications to trigger the install.
3. Confirm the install — it creates two tables (`bento`, `bento_grades`) and
   the capabilities below.

## Cutting a new release

The repo here holds the plugin's own PHP/JS source — the actual embedded
Bento app (`asset/bento-shell.html`) is deliberately NOT committed; it's
built fresh each time from the current
[`lasjoh-toho/bento`](https://github.com/lasjoh-toho/bento) fork
(`moodle-and-editor-enhancements` branch).

1. Update that fork the normal way (merge upstream, resolve conflicts, push).
2. Here → **Actions** → **Build & release mod_bento** → **Run workflow**.
3. `build.mjs` clones the fork, builds the real app, drops it into
   `asset/bento-shell.html`, bumps `version.php`, zips it all up, and — only
   if every step above succeeded — publishes it as a new GitHub Release.
   A build failure (bad clone, failed `npm install`, a TypeScript error)
   stops the job before any release is created; the previous release stays
   the latest one, untouched.

## License note

This repo's `LICENSE` file is MIT. The individual PHP file headers still say
`GNU GPL v3 or later`, matching Moodle core's own convention (and what
Moodle's official plugins directory expects for a listed plugin). Worth
resolving one way or the other before any formal distribution; flagged here
rather than silently picking one.

## How the three pages fit together

| Page | Who | What |
|---|---|---|
| `view.php` | anyone with `mod/bento:view` | The whole page IS the Bento app, launched straight into present mode (`location.hash = '#present'` — Bento's own player-mode hook). No Moodle theme chrome — a complete `<html>` document can't nest inside another one. |
| `edit.php` | `mod/bento:edit` (teachers) | Same idea, but the full editor, reached from the activity's **settings/gear menu → "Edit presentation"**. Bento's own Save button natively knows how to save into Moodle — see below. |
| `grade.php` | `mod/bento:grade` | A normal Moodle-chrome page — plain table, one manually-entered grade + short feedback per student. Reached from the same settings/gear menu ("Grade"). Pushes into the course gradebook via `grade_update()`. |

The PPTX→Bento conversion (`bentoconvert.js` — JSZip + the same conversion
logic as the standalone converter tool + `mergeDocs`, all in one file so
there's no cross-file script-loading race) is the exact same client-side
logic as the standalone converter tool built earlier in this project. The
import widget on `mod_form.php` is available every time the activity is
edited, not just when first created: the currently-saved document always
shows up as a card too, so dropping in another file merges it with what's
already there — same drag-to-reorder-then-✚-to-connect flow as the
standalone tool.

## Known gaps — read before relying on this in production

- **Never installed against a real Moodle instance.** Every file is written
  to well-established, stable Moodle plugin APIs and every PHP file passes
  `php -l`, and the `#bento-doc` splicing was tested against the actual
  bundled shell file — but there's no substitute for an actual install-and-click
  pass on a real site before rolling this out to a class. Test on a
  throwaway Moodle instance first.
- **No backup/restore support** (`FEATURE_BACKUP_MOODLE2` is `false`). A
  course backup will silently omit this activity's content. Implementing
  `backup/moodle2/backup_bento_activity_task.class.php` and the matching
  restore class is the natural next step.
- **No mobile app support.** Opens fine in a mobile browser; the native
  Moodle App won't render it specially.
- **Document stored as a DB column** (`bento.document`, a big text field),
  not through Moodle's File API. Fine for typical decks; a course with many
  huge, image-heavy presentations would benefit from moving the document (or
  at least its embedded image assets) into proper stored files instead.
- **Grading is manual only** — there's no auto-score, by design (a
  presentation doesn't have a "correct answer"). `grade.php` is the entire
  grading UI.

## Files

```
version.php             plugin metadata
lib.php                 instance CRUD, completion, grading, settings-menu links
mod_form.php            add/edit form (name, intro, initial PPTX import, grading)
bentoconvert.js          JSZip + PPTX→bento/slides conversion + mergeDocs + the import/merge
                          widget's own wiring, ALL in one file — deliberately, not split into a
                          second <script> tag: two separate mod_form.php script loads raced on
                          load order once already (JSZip vs. the conversion code) and it cost a
                          few rounds to track down; this avoids that whole class of bug entirely
thirdpartylibs/jszip.min.js   bundled dependency (PPTX is a zip container)
view.php                raw full-page: launches straight into present mode
edit.php                raw full-page: full editor, plus a <meta> tag telling Bento's own
                          Save button (see moodle.ts in the Bento source) it's running inside
                          this activity — no injected script hunting for buttons anymore
grade.php               normal Moodle page: manual per-student grading
index.php               standard course-level "list all instances" page
asset/bento-shell.html  the actual Bento app (same file the standalone build produces)
db/install.xml          bento, bento_grades tables
db/access.php           mod/bento:view, :edit, :grade, :addinstance
db/services.php         mod_bento_save_document web service registration
db/upgrade.php          empty stub for future version bumps
classes/external/save_document.php   the save web service itself
classes/event/course_module_viewed.php
classes/privacy/provider.php         GDPR privacy API (only bento_grades holds personal data)
lang/en/bento.php, lang/de/bento.php
pix/icon.svg, pix/monologo.svg       the actual Bento favicon
styles.css              dropzone styling (auto-loaded by Moodle)
```
