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

## When the spec changes

Update the doc in the same piece of work as the code. The spec must never drift
from what the app does.

## Commits

Small and frequent, one feature or fix each.
