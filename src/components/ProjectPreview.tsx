import type { Project } from '../data/profile'

/**
 * Illustrative previews drawn in code (no fake screenshots): each one shows the
 * shape of the system rather than pretending to be a real client screen.
 */
export function ProjectPreview({ project }: { project: Project }) {
  const [c1, c2] = project.palette
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[22px] border border-white/[0.08] bg-ink-900"
      style={{ background: `radial-gradient(120% 90% at 100% 0%, ${c1}26, transparent 55%), radial-gradient(90% 80% at 0% 100%, ${c2}22, transparent 60%), #0c0c12` }}
    >
      <div className="grid-bg absolute inset-0 opacity-50" />
      <div className="absolute inset-0 p-4 sm:p-6">{previews[project.id]?.(c1, c2)}</div>
      <span className="absolute bottom-3 right-4 font-mono text-[10px] uppercase tracking-[0.2em] text-mist-500">Illustrative preview</span>
    </div>
  )
}

const bar = (w: string, o = 0.12) => <span className="block h-2 rounded-full" style={{ width: w, background: `rgba(255,255,255,${o})` }} />

const previews: Record<string, (c1: string, c2: string) => JSX.Element> = {
  crm: (c1, c2) => (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2">
        <span className="font-mono text-[11px] text-mist-300">Leads · Pipeline</span>
        <span className="flex gap-1.5">{[c1, c2, '#5cc8ff'].map((c) => <span key={c} className="h-2 w-2 rounded-full" style={{ background: c }} />)}</span>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-2.5">
        {['New', 'Contacted', 'Won'].map((col, ci) => (
          <div key={col} className="flex flex-col gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-mist-500">{col}</span>
            {Array.from({ length: 3 - ci + (ci === 2 ? 1 : 0) }, (_, i) => (
              <div key={i} className="space-y-1.5 rounded-lg border border-white/[0.06] bg-ink-800/80 p-2">
                {bar('70%', 0.25)}
                {bar('45%')}
                <span className="mt-1 block h-1 w-8 rounded-full" style={{ background: ci === 2 ? '#34d399' : c1 }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  ),
  web: (c1, c2) => (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black/30">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 rounded-full bg-white/20" />)}
        <span className="ml-2 h-4 flex-1 rounded-md bg-white/[0.06]" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex justify-between">{bar('20%', 0.3)}<span className="flex w-1/3 gap-2">{bar('100%')}{bar('100%')}{bar('100%')}</span></div>
        <div className="mt-2 grid flex-1 grid-cols-5 gap-4">
          <div className="col-span-3 flex flex-col justify-center gap-2.5">
            <span className="block h-4 w-[90%] rounded-md bg-white/30" />
            <span className="block h-4 w-[65%] rounded-md" style={{ background: c1 }} />
            {bar('80%')}{bar('60%')}
            <span className="mt-2 block h-6 w-24 rounded-full" style={{ background: c1 }} />
          </div>
          <div className="col-span-2 flex flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="font-mono text-[9px] uppercase text-mist-500">Enquiry form</span>
            {[0, 1, 2].map((i) => <span key={i} className="block h-5 rounded-md border border-white/10" />)}
            <span className="mt-auto block h-6 rounded-md" style={{ background: c2 }} />
          </div>
        </div>
      </div>
    </div>
  ),
  cloud: (c1) => (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black/50 font-mono text-[10.5px] leading-5 sm:text-[11.5px]">
      <div className="border-b border-white/10 px-3 py-2 text-mist-500">ubuntu@server: /etc/nginx/sites-available</div>
      <pre className="flex-1 overflow-hidden whitespace-pre p-3 text-mist-300">
{`server {
  listen 443 ssl http2;
  server_name `}<span style={{ color: c1 }}>app.example.com</span>{`;
  root /var/www/app/public;

  ssl_certificate     /etc/letsencrypt/…/fullchain.pem;
  index index.php;

  location / {
    try_files $uri $uri/ /index.php?$query_string;
  }
  location ~ \\.php$ {
    fastcgi_pass unix:/run/php/php-fpm.sock;
  }
}`}
      </pre>
      <div className="border-t border-white/10 px-3 py-2"><span className="text-emerald-400">✓</span> <span className="text-mist-400">nginx -t: syntax is ok</span></div>
    </div>
  ),
  react: (c1, c2) => (
    <div className="flex h-full items-center justify-center">
      <div className="relative flex flex-col items-center gap-5 font-mono text-[11px]">
        <span className="rounded-lg border px-3 py-1.5" style={{ borderColor: c1, color: c1 }}>{'<App />'}</span>
        <div className="flex gap-3 sm:gap-6">
          {['<Layout />', '<Dashboard />', '<ApiProvider />'].map((n, i) => (
            <div key={n} className="flex flex-col items-center gap-3">
              <span className="h-4 w-px bg-white/20" />
              <span className="rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-mist-300">{n}</span>
              <div className="flex gap-1.5">
                {Array.from({ length: i + 1 }, (_, k) => <span key={k} className="h-6 w-6 rounded-md border border-white/10" style={{ background: `${c2}${k % 2 ? '33' : '66'}` }} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  flutter: (c1, c2) => (
    <div className="flex h-full items-center justify-center gap-4">
      {[0, 1].map((p) => (
        <div key={p} className={`flex h-[88%] max-h-72 w-32 flex-col gap-2 rounded-[22px] border-4 border-ink-700 bg-ink-850 p-2.5 sm:w-36 ${p ? 'translate-y-6' : ''}`}>
          <span className="mx-auto block h-1.5 w-10 rounded-full bg-ink-700" />
          {p === 0 ? (
            <>
              <span className="mt-4 block h-8 w-8 rounded-xl" style={{ background: c1 }} />
              {bar('80%', 0.3)}
              <span className="mt-2 block h-6 rounded-lg border border-white/10" />
              <span className="block h-6 rounded-lg border border-white/10" />
              <span className="mt-auto block h-7 rounded-lg" style={{ background: c2 }} />
            </>
          ) : (
            <>
              {bar('50%', 0.3)}
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="flex items-center gap-2 rounded-lg bg-white/[0.04] p-1.5">
                  <span className="h-5 w-5 shrink-0 rounded-md" style={{ background: i % 2 ? c2 : c1 }} />
                  {bar('70%')}
                </span>
              ))}
            </>
          )}
        </div>
      ))}
    </div>
  ),
}
