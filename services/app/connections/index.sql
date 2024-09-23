--==================================================================================================
--Sử Dụng pg_stat_user_indexes và pg_index
--Để có thông tin chi tiết hơn về chỉ mục, bao gồm cả các thống kê về việc sử dụng, bạn có thể kết hợp các bảng hệ thống pg_stat_user_indexes và pg_index.

SELECT 
    indexrelid::regclass AS index_name,
    idx_scan AS number_of_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM 
    pg_stat_user_indexes
WHERE 
    relname = 'keyframes';

--==================================================================================================

EXPLAIN ANALYZE
SELECT *, (embedding <-> :query_vector) AS distance
FROM keyframes
WHERE "userId" = :user_id
ORDER BY distance
LIMIT :limit;



--==================================================================================================
DROP INDEX IF EXISTS idx_user_id_embedding;


--==================================================================================================

SELECT
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename = 'keyframes';




--==================================================================================================
SELECT *
FROM pg_indexes
WHERE tablename = 'keyframes'
--==================================================================================================

CREATE INDEX ivfflat_idx ON keyframes USING ivfflat (embedding vector_cosine_ops) WITH (lists=10);







--==================================================================================================









--==================================================================================================









--==================================================================================================









--==================================================================================================









--==================================================================================================

