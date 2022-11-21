ALTER SCHEMA old RENAME TO bultdatabasen;

ALTER TABLE resource ALTER COLUMN counters SET DEFAULT json_build_object();

-- add tree table

create extension ltree;

CREATE TABLE bultdatabasen.tree (
    resource_id UUID NOT NULL,
    path ltree NOT NULL
);

GRANT ALL PRIVILEGES ON TABLE tree TO bultdatabasen;

CREATE INDEX path_gist_idx ON tree USING GIST (path);
CREATE INDEX path_idx ON tree USING BTREE (path);

-- migrate old tree structure

CREATE OR REPLACE FUNCTION
  populate_path(RESOURCE_ID varchar)
RETURNS
  void
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
            UNION ALL SELECT REPLACE(f.id, '-', '_')
        ) o;
        
        INSERT INTO tree values(f.id::uuid, path::ltree);
    END LOOP;
END $$ LANGUAGE plpgsql;

SELECT populate_path(id) FROM resource WHERE type <> 'root' AND depth < 600 AND parent_id IS NOT NULL;

ALTER TABLE resource DROP COLUMN depth;
UPDATE resource SET parent_id = NULL WHERE type IN ('area', 'crag', 'point', 'root', 'route', 'sector');
DROP TABLE foster_care;

-- mode resource types into resource_type enum type

DROP TABLE resource_type;

CREATE TYPE bultdatabasen.resource_type AS ENUM (
    'area',
    'bolt',
    'comment',
    'crag',
    'image',
    'point',
    'root',
    'route',
    'sector',
    'task'
);

ALTER TABLE resource ALTER COLUMN type TYPE resource_type USING type::resource_type;

-- use UUID data type for resource.id

ALTER TABLE resource DROP CONSTRAINT fk_resource_1;
ALTER TABLE area DROP CONSTRAINT fk_area_1;
ALTER TABLE bolt DROP CONSTRAINT fk_bolt_1;
ALTER TABLE crag DROP CONSTRAINT fk_crag_1;
ALTER TABLE image DROP CONSTRAINT fk_point_image_1;
ALTER TABLE point DROP CONSTRAINT fk_point_2;
ALTER TABLE route DROP CONSTRAINT fk_route_1;
ALTER TABLE sector DROP CONSTRAINT fk_sector_1;
ALTER TABLE task DROP CONSTRAINT fk_task_1;
ALTER TABLE team_role DROP CONSTRAINT fk_team_role_2;
ALTER TABLE trash DROP CONSTRAINT fk_trash_1;
ALTER TABLE trash DROP CONSTRAINT fk_trash_2;
ALTER TABLE user_role DROP CONSTRAINT fk_user_role_2;
ALTER TABLE connection DROP CONSTRAINT fk_connection_1;
ALTER TABLE connection DROP CONSTRAINT fk_connection_2;
ALTER TABLE connection DROP CONSTRAINT fk_connection_3;

ALTER TABLE resource ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE resource ALTER COLUMN parent_id TYPE UUID USING id::uuid;
ALTER TABLE area ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE bolt ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE crag ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE image ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE connection ALTER COLUMN src_point_id TYPE UUID USING src_point_id::uuid;
ALTER TABLE connection ALTER COLUMN dst_point_id TYPE UUID USING dst_point_id::uuid;
ALTER TABLE connection ALTER COLUMN route_id TYPE UUID USING route_id::uuid;
ALTER TABLE point ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE route ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE sector ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE task ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE team_role ALTER COLUMN resource_id TYPE UUID USING resource_id::uuid;
ALTER TABLE trash ALTER COLUMN resource_id TYPE UUID USING resource_id::uuid;
ALTER TABLE trash ALTER COLUMN orig_parent_id TYPE UUID USING orig_parent_id::uuid;
ALTER TABLE user_role ALTER COLUMN resource_id TYPE UUID USING resource_id::uuid;

