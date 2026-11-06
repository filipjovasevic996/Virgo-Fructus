/**
 * Jedini izvor istine za kategorije proizvoda.
 *
 * `slug` je vrednost koja se čuva u `products.category` i ujedno deo URL-a
 * stranice kategorije (`/prodavnica/<slug>` i `/en/prodavnica/<slug>`).
 * Isti slug se koristi u oba jezika, kao i kod proizvoda (`/en/proizvodi/<sr-slug>`).
 */

export const PRODUCT_CATEGORY_SLUGS = [
  'dehidrirano-voce',
  'novogodisnja-kolekcija',
  'poklon-setovi',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORY_SLUGS)[number]

type LocalizedText = { sr: string; en: string }

export interface ProductCategoryDef {
  slug: ProductCategory
  /** Kratak naziv za dugmiće filtera i admin. */
  label: LocalizedText
  /** H1 i <title> stranice kategorije. */
  heading: LocalizedText
  /** Meta description i uvodni tekst stranice kategorije. */
  description: LocalizedText
  /** schema.org Product.category (Google product taxonomy, engleski). */
  schemaCategory: string
}

export const PRODUCT_CATEGORIES: readonly ProductCategoryDef[] = [
  {
    slug: 'dehidrirano-voce',
    label: { sr: 'Dehidrirano voće', en: 'Dehydrated fruit' },
    heading: { sr: 'Dehidrirano voće', en: 'Dehydrated fruit' },
    description: {
      sr: 'Premium dehidrirano voće iz Beograda — citrusi, egzotično i domaće voće. 100% prirodno, bez dodatog šećera, aditiva i konzervansa. Idealno za koktele, čaj, deserte i zdravu užinu.',
      en: 'Premium dehydrated fruit from Belgrade — citrus, exotic and locally grown fruit. 100% natural, no added sugar, additives or preservatives. Perfect for cocktails, tea, desserts and healthy snacking.',
    },
    schemaCategory: 'Food, Beverages & Tobacco > Food Items > Fruits & Vegetables > Dried Fruits',
  },
  {
    slug: 'novogodisnja-kolekcija',
    label: { sr: 'Novogodišnja kolekcija', en: 'New Year collection' },
    heading: { sr: 'Novogodišnja kolekcija', en: 'New Year collection' },
    description: {
      sr: 'Ručno rađeni novogodišnji ukrasi od dehidrirane pomorandže i limuna — prirodna dekoracija za jelku i praznični sto, i lep poklon za praznike.',
      en: "Handmade New Year's ornaments from dehydrated orange and lemon — natural decoration for the tree and the holiday table, and a lovely holiday gift.",
    },
    schemaCategory: 'Home & Garden > Decor > Seasonal & Holiday Decorations > Christmas Tree Ornaments',
  },
  {
    slug: 'poklon-setovi',
    label: { sr: 'Poklon setovi', en: 'Gift sets' },
    heading: { sr: 'Poklon setovi', en: 'Gift sets' },
    description: {
      sr: 'Poklon setovi i boxevi sa dehidriranim voćem — gift box za koktele, snack box za zdravu užinu i premium box sa barmenskom opremom. Spremni za poklon.',
      en: 'Gift sets and boxes with dehydrated fruit — a cocktail gift box, a healthy snack box and a premium box with bar tools. Ready to give.',
    },
    schemaCategory: 'Food, Beverages & Tobacco > Food Items > Food Gift Baskets',
  },
]

export function isProductCategory(value: unknown): value is ProductCategory {
  return (
    typeof value === 'string' &&
    (PRODUCT_CATEGORY_SLUGS as readonly string[]).includes(value)
  )
}

export function getProductCategory(slug: string | null | undefined) {
  return PRODUCT_CATEGORIES.find((c) => c.slug === slug)
}

export function categoryLabel(slug: string | null | undefined, locale: 'sr' | 'en') {
  return getProductCategory(slug)?.label[locale] ?? ''
}

export function categoryPath(slug: ProductCategory) {
  return `/prodavnica/${slug}`
}
