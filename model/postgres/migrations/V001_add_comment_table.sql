
CREATE TABLE bultdatabasen.comment (
    id uuid NOT NULL,
    text text NOT NULL,
    tags json DEFAULT json_build_array() NOT NULL
);

ALTER TABLE bultdatabasen.comment OWNER TO bultdatabasen;

ALTER TABLE bultdatabasen.comment
    ADD CONSTRAINT idx_29611_primary PRIMARY KEY (id); 

ALTER TABLE bultdatabasen.comment
    ADD CONSTRAINT fk_comment_1 FOREIGN KEY (id) REFERENCES bultdatabasen.resource(id);