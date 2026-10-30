// Generates public/Satyam-Shukla-Resume.pdf from the verified data in src/data/profile.ts.
// Run: npm run resume   (needs Playwright: local install, or a global one via NODE_PATH)
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

// CommonJS require honours NODE_PATH, so a globally installed Playwright works too.
const { chromium } = createRequire(import.meta.url)('playwright')

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(join(root, 'src/data/profile.ts'), 'utf8')
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText
const tmp = mkdtempSync(join(tmpdir(), 'resume-'))
writeFileSync(join(tmp, 'profile.mjs'), js)
const { profile, about, experience, skillGroups, tools, projects } = await import(join(tmp, 'profile.mjs'))

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 16mm 15mm; }
  * { box-sizing: border-box; }
  body { font: 10pt/1.45 -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color: #17171c; margin: 0; }
  h1 { font-size: 24pt; margin: 0; letter-spacing: -0.02em; }
  .role { color: #e5620a; font-weight: 600; margin-top: 2px; }
  .contact { margin-top: 6px; color: #444; font-size: 9pt; }
  .contact a { color: inherit; text-decoration: none; }
  h2 { font-size: 10.5pt; text-transform: uppercase; letter-spacing: .12em; color: #e5620a; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin: 16px 0 8px; }
  h3 { font-size: 11pt; margin: 0; }
  p { margin: 0 0 6px; }
  ul { margin: 4px 0 0 16px; padding: 0; } li { margin: 2px 0; }
  .row { display: flex; justify-content: space-between; align-items: baseline; }
  .muted { color: #666; font-size: 9pt; }
  .skills { display: grid; grid-template-columns: 110px 1fr; gap: 4px 10px; }
  .skills b { font-weight: 600; }
  .proj { margin-bottom: 7px; break-inside: avoid; }
</style></head><body>
  <h1>${esc(profile.name)}</h1>
  <div class="role">${esc(profile.roles.join(' | '))}</div>
  <div class="contact">${esc(profile.email)} · ${esc(profile.phone)} · <a href="${profile.linkedin}">${esc(profile.linkedinLabel)}</a></div>

  <h2>Summary</h2>
  <p>${esc(about.lead)} ${esc(about.paragraphs[0])}</p>

  <h2>Experience</h2>
  <div class="row"><h3>${esc(experience.role)} — ${esc(experience.company)}</h3><span class="muted">${esc(experience.duration)}</span></div>
  <p class="muted">${esc(experience.summary)}</p>
  <ul>${experience.tracks.map((t) => `<li><b>${esc(t.title)}:</b> ${esc(t.body)}</li>`).join('')}</ul>

  <h2>Technical skills</h2>
  <div class="skills">
    ${skillGroups.map((g) => `<b>${esc(g.title)}</b><span>${g.items.map((i) => esc(i.name) + (i.level === 'Growing' ? ' (learning)' : '')).join(', ')}</span>`).join('')}
    <b>Tools</b><span>${tools.map(esc).join(', ')}</span>
  </div>

  <h2>Project work</h2>
  ${projects.map((p) => `<div class="proj"><div class="row"><h3>${esc(p.title)}</h3><span class="muted">${esc(p.status)}</span></div><p>${esc(p.summary)}</p><p class="muted">${p.stack.map(esc).join(' · ')}</p></div>`).join('')}
</body></html>`

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent(html, { waitUntil: 'load' })
await page.pdf({ path: join(root, 'public/Satyam-Shukla-Resume.pdf'), format: 'A4', printBackground: true })
await browser.close()
console.log('Wrote public/Satyam-Shukla-Resume.pdf')
