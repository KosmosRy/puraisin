CREATE TABLE puraisu (
    type character varying(12) NOT NULL,
    content character varying(64) NOT NULL,
    location character varying(64) NOT NULL,
    info text,
    source character varying(32) NOT NULL,
    biter character varying(32) NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
