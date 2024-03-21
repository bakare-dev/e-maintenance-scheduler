const Mailer = require("../utils/Mailer");

let instance;
class Service {

    #mailer;

    constructor() {

        if (instance) return instance;

        this.#mailer = new Mailer();

        instance = this;

    }

    sendMaintenanceReport = async (message, callback) => {

       
        message.recipients.forEach(async (item) => {

            let info = {
                sender: "noreply@lmu.edu.ng",
                templateFile: "report.ejs",
                subject: "Weekly Maintenance Report",
                recipients: item,
                data: message.data,
                attachments: message.attachments
            }

            this.#mailer.sendMail(info, (response) => {
                callback(response);
            })

        })


    }
}

module.exports = Service;