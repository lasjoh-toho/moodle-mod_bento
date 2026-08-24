/**
 * view.php's own "Als Präsentationskachel übernehmen" button, on the
 * teacher-facing gallery of student submissions — one webservice call, no
 * relation to the importer widget's own (much larger) bentoconvert.js.
 *
 * Brings a student's submission into the teacher's own activity settings
 * as a separate draft tile (bento_decks), exactly the same destination an
 * imported .pptx becomes — a teacher can then combine student work into a
 * shared presentation the same way they'd combine several imports, via
 * that page's own ✚ connector or the '⇧ Nach oben stellen'/Speichern
 * workflow (see bentoconvert.js).
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     See LICENSE-JS.md in the repository root
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var buttons = document.querySelectorAll('.mod-bento-addtile-btn');
    if (!buttons.length) return;

    function callBentoWebservice(methodname, args) {
      var url = M.cfg.wwwroot + '/lib/ajax/service.php?sesskey=' + encodeURIComponent(M.cfg.sesskey) + '&info=' + methodname;
      var body = [{ index: 0, methodname: methodname, args: args }];
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(function (res) {
        return res.text().then(function (raw) {
          var data;
          try { data = JSON.parse(raw); } catch (e) { throw new Error('Moodle antwortete nicht mit JSON (HTTP ' + res.status + '): ' + raw.slice(0, 200)); }
          if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + JSON.stringify(data));
          if (!Array.isArray(data)) throw new Error((data && (data.message || data.error)) || 'Anfrage fehlgeschlagen (unerwartete Antwort)');
          if (data[0] && data[0].error) throw new Error(data[0].message || (data[0].exception && data[0].exception.message) || 'Anfrage fehlgeschlagen');
          return data[0] && data[0].data;
        });
      });
    }

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function () {
        var cmid = parseInt(btn.dataset.cmid, 10);
        var submissionId = btn.dataset.submissionid;
        var jsonEl = document.querySelector('.mod-bento-subdoc-json[data-submissionid="' + submissionId + '"]');
        if (!cmid || !jsonEl) return;
        var doc;
        try { doc = JSON.parse(jsonEl.textContent); } catch (e) { alert('Konnte die Einreichung nicht lesen.'); return; }
        var name = btn.closest('.card')?.querySelector('.card-title')?.textContent?.trim() || 'Schülerpräsentation';
        btn.disabled = true;
        var originalText = btn.textContent;
        callBentoWebservice('mod_bento_save_deck', { cmid: cmid, deckid: 0, name: name, document: JSON.stringify(doc) })
          .then(function () {
            btn.textContent = '\u2713';
            setTimeout(function () {
              btn.textContent = originalText;
              btn.disabled = false;
            }, 2000);
          })
          .catch(function (e) {
            console.error(e);
            alert('Konnte nicht übernommen werden: ' + (e.message || e));
            btn.disabled = false;
          });
      });
    });
  });
})();
