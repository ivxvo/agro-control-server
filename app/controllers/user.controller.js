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

/////////// Фильтрация пользователей ////////////////////
const approval = ["id", "username", "email", "role"];

const validateFilter = (filter) => {
    for(let field in filter) {
        if(!approval.includes(field)) {
            return false;
        }
    }
    return true;
};

const getCondition = (filter) => {
    let condition = {};
    if(filter.id) {
        condition.id = filter.id;
    }
    if(filter.username) {
        condition.username = { [Op.like]: `%${filter.username}%` };
    }
    if(filter.email) {
        condition.email = { [Op.like]: `%${filter.email}%` };
    }
    if(filter.role) {
        condition["$Role.name$"] = { [Op.like]: `%${filter.role}%` };
    }

    return condition;
};

exports.getUsersAll = (req, res) => {
    const { page, size } = req.query;

    let condition = null;
    if(req.query.filter) {
        const filter = JSON.parse(req.query.filter);

        if(!validateFilter(filter)) {
            res.status(403).send({
                result: globalThis.ReqResult.error,
                message: "Невозможно получение данных по указанному фильтру!"
            });
            return;
        }

        condition = getCondition(filter);
    }

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