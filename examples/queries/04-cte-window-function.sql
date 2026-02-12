-- Customer spending ranks with percentiles
WITH customer_totals AS (
  SELECT
    c.id,
    c.name,
    c.city,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.total), 0) AS total_spent
  FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id, c.name, c.city
)
SELECT
  name,
  city,
  order_count,
  total_spent,
  RANK() OVER (ORDER BY total_spent DESC) AS spending_rank,
  NTILE(100) OVER (ORDER BY total_spent DESC) AS percentile
FROM customer_totals
ORDER BY total_spent DESC
LIMIT 20;
