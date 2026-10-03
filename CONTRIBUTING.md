# Contributing

Thanks for helping! The most wanted contribution is **new characters**.

## Add a character

1. Copy `packages/widget/src/characters/cat.ts` to `yourcharacter.ts`.
2. Draw your character as SVG inside `render()`. Keep the `viewBox` around `0 0 240 300` so it fits the panel.
3. Add the class names you can support (all optional):

   | Class | What the widget does |
   |---|---|
   | `.m-all` | gentle breathing |
   | `.m-head` | tilts while thinking |
   | `.m-eyes` | follows the pointer |
   | `.m-eye` | blinks |
   | `.m-mouth` / `.m-open` | swapped while talking |
   | `.m-ear`, `.m-tail` | twitch / wag |
   | `.m-wave` | waves hello when the chat opens |

4. Set `origins` so heads and tails rotate around the right point.
5. Use `palette(color)` so the `color` attribute works.
6. Register it in `characters/index.ts`, run `pnpm dev`, and check it in the playground (light and dark, desktop and phone).
7. Open a pull request with a screenshot or GIF.

### Rules for characters
- Original artwork only — no characters you don't own the rights to.
- No external images or fonts; everything inside the SVG.
- Respect `prefers-reduced-motion` (the widget already stops CSS animations).

## Code

- `pnpm test` must pass. Add a test for new behavior.
- Keep the widget dependency-free and small (gzip < 30 KB).
- Never log conversation content on the server.
