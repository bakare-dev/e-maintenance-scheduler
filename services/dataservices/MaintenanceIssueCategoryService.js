const Service = require("./Service");
const MaintenanceIssueCategoryEntity = require("../../entities/MaintenanceIssueCategory");

let instance;

class MaintenanceIssueCategoryService extends Service {

    constructor () {

        if (instance) return instance;

        super(MaintenanceIssueCategoryEntity);

        instance = this;
    }

}

module.exports = MaintenanceIssueCategoryService