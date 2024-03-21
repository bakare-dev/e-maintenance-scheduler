const Service = require("./Service");
const MaintenanceIssueEntity = require("../../entities/MaintenanceIssue");

let instance;

class MaintenanceIssueService extends Service {

    constructor () {

        if (instance) return instance;

        super(MaintenanceIssueEntity);

        instance = this;
    }

   
}

module.exports = MaintenanceIssueService