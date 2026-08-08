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
 * "Text einfügen" / "Paste text" — turns text copied from a webpage or PDF
 * into several slides plus a Zusatztext (longRead) companion, the exact
 * same feature and interaction as the standalone bento-moodle-tools
 * converter's own paste flow (see that project's template.html for the
 * original, this is a direct port). Kept in its OWN file rather than
 * folded into bentoconvert.js (126KB of mostly-minified JSZip + the PPTX
 * conversion logic already) — touching that file for an unrelated feature
 * risked breaking something that already works. The only connection
 * between the two is window.bentoConvertApi.addItem(), a minimal export
 * bentoconvert.js adds at its own end specifically for this — this file
 * never reads or writes any of bentoconvert.js's internal state directly.
 *
 * Difference from the standalone tool: images referenced by URL in pasted
 * HTML go through THIS Moodle site's own image_proxy.php (login-required,
 * see that file) rather than an optional user-configured external proxy —
 * Moodle already has a login system to gate it behind, so there's no
 * reason to make it opt-in here the way the standalone tool has to.
 *
 * @package     mod_bento
 * @copyright   2026 The Bento authors
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var pasteTile = document.getElementById('mod-bento-pastetile');
    if (!pasteTile) return; // this page doesn't have the importer widget at all

    var M = window.M || {};
    var STR = (M.util && M.util.get_string) || function (key) { return key; };
    var t = function (key) { return STR(key, 'mod_bento'); };

    // ---- build the modal + continuous-document DOM once, lazily ----
    var modal = document.createElement('div');
    modal.className = 'mod-bento-paste-modal';
    modal.innerHTML =
      '<div class="mod-bento-paste-modal-inner">' +
      '  <button type="button" class="mod-bento-paste-modal-close">\u2715</button>' +
      '  <div class="mod-bento-paste-step1">' +
      '    <h3>' + esc(t('pastestep1title')) + '</h3>' +
      '    <p>' + esc(t('pastestep1desc')) + '</p>' +
      '    <div class="mod-bento-paste-catcher" contenteditable="true">' + esc(t('pastecatcherplaceholder')) + '</div>' +
      '  </div>' +
      '  <div class="mod-bento-paste-step2" style="display:none">' +
      '    <div class="mod-bento-paste-step2head">' +
      '      <div><h3 style="display:inline">' + esc(t('pastestep2title')) + '</h3>' +
      '        <p style="margin-bottom:8px">' + esc(t('pastestep2desc')) + '</p></div>' +
      '      <button type="button" class="mod-bento-paste-viewtoggle">' + esc(t('pasteviewtoggle')) + '</button>' +
      '    </div>' +
      '    <div class="mod-bento-paste-doc" contenteditable="true"></div>' +
      '    <div class="mod-bento-paste-preview" style="display:none"></div>' +
      '    <button type="button" class="mod-bento-paste-generatebtn">' + esc(t('pastegeneratebtn')) + '</button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(modal);

    var ctxMenu = document.createElement('div');
    ctxMenu.className = 'mod-bento-paste-ctxmenu';
    ctxMenu.style.display = 'none';
    ctxMenu.innerHTML =
      '<button type="button" class="mbp-ctx-endslide">' + esc(t('pastectxendslide')) + '</button>' +
      '<button type="button" class="mbp-ctx-togglemode">' + esc(t('pastectxtogglemode')) + '</button>';
    document.body.appendChild(ctxMenu);

    var pasteCatcher = modal.querySelector('.mod-bento-paste-catcher');
    var step1 = modal.querySelector('.mod-bento-paste-step1');
    var step2 = modal.querySelector('.mod-bento-paste-step2');
    var lrDoc = modal.querySelector('.mod-bento-paste-doc');
    var lrPreview = modal.querySelector('.mod-bento-paste-preview');
    var viewToggle = modal.querySelector('.mod-bento-paste-viewtoggle');
    var generateBtn = modal.querySelector('.mod-bento-paste-generatebtn');
    var closeBtn = modal.querySelector('.mod-bento-paste-modal-close');
    var ctxEndSlide = ctxMenu.querySelector('.mbp-ctx-endslide');
    var ctxToggleMode = ctxMenu.querySelector('.mbp-ctx-togglemode');

    function esc(s) {
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function openModal() {
      step1.style.display = '';
      step2.style.display = 'none';
      pasteCatcher.textContent = t('pastecatcherplaceholder');
      pasteCatcher.dataset.filled = '0';
      modal.classList.add('show');
      pasteCatcher.focus();
    }
    function closeModal() { modal.classList.remove('show'); ctxMenu.style.display = 'none'; }
    pasteTile.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

    pasteCatcher.addEventListener('focus', function () {
      if (pasteCatcher.dataset.filled !== '1') pasteCatcher.textContent = '';
    });

    // ---- clipboard capture (see the standalone converter for the same logic) ----
    pasteCatcher.addEventListener('paste', function (ev) {
      ev.preventDefault();
      var cd = ev.clipboardData;
      if (!cd) return;
      var html = cd.getData('text/html');
      var plain = cd.getData('text/plain');
      var imageFiles = [];
      var items = cd.items || [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf('image/') === 0) {
          var file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      pasteCatcher.dataset.filled = '1';
      pasteCatcher.textContent = '\u2026';
      parsePastedContent(html, plain, imageFiles).then(function (blocks) {
        if (!blocks.length) {
          pasteCatcher.textContent = t('pastecatcherplaceholder');
          pasteCatcher.dataset.filled = '0';
          return;
        }
        buildInitialDoc(blocks);
        step1.style.display = 'none';
        step2.style.display = '';
        lrDoc.style.display = '';
        lrPreview.style.display = 'none';
        viewToggle.classList.remove('active');
        viewToggle.textContent = t('pasteviewtoggle');
      });
    });

    function fileToDataUrl(file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(String(reader.result)); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    /** Routes through THIS site's own image_proxy.php (login-required,
     *  same origin as this whole page) rather than trying a direct
     *  cross-origin fetch first — unlike the standalone converter, there's
     *  no reason to even attempt the CORS-restricted direct path here,
     *  since the proxy always works for any logged-in user regardless. */
    function tryFetchImageAsDataUrl(url) {
      var proxyUrl = M.cfg.wwwroot + '/mod/bento/image_proxy.php?url=' + encodeURIComponent(url);
      return fetch(proxyUrl).then(function (res) {
        if (!res.ok) return null;
        return res.blob().then(function (blob) {
          if (blob.type.indexOf('image/') !== 0) return null;
          return fileToDataUrl(blob);
        });
      }).catch(function () { return null; });
    }

    function sanitizeInlineHtml(node) {
      var ALLOWED = { b: 1, strong: 1, i: 1, em: 1, u: 1 };
      var SKIP = { script: 1, style: 1 };
      function walk(n) {
        if (n.nodeType === 3) return esc(n.textContent);
        if (n.nodeType !== 1) return '';
        var tag = n.tagName.toLowerCase();
        if (SKIP[tag]) return '';
        var inner = Array.prototype.map.call(n.childNodes, walk).join('');
        return ALLOWED[tag] ? ('<' + tag + '>' + inner + '</' + tag + '>') : inner;
      }
      return Array.prototype.map.call(node.childNodes, walk).join('').replace(/\s+/g, ' ').trim();
    }

    /** Same model as the standalone converter: HTML for visual fidelity
     *  (bold/italic/heading size) and image position only — never for
     *  auto-deciding slide/Zusatztext, that stays a manual, cursor-menu
     *  choice made in the continuous document further down. */
    function parsePastedContent(html, plain, imageFiles) {
      var blocks = [];
      var work = Promise.resolve();
      if (html && html.trim()) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var nodes = doc.body ? doc.body.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,blockquote,img') : [];
        Array.prototype.forEach.call(nodes, function (node) {
          var tag = node.tagName.toLowerCase();
          if (tag === 'img') {
            var src = node.getAttribute('src');
            if (!src) return;
            work = work.then(function () {
              return tryFetchImageAsDataUrl(src).then(function (dataUrl) {
                if (dataUrl) blocks.push({ kind: 'image', dataUrl: dataUrl });
              });
            });
            return;
          }
          var innerHtml = sanitizeInlineHtml(node);
          if (!innerHtml.trim()) return;
          var level = /^h([1-6])$/.exec(tag);
          blocks.push({ kind: 'text', html: innerHtml, headingLevel: level ? +level[1] : 0 });
        });
      } else if (plain && plain.trim()) {
        var paragraphs = plain.split(/\n{2,}/).map(function (p) { return p.replace(/[ \t]+/g, ' ').trim(); }).filter(Boolean);
        paragraphs.forEach(function (text) { blocks.push({ kind: 'text', html: esc(text), headingLevel: 0 }); });
      }
      imageFiles.forEach(function (file) {
        work = work.then(function () {
          return fileToDataUrl(file).catch(function () { return null; }).then(function (dataUrl) {
            if (dataUrl) blocks.push({ kind: 'image', dataUrl: dataUrl });
          });
        });
      });
      return work.then(function () { return blocks; });
    }

    // ---- continuous document: markers, cursor menu, mode shading ----
    function makeBreakMarker(n) {
      var el = document.createElement('div');
      el.className = 'mbp-marker-break';
      el.dataset.mbpMarker = 'break';
      el.contentEditable = 'false';
      el.textContent = '\u25aa Folie ' + n;
      return el;
    }
    function makeModeMarker(toZusatz) {
      var el = document.createElement('div');
      el.className = 'mbp-marker-mode';
      el.dataset.mbpMarker = toZusatz ? 'zusatz-on' : 'zusatz-off';
      el.contentEditable = 'false';
      el.textContent = toZusatz ? '\u21b3 Zusatztext' : '\u21b3 Folientext';
      return el;
    }

    function buildInitialDoc(blocks) {
      lrDoc.innerHTML = '';
      lrDoc.appendChild(makeBreakMarker(1));
      blocks.forEach(function (b) {
        if (b.kind === 'image') {
          var img = document.createElement('img');
          img.src = b.dataUrl;
          img.dataset.mbp = 'image';
          lrDoc.appendChild(img);
        } else if (b.html) {
          var p = document.createElement('p');
          p.innerHTML = b.html;
          p.dataset.mbp = 'text';
          if (b.headingLevel) p.classList.add('mbp-h' + b.headingLevel);
          lrDoc.appendChild(p);
        }
      });
      refreshSlideNumbers();
    }

    function refreshSlideNumbers() {
      var slideNum = 0;
      var inZusatz = false;
      Array.prototype.forEach.call(lrDoc.children, function (node) {
        if (node.dataset.mbpMarker === 'break') {
          slideNum++;
          node.textContent = '\u25aa Folie ' + slideNum;
          inZusatz = false;
          return;
        }
        if (node.dataset.mbpMarker === 'zusatz-on') { inZusatz = true; return; }
        if (node.dataset.mbpMarker === 'zusatz-off') { inZusatz = false; return; }
        node.classList.toggle('mbp-zusatz', inZusatz);
      });
    }

    function splitAtCursorForMarker() {
      var sel = window.getSelection();
      if (!sel || !sel.rangeCount) return lrDoc.lastElementChild;
      var range = sel.getRangeAt(0);
      if (!lrDoc.contains(range.startContainer)) return lrDoc.lastElementChild;
      var p = range.startContainer;
      if (p.nodeType === 3) p = p.parentElement;
      while (p && p.parentElement !== lrDoc) p = p.parentElement;
      if (!p || p.tagName !== 'P') return p || lrDoc.lastElementChild;

      var beforeRange = document.createRange();
      beforeRange.selectNodeContents(p);
      beforeRange.setEnd(range.startContainer, range.startOffset);
      var beforeText = beforeRange.toString();
      var afterText = p.textContent.slice(beforeText.length);
      if (!beforeText.trim() || !afterText.trim()) return p;

      var afterP = document.createElement('p');
      afterP.textContent = afterText;
      afterP.dataset.mbp = 'text';
      p.textContent = beforeText;
      p.parentNode.insertBefore(afterP, p.nextSibling);
      return p;
    }

    ctxEndSlide.addEventListener('click', function () {
      var anchor = splitAtCursorForMarker();
      anchor.parentNode.insertBefore(makeBreakMarker(1), anchor.nextSibling);
      refreshSlideNumbers();
      ctxMenu.style.display = 'none';
    });
    ctxToggleMode.addEventListener('click', function () {
      var anchor = splitAtCursorForMarker();
      var inZusatz = false;
      for (var i = 0; i < lrDoc.children.length; i++) {
        var node = lrDoc.children[i];
        if (node === anchor || (node.contains && node.contains(anchor))) break;
        if (node.dataset.mbpMarker === 'break') inZusatz = false;
        else if (node.dataset.mbpMarker === 'zusatz-on') inZusatz = true;
        else if (node.dataset.mbpMarker === 'zusatz-off') inZusatz = false;
      }
      anchor.parentNode.insertBefore(makeModeMarker(!inZusatz), anchor.nextSibling);
      refreshSlideNumbers();
      ctxMenu.style.display = 'none';
    });

    function showCtxMenuAtCursor() {
      var sel = window.getSelection();
      if (!sel || !sel.rangeCount || !lrDoc.contains(sel.anchorNode)) { ctxMenu.style.display = 'none'; return; }
      var range = sel.getRangeAt(0).cloneRange();
      var rect = range.getClientRects()[0];
      if (!rect) rect = range.startContainer.nodeType === 1 ? range.startContainer.getBoundingClientRect() : null;
      if (!rect || (!rect.width && !rect.height)) { ctxMenu.style.display = 'none'; return; }
      ctxMenu.style.display = 'flex';
      var menuRect = ctxMenu.getBoundingClientRect();
      ctxMenu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - menuRect.width - 8)) + 'px';
      ctxMenu.style.top = Math.max(8, rect.top - menuRect.height - 8) + 'px';
    }
    lrDoc.addEventListener('click', showCtxMenuAtCursor);
    lrDoc.addEventListener('keyup', function (ev) { if (ev.key.indexOf('Arrow') === 0) showCtxMenuAtCursor(); });
    document.addEventListener('click', function (ev) {
      if (!ctxMenu.contains(ev.target) && ev.target !== lrDoc && !lrDoc.contains(ev.target)) ctxMenu.style.display = 'none';
    });

    function parseDocToBlocks() {
      var blocks = [];
      var pendingBreak = false;
      var inZusatz = false;
      Array.prototype.forEach.call(lrDoc.children, function (node) {
        if (node.dataset.mbpMarker === 'break') { pendingBreak = true; inZusatz = false; return; }
        if (node.dataset.mbpMarker === 'zusatz-on') { inZusatz = true; return; }
        if (node.dataset.mbpMarker === 'zusatz-off') { inZusatz = false; return; }
        if (node.dataset.mbp === 'image') {
          blocks.push({ kind: 'image', dataUrl: node.getAttribute('src'), slideBreakBefore: pendingBreak });
        } else {
          var text = (node.textContent || '').trim();
          if (text) blocks.push({ kind: 'text', role: inZusatz ? 'longread' : 'slide', text: text, slideBreakBefore: pendingBreak });
        }
        pendingBreak = false;
      });
      if (blocks.length) blocks[0].slideBreakBefore = true;
      return blocks;
    }

    function renderSlidePreview() {
      var blocks = parseDocToBlocks();
      lrPreview.innerHTML = '';
      var slideEl = null;
      var slideNum = 0;
      function ensureSlide() {
        if (slideEl) return slideEl;
        slideNum++;
        slideEl = document.createElement('div');
        slideEl.className = 'mbp-preview-slide';
        var h = document.createElement('h4');
        h.textContent = 'Folie ' + slideNum;
        slideEl.appendChild(h);
        lrPreview.appendChild(slideEl);
        return slideEl;
      }
      blocks.forEach(function (b) {
        if (b.slideBreakBefore) slideEl = null;
        var s = ensureSlide();
        if (b.kind === 'image') {
          var img = document.createElement('img');
          img.src = b.dataUrl;
          img.style.cssText = 'max-width:100%;max-height:120px;border-radius:6px;margin-bottom:6px';
          s.appendChild(img);
        } else {
          var p = document.createElement('p');
          if (b.role === 'longread') p.className = 'mbp-preview-zusatz';
          p.textContent = (b.role === 'longread' ? '(Zusatztext) ' : '') + b.text;
          s.appendChild(p);
        }
      });
      if (!lrPreview.children.length) lrPreview.innerHTML = '<p style="opacity:.6">Noch kein Inhalt.</p>';
    }
    viewToggle.addEventListener('click', function () {
      var showingPreview = lrPreview.style.display !== 'none';
      if (showingPreview) {
        lrPreview.style.display = 'none';
        lrDoc.style.display = '';
        viewToggle.classList.remove('active');
        viewToggle.textContent = t('pasteviewtoggle');
      } else {
        renderSlidePreview();
        lrDoc.style.display = 'none';
        lrPreview.style.display = '';
        viewToggle.classList.add('active');
        viewToggle.textContent = t('pastestep2title');
      }
    });

    // ---- generation: same slide/asset shapes bentoconvert.js's own PPTX
    // conversion produces, then handed to the SAME shared items list ----
    function uuid() {
      if (crypto.randomUUID) return crypto.randomUUID();
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    function blankBentoDoc(title) {
      return {
        format: 'bento/slides', version: 1,
        docId: (crypto.randomUUID ? crypto.randomUUID() : 'blank-' + Date.now()),
        title: title || 'Eingefügter Text',
        size: { width: 1280, height: 720 },
        theme: { background: '#FFFFFF', color: '#111111', accent: '#FF9E5E', fontFamily: 'system-ui, sans-serif' },
        slides: [], modified: new Date().toISOString(),
      };
    }
    function buildDocFromBlocks(blocks) {
      var doc = blankBentoDoc('Eingefügter Text');
      doc.assets = {};
      var assetN = 1;
      function internImage(dataUrl) {
        var key = 'pasted' + (assetN++);
        doc.assets[key] = dataUrl;
        return 'asset:' + key;
      }
      var current = null;
      var slideTextCount = 0;
      function startSlide() {
        current = { id: 's' + (doc.slides.length + 1), background: '#FFFFFF', transition: 'none', elements: [], notes: '' };
        slideTextCount = 0;
        doc.slides.push(current);
      }
      function bodyBlockY() { return 60 + slideTextCount * 90; }
      function ensureLongRead() { if (!current.longRead) current.longRead = { blocks: [] }; return current.longRead; }

      blocks.forEach(function (block) {
        if (block.slideBreakBefore || !current) startSlide();
        if (block.kind === 'image') {
          current.elements.push({
            id: uuid(), type: 'image', x: 240, y: 160, w: 800, h: 450, rotation: 0, opacity: 1,
            src: internImage(block.dataUrl), fit: 'contain', radius: 0,
          });
          return;
        }
        var text = block.text.trim();
        if (!text) return;
        if (block.role === 'longread') {
          ensureLongRead().blocks.push({ id: uuid(), type: 'explain', text: text });
        } else {
          var isTitle = slideTextCount === 0;
          current.elements.push({
            id: uuid(), type: 'text', x: 60, y: bodyBlockY(), w: 1160, h: isTitle ? 90 : 70, rotation: 0, opacity: 1,
            html: esc(text), fontSize: isTitle ? 40 : 22, fontFamily: 'system-ui, sans-serif', fontWeight: isTitle ? 700 : 400,
            color: doc.theme.color, align: 'left', valign: 'top', lineHeight: isTitle ? 1.2 : 1.4,
          });
          slideTextCount++;
        }
      });
      if (!doc.slides.length) startSlide();
      return doc;
    }

    generateBtn.addEventListener('click', function () {
      var doc = buildDocFromBlocks(parseDocToBlocks());
      if (window.bentoConvertApi && window.bentoConvertApi.addItem) {
        window.bentoConvertApi.addItem({
          baseName: 'Eingefuegter-Text', doc: doc, slideCount: doc.slides.length, warnings: [], existing: false,
        });
      }
      closeModal();
    });
  });
})();
