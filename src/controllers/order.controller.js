// src/controllers/orderController.js (Optimized)
const getOrderHistory = async (req, res) => {
  const userId = req.user.id;
  const limit = 20;
  const offset = req.query.offset || 0;

  const optimizedQuery = `
    SELECT
      o.id, 
      o.total, 
      o.status, 
      o.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'itemId', oi.item_id,
            'quantity', oi.quantity,
            'unitPrice', oi.unit_price,
            'name', mi.name
          )
        ) FILTER (WHERE oi.id IS NOT NULL), '[]'
      ) AS items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN menu_items mi ON mi.id = oi.item_id
    WHERE o.user_id = $1
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await db.query(optimizedQuery, [userId, limit, offset]);
  res.json(result.rows);
};