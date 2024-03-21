require("dotenv").config();
module.exports = {
  server: {
    port: process.env.PORT,
    mode: process.env.MODE
  },
  database: {
    development: {
      database: process.env.DEV_DB,
      username: process.env.DEV_USER,
      password: process.env.DEV_PASSWORD,
      host: process.env.DEV_HOST,
      dialect: "mysql",
      logging: false,
    },
    test: {
      database: process.env.TEST_DB,
      username: process.env.TEST_USER,
      password: process.env.TEST_PASSWORD,
      host: process.env.TEST_HOST,
      dialect: "postgres",
      logging: false,
    },
    production: {},
  },
  infrastructure: {
    dateFormat: "YYYY-MM-DD hh:mm:ss",
    timezone: "Africa/Lagos",
    baseUrl: {
      production: "",
      development: "localhost",
      test: "",
    },
    winston: {
      server: process.env.WINSTONSOURCESERVER,
      sourceToken: process.env.WINSTONSOURCETOKEN,
    },
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USN,
      password: process.env.SMTP_PASSWORD,
    },
    cloudinary: {
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    },
  },
};
