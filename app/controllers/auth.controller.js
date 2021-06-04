const db = require("../models");
const config = require("../config/auth.config.js");
const User = db.user;
const Role = db.user.role;

const Op = db.Sequelize.Op;

let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
    // Save User to Database
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        roleId: 1 // fix
    })
        .then(() => {
            res.send({
                result: globalThis.ReqResult.success,
                message: `Пользователь '${req.body.username}' успешно создан.`
            });
        })
        // .then(user => {
        //     if(req.body.role) {
        //         Role.findOne({
        //             where: {
        //                 name: req.body.role                        
        //             }
        //         }).then(role => {
        //             user.setRole(role).then(() => {
        //                 res.send({
        //                     message: "User was registered successfully!"
        //                 });
        //             });
        //         });
        //     } else {
        //         // user role = 1
        //         user.setRole([1]).then(() => {
        //             res.send({
        //                 message: "User was registered successfully!"
        //             });
        //         });
        //     }
        // })
       
        .catch(err => {
            res.status(500).send({
                result: globalThis.ReqResult.error,
                message: `Не удалось создать пользователя '${req.body.username}'.\r\n${err.message}`
            });
        });
};

exports.signin = (req, res) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    })
    .then(user => {
        if(!user) {
            return res.send({
                result: globalThis.ReqResult.error,
                message: `Пользователь '${req.body.username}' не найден!`
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
                message: "Неверный пароль!"
            });
        }

        let token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400 // 24 hours
        });

        let authorities = [];
        user.getRole().then(role => {
            // for(let i = 0; i < roles.length; i++) {
            //     authorities.push("ROLE_", + roles[i].name.toUpperCase());
            // }
            res.status(200).send({
                result: globalThis.ReqResult.success,
                message: `Пользователь '${req.body.username}' успешно авторизован.`,
                id: user.id,
                username: user.username,
                email: user.email,
                role: role.name,
                accessToken: token
            });
        });
    })
    .catch(err => {
        res.status(500).send({
            result: globalThis.ReqResult.error,
            message: err.message
        });
    });
};

exports.verify = (req, res) => {
    res.status(200).send({
        result: globalThis.ReqResult.success,
        message: `Валидный токен доступа пользователя '${req.body.username}'.`
    });
};