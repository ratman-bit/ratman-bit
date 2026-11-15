# Customizing your Material 3 profile

Everything is driven by **`profile.config.json`**. Edit it, then either push (the
GitHub Action rebuilds the cards) or build locally:

```sh
npm install
npm run build              # fetches live stats (set GITHUB_TOKEN for contribution data)
npm run build -- --readme  # also regenerate README.md from the config
npm run offline            # re-render from the cached data/stats.json, no network
```

| Key | What it does |
| --- | --- |
| `theme.seed` | Any hex color. The whole palette comes from it, the same way Android derives colors from your wallpaper. |
| `theme.variant` | `tonalSpot` (Pixel default), `vibrant`, `expressive`, `fidelity`, `content`, `neutral`, `monochrome`, `rainbow`, `fruitSalad` |
| `theme.contrast` | `-1` to `1`. `0.5` gives a higher-contrast scheme. |
| `glance`, `greeting`, `tagline`, `heroChips` | The home-screen hero card. |
| `quickSettings.tiles` | Toggle tiles. `active: false` draws an "off" tile. `{repos}`, `{stars}`, `{followers}` are filled in from live data. |
| `featured` | The repo shown as the "now playing" media card. `from`/`to` label the squiggly progress bar. |
| `toolbox.chips` | Filter chips. `selected: true` gives the filled style. |
| `languages.exclude` | Languages to hide (e.g. files GitHub misdetects). |
| `buttons` | Buttons under the cards. `style`: `filled`, `tonal` or `outlined`. |

Icons are Material Symbols Rounded and live in `scripts/icons.mjs`. Available names:
`auto_awesome bolt book bug_report check code coffee commit dark_mode deployed_code devices
do_not_disturb_on fast_forward fast_rewind favorite group lightbulb local_fire_department memory
pause person_add play_arrow public rocket_launch schedule signal_cellular_alt skip_next
skip_previous star terminal waving_hand wifi`.

Shapes (`scripts/lib/shapes.mjs`): `circle cookie9 cookie12 sunny clover4 flower squircle pentagon gem`.

Credits: Google Sans Flex (SIL OFL 1.1, see `assets/fonts/OFL.txt`), Material Symbols (Apache 2.0),
`@material/material-color-utilities` (Apache 2.0).
