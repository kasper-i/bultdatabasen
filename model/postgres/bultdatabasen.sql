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
    id character varying(36) NOT NULL,
    name character varying(256) NOT NULL
);


--
-- Name: bolt; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.bolt (
    id character varying(36) NOT NULL,
    type bultdatabasen.bolt_type,
    "position" bultdatabasen.bolt_position,
    installed timestamp with time zone,
    dismantled timestamp with time zone,
    manufacturer_id character varying(36),
    model_id character varying(36),
    material_id character varying(36),
    diameter double precision,
    diameter_unit bultdatabasen.bolt_diameter_unit
);


--
-- Name: connection; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.connection (
    route_id character varying(36) NOT NULL,
    src_point_id character varying(36) NOT NULL,
    dst_point_id character varying(36) NOT NULL
);


--
-- Name: crag; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.crag (
    id character varying(36) NOT NULL,
    name character varying(256) NOT NULL
);


--
-- Name: foster_care; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.foster_care (
    id character varying(36) NOT NULL,
    foster_parent_id character varying(36) NOT NULL
);


--
-- Name: image; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.image (
    id character varying(36) NOT NULL,
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
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    team_id character varying(36) NOT NULL,
    expiration_date timestamp with time zone NOT NULL,
    status bultdatabasen.invite_status NOT NULL
);


--
-- Name: manufacturer; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.manufacturer (
    id character varying(36) NOT NULL,
    name character varying(256) NOT NULL
);


--
-- Name: material; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.material (
    id character varying(36) NOT NULL,
    name character varying(256) NOT NULL
);


--
-- Name: model; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.model (
    id character varying(36) NOT NULL,
    name character varying(256) NOT NULL,
    manufacturer_id character varying(36) NOT NULL,
    type bultdatabasen.model_type,
    material_id character varying(36),
    diameter double precision,
    diameter_unit bultdatabasen.model_diameter_unit
);


--
-- Name: point; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.point (
    id character varying(36) NOT NULL,
    anchor boolean NOT NULL
);


--
-- Name: resource; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.resource (
    id character varying(36) NOT NULL,
    name character varying(256),
    type character varying(64) NOT NULL,
    depth integer NOT NULL,
    parent_id character varying(36),
    btime timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mtime timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    buser_id character varying(36) NOT NULL,
    muser_id character varying(36) NOT NULL,
    counters json NOT NULL
);


--
-- Name: resource_type; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.resource_type (
    name character varying(64) NOT NULL,
    depth integer NOT NULL
);


--
-- Name: role; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.role (
    name character varying(64) NOT NULL
);


--
-- Name: route; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.route (
    id character varying(36) NOT NULL,
    name character varying(256) NOT NULL,
    alt_name character varying(256),
    year integer,
    route_type character varying(64),
    external_link character varying(2048),
    length integer
);


--
-- Name: route_type; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.route_type (
    name character varying(64) NOT NULL
);


--
-- Name: sector; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.sector (
    id character varying(36) NOT NULL,
    name character varying(256) NOT NULL
);


--
-- Name: task; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.task (
    id character varying(36) NOT NULL,
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
    id character varying(36) NOT NULL,
    name character varying(256)
);


--
-- Name: team_role; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.team_role (
    team_id character varying(36) NOT NULL,
    resource_id character varying(36) NOT NULL,
    role character varying(64) NOT NULL
);


--
-- Name: trash; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.trash (
    resource_id character varying(36) NOT NULL,
    dtime timestamp with time zone NOT NULL,
    duser_id character varying(36) NOT NULL,
    orig_parent_id character varying(36) NOT NULL
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
    resource_id character varying(36) NOT NULL,
    role character varying(64) NOT NULL
);


--
-- Name: user_team; Type: TABLE; Schema: bultdatabasen; Owner: -
--

CREATE TABLE bultdatabasen.user_team (
    user_id character varying(36) NOT NULL,
    team_id character varying(36) NOT NULL,
    admin smallint NOT NULL
);


--
-- Name: area idx_20557_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.area
    ADD CONSTRAINT idx_20557_primary PRIMARY KEY (id);


--
-- Name: bolt idx_20560_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.bolt
    ADD CONSTRAINT idx_20560_primary PRIMARY KEY (id);


--
-- Name: connection idx_20563_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.connection
    ADD CONSTRAINT idx_20563_primary PRIMARY KEY (src_point_id, dst_point_id, route_id);


--
-- Name: crag idx_20566_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.crag
    ADD CONSTRAINT idx_20566_primary PRIMARY KEY (id);


--
-- Name: foster_care idx_20569_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.foster_care
    ADD CONSTRAINT idx_20569_primary PRIMARY KEY (id, foster_parent_id);


--
-- Name: image idx_20572_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.image
    ADD CONSTRAINT idx_20572_primary PRIMARY KEY (id);


--
-- Name: invite idx_20578_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.invite
    ADD CONSTRAINT idx_20578_primary PRIMARY KEY (id);


