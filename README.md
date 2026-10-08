# SCREW FACE PRODUCT — website

Four-page store front for the Winter 26 drop. Static HTML, CSS and vanilla JS —
no build step, no dependencies, no framework.

```
index.html        Home — film hero, the words, product grid, the drop,
                  bundle pricing, lookbook rail, prints, list sign-up
shop.html         Filterable grid — hoodies / tracksuits
product.html      PDP — front, back, print detail, sizes, accordions
lookbook.html     Winter 26 lookbook — Looks 01–05
assets/img/       Product photography + stills pulled from the film
assets/video/     Four clips cut from SFP Video.mp4
assets/js/data.js Catalogue — 8 pieces, prices, prints, colourways
assets/js/main.js All behaviour, including the bundle maths
```

## Run it

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

Open `index.html` directly if you prefer; `product.html?id=…` reads a query string,
so a server is better for the PDP.

## Pricing

Hoodies are $40 CAD. The bundle is applied automatically in the bag — nothing to enter.

| Hoodies | Price |
|---|---|
| 1 | $40 |
| 2 | $70 |
| 3 | $100 |
| 4 | $125 |

Past four the tiers stack: every full four is $125 and the remainder is charged at its
own tier (5 → $165, 6 → $195, 7 → $225, 8 → $250). The No Evil tracksuit is $70 for the
set and is priced on its own — it does not count toward a hoodie bundle.

All of this lives in two places:

```js
// assets/js/data.js
const HOODIE_TIERS = [0, 40, 70, 100, 125];
// assets/js/main.js
function hoodieTotal(n) { … }
```

Change the tiers and the bag, the nudge line ("add one more hoodie — 3 for $100") and
the PDP copy all follow. The written prices in the marquees and body copy are hand-typed
in the HTML — search for `$125` if you change them.

## The catalogue

Eight pieces in `assets/js/data.js`. Each entry drives the shop grid, the home grid,
the PDP and the bag:

```js
{ id:'sfp-red', name:'Product Of My Environment Hoodie', cat:'hoodies', price:40,
  colour:'Red', colours:['#96222f'], flag:'',
  a:'red-1', b:'red-2', detail:'red-3',
  print:'product of my environment',
  note:'…' }
```

`a` is the card image and `b` its hover — the on-model front and back, so every grid on
the site (home, shop, related) is the worn set and hovering a card turns the piece around.
`model`, `render` and `photo` hold the three sources, and `detail` is the wide print crop.
All are filenames in `assets/img`; `cat` must match a chip's `data-cat` in `shop.html`.

The product page gallery reads: **model front · model three-quarter · model back · flat
render front · flat render back** — four half-width shots and one wide one, so the grid
always closes evenly. Every shot in it sits on white.

| Piece | Colourways | Print |
|---|---|---|
| Today For Me Hoodie | Heather Grey, Sky Blue, Bone | today for me tomorrow for you |
| Signature Script Hoodie | Forest Green | script + monogram only |
| Product Of My Environment Hoodie | Black, Red | product of my environment |
| No Evil Tracksuit | Espresso, Lilac | no evil |

## Where the assets came from

**On-model renders** (`m-*.jpg`) — the second batch of eight, three views each. Split into
figures, framed 4:5 with the model at a consistent height, and the space either side filled
by extending the render's own background so there is no visible join. These carry the home
page, the shop grid and every card on the site.

**Flat renders** (`r-*.jpg`) — the first batch of eight, each a front and a back (or a hood
and a pant), split at the true gap between the two garments. Sky blue and forest green only
had one garment in frame, so their second view is a zoom on the print. Now one shot inside
the product gallery.

**Photography** — your twelve flat-lays, cut to 4:5 plus a 16:10 crop of the print area.
These were shot on carpet and a wood floor, so they are **not currently used on the site** —
the product page shows the renders, which are already on white. They are still in
`assets/img` and still mapped in `data.js` as `photo` and `detail`, so putting them back is
a one-line change in the gallery in `main.js`. Where each came from:

