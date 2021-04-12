module.exports = (sequelize, Sequelize) => {
    const PermissionAction = sequelize.define("PermissionAction", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
        paranoid: true
    });

    return PermissionAction;
}