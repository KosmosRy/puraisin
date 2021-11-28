exports.up = (pgm) => {
  pgm.sql(`
      CREATE TABLE slack_secrets (
          organization TEXT PRIMARY KEY,
          signing_secret TEXT NOT NULL,
          bot_token TEXT NOT NULL,
          app_token TEXT NOT NULL,
          client_id TEXT NOT NULL,
          client_secret TEXT NOT NULL
      )
  `)
}

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE slack_secrets`)
}
