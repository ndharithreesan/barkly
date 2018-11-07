//<dbuser>:<dbpassword>@ds153593.mlab.com:53593/barkly-challenge

module.exports = {
  db: process.env.DB || 'barkly-challenge',
  connectURL: process.env.CONNECT_URL || 'mongodb://localhost:27017',
  user: process.env.DB_USER || '',
  pass: process.env.DB_PASS || '',
  port: process.env.PORT || 8000
};
