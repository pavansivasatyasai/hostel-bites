-- Sample product catalog (groceries). Run after schema.sql.
-- Prices in paise (100 paise = ₹1).

insert into public.products (name, price, stock, category, image_url) values
  ('Amul Taaza Toned Milk 1L', 6600, 40, 'Dairy', 'https://placehold.co/300x300?text=Milk'),
  ('Amul Butter 100g', 5600, 30, 'Dairy', 'https://placehold.co/300x300?text=Butter'),
  ('Paneer 200g', 9000, 15, 'Dairy', 'https://placehold.co/300x300?text=Paneer'),
  ('Curd (Dahi) 400g', 4500, 25, 'Dairy', 'https://placehold.co/300x300?text=Curd'),
  ('Eggs 6 pcs', 4200, 50, 'Dairy', 'https://placehold.co/300x300?text=Eggs'),
  ('Brown Bread 400g', 4500, 20, 'Bakery', 'https://placehold.co/300x300?text=Bread'),
  ('Basmati Rice 1kg', 12000, 35, 'Staples', 'https://placehold.co/300x300?text=Rice'),
  ('Toor Dal 1kg', 14500, 25, 'Staples', 'https://placehold.co/300x300?text=Dal'),
  ('Wheat Atta 5kg', 26000, 20, 'Staples', 'https://placehold.co/300x300?text=Atta'),
  ('Sunflower Oil 1L', 13500, 30, 'Staples', 'https://placehold.co/300x300?text=Oil'),
  ('Sugar 1kg', 4800, 40, 'Staples', 'https://placehold.co/300x300?text=Sugar'),
  ('Salt 1kg', 2200, 60, 'Staples', 'https://placehold.co/300x300?text=Salt'),
  ('Tea (Chai) 250g', 11000, 25, 'Beverages', 'https://placehold.co/300x300?text=Tea'),
  ('Coffee 100g', 18000, 15, 'Beverages', 'https://placehold.co/300x300?text=Coffee'),
  ('Coca-Cola 750ml', 4000, 40, 'Beverages', 'https://placehold.co/300x300?text=Cola'),
  ('Biscuits (Parle-G) 80g', 1000, 80, 'Snacks', 'https://placehold.co/300x300?text=Biscuits'),
  ('Lays Chips 52g', 2000, 60, 'Snacks', 'https://placehold.co/300x300?text=Chips'),
  ('Maggi Noodles 70g', 1400, 70, 'Snacks', 'https://placehold.co/300x300?text=Maggi'),
  ('Onion 1kg', 4000, 50, 'Vegetables', 'https://placehold.co/300x300?text=Onion'),
  ('Tomato 1kg', 3500, 50, 'Vegetables', 'https://placehold.co/300x300?text=Tomato'),
  ('Potato 1kg', 3000, 50, 'Vegetables', 'https://placehold.co/300x300?text=Potato'),
  ('Banana (dozen)', 6000, 30, 'Fruits', 'https://placehold.co/300x300?text=Banana'),
  ('Apple 1kg', 18000, 20, 'Fruits', 'https://placehold.co/300x300?text=Apple'),
  ('Shampoo 180ml', 16000, 15, 'Personal Care', 'https://placehold.co/300x300?text=Shampoo'),
  ('Toothpaste 100g', 8500, 25, 'Personal Care', 'https://placehold.co/300x300?text=Toothpaste');
