export type ProductCategory =
  | 'perfume'
  | 'home_diffuser'
  | 'tissue_oil'
  | 'body_mist'
  | 'car_diffuser'
  | 'lotion'

export type ProductGender = 'female' | 'male' | 'unisex'

export const GENDER_LABELS: Record<ProductGender, string> = {
  female: 'Female',
  male: 'Male',
  unisex: 'Unisex',
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  perfume: 'Perfume',
  home_diffuser: 'Home Diffuser',
  tissue_oil: 'Tissue Oil',
  body_mist: 'Body Mist',
  car_diffuser: 'Car Diffuser',
  lotion: 'Lotion',
}

export const CATEGORY_SECTION_TITLES: Record<ProductCategory, string> = {
  perfume: 'Perfumes',
  home_diffuser: 'Home Diffusers',
  tissue_oil: 'Tissue Oils',
  body_mist: 'Body Mist',
  car_diffuser: 'Car Diffusers',
  lotion: 'Lotions',
}

export const ALLOWED_SIZES_BY_CATEGORY: Record<ProductCategory, number[]> = {
  perfume: [35, 50, 100],
  home_diffuser: [150, 200],
  tissue_oil: [125],
  body_mist: [100],
  car_diffuser: [8, 10],
  lotion: [100, 250],
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'perfume',
  'home_diffuser',
  'tissue_oil',
  'body_mist',
  'car_diffuser',
  'lotion',
]

// ─── Storefront menu bar sections ──────────────────────────────────────────
// Perfumes split into Female / Male / Unisex; every other category maps
// straight through. Each section gets its own anchor id for the menu bar's
// scroll-to-section navigation.
export interface MenuSection {
  id: string
  label: string
  matches: (product: { category?: ProductCategory; gender?: ProductGender | null }) => boolean
}

export const MENU_SECTIONS: MenuSection[] = [
  {
    id: 'section-female-fragrances',
    label: 'Female Fragrances',
    matches: (p) => p.category === 'perfume' && p.gender === 'female',
  },
  {
    id: 'section-male-fragrances',
    label: 'Male Fragrances',
    matches: (p) => p.category === 'perfume' && p.gender === 'male',
  },
  {
    id: 'section-unisex-fragrances',
    label: 'Unisex Fragrances',
    matches: (p) => p.category === 'perfume' && (p.gender === 'unisex' || !p.gender),
  },
  {
    id: 'section-body-mist',
    label: 'Body Mists',
    matches: (p) => p.category === 'body_mist',
  },
  {
    id: 'section-lotion',
    label: 'Lotions',
    matches: (p) => p.category === 'lotion',
  },
  {
    id: 'section-tissue-oil',
    label: 'Tissue Oils',
    matches: (p) => p.category === 'tissue_oil',
  },
  {
    id: 'section-car-diffuser',
    label: 'Car Diffusers',
    matches: (p) => p.category === 'car_diffuser',
  },
  {
    id: 'section-home-diffuser',
    label: 'Home Diffusers',
    matches: (p) => p.category === 'home_diffuser',
  },
]
