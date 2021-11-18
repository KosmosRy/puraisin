module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: 'puraisin',
      user: 'puraisin',
      password: 'puraisin'
    },
    migrations: {
      tableName: 'migrations'
    }
  }
}
