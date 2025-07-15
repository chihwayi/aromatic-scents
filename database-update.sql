-- Add is_new_arrival column to products table
ALTER TABLE products ADD COLUMN is_new_arrival BOOLEAN DEFAULT false;

-- Update some existing products to be marked as new arrivals for demonstration
UPDATE products SET is_new_arrival = true WHERE name IN ('Midnight Elegance', 'Ocean Breeze') LIMIT 2;