--
-- Name: manufacturer idx_20581_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.manufacturer
    ADD CONSTRAINT idx_20581_primary PRIMARY KEY (id);


--
-- Name: material idx_20584_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.material
    ADD CONSTRAINT idx_20584_primary PRIMARY KEY (id);


--
-- Name: model idx_20587_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.model
    ADD CONSTRAINT idx_20587_primary PRIMARY KEY (id);


--
-- Name: point idx_20590_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.point
    ADD CONSTRAINT idx_20590_primary PRIMARY KEY (id);


--
-- Name: resource idx_20593_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.resource
    ADD CONSTRAINT idx_20593_primary PRIMARY KEY (id);


--
-- Name: resource_type idx_20601_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.resource_type
    ADD CONSTRAINT idx_20601_primary PRIMARY KEY (name);


--
-- Name: role idx_20604_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.role
    ADD CONSTRAINT idx_20604_primary PRIMARY KEY (name);


--
-- Name: route idx_20607_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.route
    ADD CONSTRAINT idx_20607_primary PRIMARY KEY (id);


--
-- Name: route_type idx_20613_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.route_type
    ADD CONSTRAINT idx_20613_primary PRIMARY KEY (name);


--
-- Name: sector idx_20616_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.sector
    ADD CONSTRAINT idx_20616_primary PRIMARY KEY (id);


--
-- Name: task idx_20619_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.task
    ADD CONSTRAINT idx_20619_primary PRIMARY KEY (id);


--
-- Name: team idx_20627_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.team
    ADD CONSTRAINT idx_20627_primary PRIMARY KEY (id);


--
-- Name: team_role idx_20630_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.team_role
    ADD CONSTRAINT idx_20630_primary PRIMARY KEY (team_id, resource_id);


--
-- Name: trash idx_20633_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.trash
    ADD CONSTRAINT idx_20633_primary PRIMARY KEY (resource_id);


--
-- Name: user idx_20636_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen."user"
    ADD CONSTRAINT idx_20636_primary PRIMARY KEY (id);


--
-- Name: user_role idx_20643_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.user_role
    ADD CONSTRAINT idx_20643_primary PRIMARY KEY (user_id, resource_id);


--
-- Name: user_team idx_20646_primary; Type: CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.user_team
    ADD CONSTRAINT idx_20646_primary PRIMARY KEY (user_id, team_id);


--
-- Name: idx_20557_fk_area_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20557_fk_area_1_idx ON bultdatabasen.area USING btree (id, name);


--
-- Name: idx_20560_fk_bolt_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20560_fk_bolt_2_idx ON bultdatabasen.bolt USING btree (model_id, manufacturer_id);


--
-- Name: idx_20560_fk_bolt_3_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20560_fk_bolt_3_idx ON bultdatabasen.bolt USING btree (manufacturer_id);


--
-- Name: idx_20560_fk_bolt_4_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20560_fk_bolt_4_idx ON bultdatabasen.bolt USING btree (material_id);


--
-- Name: idx_20563_fk_connection_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20563_fk_connection_1_idx ON bultdatabasen.connection USING btree (src_point_id);


--
-- Name: idx_20563_fk_connection_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20563_fk_connection_2_idx ON bultdatabasen.connection USING btree (dst_point_id);


--
-- Name: idx_20563_fk_connection_3_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20563_fk_connection_3_idx ON bultdatabasen.connection USING btree (route_id);


--
-- Name: idx_20563_index5; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE UNIQUE INDEX idx_20563_index5 ON bultdatabasen.connection USING btree (route_id, dst_point_id);


--
-- Name: idx_20563_index6; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE UNIQUE INDEX idx_20563_index6 ON bultdatabasen.connection USING btree (route_id, src_point_id);


--
-- Name: idx_20566_fk_crag_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20566_fk_crag_1_idx ON bultdatabasen.crag USING btree (id, name);


--
-- Name: idx_20569_fk_foster_care_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20569_fk_foster_care_2_idx ON bultdatabasen.foster_care USING btree (foster_parent_id);


--
-- Name: idx_20578_fk_invite_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20578_fk_invite_1_idx ON bultdatabasen.invite USING btree (user_id);


--
-- Name: idx_20578_fk_invite_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20578_fk_invite_2_idx ON bultdatabasen.invite USING btree (team_id);


--
-- Name: idx_20587_fk_model_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20587_fk_model_1_idx ON bultdatabasen.model USING btree (manufacturer_id);


--
-- Name: idx_20587_fk_model_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20587_fk_model_2_idx ON bultdatabasen.model USING btree (material_id);


--
-- Name: idx_20587_index3; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE UNIQUE INDEX idx_20587_index3 ON bultdatabasen.model USING btree (id, manufacturer_id);


--
-- Name: idx_20593_fk_resource_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20593_fk_resource_1_idx ON bultdatabasen.resource USING btree (parent_id);


--
-- Name: idx_20593_fk_resource_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20593_fk_resource_2_idx ON bultdatabasen.resource USING btree (type, depth);