ALTER TABLE resource ADD CONSTRAINT "fk_resource_1" FOREIGN KEY (parent_id) REFERENCES resource(id);
ALTER TABLE area ADD CONSTRAINT "fk_area_1" FOREIGN KEY (id, name) REFERENCES resource(id, name) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE bolt ADD CONSTRAINT "fk_bolt_1" FOREIGN KEY (id) REFERENCES resource(id);
ALTER TABLE crag ADD CONSTRAINT "fk_crag_1" FOREIGN KEY (id, name) REFERENCES resource(id, name) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE image ADD CONSTRAINT "fk_image_1" FOREIGN KEY (id) REFERENCES resource(id);
ALTER TABLE point ADD CONSTRAINT "fk_point_1" FOREIGN KEY (id) REFERENCES resource(id);
ALTER TABLE connection ADD CONSTRAINT "fk_connection_1" FOREIGN KEY (src_point_id) REFERENCES point(id);
ALTER TABLE connection ADD CONSTRAINT "fk_connection_2" FOREIGN KEY (dst_point_id) REFERENCES point(id);
ALTER TABLE connection ADD CONSTRAINT "fk_connection_3" FOREIGN KEY (route_id) REFERENCES route(id);
ALTER TABLE route ADD CONSTRAINT "fk_route_1" FOREIGN KEY (id, name) REFERENCES resource(id, name) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE sector ADD CONSTRAINT "fk_sector_1" FOREIGN KEY (id, name) REFERENCES resource(id, name) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE task ADD CONSTRAINT "fk_task_1" FOREIGN KEY (id) REFERENCES resource(id);
ALTER TABLE team_role ADD CONSTRAINT "fk_team_role_2" FOREIGN KEY (resource_id) REFERENCES resource(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE trash ADD CONSTRAINT "fk_trash_1" FOREIGN KEY (resource_id) REFERENCES resource(id);
ALTER TABLE trash ADD CONSTRAINT "fk_trash_2" FOREIGN KEY (orig_parent_id) REFERENCES resource(id);
ALTER TABLE user_role ADD CONSTRAINT "fk_user_role_2" FOREIGN KEY (resource_id) REFERENCES resource(id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE INDEX "fk_tree_1_idx" ON "tree" USING btree (resource_id);
ALTER TABLE tree ADD CONSTRAINT "fk_tree_1" FOREIGN KEY (resource_id) REFERENCES resource(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- use UUID data type for team.id

ALTER TABLE invite DROP CONSTRAINT fk_invite_2;
ALTER TABLE team_role DROP CONSTRAINT fk_team_role_1;
ALTER TABLE user_team DROP CONSTRAINT fk_user_team_2;

ALTER TABLE team ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE team_role ALTER COLUMN team_id TYPE UUID USING team_id::uuid;
ALTER TABLE invite ALTER COLUMN team_id TYPE UUID USING team_id::uuid;
ALTER TABLE user_team ALTER COLUMN team_id TYPE UUID USING team_id::uuid;

ALTER TABLE invite ADD CONSTRAINT "fk_invite_2" FOREIGN KEY (team_id) REFERENCES team(id);
ALTER TABLE team_role ADD CONSTRAINT "fk_team_role_1" FOREIGN KEY (team_id) REFERENCES team(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE user_team ADD CONSTRAINT "fk_user_team_2" FOREIGN KEY (team_id) REFERENCES team(id);

-- use UUID data type for invite.id

ALTER TABLE invite ALTER COLUMN id TYPE UUID USING id::uuid;

-- use UUID data type for manufacturer.id

ALTER TABLE bolt DROP CONSTRAINT fk_bolt_3;
ALTER TABLE model DROP CONSTRAINT fk_model_1;
ALTER TABLE bolt DROP CONSTRAINT fk_bolt_2;

ALTER TABLE manufacturer ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE bolt ALTER COLUMN manufacturer_id TYPE UUID USING manufacturer_id::uuid;
ALTER TABLE model ALTER COLUMN manufacturer_id TYPE UUID USING manufacturer_id::uuid;

ALTER TABLE bolt ADD CONSTRAINT "fk_bolt_3" FOREIGN KEY (manufacturer_id) REFERENCES manufacturer(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE model ADD CONSTRAINT "fk_model_1" FOREIGN KEY (manufacturer_id) REFERENCES manufacturer(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE bolt ADD CONSTRAINT "fk_bolt_2" FOREIGN KEY (model_id, manufacturer_id) REFERENCES model(id, manufacturer_id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- use UUID data type for material.id

ALTER TABLE bolt DROP CONSTRAINT fk_bolt_4;
ALTER TABLE model DROP CONSTRAINT fk_model_2;

ALTER TABLE material ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE bolt ALTER COLUMN material_id TYPE UUID USING material_id::uuid;
ALTER TABLE model ALTER COLUMN material_id TYPE UUID USING material_id::uuid;

ALTER TABLE bolt ADD CONSTRAINT "fk_bolt_4" FOREIGN KEY (material_id) REFERENCES material(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE model ADD CONSTRAINT "fk_model_2" FOREIGN KEY (material_id) REFERENCES material(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- use UUID data type for model.id

ALTER TABLE bolt DROP CONSTRAINT fk_bolt_2;

ALTER TABLE model ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE bolt ALTER COLUMN model_id TYPE UUID USING model_id::uuid;

ALTER TABLE bolt ADD CONSTRAINT "fk_bolt_2" FOREIGN KEY (model_id, manufacturer_id) REFERENCES model(id, manufacturer_id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- unused columns

ALTER TABLE route DROP COLUMN external_link;

-- create enum for route type

ALTER TABLE route DROP CONSTRAINT fk_route_2;
DROP INDEX "idx_22487_fk_route_2_idx";

DROP TABLE route_type;

CREATE TYPE bultdatabasen.route_type AS ENUM (
    'aid',
    'dws',
    'partially_bolted',
    'sport',
    'top_rope',
    'traditional'
);

ALTER TABLE route ALTER COLUMN route_type TYPE route_type USING route_type::route_type;

-- create enum for role

ALTER TABLE user_role DROP CONSTRAINT fk_user_role_3;
DROP INDEX "idx_22523_fk_user_role_3_idx";

ALTER TABLE team_role DROP CONSTRAINT fk_team_role_3;
DROP INDEX "idx_22510_fk_team_role_3_idx";

DROP TABLE role;

CREATE TYPE bultdatabasen.role AS ENUM (
    'owner'
);

ALTER TABLE user_role ALTER COLUMN role TYPE role USING role::role;
ALTER TABLE team_role ALTER COLUMN role TYPE role USING role::role;