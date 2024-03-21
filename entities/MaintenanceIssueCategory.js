
const {Model, DataTypes} = require('sequelize');
const DatabaseEngine = require("../utils/DatabaseEngine");


const dbEngine = new DatabaseEngine();

class MaintenanceIssueCategory extends Model{};

MaintenanceIssueCategory.init({
    Name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: dbEngine.getConnectionManager(),
    timestamps: false
});

module.exports = MaintenanceIssueCategory;