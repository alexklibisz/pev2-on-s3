-- E-commerce schema for generating example query plans

CREATE TABLE categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  parent_id int REFERENCES categories(id)
);

CREATE TABLE products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  category_id int NOT NULL REFERENCES categories(id),
  price numeric(10,2) NOT NULL,
  stock int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_category_id ON products(category_id);

CREATE TABLE customers (
  id serial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  city text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_customers_email ON customers(email);

CREATE TABLE orders (
  id serial PRIMARY KEY,
  customer_id int NOT NULL REFERENCES customers(id),
  status text NOT NULL DEFAULT 'pending',
  total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
  id serial PRIMARY KEY,
  order_id int NOT NULL REFERENCES orders(id),
  product_id int NOT NULL REFERENCES products(id),
  quantity int NOT NULL,
  unit_price numeric(10,2) NOT NULL
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE TABLE reviews (
  id serial PRIMARY KEY,
  product_id int NOT NULL REFERENCES products(id),
  customer_id int NOT NULL REFERENCES customers(id),
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);

-- Seed data

INSERT INTO categories (name, parent_id) VALUES
  ('Electronics', NULL),
  ('Clothing', NULL),
  ('Books', NULL),
  ('Home & Garden', NULL),
  ('Sports', NULL);

INSERT INTO categories (name, parent_id)
SELECT
  'Subcategory ' || g || ' of ' || c.name,
  c.id
FROM categories c, generate_series(1, 5) g
WHERE c.parent_id IS NULL;

-- ~500 products
INSERT INTO products (name, category_id, price, stock, created_at)
SELECT
  'Product ' || g,
  (g % 30) + 1,
  round((random() * 500 + 1)::numeric, 2),
  (random() * 1000)::int,
  now() - (random() * interval '730 days')
FROM generate_series(1, 500) g;

-- ~10k customers
INSERT INTO customers (name, email, city, created_at)
SELECT
  'Customer ' || g,
  'customer' || g || '@example.com',
  (ARRAY['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','Austin'])[1 + (g % 10)],
  now() - (random() * interval '1095 days')
FROM generate_series(1, 10000) g;

-- ~50k orders
INSERT INTO orders (customer_id, status, total, created_at)
SELECT
  1 + (g % 10000),
  (ARRAY['pending','confirmed','shipped','delivered','cancelled'])[1 + (g % 5)],
  round((random() * 1000 + 10)::numeric, 2),
  now() - (random() * interval '730 days')
FROM generate_series(1, 50000) g;

-- ~150k order_items
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT
  1 + (g % 50000),
  1 + (g % 500),
  1 + (g % 5),
  round((random() * 200 + 5)::numeric, 2)
FROM generate_series(1, 150000) g;

-- ~20k reviews
INSERT INTO reviews (product_id, customer_id, rating, body, created_at)
SELECT
  1 + (g % 500),
  1 + (g % 10000),
  1 + (g % 5),
  'Review text for product ' || (1 + (g % 500)) || ' by customer ' || (1 + (g % 10000)),
  now() - (random() * interval '365 days')
FROM generate_series(1, 20000) g;

-- Analyze tables for accurate planner statistics
ANALYZE;
