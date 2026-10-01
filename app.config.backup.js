const appJson = require('./app.json');

module.exports = ({ config }) => ({
  ...appJson.expo,
  plugins: [
    ...(appJson.expo.plugins || []),
    '@react-native-community/datetimepicker',
  ],
  extra: {
    ...(appJson.expo.extra || {}),
  },
});
