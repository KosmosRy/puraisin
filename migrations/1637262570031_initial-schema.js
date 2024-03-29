exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE megafauna (
        biter       CHARACTER VARYING(32)    NOT NULL PRIMARY KEY,
        weight      NUMERIC                  NOT NULL DEFAULT 85.5,
        displayname CHARACTER VARYING(50)
    );
    
    CREATE TABLE puraisu (
        id          BIGSERIAL PRIMARY KEY,
        type        CHARACTER VARYING(64)                           NOT NULL,
        content     TEXT                                            NOT NULL,
        location    TEXT                                            NOT NULL,
        info        TEXT,
        source      CHARACTER VARYING(32)                           NOT NULL,
        biter       CHARACTER VARYING(32)                           NOT NULL REFERENCES megafauna(biter),
        "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP(0)          NOT NULL,
        postfestum  BOOLEAN                                         NOT NULL,
        coordinates JSON,
        portion     NUMERIC DEFAULT 1                               NOT NULL,
        weight      NUMERIC DEFAULT 85.5                            NOT NULL,
        tzoffset    VARCHAR(6)
    );
  `);
};

exports.down = false;
