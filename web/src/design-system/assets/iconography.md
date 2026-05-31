# Iconography - Lucide mapping

Loyainiti uses **Lucide** icons (https://lucide.dev). Load from CDN:

```html
<script src="https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js"></script>
<i data-lucide="qr-code"></i>
<script>lucide.createIcons()</script>
```

Or import individual SVGs from `https://unpkg.com/lucide-static@0.460.0/icons/<name>.svg`.

## Concept → icon map

| Concept | Lucide icon | Notes |
| --- | --- | --- |
| Customer QR / scan | `qr-code` | Outline only; never filled. |
| Scan action (verb) | `scan-line` | Used on the staff scanner button. |
| Visit (verb/noun) | `coffee` | Even non-café businesses use coffee - it's the brand. |
| Loyalty reward / gift | `gift` | Filled state when redeemable. |
| Stamp (custom) | `assets/stamp.svg` | Brand-custom, gold-foil look. Never Lucide. |
| Customer | `user` | Singular customer. |
| Customers (plural) | `users` | Top-customers list, member counts. |
| New customer | `user-plus` | "New members" KPI. |
| Business / store | `store` | Owner-facing. |
| Menu (list) | `book-open` | Member menu, public menu. |
| Menu item | `utensils` | A specific item, e.g. espresso. |
| Stats | `bar-chart-3` | Dashboard tab. |
| Trend up | `trending-up` | Positive delta on KPI. |
| Trend down | `trending-down` | Negative delta. |
| Date range | `calendar` | Date-range picker trigger. |
| Search | `search` | Global. |
| Settings | `settings` | Owner subnav. |
| Sign out | `log-out` | Confirm dialog. |
| Wallet (customer) | `wallet` | Customer app primary tab. |
| Discover (customer) | `compass` | Customer app secondary tab. |
| Visit history | `history` | Customer app tertiary tab. |
| Profile | `user-round` | Customer app account tab. |
| Close / dismiss | `x` | Modals, banners. |
| More / overflow | `more-horizontal` | Table-row actions. |
| Filter | `sliders-horizontal` | List filters. |
| Sort | `arrow-up-down` | Table-column sort. |
| Link out | `arrow-up-right` | "View business" arrow. |
| Loading | (spinner - see components) | Custom dotted-ring spinner, not Lucide. |

## Rules

- **Stroke 1.75px**. Lucide ships at 2 by default - set `stroke-width="1.75"` on the SVG or pass `{ 'stroke-width': 1.75 }` to `lucide.createIcons`.
- **Default size 20**. Use 16 in compact UI (inline with body), 24 in toolbar/header, 40+ for empty-state illustrations.
- **Color: currentColor.** Always. No explicit fill/stroke on Lucide icons.
- **Never colorize Lucide icons with brand color** (terracotta, gold). The only exception is the gift icon in a "reward earned" badge, which goes to `--gold-600`.
- For empty-state illustrations, use Lucide icons at 48px with `--paper-400` color and 1.5px stroke.

## Brand-custom glyphs

These are NOT Lucide and live in `assets/`:

- `stamp.svg` - gold-foil stamp glyph. Used in the loyalty stamp grid (filled + outlined variants).
- `logo.svg`, `logo-mark.svg` - wordmark and mark.

If you find yourself reaching for an icon Lucide doesn't ship, prefer composing two Lucide icons over hand-drawing a new one. Hand-drawn SVG is a last resort and must be documented here.
