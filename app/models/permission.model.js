// const subject = require("./permissionSubject.model");
// const action = require("./permissionAction.model");

module.exports = (sequelize, Sequelize) => {
    // const PermissionSubject = subject(sequelize, Sequelize);
    // const PermissionAction = action(sequelize, Sequelize);
    const Permission = sequelize.define("Permission", {
        // id: {
        //     type: Sequelize.INTEGER,
        //     primaryKey: true,
        //     autoIncrement: true
        // },
        description: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // subjectId: {
        //     type: Sequelize.INTEGER,
        //     references: {
        //         model: PermissionSubject,
        //         key: "id"
        //     }
        // },
        // actionId: {
        //     type: Sequelize.INTEGER,
        //     references: {
        //         model: PermissionAction,
        //         key: "id"
        //     }
        // }
    }, {
        paranoid: true
    });

    // subject.belongsToMany(action, )

    return Permission;
}