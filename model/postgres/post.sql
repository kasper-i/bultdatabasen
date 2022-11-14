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
  populate_path(ID varchar)
RETURNS
  void
AS $$
DECLARE

BEGIN
  RAISE NOTICE 'A simple text';
END $$ LANGUAGE plpgsql;
