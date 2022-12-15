--
-- PostgreSQL database dump
--

-- Dumped from database version 12.12 (Ubuntu 12.12-0ubuntu0.20.04.1)
-- Dumped by pg_dump version 12.12 (Ubuntu 12.12-0ubuntu0.20.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: bultdatabasen; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA bultdatabasen;


--
-- Name: ltree; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS ltree WITH SCHEMA bultdatabasen;


--
-- Name: EXTENSION ltree; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION ltree IS 'data type for hierarchical tree-like structures';


--
-- Name: bolt_diameter_unit; Type: TYPE; Schema: bultdatabasen; Owner: -
--

CREATE TYPE bultdatabasen.bolt_diameter_unit AS ENUM (
    'mm',
    'inch'
);


--
-- Name: bolt_position; Type: TYPE; Schema: bultdatabasen; Owner: -
--

CREATE TYPE bultdatabasen.bolt_position AS ENUM (
    'left',
    'right'
);


--
-- Name: bolt_type; Type: TYPE; Schema: bultdatabasen; Owner: -
--

CREATE TYPE bultdatabasen.bolt_type AS ENUM (
    'expansion',
    'glue',
    'piton'
);


--
-- Name: invite_status; Type: TYPE; Schema: bultdatabasen; Owner: -
--

CREATE TYPE bultdatabasen.invite_status AS ENUM (
    'pending',
    'accepted',
    'declined',
    'revoked'
);


--
-- Name: model_diameter_unit; Type: TYPE; Schema: bultdatabasen; Owner: -
--

CREATE TYPE bultdatabasen.model_diameter_unit AS ENUM (
    'mm',
    'inch'
);


--
-- Name: model_type; Type: TYPE; Schema: bultdatabasen; Owner: -
--

CREATE TYPE bultdatabasen.model_type AS ENUM (
    'expansion',
    'glue',
    'piton'
);


--
-- Name: resource_type; Type: TYPE; Schema: bultdatabasen; Owner: -
--

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


--
-- Name: role; Type: TYPE; Schema: bultdatabasen; Owner: -
--

CREATE TYPE bultdatabasen.role AS ENUM (
    'owner'
);


--
-- Name: route_type; Type: TYPE; Schema: bultdatabasen; Owner: -
--

CREATE TYPE bultdatabasen.route_type AS ENUM (
    'aid',
    'dws',
    'partially_bolted',
    'sport',
    'top_rope',
    'traditional'
);


--
-- Name: task_status; Type: TYPE; Schema: bultdatabasen; Owner: -
--

CREATE TYPE bultdatabasen.task_status AS ENUM (
    'open',
    'assigned',
    'closed',
    'rejected'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: area; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.area (
    id uuid NOT NULL,
    name character varying(256) NOT NULL
);


--
-- Name: bolt; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.bolt (
    id uuid NOT NULL,
    type bultdatabasen.bolt_type,
    "position" bultdatabasen.bolt_position,
    installed timestamp with time zone,
    dismantled timestamp with time zone,
    manufacturer_id uuid,
    model_id uuid,
    material_id uuid,
    diameter double precision,
    diameter_unit bultdatabasen.bolt_diameter_unit
);


--
-- Name: connection; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.connection (
    route_id uuid NOT NULL,
    src_point_id uuid NOT NULL,
    dst_point_id uuid NOT NULL
);


--
-- Name: crag; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.crag (
    id uuid NOT NULL,
    name character varying(256) NOT NULL
);


--
-- Name: image; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.image (
    id uuid NOT NULL,
    mime_type character varying(64) NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    description text,
    rotation integer,
    size integer NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL
);


--
-- Name: invite; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.invite (
    id uuid NOT NULL,
    user_id character varying(36) NOT NULL,
    team_id uuid NOT NULL,
    expiration_date timestamp with time zone NOT NULL,
    status bultdatabasen.invite_status NOT NULL
);


--
-- Name: manufacturer; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.manufacturer (
    id uuid NOT NULL,
    name character varying(256) NOT NULL
);


--
-- Name: material; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.material (
    id uuid NOT NULL,
    name character varying(256) NOT NULL
);


--
-- Name: model; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.model (
    id uuid NOT NULL,
    name character varying(256) NOT NULL,
    manufacturer_id uuid NOT NULL,
    type bultdatabasen.model_type,
    material_id uuid,
    diameter double precision,
    diameter_unit bultdatabasen.model_diameter_unit
);


--
-- Name: point; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.point (
    id uuid NOT NULL,
    anchor boolean NOT NULL
);


--
-- Name: resource; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.resource (
    id uuid NOT NULL,
    name character varying(256),
    type bultdatabasen.resource_type NOT NULL,
    leaf_of uuid,
    btime timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mtime timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    buser_id character varying(36) NOT NULL,
    muser_id character varying(36) NOT NULL,
    counters json DEFAULT json_build_object() NOT NULL
);


--
-- Name: route; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.route (
    id uuid NOT NULL,
    name character varying(256) NOT NULL,
    alt_name character varying(256),
    year integer,
    route_type bultdatabasen.route_type,
    length integer
);


--
-- Name: sector; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE test.bultdatabasen.sector (
    id uuid NOT NULL,
    name character varying(256) NOT NULL
);


--
-- Name: task; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.task (
    id uuid NOT NULL,
    status bultdatabasen.task_status DEFAULT 'open'::bultdatabasen.task_status NOT NULL,
    description text NOT NULL,
    priority integer DEFAULT 2 NOT NULL,
    assignee character varying(36),
    comment text,
    closed_at timestamp with time zone
);


--
-- Name: team; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.team (
    id uuid NOT NULL,
    name character varying(256)
);


--
-- Name: team_role; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.team_role (
    team_id uuid NOT NULL,
    resource_id uuid NOT NULL,
    role bultdatabasen.role NOT NULL
);


--
-- Name: trash; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.trash (
    resource_id uuid NOT NULL,
    dtime timestamp with time zone NOT NULL,
    duser_id character varying(36) NOT NULL,
    orig_leaf_of uuid,
    orig_path bultdatabasen.ltree
);


--
-- Name: tree; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.tree (
    resource_id uuid NOT NULL,
    path bultdatabasen.ltree NOT NULL
);


--
-- Name: user; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen."user" (
    id character varying(36) NOT NULL,
    email character varying(256),
    first_name character varying(256),
    last_name character varying(256),
    first_seen timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_role; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.user_role (
    user_id character varying(36) NOT NULL,
    resource_id uuid NOT NULL,
    role bultdatabasen.role NOT NULL
);


--
-- Name: user_team; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.user_team (
    user_id character varying(36) NOT NULL,
    team_id uuid NOT NULL,
    admin smallint NOT NULL
);


--
-- Name: area idx_29521_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.area
    ADD CONSTRAINT idx_29521_primary PRIMARY KEY (id);


--
-- Name: bolt idx_29524_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.bolt
    ADD CONSTRAINT idx_29524_primary PRIMARY KEY (id);


--
-- Name: connection idx_29527_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.connection
    ADD CONSTRAINT idx_29527_primary PRIMARY KEY (src_point_id, dst_point_id, route_id);


--
-- Name: crag idx_29530_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.crag
    ADD CONSTRAINT idx_29530_primary PRIMARY KEY (id);


--
-- Name: image idx_29536_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.image
    ADD CONSTRAINT idx_29536_primary PRIMARY KEY (id);


--
-- Name: invite idx_29542_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.invite
    ADD CONSTRAINT idx_29542_primary PRIMARY KEY (id);


--
-- Name: manufacturer idx_29545_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.manufacturer
    ADD CONSTRAINT idx_29545_primary PRIMARY KEY (id);


--
-- Name: material idx_29548_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.material
    ADD CONSTRAINT idx_29548_primary PRIMARY KEY (id);


--
-- Name: model idx_29551_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.model
    ADD CONSTRAINT idx_29551_primary PRIMARY KEY (id);


--
-- Name: point idx_29554_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.point
    ADD CONSTRAINT idx_29554_primary PRIMARY KEY (id);


--
-- Name: resource idx_29557_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.resource
    ADD CONSTRAINT idx_29557_primary PRIMARY KEY (id);


--
-- Name: route idx_29571_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.route
    ADD CONSTRAINT idx_29571_primary PRIMARY KEY (id);


--
-- Name: sector idx_29580_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY test.bultdatabasen.sector
    ADD CONSTRAINT idx_29580_primary PRIMARY KEY (id);


--
-- Name: task idx_29583_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.task
    ADD CONSTRAINT idx_29583_primary PRIMARY KEY (id);


--
-- Name: team idx_29591_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.team
    ADD CONSTRAINT idx_29591_primary PRIMARY KEY (id);


--
-- Name: team_role idx_29594_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.team_role
    ADD CONSTRAINT idx_29594_primary PRIMARY KEY (team_id, resource_id);


--
-- Name: trash idx_29597_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.trash
    ADD CONSTRAINT idx_29597_primary PRIMARY KEY (resource_id);


--
-- Name: user idx_29600_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen."user"
    ADD CONSTRAINT idx_29600_primary PRIMARY KEY (id);


--
-- Name: user_role idx_29607_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.user_role
    ADD CONSTRAINT idx_29607_primary PRIMARY KEY (user_id, resource_id);


--
-- Name: user_team idx_29610_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.user_team
    ADD CONSTRAINT idx_29610_primary PRIMARY KEY (user_id, team_id);


--
-- Name: fk_tree_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX fk_tree_1_idx ON bultdatabasen.tree USING btree (resource_id);


--
-- Name: idx_29521_fk_area_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29521_fk_area_1_idx ON bultdatabasen.area USING btree (id, name);


--
-- Name: idx_29524_fk_bolt_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29524_fk_bolt_2_idx ON bultdatabasen.bolt USING btree (model_id, manufacturer_id);


--
-- Name: idx_29524_fk_bolt_3_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29524_fk_bolt_3_idx ON bultdatabasen.bolt USING btree (manufacturer_id);


--
-- Name: idx_29524_fk_bolt_4_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29524_fk_bolt_4_idx ON bultdatabasen.bolt USING btree (material_id);


--
-- Name: idx_29527_fk_connection_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29527_fk_connection_1_idx ON bultdatabasen.connection USING btree (src_point_id);


--
-- Name: idx_29527_fk_connection_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29527_fk_connection_2_idx ON bultdatabasen.connection USING btree (dst_point_id);


--
-- Name: idx_29527_fk_connection_3_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29527_fk_connection_3_idx ON bultdatabasen.connection USING btree (route_id);


--
-- Name: idx_29527_index5; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE UNIQUE INDEX idx_29527_index5 ON bultdatabasen.connection USING btree (route_id, dst_point_id);


--
-- Name: idx_29527_index6; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE UNIQUE INDEX idx_29527_index6 ON bultdatabasen.connection USING btree (route_id, src_point_id);


--
-- Name: idx_29530_fk_crag_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29530_fk_crag_1_idx ON bultdatabasen.crag USING btree (id, name);


--
-- Name: idx_29542_fk_invite_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29542_fk_invite_1_idx ON bultdatabasen.invite USING btree (user_id);


--
-- Name: idx_29542_fk_invite_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29542_fk_invite_2_idx ON bultdatabasen.invite USING btree (team_id);


--
-- Name: idx_29551_fk_model_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29551_fk_model_1_idx ON bultdatabasen.model USING btree (manufacturer_id);


--
-- Name: idx_29551_fk_model_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29551_fk_model_2_idx ON bultdatabasen.model USING btree (material_id);


--
-- Name: idx_29551_index3; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE UNIQUE INDEX idx_29551_index3 ON bultdatabasen.model USING btree (id, manufacturer_id);


--
-- Name: idx_29557_fk_resource_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29557_fk_resource_1_idx ON bultdatabasen.resource USING btree (leaf_of);


--
-- Name: idx_29557_fk_resource_3_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29557_fk_resource_3_idx ON bultdatabasen.resource USING btree (buser_id);


--
-- Name: idx_29557_fk_resource_4_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29557_fk_resource_4_idx ON bultdatabasen.resource USING btree (muser_id);


--
-- Name: idx_29557_index4; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE UNIQUE INDEX idx_29557_index4 ON bultdatabasen.resource USING btree (id, name);


--
-- Name: idx_29571_fk_route_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29571_fk_route_1_idx ON bultdatabasen.route USING btree (id, name);


--
-- Name: idx_29580_fk_sector_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29580_fk_sector_1_idx ON test.bultdatabasen.sector USING btree (id, name);


--
-- Name: idx_29583_fk_task_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29583_fk_task_2_idx ON bultdatabasen.task USING btree (assignee);


--
-- Name: idx_29594_fk_team_role_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29594_fk_team_role_2_idx ON bultdatabasen.team_role USING btree (resource_id);


--
-- Name: idx_29597_fk_trash_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29597_fk_trash_2_idx ON bultdatabasen.trash USING btree (orig_leaf_of);


--
-- Name: idx_29597_fk_trash_3_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29597_fk_trash_3_idx ON bultdatabasen.trash USING btree (duser_id);


--
-- Name: idx_29607_fk_user_role_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29607_fk_user_role_2_idx ON bultdatabasen.user_role USING btree (resource_id);


--
-- Name: idx_29610_fk_user_team_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_29610_fk_user_team_2_idx ON bultdatabasen.user_team USING btree (team_id);


--
-- Name: path_gist_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX path_gist_idx ON bultdatabasen.tree USING gist (path);


--
-- Name: path_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX path_idx ON bultdatabasen.tree USING btree (path);


--
-- Name: area fk_area_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.area
    ADD CONSTRAINT fk_area_1 FOREIGN KEY (id, name) REFERENCES bultdatabasen.resource(id, name) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bolt fk_bolt_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.bolt
    ADD CONSTRAINT fk_bolt_1 FOREIGN KEY (id) REFERENCES bultdatabasen.resource(id);


--
-- Name: bolt fk_bolt_2; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.bolt
    ADD CONSTRAINT fk_bolt_2 FOREIGN KEY (model_id, manufacturer_id) REFERENCES bultdatabasen.model(id, manufacturer_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bolt fk_bolt_3; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.bolt
    ADD CONSTRAINT fk_bolt_3 FOREIGN KEY (manufacturer_id) REFERENCES bultdatabasen.manufacturer(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bolt fk_bolt_4; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.bolt
    ADD CONSTRAINT fk_bolt_4 FOREIGN KEY (material_id) REFERENCES bultdatabasen.material(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: connection fk_connection_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.connection
    ADD CONSTRAINT fk_connection_1 FOREIGN KEY (src_point_id) REFERENCES bultdatabasen.point(id);


--
-- Name: connection fk_connection_2; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.connection
    ADD CONSTRAINT fk_connection_2 FOREIGN KEY (dst_point_id) REFERENCES bultdatabasen.point(id);


--
-- Name: connection fk_connection_3; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.connection
    ADD CONSTRAINT fk_connection_3 FOREIGN KEY (route_id) REFERENCES bultdatabasen.route(id);


--
-- Name: crag fk_crag_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.crag
    ADD CONSTRAINT fk_crag_1 FOREIGN KEY (id, name) REFERENCES bultdatabasen.resource(id, name) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: image fk_image_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.image
    ADD CONSTRAINT fk_image_1 FOREIGN KEY (id) REFERENCES bultdatabasen.resource(id);


--
-- Name: invite fk_invite_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.invite
    ADD CONSTRAINT fk_invite_1 FOREIGN KEY (user_id) REFERENCES bultdatabasen."user"(id);


--
-- Name: invite fk_invite_2; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.invite
    ADD CONSTRAINT fk_invite_2 FOREIGN KEY (team_id) REFERENCES bultdatabasen.team(id);


--
-- Name: model fk_model_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.model
    ADD CONSTRAINT fk_model_1 FOREIGN KEY (manufacturer_id) REFERENCES bultdatabasen.manufacturer(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: model fk_model_2; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.model
    ADD CONSTRAINT fk_model_2 FOREIGN KEY (material_id) REFERENCES bultdatabasen.material(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: point fk_point_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.point
    ADD CONSTRAINT fk_point_1 FOREIGN KEY (id) REFERENCES bultdatabasen.resource(id);


--
-- Name: resource fk_resource_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.resource
    ADD CONSTRAINT fk_resource_1 FOREIGN KEY (leaf_of) REFERENCES bultdatabasen.resource(id);


--
-- Name: resource fk_resource_3; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.resource
    ADD CONSTRAINT fk_resource_3 FOREIGN KEY (buser_id) REFERENCES bultdatabasen."user"(id);


--
-- Name: resource fk_resource_4; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.resource
    ADD CONSTRAINT fk_resource_4 FOREIGN KEY (muser_id) REFERENCES bultdatabasen."user"(id);


--
-- Name: route fk_route_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.route
    ADD CONSTRAINT fk_route_1 FOREIGN KEY (id, name) REFERENCES bultdatabasen.resource(id, name) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sector fk_sector_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY test.bultdatabasen.sector
    ADD CONSTRAINT fk_sector_1 FOREIGN KEY (id, name) REFERENCES bultdatabasen.resource(id, name) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: task fk_task_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.task
    ADD CONSTRAINT fk_task_1 FOREIGN KEY (id) REFERENCES bultdatabasen.resource(id);


--
-- Name: task fk_task_2; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.task
    ADD CONSTRAINT fk_task_2 FOREIGN KEY (assignee) REFERENCES bultdatabasen."user"(id);


--
-- Name: team_role fk_team_role_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.team_role
    ADD CONSTRAINT fk_team_role_1 FOREIGN KEY (team_id) REFERENCES bultdatabasen.team(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_role fk_team_role_2; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.team_role
    ADD CONSTRAINT fk_team_role_2 FOREIGN KEY (resource_id) REFERENCES bultdatabasen.resource(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trash fk_trash_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.trash
    ADD CONSTRAINT fk_trash_1 FOREIGN KEY (resource_id) REFERENCES bultdatabasen.resource(id);


--
-- Name: trash fk_trash_2; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.trash
    ADD CONSTRAINT fk_trash_2 FOREIGN KEY (orig_leaf_of) REFERENCES bultdatabasen.resource(id);


--
-- Name: trash fk_trash_3; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.trash
    ADD CONSTRAINT fk_trash_3 FOREIGN KEY (duser_id) REFERENCES bultdatabasen."user"(id);


--
-- Name: tree fk_tree_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.tree
    ADD CONSTRAINT fk_tree_1 FOREIGN KEY (resource_id) REFERENCES bultdatabasen.resource(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_role fk_user_role_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.user_role
    ADD CONSTRAINT fk_user_role_1 FOREIGN KEY (user_id) REFERENCES bultdatabasen."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_role fk_user_role_2; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.user_role
    ADD CONSTRAINT fk_user_role_2 FOREIGN KEY (resource_id) REFERENCES bultdatabasen.resource(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_team fk_user_team_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.user_team
    ADD CONSTRAINT fk_user_team_1 FOREIGN KEY (user_id) REFERENCES bultdatabasen."user"(id);


--
-- Name: user_team fk_user_team_2; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.user_team
    ADD CONSTRAINT fk_user_team_2 FOREIGN KEY (team_id) REFERENCES bultdatabasen.team(id);


--
-- Name: TABLE tree; Type: ACL; Schema: bultdatabasen; Owner: -
--

GRANT ALL ON TABLE bultdatabasen.tree TO bultdatabasen;


--
-- PostgreSQL database dump complete
--

