/* ============================================================
   SCREW FACE — navigation config
   assets/js/nav.config.js

   Single source of truth for the primary nav, the mobile drawer
   and the footer link columns. Nothing in the header markup
   hardcodes a link — edit this file, not the HTML.

   ------------------------------------------------------------
   COLLECTION NAMING RULE — do not break this
   ------------------------------------------------------------
   Collections get proper names, never season or date labels.
   THE FIRST CUT. CHAPTER TWO. NO EVIL.
   Never FALL 2026, never WINTER 26, never DROP 3.
   A named collection reads as a chapter someone missed.
   A dated one reads as expired inventory.
   ------------------------------------------------------------

   Item shape:
     label     text as written; rendered uppercase by CSS
     href      relative URL. Use "index.html#x" for on-page
               anchors — the renderer shortens it to "#x" when
               you are already on index.
     cat       optional. Ties the item to a PRODUCTS category.
               If that category has zero SKUs the item is not
               rendered at all — an empty category link is worse
               than no link.
     children  optional array. Renders a dropdown instead of a
               plain link. A group whose children resolve to
               fewer than two items does NOT render its trigger.
   ============================================================ */

const NAV = {

  /* -- PRIMARY ------------------------------------------------
     Flat (Variant A) because the catalogue is 8 SKUs across two
     categories with no collections defined. See the note at the
     bottom of this file for the flip to the grouped structure.
     About lives in the footer, not up here.
  ------------------------------------------------------------ */
  primary: [
    { label: 'Shop All',    href: 'shop.html' },
    { label: 'Hoodies',     href: 'shop.html?cat=hoodies',     cat: 'hoodies' },
    { label: 'Tracksuits',  href: 'shop.html?cat=tracksuits',  cat: 'tracksuits' },
    { label: 'Accessories', href: 'shop.html?cat=accessories', cat: 'accessories' },
    { label: 'Lookbook',    href: 'lookbook.html' },
    { label: 'Story',       href: 'story.html' }
  ],

  /* -- DROP SLOT ----------------------------------------------
     The current drop, sat at the end of the primary row.
     null renders nothing at all — no empty element, no
     placeholder. Set it to an object to light the slot up:

       activeDrop: { label: 'The First Cut',
                     href: 'shop.html?drop=the-first-cut' },
  ------------------------------------------------------------ */
  activeDrop: null,

  /* -- FOOTER -------------------------------------------------
     Column headings match the footer markup already in place.
  ------------------------------------------------------------ */
  footer: {
    info: [
      { label: 'Our Story',          href: 'story.html' },
      { label: 'The SFP Mindset',    href: 'story.html#mindset' },
      { label: 'Contact',            href: 'index.html#join' },
      { label: 'Shipping & Returns', href: 'index.html#shipping-returns' },
      { label: 'Size Guide',         href: 'index.html#size-guide' },
      { label: 'SFP × Music',        href: 'index.html#music' },
      { label: 'The Film',           href: 'index.html#journal' },
      { label: 'Lookbook',           href: 'lookbook.html' }
    ],
    follow: [
      { label: 'Instagram',  href: 'https://instagram.com/' },
      { label: 'TikTok',     href: 'https://tiktok.com/' },
      { label: 'YouTube',    href: 'https://youtube.com/' },
      { label: 'Newsletter', href: 'index.html#join' }
    ]
  }
};

/* ============================================================
   FLIPPING TO THE GROUPED STRUCTURE (Variant B)

   Warranted once the catalogue passes ~15 SKUs AND there are
   two or more named collections. Until then a COLLECTIONS
   dropdown renders empty and a SHOP dropdown renders three
   items, both of which read worse than the flat row.

   It is a data change only — the renderer already handles
   children, hover intent, keyboard and touch:

     primary: [
       { label: 'Shop', href: 'shop.html', children: [
         { label: 'All',         href: 'shop.html' },
         { label: 'Hoodies',     href: 'shop.html?cat=hoodies',     cat: 'hoodies' },
         { label: 'Tracksuits',  href: 'shop.html?cat=tracksuits',  cat: 'tracksuits' },
         { label: 'Accessories', href: 'shop.html?cat=accessories', cat: 'accessories' }
       ]},
       { label: 'Collections', href: 'collections.html', children: [
         { label: 'The First Cut', href: 'collections.html?c=the-first-cut' },
         { label: 'Chapter Two',   href: 'collections.html?c=chapter-two' },
         { label: 'Archive',       href: 'collections.html?c=archive' }
       ]}
     ]

   Lookbook comes out of the row at that point and its
   photography moves to the top of each collection page —
   shoot imagery above, buyable product below. Keep
   lookbook.html serving and redirect it to collections.
   ============================================================ */
