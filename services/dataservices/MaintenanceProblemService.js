const Service = require("./Service");
const MaintenanceProblemEntity = require("../../entities/MaintenanceProblem");

let instance;

class MaintenanceProblemService extends Service {

    constructor () {

        if (instance) return instance;

        super(MaintenanceProblemEntity);

        instance = this;
    }
}

module.exports = MaintenanceProblemService