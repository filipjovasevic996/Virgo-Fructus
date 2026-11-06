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
  return buildCategoryMetadata('sr', props)
}

export default function ShopCategoryPage(props: CategoryPageProps) {
  return <CategoryPage locale="sr" {...props} />
}
