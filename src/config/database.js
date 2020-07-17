module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'docker',
  database: 'FastFeet',
  define: {
    timestamp: true,
    underscored: true,
    underscoredAll: true,
  },
};
