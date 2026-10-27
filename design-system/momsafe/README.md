# MomSafe design system

Custom light theme using Untitled UI public naming conventions. This is not the official licensed Untitled UI component library.

## Deliverables
- tokens.css: runtime primitive, semantic and component variables.
- tokens.json: portable DTCG-style tokens with typed values and alias references.
- preview.html: responsive palette, typography and component specimen.
- CONTRAST.md: calculated WCAG foreground/background contrast.
- generate.mjs: reproducible source. Run: node design-system/momsafe/generate.mjs.

## Exact reference anchors
| Reference | Hex | Scale alias | Purpose |
|---|---|---|---|
| Metropolitan White | #EEECE7 | neutral-50 | Canvas |
| Dusty Plum | #D7D0E1 | neutral-200 | Border |
| True Purple | #65318E | brand-600 | Primary action |
| Persian Pink | #F77FBE | pink-600 | Supporting accent |
| Savoy Blue | #4B61D1 | blue-600 | Information |
| Orbital Kingdom | #220088 | violet-600 | Deep accent |

Only these six colors were supplied. Other values are custom derived supporting shades, not sampled colors or official Untitled UI values. Chromatic scales have eleven steps, 50 through 950. Tints mix the 600 anchor with white; shades mix with black. Neutral 50 and 200 deliberately use the supplied canvas and border colors.

## Naming and aliases
Primitive → semantic → component. Consume purpose-specific aliases in components.
- color.brand-600 → color.bg-brand-solid → color.button-primary-bg
- color.neutral-900 → color.text-primary → color.input-fg
- CSS: --color-button-primary-bg: var(--color-bg-brand-solid)
- JSON: component $value references {color.bg-brand-solid}.

Public naming conventions retained: text-*, bg-*, fg-*, border-*, brand-50 through 950, _hover, _on-brand, _alt. Text tokens are for copy; fg tokens are graphical foregrounds. Component aliases and supplied color names are MomSafe extensions. CSS flattens group names with hyphens.

Sources:
https://www.untitledui.com/react/docs/installation
https://www.untitledui.com/react/docs/theming

## Typography
Inter, regular 400 body, medium 500 labels, semibold 600 headings/actions.
Display size/line-height px: xs 24/32, sm 30/38, md 36/44, lg 48/60, xl 60/72, 2xl 72/90.
Text: xs 12/18, sm 14/20, md 16/24, lg 18/28, xl 20/30.
Prefer text-md for body and text-xs only for metadata.

## Spacing and radius
Spacing px: none 0, xxs 2, xs 4, sm 6, md 8, lg 12, xl 16, 2xl 20, 3xl 24, 4xl 32, 5xl 40, 6xl 48, 7xl 64, 8xl 80, 9xl 96.
Radius px: none 0, xxs 2, xs 4, sm 6, md 8, lg 10, xl 12, 2xl 16, 3xl 20, 4xl 24, full 9999.
Inputs use radius-md, panels radius-2xl, hero radius-4xl.
Maximum container 1280px, reading width 720px. MomSafe breakpoints: 600 mobile, 850 tablet, 1150 compact desktop, 1500 wide desktop.

## Components
Primary button uses button-primary-bg/fg and bg_hover. Secondary button uses button-secondary-bg/fg/border. Input uses input-bg/fg/border/placeholder.
All controls need visible focus, disabled semantics and 44px targets. Selection uses aria-pressed; current navigation uses aria-current. Clinical urgency always needs text alongside color. Reduced motion is respected.
Shadows: xs subtle separation, sm raised controls, md overlays.

## Scope and accessibility
Light theme only. Supporting red/yellow/green scales preserve distinct error/warning/success meanings. Pink uses dark text.
CONTRAST.md calculates solid sRGB ratios; printed ratios in the source image are not relied upon.
The mobile-first three-portal shell consumes semantic variables. Existing clinical screens still include original Tailwind utility classes; the shared theme adapts their brand tokens. A full clinical component migration remains future work.
Authentication is inherited demo authentication, not secure access control.
