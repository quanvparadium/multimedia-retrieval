docker exec -it be-express-postgres_db-1 pg_dump -U baonguyen -d datn -s -f /tmp/schema_dump.sql
docker cp be-express-postgres_db-1:/tmp/schema_dump.sql ./schema_dump.sql

docker cp ./schema_dump.sql be-express-postgres_db_1-1:/tmp/schema_dump.sql
docker exec be-express-postgres_db_1-1 //bin//bash -c "psql -U baonguyen -d datn -f /tmp/schema_dump.sql"

docker cp ./schema_dump.sql be-express-postgres_db_2-1:/tmp/schema_dump.sql
docker exec be-express-postgres_db_2-1 //bin//bash -c "psql -U baonguyen -d datn -f /tmp/schema_dump.sql"   