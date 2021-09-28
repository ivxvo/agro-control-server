const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

const { TokenExpiredError } = jwt;

const db = require("../models");
const User = db.user;
const Role = db.role;

const catchError = (err, res) => {
    if(err instanceof TokenExpiredError) {
        return res.status(401).send({
            result: globalThis.ReqResult.error,
            message: "Авторизация не пройдена. Истёк срок действия токена доступа"
        });
    }

    return res.status(401).send({
        result: globalThis.ReqResult.error,
        message: "Авторизация не пройдена"
    });
};

const verifyToken = (req, res, next) => {    
    let token = req.headers["x-access-token"];

    if(!token) {
        return res.status(401).send({
            result: globalThis.ReqResult.error,
            message: "Не предоставлен токен доступа"
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) {
            return catchError(err, res);
        }
        req.userId = decoded.id;
        next();
    });
};

const checkPermission = (action, subject) => {
    return async (req, res, next) => {
        const user = await User.findByPk(req.userId, {
            attributes: [],
            include: {
                model: Role,
                attributes: ["permissions"],
                required: true
            }
        });

        if(!user.Role.permissions.includes(action + subject)) {
            return res.status(403).send({
                result: globalThis.ReqResult.error,
                message: "Отсутствует право доступа"
            });
        }

        next();
    }
};

const isExistUser = (req, res, next) => {
    User.findByPk(req.userId)
        .then((user) => {
            if(user) {
                next();
            } else {
                return res.status(410).send({
                    result: globalThis.ReqResult.error,
                    message: "Пользователь не зарегистрирован в системе"
                });
            }
        },
        () => {
            return res.status(500).send({
                result: globalThis.ReqResult.error,
                message: "Не удалось получить данные о пользователе"
            });
        });
};

const authJwt = {
    verifyToken: verifyToken,
    checkPermission: checkPermission,
    isExistUser: isExistUser   
};

module.exports = authJwt;