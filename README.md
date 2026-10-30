# Satyam Shukla — Portfolio

Personal developer portfolio: React 18 + TypeScript + Vite, Tailwind CSS, GSAP/ScrollTrigger,
Framer Motion, Lenis smooth scrolling, and a React Three Fiber hero scene.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the build locally
```

## Before you publish — 3 things to check

1. **Contact form delivery.** Get a free access key at https://web3forms.com (sign up with
   `shuklasatyam23056@gmail.com`), then create `.env` from `.env.example`:
   `VITE_WEB3FORMS_ACCESS_KEY=your-key`. Without a key the form still validates, then opens the
   visitor's email app with the message prefilled — it never shows a fake "sent" message.
   On Vercel/Netlify, add the same variable in the project's environment settings.
2. **Resume.** `public/Satyam-Shukla-Resume.pdf` is generated from `src/data/profile.ts`
   (`npm run resume`, needs Playwright). Replace it with your own PDF at the same path if you prefer.
3. **Content & proficiency levels.** Everything lives in `src/data/profile.ts`. Adjust each
   skill's `level` (`Core` / `Strong` / `Working` / `Growing`) to match reality, and add real
   `links` (GitHub, live URLs) to projects when they're public — buttons appear automatically.

## Deploy

Any static host works. Vercel: import the repo, framework "Vite", output `dist`.
Netlify: build `npm run build`, publish `dist`.

## Structure

```
src/
  data/profile.ts          all content (single source of truth)
  lib/                     motion prefs, device tier, GSAP + Lenis setup
  components/              SplitText, Reveal, Magnetic, TiltCard, Cursor, Loader, Nav, …
  three/HeroScene.tsx      R3F scene (lazy-loaded, paused off-screen)
  demos/CrmDemo.tsx        in-browser CRM demo (lazy-loaded, sample data only)
  components/CommandPalette.tsx  ⌘K / Ctrl+K quick actions
  sections/Terminal.tsx    interactive shell (help, skills, projects, demo, hire…)
  sections/                Hero, Marquee, About, Skills, Projects, Architecture, Workflow, Contact, Footer
```

## Performance & accessibility notes

- No `backdrop-filter` or CSS `blur()` glows; scroll animations use only transform/opacity.
- The 3D hero measures its own frame rate and drops to a lighter mode if it's below 45 fps.

- Three.js (~220 kB gz) loads after first paint in its own chunk and stops rendering when the hero is off-screen.
- Low-memory / few-core / Save-Data devices and touch screens get fewer particles and lower DPR.
- `prefers-reduced-motion`: no loader, no WebGL, no pinning or scrubbed animation, native scrolling.
- Custom cursor only on fine-pointer devices; keyboard focus rings, skip link, ARIA tabs and dialog semantics throughout.
