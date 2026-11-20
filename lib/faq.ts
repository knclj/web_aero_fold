export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Home page FAQ. Kept in a shared module so the visible accordion and the
 * static FAQPage structured data can never drift apart.
 */
export const HOME_FAQ: FaqItem[] = [
  {
    question: 'What is a foldable travel bag?',
    answer:
      'A foldable travel bag is a lightweight duffel, tote or weekender that packs flat or folds into its own pocket when empty. It takes up little space in a suitcase or closet, then unfolds into a full-size bag when you need extra capacity.',
  },
  {
    question: 'Are AERO-FOLD bags cabin friendly?',
    answer:
      'Many of our foldable travel bags are designed to fit within common carry-on limits. Check the dimensions listed on each product page and confirm the current rules with your airline before you fly.',
  },
  {
    question: 'Can I order custom foldable bags with my logo?',
    answer:
      'Yes. We support custom colors, logo printing, woven labels and retail packaging for wholesale orders. Send your artwork, target quantity and delivery date and we will confirm the options and price.',
  },
  {
    question: 'What is the minimum order quantity?',
    answer:
      'MOQ depends on the style, fabric and level of customization. Contact us with the bag type, quantity and logo requirements you have in mind and we will confirm the MOQ, sample cost and lead time.',
  },
  {
    question: 'How do I care for a packable travel bag?',
    answer:
      'Wipe the fabric with a damp cloth and mild soap, then air-dry it completely before folding. Store the bag in its pouch in a dry place. Do not machine wash unless the care label specifically allows it.',
  },
  {
    question: 'Do you ship worldwide?',
    answer:
      'Yes. We quote shipping by air or sea depending on the destination, order size and delivery date. Share your address and quantity and we will include freight in your quote.',
  },
];
