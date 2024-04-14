const Logger = require("../utils/Logger");
const NotificationService = require("./NotificationService");
const cron = require("node-cron");
const MaintenanceProblemIssueService = require("./dataservices/MaintenanceProblemIssueService");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const { infrastructure } = require("../config/main.settings");

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
            const hostelGroups = await this.#getWeeklyIssues();
            const attachments = [];

            for (const hostel of Object.keys(hostelGroups)) {
                const issues = hostelGroups[hostel];
                const response = await this.#convertDataToExcel(issues, hostel);
                const excelContent = fs.readFileSync(response.filePath);

                const attachment = {
                    filename: `${hostel} Weekly Maintenance Report`,
                    content: excelContent,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                };

                attachments.push(attachment);
            }

            let reportNotification = {
                recipients: [infrastructure.recievers.admin, infrastructure.recievers.support],
                data: {
                    hostelGroups: hostelGroups
                },
                attachments: attachments,
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

            return this.#groupByHostel(problems);
        } catch (err) {
            this.#logger.error(err);
            throw new Error(err.message);
        }
    }

    #groupByHostel = (array) => {
        return array.reduce((acc, problem) => {
            const hostel = problem.Hostel;
            if (!acc[hostel]) {
              acc[hostel] = [];
            }
            acc[hostel].push({
              Webmail: problem.WebMail,
              Hostel: problem.Hostel,
              Room: `${problem.Block} ${problem.RoomNumber}`,
              TimeAvailable: this.#getDateStringAndTime(problem.TimeAvailable),
              DateComplaintMade: new Date(problem.DateComplaintMade).toDateString(),
              MaintenanceIssue: problem.Description,
            });
            return acc;
        }, {});
    }

    #convertDataToExcel = async (data, hall) => {
        try {
            const date = new Date();
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            const filePath = path.join(__dirname, `../reports/${hall}_report_${formattedDate}.xlsx`);
            
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Reports');

            const headers = Object.keys(data[0]);
            worksheet.addRow(headers);

            data.forEach(row => {
                const values = headers.map(header => row[header]);
                worksheet.addRow(values);
            });

            await workbook.xlsx.writeFile(filePath);
        
            this.#logger.info(`Data converted to excel successfully: ${hall}_report_${formattedDate}.xlsx` );

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
