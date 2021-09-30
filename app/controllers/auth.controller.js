const db = require("../models");
const config = require("../config/auth.config.js");
const { user: User, refreshSession: RefreshSession} = db;

let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
    // Save User to Database
    const { username, email, password, roleId } = req.body;
    User.create({
        username: username,
        email: email,
        password: bcrypt.hashSync(password, 8),
        roleId: roleId
    })
        .then(() => {
            res.send({
                result: globalThis.ReqResult.success,
                message: `Пользователь '${req.body.username}' успешно создан`
            });
        })              
        .catch(err => {
            console.log(err);
            res.status(500).send({
                result: globalThis.ReqResult.error,
                message: `Не удалось создать пользователя '${req.body.username}'`
            });
        });
};

exports.signin = (req, res) => {
    const { username: paramUsername, fingerPrint } =  req.body;

    User.findOne({
        where: {
            username: paramUsername
        }
    })
    .then(async user => {
        if(!user) {
            return res.send({
                result: globalThis.ReqResult.error,
                message: `Пользователь '${paramUsername}' не найден`
            });
        }    

        let passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if(!passwordIsValid) {
            return res.status(401).send({
                result: globalThis.ReqResult.error,
                accessToken: null,
                message: "Неверный пароль"
            });
        }

        let expiredAt = new Date();
        expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtExpiration);

        const token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: config.jwtExpiration
        });
        

        let refreshSession = await RefreshSession.createRefreshSession(user, fingerPrint);          
        let role = await user.getRole();

        res.status(200).send({     
            id: user.id,
            username: user.username,
            email: user.email,
            role: role.name,
            permissions: role.permissions,                      
            accessToken: token,
            expiryDate: expiredAt.getTime(),
            refreshToken: refreshSession.refreshToken
        });
    })
    .catch(err => {
        res.status(500).send({
            result: globalThis.ReqResult.error,
            message: err.message
        });
    });
};

exports.refreshSession = async (req, res) => {
    const { refreshToken: requestToken, fingerPrint: requestPrint } = req.body;

    if(!requestToken) {
        return res.status(403).json({
            result: globalThis.ReqResult.error,
            message: "Для продолжения работы требуется токен обновления"
        });
    }
    if(!requestPrint) {
        return res.status(403).json({
            result: globalThis.ReqResult.error,
            message: "Для продолжения работы требуется идентификация клиентского приложения"
        });
    }

    try {
        let refreshSession =  await RefreshSession.findOne({
            where: {
                refreshToken: requestToken
            }
        });

        if(!refreshSession) {
            return res.status(401).json({
                result: globalThis.ReqResult.error,
                message: "Токен обновления не найден"
            });
        }

        RefreshSession.destroy({
            where: {
                id: refreshSession.id
            }
        });

        if(RefreshSession.checkIsExpired(refreshSession)) {
            return res.status(401).json({
                result: globalThis.ReqResult.error,
                message: "Истёк сеанс работы в системе. Пожалуйста, авторизуйтесь..."
            });
        }

        if(refreshSession.fingerPrint !== requestPrint) {
            return res.status(403).json({
                result: globalThis.ReqResult.error,
                message: "Неверный идентификатор клиентского приложения"
            });
        }

        const user = await refreshSession.getUser();

        let expiredAt = new Date();
        expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtExpiration);

        const token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: config.jwtExpiration
        });

        let newRefreshSession = await RefreshSession.createRefreshSession(user, requestPrint);

        user.getRole().then(role => {            
            res.status(200).json({                
                id: user.id,
                username: user.username,
                email: user.email,
                role: role.name,
                permissions: role.permissions,
                accessToken: token,
                expiryDate: expiredAt.getTime(),
                refreshToken: newRefreshSession.refreshToken
            });
        });

    } catch(err) {
        return res.status(500).send({
            result: globalThis.ReqResult.error,
            message: "Не удалось продлить сеанс работы в системе. Пожалуйста, авторизуйтесь..."
        });
    }
};

exports.getCredentials = async (req, res) => {   
    const user = await User.findByPk(req.userId);

    if(!user) {
        return res.status(410).send({
            result: globalThis.ReqResult.error,
            message: "Пользователь не зарегистрирован в системе"
        });
    };

    const role = await user.getRole();

    res.status(200).send({
        username: user.username,
        email: user.email,
        role: role.name,
        permissions: role.permissions      
    });
};