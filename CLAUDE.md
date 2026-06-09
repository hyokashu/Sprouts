# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A custom Shopify theme for **Vault TCG** — an Australian store selling Chinese-exclusive Pokémon and One Piece TCG cards. Theme name: **Qilin Cards v2**. No build system. No package manager. Liquid templates + plain CSS + vanilla JS, served directly by Shopify.

## Development commands

```bash
# Preview theme against the live store (requires Shopify CLI)
shopify theme dev --store sproutclc.myshopify.com

# Push local changes to a named theme
shopify theme push --theme "vault-tcg-theme-dev"

# Pull current live theme
shopify theme pull
```

No linting, no tests, no compilation step. Changes to `assets/`, `sections/`, `snippets/`, `layout/`, and `templates/` go live on push.

## Architecture

### CSS load order (set in `layout/theme.liquid`)

```
qilin-tokens.css     ← all design tokens (OKLCH colors, spacing, type, z-index, motion)
qilin-base.css       ← reset, base typography, shared components (.btn, .badge, .product-card, .container)
section-header.css   ← sticky header, mobile drawer
section-home-v2.css  ← homepage-only styles (.qc-* prefix)
section-collection.css
section-product.css
section-cart-drawer.css
section-cart.css
```

Section CSS files are loaded globally (not scoped). Footer has its CSS inlined in `sections/footer.liquid` — an inconsistency to fix.

### The zone system

The most important architectural pattern. Each product belongs to a game (`pokemon` or `one-piece`). A `.zone-{game}` class is placed on the nearest ancestor element, which overrides a set of CSS custom properties for everything inside:

```css
/* Default (forest green + gold) */
:root {
  --zone-primary: oklch(24% 0.065 148);
  --zone-accent:  oklch(65% 0.125 80);
}

/* Pokémon CN override */
.zone-pokemon {
  --zone-primary: var(--poke-red);
  --zone-accent:  var(--poke-yellow);
}

/* One Piece CN override */
.zone-one-piece {
  --zone-primary: var(--op-red);
  --zone-accent:  var(--op-gold);
}
```

Components like `.btn--primary`, `.badge--cn`, and `:focus-visible` consume `--zone-primary` — they automatically adopt the right game color without any conditional logic. Apply the zone class at the page or section level, not on individual components.

### Product metafields

All game/product metadata lives in `custom` metafields, not in product type or tags:

| Metafield | Values | Used for |
|---|---|---|
| `custom.game` | `pokemon`, `one-piece` | Zone class, badge color |
| `custom.product_type_tcg` | `sealed`, `graded` | Image aspect ratio (square vs portrait), graded-specific UI |
| `custom.set_name` | string | Badge label on cards and product page |
| `custom.grading_company` | `psa`, `bgs`, `cgc` | Grading badge color/style |
| `custom.grade_value` | string (e.g. `"9.5"`) | Displayed on grading badge |

### Two button classes (known inconsistency)

There are two parallel button systems. Do not mix them:

- `.btn`, `.btn--primary`, `.btn--outline` — defined in `qilin-base.css`. Used on product pages, collection pages, cart. Font-size: 0.9375rem (15px).
- `.qc-btn`, `.qc-btn--primary`, `.qc-btn--ghost` — defined in `section-home-v2.css`. Homepage only. Font-size: 0.625rem (10px) — this is a known issue to be fixed.

### JavaScript

Vanilla JS only, no dependencies. Two globals:

- **`window.QilinCart`** (`assets/cart-drawer.js`) — exposes `.open()`, `.close()`, `.add(variantId, qty, properties)`. Add-to-cart buttons on the product page call `QilinCart.add()` directly. The cart drawer is rendered client-side from `/cart.js`.
- **Homepage IIFEs** (`assets/section-home-v2.js`) — three self-contained functions: hero slider (5s auto-advance, pause on hover/focus), fan favourites tab switcher, newsletter form submit state.

Both files are loaded globally via `defer` in `layout/theme.liquid`, not per-section.

### Color system

**All colors are OKLCH. No hex, no rgb() anywhere** — enforced by convention. Token file: `assets/qilin-tokens.css`. When adding new colors, use `oklch(L% C H)` and add them to the appropriate section in that file. Use `oklch(from var(--token) l c h / alpha)` for alpha variants rather than hard-coding a new value.

### Templates and section routing

Each template JSON (`templates/*.json`) declares which sections render on that route. Product pages have two templates: `product.json` (sealed) and `product.graded-card.json` (graded). The graded template renders `main-product-graded.liquid` which has a dark image surface and grading-specific layout.
