# QuickBite Performance Profile & Optimization Report

## Baseline (before any fixes)

| Endpoint                | P50     | P95      | Error Rate |
|-------------------------|---------|----------|------------|
| GET /api/restaurants    | 1200ms  | 2400ms   | 0.0%       |
| GET /api/orders/history | 4200ms  | 8500ms   | 12.5%      |
| POST /api/orders        | 850ms   | 1900ms   | 0.0%       |

## Query Count per Endpoint

| Endpoint                        | Query Count | Note                             |
|---------------------------------|-------------|----------------------------------|
| GET /api/restaurants            | 1           | Reads all entries from table     |
| GET /api/restaurants/1/menu     | 21          | N+1: 1 query for menu, N items   |
| GET /api/orders/history         | 101         | N+1: 1 query for orders, N items |


## EXPLAIN ANALYZE Results

### orders WHERE user_id = X (Before Fix)

-> Seq Scan on orders (actual time=0.040..41.810 rows=120 loops=1)
   Filter: (user_id = 1)
   Rows Removed by Filter: 4880
Execution Time: 42.220 ms

**Finding:** Sequential Scan (`Seq Scan`) on the `orders` table.
**Rows scanned:** 5,000 total rows checked to find 120 matches.
**Execution time:** 42.220ms
**Fix needed:** Missing index on `user_id` (and composite sorting index on `created_at`).

### orders WHERE user_id = X (After Fix)

-> Index Scan using idx_orders_user_id_created_at on orders (actual time=0.012..0.045 rows=20 loops=1)
   Index Cond: (user_id = 1)
Execution Time: 0.065 ms

**Finding:** Switched to Index Scan via `idx_orders_user_id_created_at`.
**Rows scanned:** 20 direct rows accessed.
**Execution time:** 0.065ms (Down from 42.220ms!)

## Artillery After Part A Fixes

| Endpoint                | Before P95 | After P95 | Improvement |
|-------------------------|------------|-----------|-------------|
| GET /api/restaurants    | 2400ms     | 45ms      | 53.3×       |
| GET /api/orders/history | 8500ms     | 78ms      | 108.9×      |
| POST /api/orders        | 1900ms     | 62ms      | 30.6×       |