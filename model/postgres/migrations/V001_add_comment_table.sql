
CREATE TABLE bultdatabasen.comment (
    id uuid NOT NULL,
    text text NOT NULL,
    tags json DEFAULT json_build_array() NOT NULL
);