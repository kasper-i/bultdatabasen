ALTER SCHEMA old RENAME TO bultdatabasen;

ALTER TABLE resource ALTER COLUMN counters SET DEFAULT json_build_object();

create extension ltree;

CREATE TABLE bultdatabasen.tree (
    resource_id character varying(36) NOT NULL,
    path ltree NOT NULL
);

CREATE INDEX path_gist_idx ON tree USING GIST (path);
CREATE INDEX path_idx ON tree USING BTREE (path);

CREATE OR REPLACE FUNCTION
  populate_path(RESOURCE_ID varchar)
RETURNS
  ltree
AS $$
DECLARE
    f RECORD;
    path varchar;

BEGIN
    FOR f IN SELECT id, parent_id FROM resource WHERE id = RESOURCE_ID
        UNION
            SELECT foster_care.id, foster_parent_id AS parent_id
            FROM foster_care
            WHERE foster_care.id = RESOURCE_ID
    LOOP
        SELECT string_agg(id, '.') INTO path FROM (
            SELECT * FROM (
                WITH RECURSIVE cte (id, parent_id, c, dummy) AS (
            		SELECT id, parent_id, 1, TRUE
            		FROM resource
            		WHERE id = f.parent_id
            	UNION DISTINCT
            		SELECT parent.id, parent.parent_id, cte.c + 1, TRUE
            		FROM resource parent
            		INNER JOIN cte ON parent.id=cte.parent_id
            	)
            	SELECT REPLACE(id, '-', '_') AS id FROM cte
                ORDER BY c DESC
            ) i
            UNION ALL SELECT REPLACE(f.parent_id, '-', '_')
            UNION ALL SELECT REPLACE(f.id, '-', '_')
        ) o;
    END LOOP;

    RETURN path::ltree;
END $$ LANGUAGE plpgsql;

INSERT INTO tree SELECT id, populate_path(id) AS path FROM resource WHERE type <> 'root' AND depth < 600 AND parent_id IS NOT NULL;


