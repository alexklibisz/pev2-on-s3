-- Products with above-average review ratings
SELECT
  p.id,
  p.name,
  p.price,
  AVG(r.rating) AS avg_rating,
  COUNT(r.id) AS review_count
FROM products p
JOIN reviews r ON r.product_id = p.id
GROUP BY p.id, p.name, p.price
HAVING AVG(r.rating) > (
  SELECT AVG(rating) FROM reviews
)
ORDER BY avg_rating DESC, review_count DESC
LIMIT 20;
