/**
 * Initial catalogue used once, when the database is created empty.
 * The 32 demo products share one foldable duffel design, shown in different
 * colours, detail views and lifestyle shots. Titles and descriptions are
 * descriptive so every product page has unique, indexable content.
 */
const IMAGE_BASE =
  'https://raw.githubusercontent.com/knclj/picserver/vijery/bag_produts';

export interface SeedProduct {
  title: string;
  category: string;
  description: string;
  priceCents: number | null;
  image: string;
}

type ViewKey =
  | 'studio'
  | 'side'
  | 'interior'
  | 'empty'
  | 'pocket'
  | 'phone'
  | 'laptop'
  | 'zip'
  | 'label'
  | 'strap'
  | 'handle'
  | 'carried'
  | 'shoulder';

const VIEW_COPY: Record<ViewKey, string> = {
  studio: 'The clean, unstructured shape fits under a seat or in an overhead bin.',
  side: 'This side view shows the low-profile silhouette and the reinforced base panel.',
  interior:
    'The open interior has a wide main compartment and slip pockets for clothes, a tablet and a water bottle.',
  empty:
    'The empty interior shows how the bag collapses flat for storage between trips.',
  pocket:
    'An interior zip pocket keeps passports, cables and small essentials separate from the main load.',
  phone:
    'A slip pocket keeps a phone within reach without digging through the bag.',
  laptop:
    'A padded sleeve separates a laptop or tablet from clothing and accessories.',
  zip: 'The main zip runs along the top for wide access, with a reinforced pull for easy packing.',
  label: 'A woven AERO-FOLD label finishes the front panel.',
  strap:
    'The detachable shoulder strap attaches with metal hardware and adjusts for crossbody carry.',
  handle:
    'Twin carry handles are shaped to sit comfortably in the hand when the bag is full.',
  carried:
    'Shown carried on a weekend trip, it works as a personal item, gym bag or everyday carry.',
  shoulder:
    'Shown on the shoulder, the adjustable strap leaves both hands free for travel.',
};

interface Variant {
  title: string;
  color: string;
  view: ViewKey;
  image: number;
}

const VARIANTS: Variant[] = [
  { title: 'AERO-FOLD Foldable Travel Duffel — Black', color: 'black', view: 'studio', image: 1 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Black Side Profile', color: 'black', view: 'side', image: 2 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Sky Blue', color: 'sky blue', view: 'studio', image: 3 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Slate Blue', color: 'slate blue', view: 'studio', image: 4 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Lilac', color: 'lilac', view: 'studio', image: 5 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Lilac Side Profile', color: 'lilac', view: 'side', image: 6 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Mint', color: 'mint', view: 'studio', image: 7 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Mint Side Profile', color: 'mint', view: 'side', image: 8 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Mauve', color: 'mauve', view: 'studio', image: 9 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Dusty Rose', color: 'dusty rose', view: 'studio', image: 10 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Pink', color: 'pink', view: 'studio', image: 11 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Pink Side Profile', color: 'pink', view: 'side', image: 12 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Plum', color: 'plum', view: 'studio', image: 13 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Plum Side Profile', color: 'plum', view: 'side', image: 14 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Lavender Open Interior', color: 'lavender', view: 'interior', image: 15 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Lavender Empty Interior', color: 'lavender', view: 'empty', image: 16 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Lavender Interior Pocket', color: 'lavender', view: 'pocket', image: 17 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Lavender Phone Pocket', color: 'lavender', view: 'phone', image: 18 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Lavender Laptop Sleeve', color: 'lavender', view: 'laptop', image: 19 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Lavender Zip Detail', color: 'lavender', view: 'zip', image: 20 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Lavender Woven Label', color: 'lavender', view: 'label', image: 21 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Lavender Strap Detail', color: 'lavender', view: 'strap', image: 22 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Lavender Carry Handle', color: 'lavender', view: 'handle', image: 23 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Pink, Carried', color: 'pink', view: 'carried', image: 24 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Blue, Carried', color: 'blue', view: 'carried', image: 25 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Blue, Shoulder Carry', color: 'blue', view: 'shoulder', image: 26 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Black, Carried', color: 'black', view: 'carried', image: 27 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Black, Shoulder Carry', color: 'black', view: 'shoulder', image: 28 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Mint, Carried', color: 'mint', view: 'carried', image: 29 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Plum, Carried', color: 'plum', view: 'carried', image: 30 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Lavender, Carried', color: 'lavender', view: 'carried', image: 31 },
  { title: 'AERO-FOLD Foldable Travel Duffel — Pink, Shoulder Carry', color: 'pink', view: 'shoulder', image: 32 },
];

export function seedProducts(): SeedProduct[] {
  return VARIANTS.map((variant, index) => {
    const colour = variant.color.charAt(0).toUpperCase() + variant.color.slice(1);
    const description =
      `The AERO-FOLD packable duffel in ${colour.toLowerCase()} is a soft-sided travel bag that folds flat when empty and opens into a roomy carry-on for weekend trips, gym sessions and everyday errands. ` +
      `${VIEW_COPY[variant.view]} ` +
      'Custom colours, logo printing and wholesale orders are available.';

    return {
      title: variant.title,
      category: index % 2 === 0 ? 'Traveler' : 'Executive',
      description,
      priceCents: null,
      image: `${IMAGE_BASE}/800${variant.image}.jpg`,
    };
  });
}
