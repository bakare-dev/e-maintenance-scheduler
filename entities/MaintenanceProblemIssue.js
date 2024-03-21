
const {Model, DataTypes} = require('sequelize');
const DatabaseEngine = require("../utils/DatabaseEngine");
const MaintenanceProblem = require('./MaintenanceProblem');
const MaintenanceIssue = require('./MaintenanceIssue');


const dbEngine = new DatabaseEngine();

class MaintenanceProblemIssue extends Model{};

MaintenanceProblemIssue.init({
    
}, {
    sequelize: dbEngine.getConnectionManager(),
    modelName: 'MaintenanceProblemIssue',
    timestamps: false
});

MaintenanceProblem.hasOne(MaintenanceProblemIssue, {
    foreignKey: {
        allowNull: false
    }
})
MaintenanceProblemIssue.belongsTo(MaintenanceProblem);

MaintenanceIssue.hasMany(MaintenanceProblemIssue, {
    foreignKey: {
        allowNull: false
    }
})
MaintenanceProblemIssue.belongsTo(MaintenanceIssue);

module.exports = MaintenanceProblemIssue;