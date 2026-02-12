-- Orders filtered by date range and total
SELECT id, customer_id, status, total, created_at
FROM orders
WHERE created_at >= now() - interval '30 days'
  AND total > 500
ORDER BY total DESC;