--
-- Name: idx_20593_fk_resource_3_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20593_fk_resource_3_idx ON bultdatabasen.resource USING btree (buser_id);


--
-- Name: idx_20593_fk_resource_4_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20593_fk_resource_4_idx ON bultdatabasen.resource USING btree (muser_id);


--
-- Name: idx_20593_index4; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE UNIQUE INDEX idx_20593_index4 ON bultdatabasen.resource USING btree (id, name);


--
-- Name: idx_20601_index2; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE UNIQUE INDEX idx_20601_index2 ON bultdatabasen.resource_type USING btree (name, depth);


--
-- Name: idx_20607_fk_route_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20607_fk_route_1_idx ON bultdatabasen.route USING btree (id, name);


--
-- Name: idx_20607_fk_route_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20607_fk_route_2_idx ON bultdatabasen.route USING btree (route_type);


--
-- Name: idx_20616_fk_sector_1_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20616_fk_sector_1_idx ON bultdatabasen.sector USING btree (id, name);


--
-- Name: idx_20619_fk_task_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20619_fk_task_2_idx ON bultdatabasen.task USING btree (assignee);


--
-- Name: idx_20630_fk_team_role_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20630_fk_team_role_2_idx ON bultdatabasen.team_role USING btree (resource_id);


--
-- Name: idx_20630_fk_team_role_3_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20630_fk_team_role_3_idx ON bultdatabasen.team_role USING btree (role);


--
-- Name: idx_20633_fk_trash_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20633_fk_trash_2_idx ON bultdatabasen.trash USING btree (orig_parent_id);


--
-- Name: idx_20633_fk_trash_3_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20633_fk_trash_3_idx ON bultdatabasen.trash USING btree (duser_id);


--
-- Name: idx_20643_fk_user_role_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20643_fk_user_role_2_idx ON bultdatabasen.user_role USING btree (resource_id);


--
-- Name: idx_20643_fk_user_role_3_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20643_fk_user_role_3_idx ON bultdatabasen.user_role USING btree (role);


--
-- Name: idx_20646_fk_user_team_2_idx; Type: INDEX; Schema: bultdatabasen; Owner: -
--

CREATE INDEX idx_20646_fk_user_team_2_idx ON bultdatabasen.user_team USING btree (team_id);


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
-- Name: foster_care fk_foster_care_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.foster_care
    ADD CONSTRAINT fk_foster_care_1 FOREIGN KEY (id) REFERENCES bultdatabasen.resource(id);


--
-- Name: foster_care fk_foster_care_2; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.foster_care
    ADD CONSTRAINT fk_foster_care_2 FOREIGN KEY (foster_parent_id) REFERENCES bultdatabasen.resource(id);


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
-- Name: point fk_point_2; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.point
    ADD CONSTRAINT fk_point_2 FOREIGN KEY (id) REFERENCES bultdatabasen.resource(id);


--
-- Name: image fk_point_image_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.image
    ADD CONSTRAINT fk_point_image_1 FOREIGN KEY (id) REFERENCES bultdatabasen.resource(id);


--
-- Name: resource fk_resource_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.resource
    ADD CONSTRAINT fk_resource_1 FOREIGN KEY (parent_id) REFERENCES bultdatabasen.resource(id);


--
-- Name: resource fk_resource_2; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.resource
    ADD CONSTRAINT fk_resource_2 FOREIGN KEY (type, depth) REFERENCES bultdatabasen.resource_type(name, depth) ON UPDATE CASCADE ON DELETE RESTRICT;


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
-- Name: route fk_route_2; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.route
    ADD CONSTRAINT fk_route_2 FOREIGN KEY (route_type) REFERENCES bultdatabasen.route_type(name) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sector fk_sector_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.sector
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
-- Name: team_role fk_team_role_3; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.team_role
    ADD CONSTRAINT fk_team_role_3 FOREIGN KEY (role) REFERENCES bultdatabasen.role(name) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: trash fk_trash_1; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.trash
    ADD CONSTRAINT fk_trash_1 FOREIGN KEY (resource_id) REFERENCES bultdatabasen.resource(id);


--
-- Name: trash fk_trash_2; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.trash
    ADD CONSTRAINT fk_trash_2 FOREIGN KEY (orig_parent_id) REFERENCES bultdatabasen.resource(id);


--
-- Name: trash fk_trash_3; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.trash
    ADD CONSTRAINT fk_trash_3 FOREIGN KEY (duser_id) REFERENCES bultdatabasen."user"(id);


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
-- Name: user_role fk_user_role_3; Type: FK CONSTRAINT; Schema: bultdatabasen; Owner: -
--

ALTER TABLE ONLY bultdatabasen.user_role
    ADD CONSTRAINT fk_user_role_3 FOREIGN KEY (role) REFERENCES bultdatabasen.role(name) ON UPDATE CASCADE ON DELETE RESTRICT;


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
-- PostgreSQL database dump complete
--
