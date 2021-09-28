const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: 0,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    },
    define: {
        freezeTableName: true
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model")(sequelize, Sequelize);
db.role = require("./role.model")(sequelize, Sequelize);
db.refreshSession = require("./refreshSession.model")(sequelize, Sequelize);

db.refreshSession.belongsTo(db.user, {
    foreignKey: "userId",
    targetKey: "id"
});

db.user.hasOne(db.refreshSession, {
    foreignKey: "userId",
    targetKey: "id"
});

// RoleToUser: Role (one-to-many) User
db.role.hasMany(db.user, {
    foreignKey: {
        name: "roleId",
        allowNull: false
    }
});

db.user.belongsTo(db.role, {
    foreignKey: {
        name: "roleId",
        allowNull: false
    }
});

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;