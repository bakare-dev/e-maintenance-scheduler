const Service = require("./Service");
const MaintenanceProblemIssueEntity = require("../../entities/MaintenanceProblemIssue");
const { Op } = require('sequelize');
const Logger = require("../../utils/Logger");
const MaintenanceProblemEntity = require("../../entities/MaintenanceProblem");
const MaintenanceIssueEntity = require("../../entities/MaintenanceIssue");
const MaintenanceIssueCategoryEntity = require("../../entities/MaintenanceIssueCategory");

let instance;

class MaintenanceProblemIssueService extends Service {

    #logger;

    constructor () {

        if (instance) return instance;

        super(MaintenanceProblemIssueEntity);
        this.#logger = new Logger().getLogger();

        instance = this;
    }

    getWeeklyIssues = async (givenDate) => {
        try {
            const startDate = new Date(givenDate);
            startDate.setDate(startDate.getDate() - 7);
            const endDate = new Date(givenDate);

            const weeklyIssues = await MaintenanceProblemIssueEntity.findAll({
                include: [
                    {
                        model: MaintenanceProblemEntity,
                        where: {
                            DateComplaintMade: {
                                [Op.between]: [startDate, endDate]
                            }
                        },
                        order: [["DateComplaintMade", "ASC"]]
                    },
                    {
                        model: MaintenanceIssueEntity,
                        include: [
                            {
                                model: MaintenanceIssueCategoryEntity
                            }
                        ]
                    }
                ]
            });

            return weeklyIssues;
        } catch (err) {
            this.#logger.error(err);
            throw err;
        }
    }
}

module.exports = MaintenanceProblemIssueService