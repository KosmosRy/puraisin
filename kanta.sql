CREATE TABLE puraisu (
  type        CHARACTER VARYING(64)                           NOT NULL,
  content     TEXT                                            NOT NULL,
  location    TEXT                                            NOT NULL,
  info        TEXT,
  source      CHARACTER VARYING(32)                           NOT NULL,
  biter       CHARACTER VARYING(32)                           NOT NULL,
  "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP(0)          NOT NULL,
  postfestum  BOOLEAN                                         NOT NULL,
  coordinates JSON,
  portion     NUMERIC DEFAULT 1                               NOT NULL
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
