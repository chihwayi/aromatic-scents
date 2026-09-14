export type ProductCategory = 'perfume' | 'home_diffuser' | 'tissue_oil' | 'body_mist'

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  perfume: 'Perfume',
  home_diffuser: 'Home Diffuser',
  tissue_oil: 'Tissue Oil',
  body_mist: 'Body Mist',
}

export const CATEGORY_SECTION_TITLES: Record<ProductCategory, string> = {
  perfume: 'Perfumes',
  home_diffuser: 'Home Diffusers',
  tissue_oil: 'Tissue Oils',
  body_mist: 'Body Mist',
}

export const ALLOWED_SIZES_BY_CATEGORY: Record<ProductCategory, number[]> = {
  perfume: [35, 50, 100],
  home_diffuser: [50, 100],
  tissue_oil: [125],
  body_mist: [100],
}

export const PRODUCT_CATEGORIES: ProductCategory[] = ['perfume', 'home_diffuser', 'tissue_oil', 'body_mist']
