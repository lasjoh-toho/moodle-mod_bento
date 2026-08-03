#!/usr/bin/env node
// Assembles the installable mod_bento.zip:
//  - copies this repo's own plugin source (everything except the tooling
//    files listed in EXCLUDE below) into a staging "bento/" folder
//  - clones the bento fork, builds it, and drops the result into
//    bento/asset/bento-shell.html (never committed here — see .gitignore)
//  - bumps version.php to a fresh, monotonically-increasing value
//  - zips the staging folder into dist/mod_bento.zip, with "bento/" as the
//    zip's own top-level folder (what Moodle's installer expects)
//
// Fails loudly (non-zero exit) on any error — the GitHub Action that calls
// this only creates a release on success, so a broken bento fork or a
// broken plugin file just means this run publishes nothing new.

import { execSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BENTO_REPO = process.env.BENTO_REPO || 'https://github.com/lasjoh-toho/bento.git'
const BENTO_BRANCH = process.env.BENTO_BRANCH || 'moodle-and-editor-enhancements'
const REPO_ROOT = import.meta.dirname

// Anything in the repo root that ISN'T part of the actual Moodle plugin —
// left out of the zip entirely.
const EXCLUDE = new Set(['.git', '.github', '.gitignore', 'build.mjs', 'LICENSE', 'README.md', 'dist', 'node_modules'])

function run(cmd, cwd) {
  console.log(`$ ${cmd}`)
  execSync(cmd, { cwd, stdio: 'inherit', shell: '/bin/bash' })
}

function runCapture(cmd, cwd) {
  return execSync(cmd, { cwd, shell: '/bin/bash' }).toString()
}

const work = mkdtempSync(join(tmpdir(), 'mod-bento-build-'))
console.log('Working dir:', work)

try {
  // ---- 1. stage the plugin's own files ----
  const staged = join(work, 'bento')
  mkdirSync(staged, { recursive: true })
  for (const name of readdirSync(REPO_ROOT)) {
    if (EXCLUDE.has(name)) continue
    cpSync(join(REPO_ROOT, name), join(staged, name), { recursive: true })
  }

  // ---- 2. fetch + build the current bento fork ----
  run(`git clone --depth 1 --branch ${BENTO_BRANCH} ${BENTO_REPO} bento-src`, work)
  const bentoSrcDir = join(work, 'bento-src')
  const shortSha = runCapture('git rev-parse --short HEAD', bentoSrcDir).trim()

  const slidesDir = join(bentoSrcDir, 'slides')
  run('npm install --no-audit --no-fund', slidesDir)
  run('npm run build:single', slidesDir) // tsc -b runs inside here — a type error fails this step

  const shellHtml = readFileSync(join(slidesDir, 'dist-single', 'Bento_Slides.bento.html'), 'utf8')
  if (!shellHtml.includes('id="bento-doc"')) {
    throw new Error('Built shell is missing the #bento-doc anchor — refusing to package something the plugin could not splice into later.')
  }
  writeFileSync(join(staged, 'asset', 'bento-shell.html'), shellHtml)

  // ---- 3. bump version.php to something fresh & monotonic ----
  const versionPath = join(staged, 'version.php')
  let versionPhp = readFileSync(versionPath, 'utf8')
  const now = new Date()
  const stamp = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
    String(now.getUTCHours()).padStart(2, '0'),
    String(now.getUTCMinutes()).padStart(2, '0'),
  ].join('')
  if (!/\$plugin->version\s*=\s*\d+;/.test(versionPhp)) {
    throw new Error('version.php does not contain the expected $plugin->version = <int>; line — refusing to guess.')
  }
  versionPhp = versionPhp.replace(/\$plugin->version\s*=\s*\d+;/, `$plugin->version   = ${stamp};`)
  writeFileSync(versionPath, versionPhp)

  // ---- 4. zip it up ----
  const distDir = join(REPO_ROOT, 'dist')
  mkdirSync(distDir, { recursive: true })
  const zipPath = join(distDir, 'mod_bento.zip')
  run(`zip -r -q "${zipPath}" bento -x "*.DS_Store"`, work)

  console.log(`\nBuilt dist/mod_bento.zip from ${BENTO_BRANCH}@${shortSha}, plugin version ${stamp}`)
} finally {
  rmSync(work, { recursive: true, force: true })
}
