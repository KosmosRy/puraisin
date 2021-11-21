exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.sql(`
      ALTER TABLE puraisu ADD COLUMN permillage NUMERIC NOT NULL DEFAULT 0
  `)
}

exports.down = (pgm) => {
  pgm.sql(`
      ALTER TABLE puraisu DROP COLUMN permillage
  `)
}
