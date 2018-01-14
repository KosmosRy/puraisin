CREATE TABLE puraisu (
  type        CHARACTER VARYING(12)                  NOT NULL,
  content     CHARACTER VARYING(64)                  NOT NULL,
  location    CHARACTER VARYING(64)                  NOT NULL,
  info        TEXT,
  source      CHARACTER VARYING(32)                  NOT NULL,
  biter       CHARACTER VARYING(32)                  NOT NULL,
  "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE "session" (
  "sid"    VARCHAR      NOT NULL COLLATE "default",
  "sess"   JSON         NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL
)
WITH (OIDS = FALSE
);
ALTER TABLE "session"
  ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
  NOT DEFERRABLE INITIALLY IMMEDIATE;
