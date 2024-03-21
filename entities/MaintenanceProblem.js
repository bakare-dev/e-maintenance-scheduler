
const {Model, DataTypes} = require('sequelize');
const DatabaseEngine = require("../utils/DatabaseEngine");
const MaintenanceIssue = require('./MaintenanceIssue');


const dbEngine = new DatabaseEngine();

class MaintenanceProblem extends Model{};

MaintenanceProblem.init({
    WebMail: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    ImageURL: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    Block: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    Hostel: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    RoomNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 100,
            max: 999
        }
    },
    TimeAvailable: {
        type: DataTypes.DATE,
        allowNull: true
    },
    DateComplaintMade: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    IsResolved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize: dbEngine.getConnectionManager(),
    timestamps: false
});

module.exports = MaintenanceProblem;