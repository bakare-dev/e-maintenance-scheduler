const Service = require("./Service");
const MaintenanceProblemIssueEntity = require("../../entities/MaintenanceProblemIssue");
const Logger = require("../../utils/Logger");
const { QueryTypes } = require('sequelize');
const DatabaseEngine = require('../../utils/DatabaseEngine');

let instance;

class MaintenanceProblemIssueService extends Service {

    #logger;
    #db;

    constructor () {

        if (instance) return instance;

        super(MaintenanceProblemIssueEntity);
        this.#logger = new Logger().getLogger();
        this.#db = new DatabaseEngine().getConnectionManager();

        instance = this;
    }

    getWeeklyIssues = async (givenDate) => {
        try {
            const startDate = new Date(givenDate);
            startDate.setDate(startDate.getDate() - 7);
            const endDate = new Date(givenDate);
    
            const query = `
                SELECT mpi.id AS mpi_id, mpi.MaintenanceProblemId, mpi.MaintenanceIssueId, 
                mp.id AS mp_id, mp.WebMail, mp.ImageURL, mp.Block, mp.Hostel, mp.RoomNumber, 
                mp.TimeAvailable, mp.DateComplaintMade, mp.IsResolved, 
                mi.id AS mi_id, mi.Description, mi.MaintenanceIssueCategoryId, 
                mic.id AS mic_id, mic.Name AS CategoryName
                FROM MaintenanceProblemIssues AS mpi
                INNER JOIN MaintenanceProblems AS mp ON mpi.MaintenanceProblemId = mp.id 
                    AND mp.DateComplaintMade BETWEEN :startDate AND :endDate
                LEFT OUTER JOIN MaintenanceIssues AS mi ON mpi.MaintenanceIssueId = mi.id
                LEFT OUTER JOIN MaintenanceIssueCategories AS mic ON mi.MaintenanceIssueCategoryId = mic.id
                ORDER BY mp.DateComplaintMade ASC;
            `;
            
            const weeklyIssues = await this.#db.query(query, {
                type: QueryTypes.SELECT,
                replacements: { startDate, endDate }
            });
    
            return weeklyIssues;
        } catch (err) {
            this.#logger.error(err);
            throw err;
        }
    }
}

module.exports = MaintenanceProblemIssueService