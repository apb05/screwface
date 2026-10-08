/* ============================================================
   SCREW FACE PRODUCT — catalogue
   Photography and film: Screw Face Product (Toronto, Winter 26).
   Images live in assets/img, clips cut from the brand film in assets/video.

   Per piece:
     a, b   the card and its hover — on-model front and back (m-*.jpg)
     model  three on-model views: front, three-quarter, back
     render flat studio renders on white (r-*.jpg)
     photo  the original flat-lay photography — shot on carpet and a wood
            floor, so it is kept out of the site while every other shot is
            on white. Still here if you want it back.
     detail wide crop of the print, from the same flat-lay set — also unused

   The product page gallery runs model ×3 → render ×2, the last one wide.
   ============================================================ */

const IMG = (name) => `assets/img/${name}.jpg`;

/* Hoodie pricing is tiered — the more you take, the less each one costs.
   1: $40 · 2: $70 · 3: $100 · 4: $125 (CAD). Beyond four, the tiers stack. */
const HOODIE_TIERS = [0, 40, 70, 100, 125];

const PRODUCTS = [
  { id:'sfp-grey', name:'Today For Me Hoodie', cat:'hoodies', price:40,
    colour:'Heather Grey', colours:['#cbc8c8'], flag:'New',
    a:'m-grey-1', b:'m-grey-3',
    model:['m-grey-1','m-grey-2','m-grey-3'],
    render:['r-grey-1','r-grey-2'], photo:['grey-1','grey-2'], detail:'grey-3',
    print:'today for me tomorrow for you',
    note:'Signature script across the chest, "today for me tomorrow for you" written across the back.' },

  { id:'sfp-blue', name:'Today For Me Hoodie', cat:'hoodies', price:40,
    colour:'Sky Blue', colours:['#93a8b8'], flag:'New',
    a:'m-blue-front', b:'m-blue-back',
    model:['m-blue-1','m-blue-2','m-blue-3'],
    render:['r-blue-1','r-blue-2'], photo:['blue-1','blue-2'], detail:'blue-3',
    print:'today for me tomorrow for you',
    note:'"today for me tomorrow for you" across the back, signature script on the chest.' },

  { id:'sfp-bone', name:'Today For Me Hoodie', cat:'hoodies', price:40,
    colour:'Bone', colours:['#ddd6c9'], flag:'',
    a:'m-bone-1', b:'m-bone-3',
    model:['m-bone-1','m-bone-2','m-bone-3'],
    render:['r-bone-1','r-bone-2'], photo:['bone-1','bone-2'], detail:'bone-3',
    print:'today for me tomorrow for you',
    note:'Signature script across the chest, "today for me tomorrow for you" written across the back.' },

  { id:'sfp-green', name:'Signature Script Hoodie', cat:'hoodies', price:40,
    colour:'Forest Green', colours:['#2f4f4a'], flag:'',
    a:'m-green-1', b:'m-green-3',
    model:['m-green-1','m-green-2','m-green-3'],
    render:['r-green-1','r-green-2'], photo:['green-1','green-2'], detail:'green-3',
    print:'screw face product',
    note:'Signature script and monogram across the chest. Kangaroo pocket, ribbed cuffs and hem.' },

  { id:'sfp-black', name:'Product Of My Environment Hoodie', cat:'hoodies', price:40,
    colour:'Black', colours:['#26262a'], flag:'',
    a:'m-black-1', b:'m-black-3',
    model:['m-black-1','m-black-2','m-black-3'],
    render:['r-black-1','r-black-2'], photo:['black-1','black-2'], detail:'black-3',
    print:'product of my environment',
    note:'Signature script on the chest, "product of my environment" written across the back.' },

  { id:'sfp-red', name:'Product Of My Environment Hoodie', cat:'hoodies', price:40,
    colour:'Red', colours:['#96222f'], flag:'',
    a:'m-red-1', b:'m-red-3',
    model:['m-red-1','m-red-2','m-red-3'],
    render:['r-red-1','r-red-2'], photo:['red-1','red-2'], detail:'red-3',
    print:'product of my environment',
    note:'Signature script on the chest, "product of my environment" written across the back.' },

  { id:'sfp-espresso', name:'No Evil Tracksuit', cat:'tracksuits', price:70,
    colour:'Espresso', colours:['#6b625f'], flag:'Set',
    a:'m-espresso-1', b:'m-espresso-3',
    model:['m-espresso-1','m-espresso-2','m-espresso-3'],
    render:['r-espresso-1','r-espresso-2'], photo:['espresso-1','espresso-2'], detail:'espresso-3',
    print:'no evil',
    note:'Hood and pant in a matching colourway. No Evil graphic on the chest, monogram on the sleeve and thigh.' },

  { id:'sfp-lilac', name:'No Evil Tracksuit', cat:'tracksuits', price:70,
    colour:'Lilac', colours:['#b3b7d8'], flag:'Set',
    a:'m-lilac-1', b:'m-lilac-3',
    model:['m-lilac-1','m-lilac-2','m-lilac-3'],
    render:['r-lilac-1','r-lilac-2'], photo:['lilac-1','lilac-2'], detail:'lilac-3',
    print:'no evil',
    note:'Hood and pant in a matching colourway. No Evil graphic on the chest, monogram on the sleeve and thigh.' }
];

const SIZES = ['S','M','L','XL'];
