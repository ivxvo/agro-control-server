module.exports = (sequelize, Sequelize) => {
    const PermissionSubject = sequelize.define("PermissionSubject", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
        paranoid: true
    });

    return PermissionSubject;
}