const sequelize = require("../models").sequelize;
const db = require("../models");

const Op = db.Sequelize.Op;

const User = db.user;
const Role = db.role;
const Permission = db.permission;
const Action = db.action;
const Subject = db.subject;

let bcrypt = require("bcryptjs");

const { getPagination, getPagingData } = require("../common/pagination");

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
    const id = req.params.id;

    User.findByPk(id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: `Error retrieving User with id=${id}`
            });
        });

    // res.status(200).send("User Content.");
};

exports.updateUser = (req, res) => {
    const id = req.params.id;

    let user = {
        username: req.body.username,
        email: req.body.email
    };
    if(req.body.password) {
        user["password"] = bcrypt.hashSync(req.body.password, 8);        
    }

    User.update(user,
    { where: { id: id } })
        .then(num => {
            if (num == 1) {
                res.send({
                    result: globalThis.ReqResult.success,
                    message: `Пользователь '${user.username}' успешно обновлён.`
                });
            } else {
                res.send({
                    result: globalThis.ReqResult.error,
                    message: `Не удалось обновить пользователя '${user.username}'. Возможно пользователь не найден или данные запроса отсутствуют!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                result: globalThis.ReqResult.error,
                message: `Ошибка обновления пользователя '${user.username}'.\r\n${err.message}`
            });
        });
};

exports.deleteUser = (req, res) => {
    const id = req.params.id;

    User.destroy({
        where: {id: id}
    })
        .then(num => {
            if(num == 1) {
                res.send({
                    result: globalThis.ReqResult.success,                    
                    message: `Пользователь (id=${id}) успешно удалён.`
                });
            } else {
                res.send({
                    result: globalThis.ReqResult.error,
                    message: `Не удалось удалить пользователя (id=${id}). Возможно пользователь не найден!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                result: globalThis.ReqResult.error,                
                message: `Ошибка удаления пользователя (id=${id}).\r\n${err}`
            });
        });
};

exports.getUsersAll = (req, res) => {
    const { filter, page, size } = req.query;

    let condition = filter ? { field: { [Op.like]: `%${filter}%` } } : null; // fix

    const { limit, offset } = getPagination(page, size);

    User.findAndCountAll({
        where: condition,
        limit: limit,
        offset: offset,
        attributes: ["id", "username", "email"],
        include: {
            model: Role,
            attributes: ["name"],
            required: true,
            
            // include: {
            //     model: Permission,
            //     required: true,
            //     through: {
            //         attributes: []
            //     },
            //     include: 
            //     [
            //         {
            //             model: Action,
            //             // required: true
            //         },
            //         {
            //             model: Subject,
            //             // required: true
            //         }
            //     ]
            // }
        }
        
    })
        .then(data => {
            const pagingData = getPagingData(data, page, limit);
            res.send(pagingData);
            // res.send(data);

        })
        .catch(err => {
            res.status(500).send({
                result: globalThis.ReqResult.error,
                message: `Не удалось получить пользователей.\r\n${err}`
            });
        });

    // let usersForView = JSON.parse(JSON.stringify(users));
    // for(let user of usersForView) {
    //     user.role = user.role.name;
    // }

    // console.log(`users: ${JSON.stringify(usersForView)}`);

    // let permissions = await Permission.findOne({
    //     include: 
    //         [
    //             {
    //                 model: Action,
    //                 required: true
    //             },
    //             {
    //                 model: Subject,
    //                 required: true
    //             },
    //             {
    //                 model: Role,
    //                 required: true,
    //                 through: {
    //                     attributes: []
    //                 },
    //                 include: {
    //                     model: User,
    //                     required: true,
    //                     through: {
    //                         attributes: []
    //                     }
    //                 }
    //             }                
    //         ]
        
    // });

    // const users = await User.findAll({
    //     attributes: ["id", "username", "email"],
    //     include: {
    //         model: Role,
    //         attributes: ["name"],
    //         required: true,                      
    //     }        
    // });

    // res.status(200).send(users);
};

exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
};