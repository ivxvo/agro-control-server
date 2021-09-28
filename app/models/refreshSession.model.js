const config = require("../config/auth.config");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, Sequelize) => {
    const RefreshSession = sequelize.define("RefreshSession", {        
        refreshToken: {
            type: Sequelize.UUID,
            allowNull: false
        },
        fingerPrint: {
            type: Sequelize.STRING,
            allowNull: false
        },
        expiryDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
    });

    RefreshSession.createRefreshSession = async function (user, _fingerPrint) {
        let expiredAt = new Date();
        expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);

        let _refreshToken = uuidv4();
        let refreshSession = await this.create({
            refreshToken: _refreshToken,
            fingerPrint: _fingerPrint,
            userId: user.id,
            expiryDate: expiredAt.getTime()
        });

        return refreshSession.refreshToken;
    }

    RefreshSession.checkIsExpired = refreshSession => {
        return refreshSession.expiryDate.getTime() < new Date().getTime();
    };

    return RefreshSession;
};