# School — Style Reference
> personal desktop for creative souls

**Theme:** light

Source measurements are normalized; roles and recommendations are interpreted. Font summary lists are independent, not paired by position. HTML examples are reconstructions, not source components.

School treats its portfolio as a personal desktop: a light gray canvas (#dbdbdb) tiled with generously rounded white cards, each labeled with a tiny monospace caption in parentheses like (Y)our profile. or (Y)our weather. The entire interface speaks in IBM Plex Mono — body, headings, labels, buttons, timestamps — giving every surface the texture of a terminal session or a developer's scratchpad. Color is almost entirely suppressed: the palette is 99% achromatic, with the only warmth coming from a soft tan (#e2ceb8) and a cool blue-gray (#6a728e) used as background washes, and occasional yellow highlight blocks behind individual letters. There is no hero, no marketing band, no gradient — the grid IS the experience, and each card behaves like a widget on a calm, slightly retro operating system.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Charcoal Ink | `#303030` | `--color-charcoal-ink` | Primary text, headings, body copy, icons, link color, input borders, badges — the single dominant ink that holds the whole monochrome system together |
| Paper White | `#ffffff` | `--color-paper-white` | Card surfaces, input fields, elevated panels, text on dark fills |
| Concrete Gray | `#dbdbdb` | `--color-concrete-gray` | Page canvas, the visible background behind every card — the tone that makes white cards feel floating rather than embedded |
| Fog Mist | `#f2f2f2` | `--color-fog-mist` | Subtle elevated surfaces, secondary panels, input hover states — a step between canvas and card |
| Ash Border | `#ededed` | `--color-ash-border` | Hairline borders, input backgrounds, disabled-state fills |
| Smoke | `#c2c2c2` | `--color-smoke` | Muted text, disabled labels, badge backgrounds, inactive states |
| Graphite | `#808080` | `--color-graphite` | Secondary text, meta information, shadow tone, muted border accents |
| Pure Black | `#000000` | `--color-pure-black` | Icon fills, maximum-contrast accents, deep text on light surfaces |
| Sand Wash | `#e2ceb8` | `--color-sand-wash` | Warm background tint on select cards and sections — the only warm chromatic wash in the system, used sparingly to break the cool gray monotony |
| Slate Veil | `#6a728e` | `--color-slate-veil` | Gray supporting accent for decorative details and low-frequency emphasis. |
| Highlight Yellow | `#f9f5a2` | `--color-highlight-yellow` | Text-block highlight behind individual letters or words (the (y)our treatment) — the only vivid functional accent, used to mark a single altered character in an otherwise unstyled sentence |
| Highlight Cyan | `#c7f6ff` | `--color-highlight-cyan` | Secondary text highlight block, paired with yellow for selectable/emphasized letter swaps |

## Tokens — Typography

### IBM Plex Mono — Universal interface font · `--font-ibm-plex-mono`
- **Substitute:** JetBrains Mono, Fira Code, or system monospace stack (ui-monospace, SFMono-Regular)
- **Weights:** 400
- **Sizes:** 11px, 14px, 16px, 18px, 25px, 43px
- **Line height:** 1.40
- **Letter spacing:** normal
- **OpenType features:** `"liga" 0, "calt" 0`

### Helvetica — Secondary display font · `--font-helvetica`
- **Substitute:** Inter, Helvetica Neue, Arial, system-ui
- **Weights:** 300, 400, 700
- **Sizes:** 11px, 18px, 44px
- **Line height:** 1.40

## Do's and Don'ts

### Do
- Use IBM Plex Mono (or a close monospace substitute) for every text element including buttons, labels, captions, and inputs — mono is the system's defining voice
- Give every widget card a parenthetical caption in IBM Plex Mono 11px centered above its content
- Set all card and button radii between 20-25px to maintain the soft, pebble-like silhouette
- Use #dbdbdb as the page canvas and #ffffff for cards; let the contrast and a single 0 3px 6px shadow define card edges without borders
- Use #303030 for all text — never introduce a secondary text color other than #808080 for meta information
- Apply the highlighted-letter treatment (a flat #f9f5a2 or #c7f6ff block behind a single character) to mark a customized or emphasized glyph within an otherwise normal word
- Keep card padding between 18-24px and use 8px gaps as the default element spacing

### Don't
- Do not introduce a brand color, gradient, or saturated accent — the system is 99% achromatic and any chromatic addition will break the desktop neutrality
- Do not use a serif or humanist sans as the primary body font — the mono voice is non-negotiable
- Do not use bold or weight 700 for headlines; the system's restraint comes from weight 300-400 at large sizes
- Do not use sharp corners or radii under 10px — the soft 20-25px rounding is the tactile signature
- Do not place cards directly on white — the #dbdbdb canvas is required for cards to read as floating objects
- Do not use icons with thick strokes or filled glyphs; icons should be thin, monoline, or single characters in the monospace flow
- Do not add borders to cards — shadow alone (rgba(0,0,0,0.16) 0px 3px 6px) defines the card edge
