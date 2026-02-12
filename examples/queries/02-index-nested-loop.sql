-- Customer order history with product details
SELECT
  c.name AS customer_name,
  o.id AS order_id,
  o.created_at AS order_date,
  p.name AS product_name,
  oi.quantity,
  oi.unit_price
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE c.id = 42
ORDER BY o.created_at DESC;
