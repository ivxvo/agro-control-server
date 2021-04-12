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

db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
db.user = require("./user.model.js")(sequelize, Sequelize);
db.role = require("./role.model.js")(sequelize, Sequelize);
db.permission = require("./permission.model.js")(sequelize, Sequelize);
db.action = require("./permissionAction.model.js")(sequelize, Sequelize);
db.subject = require("./permissionSubject.model.js")(sequelize, Sequelize);

// Subject (one-to-many) Permission
db.subject.hasMany(db.permission, {
    foreignKey: {
        name: "subjectId",
        allowNull: false
    }
});
db.permission.belongsTo(db.subject, {
    foreignKey: {
        name: "subjectId",
        allowNull: false
    }
});

// Action (one-to-many) Permission
db.action.hasMany(db.permission, {
    foreignKey: {
        name: "actionId",
        allowNull: false
    }
});
db.permission.belongsTo(db.action, {
    foreignKey: {
        name: "actionId",
        allowNull: false
    }
});

// RoleToUser: Role (many-to-many) User
db.user.belongsToMany(db.role, {
    through: "RoleToUser",
    foreignKey: "userId",
    otherKey: "roleId"
});

db.role.belongsToMany(db.user, {
    through: "RoleToUser",
    foreignKey: "roleId",
    otherKey: "userId"
});

// PermissionToRole: Permission (many-to-many) Role
db.permission.belongsToMany(db.role, {
    through: "PermissionToRole",
    foreignKey: "permissionId",
    otherKey: "roleId"
});

db.role.belongsToMany(db.permission, {
    through: "PermissionToRole",
    foreignKey: "roleId",
    otherKey: "permissionId"
});

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;