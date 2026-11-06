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
  'box-paketi',
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
      sr: 'Ručno rađena novogodišnja dekoracija od dehidriranog voća. Napravljena od prirodnih materijala, bez plastike — originalan detalj koji vašem domu daje toplinu i miris praznika.',
      en: 'Handmade New Year decorations from dehydrated fruit. Made from natural materials, plastic-free — an original touch that fills your home with the warmth and scent of the holidays.',
    },
    schemaCategory: 'Home & Garden > Decor > Seasonal & Holiday Decorations > Christmas Tree Ornaments',
  },
  {
    slug: 'box-paketi',
    label: { sr: 'Box paketi', en: 'Box sets' },
    heading: { sr: 'Box paketi', en: 'Box sets' },
    description: {
      sr: 'Dehidrirano voće i pažljivo odabrani dodaci, spakovani u jednu kraft kutiju — za koktele kod kuće, malo drugačiju užinu ili kao gotov poklon koji oduševljava na prvi pogled.',
      en: 'Dehydrated fruit and carefully chosen extras, packed in one kraft box — for cocktails at home, a slightly different snack, or as a ready-to-give gift that delights at first sight.',
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
