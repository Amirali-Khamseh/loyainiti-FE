# Loyainiti Design System

Canonical source for visual tokens, brand assets, and component previews. Both `web/` and `mobile/` apps pull from here.

## Files

| File | What it is | Used by |
| --- | --- | --- |
| `tokens.css` | CSS custom properties + semantic element styles (`.h1`, `.body`, `.num-xl`, etc.) | `web/` |
| `tokens.ts` | TypeScript export of the same tokens for React Native | `mobile/` |
| `assets/logo.svg` | Full Loyainiti wordmark | both |
| `assets/logo-mark.svg` | Just the mark (icon-only) | both |
| `assets/stamp.svg` | Gold-foil loyalty stamp glyph (used in `LoyaltyStamp` component) | both |
| `assets/iconography.md` | Notes on which Lucide icons map to which app concepts | both |
| `components-preview/*.html` | 22 standalone HTML previews of every component (buttons, inputs, KPIs, loyalty stamp row, etc.) | designers, code-review |

## Sync ritual

We chose two independent app projects with **duplicated** tokens (rather than a shared workspace package). When anything in this folder changes:

```bash
# from repo root
cp design-system/tokens.css   web/src/design-system/
cp design-system/tokens.ts    mobile/src/design-system/
cp -r design-system/assets    web/src/design-system/
cp -r design-system/assets    mobile/src/design-system/
```

This is the only "build step" the design system needs. If duplication starts to hurt, the migration to pnpm workspaces + a `@loyainiti/design-system` package is straightforward — see plan notes.

## Visual identity (cheat sheet)

- **Primary action**: `--action` / `colors.action` = `#C45A36` (terracotta-600)
- **Canvas**: `--bg-canvas` / `colors.bgCanvas` = `#FBF8F3` (warm cream)
- **Loyalty accent**: `--gold-500` / `colors.gold500` = `#D4A24A`
- **Text**: `--fg-1` / `colors.fg1` = `#1F1611` (espresso-900)
- **Display font**: Fraunces (variable serif, optical sizing) — large sizes only
- **Body font**: Inter Tight (Söhne substitute)
- **Numerals**: JetBrains Mono with tabular figures (`font-feature-settings: 'tnum' 1`)
- **Spacing base**: 4px. Scale: 4/8/12/16/20/24/32/48/64/80
- **Radii**: 4 / 8 / 12 / 16 / 20 / pill
- **Light mode only** — no dark theme by design

## Iconography

Lucide via `lucide-react` (web) and `lucide-react-native` (mobile). See `assets/iconography.md` for the icon-to-concept mapping.
