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
    var bentoImporterEl = document.getElementById('mod-bento-importer');
    var bentoCourseId = (bentoImporterEl && bentoImporterEl.dataset.courseid) || '';
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
    document.body.appendChild(ctxMenu);

    var pasteCatcher = modal.querySelector('.mod-bento-paste-catcher');
    var step1 = modal.querySelector('.mod-bento-paste-step1');
    var step2 = modal.querySelector('.mod-bento-paste-step2');
    var lrDoc = modal.querySelector('.mod-bento-paste-doc');
    var lrPreview = modal.querySelector('.mod-bento-paste-preview');
    var viewToggle = modal.querySelector('.mod-bento-paste-viewtoggle');
    var generateBtn = modal.querySelector('.mod-bento-paste-generatebtn');
    var closeBtn = modal.querySelector('.mod-bento-paste-modal-close');

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
    pasteTile.addEventListener('click', function () {
      if (window.bentoConvertApi && window.bentoConvertApi.guardTerms && !window.bentoConvertApi.guardTerms()) return;
      openModal();
    });
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
      try {
        var items = cd.items || [];
        for (var i = 0; i < items.length; i++) {
          if (items[i].type && items[i].type.indexOf('image/') === 0) {
            var file = items[i].getAsFile();
            if (file) imageFiles.push(file);
          }
        }
      } catch (e) { console.warn('mod_bento: clipboard image scan failed, continuing with text only', e); }
      pasteCatcher.dataset.filled = '1';
      pasteCatcher.textContent = '\u2026';
      // Whatever fails inside here — a malformed clipboard HTML fragment,
      // an image-proxy call that errors instead of cleanly resolving null,
      // anything — the paste must never end up doing NOTHING: falling back
      // to the plain-text-only path below means typing/pasting keeps
      // working even with the image proxy fully disabled, or broken, or
      // whatever else HTML-specific went wrong.
      parsePastedContent(html, plain, imageFiles).catch(function (e) {
        console.warn('mod_bento: rich paste handling failed, falling back to plain text', e);
        if (!plain || !plain.trim()) return [];
        return plain.split(/\n{2,}/).map(function (p) { return p.replace(/[ \t]+/g, ' ').trim(); }).filter(Boolean)
          .map(function (text) { return { kind: 'text', html: esc(text), headingLevel: 0 }; });
      }).then(function (blocks) {
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
      var proxyUrl = M.cfg.wwwroot + '/mod/bento/image_proxy.php?courseid=' + encodeURIComponent(bentoCourseId) + '&url=' + encodeURIComponent(url);
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
      // One entry per node, in ORIGINAL document order — text fills in
      // immediately (synchronous), an image is a PROMISE that resolves to
      // its own block (or null on failure) later. Building the final
      // array by INDEX (not by push-whenever-it-resolves) is what keeps
      // the original interleaving of images and text intact regardless of
      // how long any individual image fetch takes — previously, every
      // text block (always synchronous) ended up before every image block
      // (always resolved later), even when the image appeared BEFORE that
      // text in the actual source document.
      var slots = [];
      if (html && html.trim()) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var nodes = doc.body ? doc.body.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,blockquote,img') : [];
        Array.prototype.forEach.call(nodes, function (node) {
          var tag = node.tagName.toLowerCase();
          if (tag === 'img') {
            var src = node.getAttribute('src');
            if (!src) return;
            slots.push(tryFetchImageAsDataUrl(src).then(function (dataUrl) {
              return dataUrl ? { kind: 'image', dataUrl: dataUrl, sourceUrl: src, retrievedAt: new Date().toISOString().slice(0, 10) } : null;
            }));
            return;
          }
          var innerHtml = sanitizeInlineHtml(node);
          if (!innerHtml.trim()) return;
          var level = /^h([1-6])$/.exec(tag);
          slots.push({ kind: 'text', html: innerHtml, headingLevel: level ? +level[1] : 0 });
        });
      } else if (plain && plain.trim()) {
        var paragraphs = plain.split(/\n{2,}/).map(function (p) { return p.replace(/[ \t]+/g, ' ').trim(); }).filter(Boolean);
        paragraphs.forEach(function (text) { slots.push({ kind: 'text', html: esc(text), headingLevel: 0 }); });
      }
      imageFiles.forEach(function (file) {
        slots.push(fileToDataUrl(file).catch(function () { return null; }).then(function (dataUrl) {
          return dataUrl ? { kind: 'image', dataUrl: dataUrl } : null;
        }));
      });
      // Every image fetch runs CONCURRENTLY now (Promise.all over the
      // whole slots array — a plain value resolves through Promise.all
      // immediately, same as a real promise would) rather than one
      // sequential chain where document N's fetch didn't even START until
      // every document before it had already finished, failed, or timed
      // out — the dominant cause of a paste with several images visibly
      // taking a long time / looking stuck.
      return Promise.all(slots).then(function (resolved) {
        return resolved.filter(Boolean);
      });
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

    var LR_TYPE_LABELS = {
      heading: 'Überschrift', explain: 'Erklärtext', quote: 'Quelle/Zitat',
      caption: 'Caption', glossary: 'Glossar (Vokabel)', task: 'Arbeitsauftrag',
      references: 'Quellennachweise',
    };

    function buildInitialDoc(blocks) {
      lrDoc.innerHTML = '';
      lrDoc.appendChild(makeBreakMarker(1));
      blocks.forEach(function (b) {
        if (b.kind === 'image') {
          var img = document.createElement('img');
          img.src = b.dataUrl;
          img.dataset.mbp = 'image';
          if (b.sourceUrl) img.dataset.sourceUrl = b.sourceUrl;
          if (b.retrievedAt) img.dataset.retrievedAt = b.retrievedAt;
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
      wireDragAndDrop();
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

    /** Which slide number (1-based) a given node currently falls under —
     *  used to label the tier-3 "Block auf Folie X erstellen" buttons
     *  with the actual number, not a generic placeholder. */
    function slideNumberOf(node) {
      var slideNum = 0;
      for (var i = 0; i < lrDoc.children.length; i++) {
        var child = lrDoc.children[i];
        if (child.dataset.mbpMarker === 'break') slideNum++;
        if (child === node || (child.contains && child.contains(node))) return slideNum;
      }
      return slideNum;
    }

    /** Whether `node` currently falls inside a Zusatztext (on/off marker)
     *  range — same scan every other mode-aware function here already
     *  does, kept as its own small helper since tier-2's type buttons
     *  need to know the CURRENT mode to decide default button state. */
    function isInZusatzRange(node) {
      var inZusatz = false;
      for (var i = 0; i < lrDoc.children.length; i++) {
        var child = lrDoc.children[i];
        if (child === node || (child.contains && child.contains(node))) return inZusatz;
        if (child.dataset.mbpMarker === 'break') inZusatz = false;
        else if (child.dataset.mbpMarker === 'zusatz-on') inZusatz = true;
        else if (child.dataset.mbpMarker === 'zusatz-off') inZusatz = false;
      }
      return inZusatz;
    }

    /** Splits the paragraph the cursor is currently in at the exact
     *  cursor position — returns {before, after}, either of which may be
     *  null if the cursor sat at that edge (nothing to split there). Pure
     *  DOM surgery, no marker inserted — callers decide what goes between
     *  the two halves. */
    function splitParagraphAtCursor() {
      var sel = window.getSelection();
      if (!sel || !sel.rangeCount) return null;
      var range = sel.getRangeAt(0);
      if (!lrDoc.contains(range.startContainer)) return null;
      var p = range.startContainer;
      if (p.nodeType === 3) p = p.parentElement;
      while (p && p.parentElement !== lrDoc) p = p.parentElement;
      if (!p || p.dataset.mbp !== 'text') return null;

      var beforeRange = document.createRange();
      beforeRange.selectNodeContents(p);
      beforeRange.setEnd(range.startContainer, range.startOffset);
      var beforeText = beforeRange.toString();
      var afterText = p.textContent.slice(beforeText.length);

      if (!beforeText.trim()) return { before: null, after: p };
      if (!afterText.trim()) return { before: p, after: null };

      var afterP = document.createElement('p');
      afterP.textContent = afterText;
      afterP.dataset.mbp = 'text';
      p.textContent = beforeText;
      p.parentNode.insertBefore(afterP, p.nextSibling);
      return { before: p, after: afterP };
    }

    /** A break always gets its own blank line — a visible, focusable gap
     *  around the marker rather than it sitting flush against the
     *  surrounding text, per feedback. `after` may be null (cursor was at
     *  the very end of the document) — an empty paragraph still gets
     *  created so there's somewhere to keep typing. */
    function insertBreakWithBlankLine(beforeNode, afterNode) {
      var blank = document.createElement('p');
      blank.dataset.mbp = 'text';
      var marker = makeBreakMarker(1);
      var anchor = beforeNode || lrDoc.lastElementChild;
      if (anchor && anchor.parentNode) {
        anchor.parentNode.insertBefore(marker, anchor.nextSibling);
        marker.parentNode.insertBefore(blank, marker.nextSibling);
      } else {
        lrDoc.appendChild(marker);
        lrDoc.appendChild(blank);
      }
      if (afterNode) blank.parentNode.insertBefore(afterNode, blank.nextSibling);
      wireDragAndDrop();
      return blank;
    }

    function placeCursorIn(node) {
      var range = document.createRange();
      range.selectNodeContents(node);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // ---- drag-and-drop: blocks move between slides, and between slide
    // content and Zusatztext, simply by landing on the other side of a
    // marker — refreshSlideNumbers()/parseDocToBlocks() already derive
    // both from scanning marker positions, so relocating a node is all
    // moving it between slides/modes actually requires. ----
    var dragged = null;
    // A floating grip, NOT draggable=true directly on the text/image
    // blocks themselves: inside a contenteditable region, clicking and
    // dragging on TEXT CONTENT is claimed by the browser's own text-
    // selection behaviour first — draggable="true" on an element full of
    // text rarely gets a real chance to start a drag via ordinary
    // interaction with that text. The grip itself has no text at all, so
    // there's nothing for text-selection to claim; it just tracks
    // whichever block it's currently hovering.
    var dragHandle = document.createElement('div');
    dragHandle.className = 'mbp-draghandle';
    dragHandle.textContent = '\u283f'; // ⠿
    dragHandle.draggable = true;
    dragHandle.hidden = true;
    document.body.appendChild(dragHandle);
    var handleFor = null;

    function positionHandleFor(node) {
      handleFor = node;
      var rect = node.getBoundingClientRect();
      dragHandle.style.left = (rect.left - 22) + 'px';
      dragHandle.style.top = (rect.top + rect.height / 2 - 9) + 'px';
      dragHandle.hidden = false;
    }

    dragHandle.addEventListener('dragstart', function (ev) {
      if (!handleFor) { ev.preventDefault(); return; }
      dragged = handleFor;
      ev.dataTransfer.effectAllowed = 'move';
      handleFor.classList.add('mbp-dragging');
    });
    dragHandle.addEventListener('dragend', function () {
      if (handleFor) handleFor.classList.remove('mbp-dragging');
      dragged = null;
      dragHandle.hidden = true;
    });

    function wireDragAndDrop() {
      Array.prototype.forEach.call(lrDoc.querySelectorAll('[data-mbp]'), function (node) {
        node.onmouseenter = function () { if (!dragged) positionHandleFor(node); };
        node.ondragover = function (ev) {
          if (!dragged || dragged === node) return;
          ev.preventDefault();
          node.classList.add('mbp-dragover');
        };
        node.ondragleave = function () { node.classList.remove('mbp-dragover'); };
        node.ondrop = function (ev) {
          ev.preventDefault();
          node.classList.remove('mbp-dragover');
          if (!dragged || dragged === node) return;
          var rect = node.getBoundingClientRect();
          var before = (ev.clientY - rect.top) < rect.height / 2;
          node.parentNode.insertBefore(dragged, before ? node : node.nextSibling);
          refreshSlideNumbers();
        };
      });
    }
    lrDoc.addEventListener('mouseleave', function () { if (!dragged) dragHandle.hidden = true; });

    // ---- the 3-tier context menu itself ----
    function clearCtxMenu() { ctxMenu.innerHTML = ''; }
    function addCtxBtn(label, onClick, cssClass) {
      var b = document.createElement('button');
      b.type = 'button';
      if (cssClass) b.className = cssClass;
      b.textContent = label;
      b.addEventListener('mousedown', function (ev) { ev.preventDefault(); onClick(); ctxMenu.style.display = 'none'; });
      ctxMenu.appendChild(b);
      return b;
    }

    /** Finds which gap between blocks a given viewport Y-coordinate falls
     *  into — geometric, not selection-based, specifically because a click
     *  in the visual gap BETWEEN two block-level elements resolves to an
     *  ambiguous/inconsistent DOM position across browsers (some snap
     *  forward to the start of the next block, some back to the end of
     *  the previous one, especially with a contenteditable=false marker
     *  nearby) — asking "where in PIXEL SPACE did the block layout put
     *  this Y" sidesteps that ambiguity entirely, since it depends only
     *  on the blocks' own rendered positions, not on how any particular
     *  browser resolves clicking into a margin.
     *  Returns the block to insert AFTER, or null to mean "at the very
     *  start of the document". */
    function findAnchorForY(clientY) {
      var children = lrDoc.children;
      var anchor = null;
      for (var i = 0; i < children.length; i++) {
        var rect = children[i].getBoundingClientRect();
        var mid = rect.top + rect.height / 2;
        if (clientY >= mid) anchor = children[i];
        else break;
      }
      return anchor;
    }

    function showCtxMenuAtCursor(clientX, clientY) {
      var sel = window.getSelection();
      if (!sel || !sel.rangeCount || !lrDoc.contains(sel.anchorNode)) { ctxMenu.style.display = 'none'; return; }
      var range = sel.getRangeAt(0);
      var collapsed = range.collapsed;
      var containerNode = range.startContainer;
      if (containerNode.nodeType === 3) containerNode = containerNode.parentElement;
      while (containerNode && containerNode.parentElement !== lrDoc && containerNode !== lrDoc) containerNode = containerNode.parentElement;
      var inBlock = containerNode && containerNode.dataset && containerNode.dataset.mbp === 'text';
      var haveCoords = typeof clientY === 'number';

      clearCtxMenu();
      if (collapsed && !inBlock) {
        // Tier 1: nothing selected AND the cursor isn't inside any block's
        // own text (i.e. it landed between blocks, or the document is
        // otherwise between-content) — the only meaningful action here is
        // starting a new slide right at this point. Prefer the GEOMETRIC
        // anchor (real click Y vs. each block's own rendered position)
        // over containerNode from the selection — the selection's own
        // idea of "nearest block" is exactly what used to put the break
        // in the wrong place (sometimes much later in the document) when
        // a browser's own click-in-the-gap snapping didn't land where the
        // person actually clicked.
        addCtxBtn('\u25aa Folie endet hier', function () {
          var anchor = haveCoords ? findAnchorForY(clientY) : ((containerNode && containerNode !== lrDoc) ? containerNode : null);
          insertBreakWithBlankLine(anchor, null);
        });
      } else if (collapsed && inBlock) {
        // Tier 2: cursor inside a block, nothing selected — reclassify
        // the WHOLE current block directly, or split it in two first.
        addCtxBtn('\u2702 Block teilen', function () {
          var split = splitParagraphAtCursor();
          if (split && split.after) placeCursorIn(split.after);
          wireDragAndDrop();
        });
        var curInZusatz = isInZusatzRange(containerNode);
        if (curInZusatz) {
          addCtxBtn('\u2192 Folieninhalt', function () {
            toggleBlockZusatz(containerNode, false);
            delete containerNode.dataset.mbpType;
          });
        } else {
          addCtxBtn('\u2192 Zusatztext', function () {
            toggleBlockZusatz(containerNode, true);
            containerNode.dataset.mbpType = 'explain';
          });
        }
        Object.keys(LR_TYPE_LABELS).forEach(function (ty) {
          addCtxBtn(LR_TYPE_LABELS[ty], function () {
            if (!isInZusatzRange(containerNode)) toggleBlockZusatz(containerNode, true);
            containerNode.dataset.mbpType = ty;
          });
        });
      } else {
        // Tier 3: text IS selected — the selection becomes its own new
        // block (before/after what's left of the original block keep
        // their existing role, same convention as the standalone
        // converter's own split logic), OR is simply discarded.
        var slideNum = slideNumberOf(containerNode) || 1;
        addCtxBtn('Block auf Folie ' + slideNum + ' erstellen', function () {
          createBlockFromSelection(false);
        });
        addCtxBtn('Block auf Ergänzungsseite zu Folie ' + slideNum + ' erstellen', function () {
          createBlockFromSelection(true);
        });
        addCtxBtn('Text löschen', function () {
          range.deleteContents();
        }, 'mbp-ctx-danger');
      }

      ctxMenu.style.display = 'flex';
      var rect = range.getClientRects()[0];
      if (!rect && containerNode && containerNode !== lrDoc) rect = containerNode.getBoundingClientRect();
      if ((!rect || (!rect.width && !rect.height)) && haveCoords) rect = { left: clientX, top: clientY, width: 0, height: 0 };
      if (!rect || (!rect.width && !rect.height && !haveCoords)) rect = lrDoc.getBoundingClientRect();
      var menuRect = ctxMenu.getBoundingClientRect();
      ctxMenu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - menuRect.width - 8)) + 'px';
      ctxMenu.style.top = Math.max(8, rect.top - menuRect.height - 8) + 'px';
    }

    /** Moves a block across the nearest zusatz-on/zusatz-off boundary by
     *  inserting one where needed — the same "position relative to
     *  markers decides role" convention drag-and-drop already relies on,
     *  just invoked programmatically for the tier-2 type buttons. */
    function toggleBlockZusatz(node, toZusatz) {
      var currentlyIn = isInZusatzRange(node);
      if (currentlyIn === toZusatz) return;
      node.parentNode.insertBefore(makeModeMarker(toZusatz), node);
      // if the NEXT node would otherwise inherit a mode it shouldn't,
      // close the range right after this one block only.
      if (node.nextSibling) node.parentNode.insertBefore(makeModeMarker(!toZusatz), node.nextSibling);
      refreshSlideNumbers();
    }

    function createBlockFromSelection(asZusatz) {
      var sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      var range = sel.getRangeAt(0);
      var text = range.toString();
      if (!text.trim()) return;
      var split = splitParagraphAtCursor(); // cursor is at range.startContainer here — but we need BOTH ends split
      // splitParagraphAtCursor only splits at the CURRENT collapsed
      // position, so for a real selection we do it manually: delete the
      // selected text from its home paragraph and insert a fresh block
      // in its place, keeping whatever's left before/after as-is.
      void split; // (not used directly — see below)
      var container = range.startContainer.nodeType === 3 ? range.startContainer.parentElement : range.startContainer;
      while (container && container.parentElement !== lrDoc && container !== lrDoc) container = container.parentElement;
      if (!container || container.dataset.mbp !== 'text') return;

      var fullText = container.textContent;
      var startOffset = getTextOffsetInNode(container, range.startContainer, range.startOffset);
      var endOffset = getTextOffsetInNode(container, range.endContainer, range.endOffset);
      var before = fullText.slice(0, startOffset);
      var middle = fullText.slice(startOffset, endOffset);
      var after = fullText.slice(endOffset);

      var newBlock = document.createElement('p');
      newBlock.textContent = middle;
      newBlock.dataset.mbp = 'text';
      if (asZusatz) newBlock.dataset.mbpType = 'explain';

      var afterP = null;
      if (after.trim()) {
        afterP = document.createElement('p');
        afterP.textContent = after;
        afterP.dataset.mbp = 'text';
      }
      container.textContent = before;
      if (!before.trim()) {
        container.parentNode.insertBefore(newBlock, container);
        container.remove();
      } else {
        container.parentNode.insertBefore(newBlock, container.nextSibling);
      }
      if (afterP) newBlock.parentNode.insertBefore(afterP, newBlock.nextSibling);
      if (asZusatz) toggleBlockZusatz(newBlock, true);
      refreshSlideNumbers();
      wireDragAndDrop();
    }

    /** Plain-text offset of (node, offset) relative to `root`'s own
     *  textContent — needed because a selection's start/endContainer can
     *  be any descendant text node (e.g. inside a <b>), not necessarily
     *  the paragraph itself. */
    function getTextOffsetInNode(root, node, offset) {
      if (node === root) return offset;
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      var total = 0;
      var cur;
      while ((cur = walker.nextNode())) {
        if (cur === node) return total + offset;
        total += cur.textContent.length;
      }
      return total;
    }

    lrDoc.addEventListener('click', function (ev) { showCtxMenuAtCursor(ev.clientX, ev.clientY); });
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
          blocks.push({
            kind: 'image', dataUrl: node.getAttribute('src'), slideBreakBefore: pendingBreak,
            sourceUrl: node.dataset.sourceUrl, retrievedAt: node.dataset.retrievedAt,
          });
          pendingBreak = false;
        } else {
          var text = (node.textContent || '').trim();
          if (text) {
            blocks.push({
              kind: 'text', role: inZusatz ? 'longread' : 'slide', text: text,
              longReadType: node.dataset.mbpType || 'explain',
              slideBreakBefore: pendingBreak,
            });
            pendingBreak = false;
          }
          // empty (e.g. the auto-inserted blank line right after a fresh
          // marker, never typed into) — pendingBreak stays true, deferred
          // to whichever REAL content comes next, instead of being lost
          // here and silently un-splitting the slide.
        }
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
          var imageEl = {
            id: uuid(), type: 'image', x: 240, y: 160, w: 800, h: 450, rotation: 0, opacity: 1,
            src: internImage(block.dataUrl), fit: 'contain', radius: 0,
          };
          // Only ever set when this image actually came through a traceable
          // fetch (the proxy or a direct-CORS fetch) — a directly-pasted
          // clipboard image file has no source URL at all, so it gets no
          // citation object rather than one with an empty/misleading URL.
          if (block.sourceUrl) {
            imageEl.citation = { sourceUrl: block.sourceUrl, retrievedAt: block.retrievedAt || new Date().toISOString().slice(0, 10) };
          }
          current.elements.push(imageEl);
          return;
        }
        var text = block.text.trim();
        if (!text) return;
        if (block.role === 'longread') {
          ensureLongRead().blocks.push({ id: uuid(), type: block.longReadType || 'explain', text: text });
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
