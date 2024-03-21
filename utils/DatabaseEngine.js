"use strict";
const config = require("../config/main.settings");
const { Sequelize } = require("sequelize");
const Logger = require("./Logger");

let instance;

class DatabaseEngine {
  #connectionManager;
  #logger;

  constructor() {
    if (instance) return instance;

    this.#connectionManager = new Sequelize(
      config.database.development.database,
      config.database.development.username,
      config.database.development.password,
      {
        host: config.database.development.host,
        dialect: config.database.development.dialect,
        logging: false,
      }
    );

    this.#logger = new Logger().getLogger();

    instance = this;
  }

  connect = async (cb) => {
    try {
      await this.#connectionManager.authenticate();
      await this.#synchronize();
      cb();
    } catch (e) {
      this.#logger.error(e);
    }
  };

  #synchronize = async () => {
    try {
      const db = {};

      db.MaintenanceIssue = require("../entities/MaintenanceIssue");
      db.MaintenanceIssueCategory = require("../entities/MaintenanceIssueCategory");
      db.MaintenanceProblem = require("../entities/MaintenanceProblem");
      db.MaintenanceProblemIssue = require("../entities/MaintenanceProblemIssue");

      this.#connectionManager.db = db;

      await this.#connectionManager.sync({ alter: true });
    } catch (e) {
      this.#logger.error(e);
    }
  };

  getConnectionManager = () => this.#connectionManager;
}

module.exports = DatabaseEngine;
