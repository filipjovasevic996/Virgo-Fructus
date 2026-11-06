import {
  CategoryPage,
  buildCategoryMetadata,
  categoryStaticParams,
  type CategoryPageProps,
} from '@/lib/shop-category-page'

export const revalidate = false
export const dynamicParams = false

export function generateStaticParams() {
  return categoryStaticParams()
}

export function generateMetadata(props: CategoryPageProps) {
  return buildCategoryMetadata('en', props)
}

export default function ShopCategoryPageEn(props: CategoryPageProps) {
  return <CategoryPage locale="en" {...props} />
}
