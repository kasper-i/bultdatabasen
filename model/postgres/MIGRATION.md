# Steps

## Pre

1. ALTER TABLE resource CHANGE COLUMN counters `counters` json NOT NULL;

# Migrate

2. pgloader mysql://bultdatabasen:bultdatabasen@127.0.0.1/old postgresql://bultdatabasen:bultdatabasen@localhost/bultdatabasen

# Post

3. ALTER SCHEMA old RENAME TO bultdatabasen;
4. ALTER TABLE resource ALTER COLUMN counters SET DEFAULT json_build_object();
