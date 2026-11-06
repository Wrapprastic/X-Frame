# X Frame

A training logbook for iPhone that runs the J3U X Frame hypertrophy program,
used one-handed between sets at the gym.

## Before changing anything

The spec is the Claude Doc "X Frame Training App — Design Document":
https://claude.ai/artifact/BTcoRKZ2nvKKmNqqUh1EMp

Read it with the Claude Docs connector before starting work. Its Decisions
section records what has been signed off. If a change would contradict the doc,
say so and ask rather than quietly deviating.

## Build target

- An offline web app installed to the iPhone Home Screen: plain HTML, CSS and
  JavaScript, no framework, no bundler, no build step.
- `index.html`: the whole app, with inline CSS and JavaScript.
- `seed.js`: the program templates, RIR table and exercise library, loaded as a
  classic script. Program changes go here, not in code.
- `engine.js`: the progression engine as pure functions with no DOM or storage
  access, loaded as a classic script.
- `tests.html`: runs the engine tests in the browser. Open it after any change
  to `seed.js` or `engine.js`; every line must pass.
- Must work offline once installed. No network calls at runtime, ever.
- Data lives in IndexedDB on the device. Nothing is uploaded anywhere.

## Hard rules

- No features that are not in the spec. Scope creep is the main risk here.
- Kilograms only. Nothing shows pounds.
- The app never lowers a target on its own.
- Large touch targets, one-handed use. Logging a set that hits its target is
  one tap.

## Releasing

- Hosted on GitHub Pages from `main`, at https://wrapprastic.github.io/X-Frame/
  (repo https://github.com/Wrapprastic/X-Frame). Use relative paths only,
  because the app is served from `/X-Frame/`, not the site root.
- Any commit that changes a shipped file (`index.html`, `seed.js`, `engine.js`,
  the manifest or an icon) must also bump `CACHE_VERSION` in `sw.js`. The
  service worker is cache-first, so without the bump every installed copy keeps
  running the old app.
- A new shipped file must be added to `APP_FILES` in `sw.js`, or it will be
  missing offline.
- Once the app is in use, the IndexedDB data on the phone is real training
  history. Schema changes need an upgrade path that keeps it.
- When testing locally, unregister the localhost service worker and delete its
  caches after editing, or the old cached files are what runs.

## When the spec changes

Update the doc in the same piece of work as the code. The spec must never drift
from what the app does.

## Commits

Small and frequent, one feature or fix each.
