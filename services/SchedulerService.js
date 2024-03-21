const Logger = require("../utils/Logger");
const NotificationService = require("./NotificationService");
const cron = require("node-cron");
const MaintenanceProblemIssueService = require("./dataservices/MaintenanceProblemIssueService");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

let instance;

class SchedulerService {

    #notificationService;
    #maintenanceProblemIssueService;
    #logger;

    constructor () {

        if (instance) return instance;

        this.#logger = new Logger().getLogger();
        this.#maintenanceProblemIssueService = new MaintenanceProblemIssueService();
        this.#notificationService = new NotificationService();

        instance = this;
    }

    start = async () => {
        try {
            cron.schedule('59 23 * * 6', async () => {
                await this.#runTask();
            }, {
                timezone: 'Africa/Lagos'
            });
    
            this.#logger.info(`Scheduler started successfully`);
        } catch (err) {
            this.#logger.error(`Error starting scheduler: ${err.message}`);
        }
    }

    #runTask = async () => {
        try {
            const issues = await this.#getWeeklyIssues();

            const response = await this.#convertDataToExcel(issues);

            const excelContent = fs.readFileSync(response.filePath);

            let reportNotification = {
                recipients: ["bakarepraise3@gmail.com", "bakare.praise@lmu.edu.ng"],
                data: {
                    issues: issues
                },
                attachments: {
                    filename: `Weekly Maintenance Report`,
                    content: excelContent,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'            
                },
            };

            this.#notificationService.sendMaintenanceReport(reportNotification, async resp => {
                if (resp.status == "success") {
                    this.#logger.info(`Report sent successfully`);
                } else {
                    this.#logger.error(`Error sending report: ${resp.message}`);
                }
            });
        } catch (err) {
            this.#logger.error(`Error Running Task: ${err.message}`);
        }
    }

    #getWeeklyIssues = async () => {
        try {
            const date = this.#formatDate();
            const problems = await this.#maintenanceProblemIssueService.getWeeklyIssues(date);

            const issuesPromises = problems.map(async (problem) => {
                return {
                    Webmail: problem.MaintenanceProblem.WebMail,
                    ImageURL: problem.MaintenanceProblem.ImageURL,
                    Room: `${problem.MaintenanceProblem.Hostel} ${problem.MaintenanceProblem.Block} ${problem.MaintenanceProblem.RoomNumber}`,
                    TimeAvailable: this.#getDateStringAndTime(problem.MaintenanceProblem.TimeAvailable),
                    DateComplaintMade: new Date(problem.MaintenanceProblem.DateComplaintMade).toDateString(),
                    IsResolved: problem.MaintenanceProblem.IsResolved ? 'Yes' : 'No',
                    MaintenanceIssue: problem.MaintenanceIssue.Description,
                    MaintenanceIssueCategory: problem.MaintenanceIssue.MaintenanceIssueCategory.Name
                };
            });

            const issues = await Promise.all(issuesPromises);
            return issues;
        } catch (err) {
            this.#logger.error(err);
            throw new Error(err.message);
        }
    }

    #convertDataToExcel = async (data) => {
        try {
            const date = new Date();
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            const filePath = path.join(__dirname, `../reports/report_${formattedDate}.xlsx`);
            
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Reports');

            const headers = Object.keys(data[0]);
            worksheet.addRow(headers);

            data.forEach(row => {
                const values = headers.map(header => row[header]);
                worksheet.addRow(values);
            });

            await workbook.xlsx.writeFile(filePath);
        
            this.#logger.info(`Data converted to excel successfully: report_${formattedDate}.xlsx` );

            return {filePath, formattedDate};
        } catch (err) {
            this.#logger.error(`Error converting data to excel: ${err.message}`);
            throw new Error(err.message);
        }
    }

    #formatDate = () => {
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
    
        const formattedDay = day < 10 ? `0${day}` : day;
        const formattedMonth = month < 10 ? `0${month}` : month;
    
        return `${year}-${formattedMonth}-${formattedDay}`;
    }

    #getDateStringAndTime = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getHours();
        const isPM = hours >= 12;
        const amPM = isPM ? 'PM' : 'AM';
        const adjustedHours = isPM ? hours - 12 : hours;
        
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
    
        return `${date.toLocaleDateString('en-US', options)}`;
    }
}

module.exports = SchedulerService;
