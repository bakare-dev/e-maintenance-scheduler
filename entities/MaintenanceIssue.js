
const {Model, DataTypes} = require('sequelize');
const DatabaseEngine = require("../utils/DatabaseEngine");
const MaintenanceIssueCategory = require('./MaintenanceIssueCategory');


const dbEngine = new DatabaseEngine();

class MaintenanceIssue extends Model{};

MaintenanceIssue.init({
    Description: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    },
}, {
    sequelize: dbEngine.getConnectionManager(),
    timestamps: false
});

MaintenanceIssueCategory.hasMany(MaintenanceIssue, {
    foreignKey: {
        allowNull: false
    }
});
MaintenanceIssue.belongsTo(MaintenanceIssueCategory);

module.exports = MaintenanceIssue;