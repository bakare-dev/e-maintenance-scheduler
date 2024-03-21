require("dotenv").config();
module.exports = {
  server: {
    port: process.env.PORT,
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
    test: {},
    production: {},
  },
  infrastructure: {
    timezone: "Africa/Lagos",
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
    recievers: {
      admin: process.env.ADMIN_EMAIL,
      support: process.env.SUPPORT_EMAIL,
    }
  },
};
