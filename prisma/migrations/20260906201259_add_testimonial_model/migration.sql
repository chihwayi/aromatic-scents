-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 5,
    "text" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Seed with the testimonials that were previously hardcoded in the frontend,
-- so the storefront looks unchanged immediately after this migration runs.
INSERT INTO "Testimonial" ("id", "name", "location", "stars", "text", "orderIndex", "isActive", "updatedAt") VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Nomsa K.', 'Johannesburg', 5, 'Midnight Elegance is everything. The longevity is incredible — I still get compliments hours after applying. Easily the most luxurious fragrance I''ve worn.', 0, true, CURRENT_TIMESTAMP),
  ('a1b2c3d4-0001-4000-8000-000000000002', 'Thabo M.', 'Cape Town', 5, 'Ordered the 100ml Golden Sunset as a gift and the presentation was immaculate. The scent is warm and sophisticated — my wife was absolutely blown away.', 1, true, CURRENT_TIMESTAMP),
  ('a1b2c3d4-0001-4000-8000-000000000003', 'Lesedi R.', 'Pretoria', 5, 'The reseller pricing is exceptional. I now stock three of their fragrances in my boutique and my clients keep coming back for more. Delivery is always prompt.', 2, true, CURRENT_TIMESTAMP);
