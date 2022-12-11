# Steps

## Pre

```sql
ALTER TABLE resource CHANGE COLUMN counters `counters` json NOT NULL;
```

# Migrate

Run `pgloader mysql://bultdatabasen:bultdatabasen@127.0.0.1/old postgresql://bultdatabasen:bultdatabasen@localhost/bultdatabasen`.

# Post

Execute post.sql.
