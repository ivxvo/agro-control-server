module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define("Role", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        permissions: {
            type: Sequelize.JSON,
            allowNull: true // fix
        }
    }, {
        paranoid: true
    });

    return Role;
};