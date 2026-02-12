-- Top 10 products by revenue
SELECT
  p.id,
  p.name,
  SUM(oi.quantity * oi.unit_price) AS total_revenue,
  SUM(oi.quantity) AS total_quantity,
  COUNT(DISTINCT oi.order_id) AS order_count
FROM products p
JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.name
ORDER BY total_revenue DESC
LIMIT 10;
