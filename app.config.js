require('dotenv').config();
const appJson = require('./app.json');

module.exports = ({ config }) => ({
  ...appJson.expo,
  extra: {
    ...(appJson.expo.extra || {}),
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    SUPABASE_JWKS_URL: process.env.SUPABASE_JWKS_URL,
  },
});