| File | Source |
|---|---|
| `grey-1/2/3` | unnamed-2 (front), unnamed-4 (back) |
| `blue-1/2/3` | unnamed-3 |
| `bone-1/2/3` | unnamed-8 (front), unnamed-6 (back) |
| `green-1/2/3` | unnamed-5 |
| `black-1/2/3` | unnamed-9 (front), unnamed-7 (back) |
| `red-1/2/3` | unnamed-11 (front), unnamed-10 (back) |
| `espresso-1/2/3` | unnamed-12 — hood, pant, and the pair |
| `lilac-1/2/3` | unnamed-13 — hood, pant, and the pair |

Film stills also appear in the home rail (`still-*.jpg`).

**Lookbook photography** (`look-*.jpg`) — on-location shots, night and dusk across
Toronto. These carry Looks 01–05 on `lookbook.html`: two pairs of one tall figure (3:4)
and one square, then a single tall figure to close. Cropped from the sources so the
subject sits centred in the tall frames, and so the square ones close on the head and
the print:

| Look | File | Where |
|---|---|---|
| 01 | `look-black.jpg` | waterfront, CN Tower behind |
| 02 | `look-espresso.jpg` | overpass at night |
| 03 | `look-green.jpg` | painted wall |
| 04 | `look-blue.jpg` | the back print, promenade |
| 05 | `look-red.jpg` | skyline at dusk |

Three more were cropped and then pulled — heather grey in the Distillery District, bone
under the hotel neon, and lilac from the back. The sources are still in the image folder
beside the project if they are ever wanted back.

The full-bleed band between Looks 02 and 03 is `look-wide.jpg` — the tricolour tracksuit
against the skyline at dusk, the one landscape frame in the set. The band is `3/2` rather
than `16/9` so the shot runs uncropped, and it shows in colour: the grayscale on that
figure was there because it used to hold a film still. It reads as an interlude rather
than a numbered look. `still-store.jpg` is no longer used anywhere.

**Film** — `SFP Video.mp4` (2:27, 2560×1080) cut into four web clips, 8.7 MB in total:

| Clip | From | Used on |
|---|---|---|
| `hero.mp4` (18s) | 0:00, 0:13, 1:36, 2:16 | home hero — logo over the skyline, the sunrise drive, walking, the outro |
| `campaign.mp4` (8.5s) | 1:32 | home film band, lookbook closer |
| `lookbook.mp4` (8s) | 0:20 | lookbook hero |
| `fit.mp4` (6s) | 1:48 | the details section (cropped vertical) |

Film stills (`still-*.jpg`) fill the editorial slots. Posters sit beside every clip so
the page still reads if autoplay is refused.

Two of these are no longer film frames: `still-crew.jpg` (the home lookbook rail) and
`poster-fit.jpg` (the poster on the details clip) are both crops of a
separate photograph of the same tracksuit at the market — same subject, same location,
much cleaner than the frame grabs they replaced. The ones they replaced are in
`_replaced-stills/`.

## Two notes on the design

- The renders sit on near-white while the page is a warm off-white, so the cards read as
  bright tiles. If you would rather they float on the page, the backgrounds can be tinted
  to `#f4f2ed` — say the word.
- **Product photography shows in colour; the film stays black and white.** The site's
  monochrome treatment would have flattened six colourways into one grey, so the
  grayscale filter now applies only to the film and its stills. To put it back, add
  `grayscale(1)` to the `filter` on `.card__media img`, `.ed__media img`,
  `.hslide__media img` and `.pdp__gallery img` in `style.css`.
- The bag drops any line whose product id has left the catalogue, and re-reads price and
  imagery from `data.js` on load — an old bag can never show a stale price.

## Still needed

- **A front shot of the sky blue hoodie** and **a back shot of the forest green** — still
  missing from all three sets. Sky blue is shown from the back everywhere; forest green
  from the front. Everything else has front, back and three-quarter.
- **Flat-lays on a white sweep.** The current ones were shot on carpet and a wood floor,
  which is why the site runs on the renders instead. Reshoot them on white and they can
  go straight back into the product gallery.
- Size chart. The PDP says "message us for measurements" in the meantime.
- Real shipping and returns terms — the current copy is deliberately vague.
- The bag is front-end only; `Checkout` is a dead link. Wire it to your commerce backend.
- The list sign-up fakes its success state — no endpoint attached.
- The menu and bag drawer don't trap focus; worth adding before launch.
