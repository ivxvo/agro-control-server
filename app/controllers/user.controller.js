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

exports.getUserById = (req, res) => {
    const id = req.params.id;

    User.findByPk(id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                result: globalThis.ReqResult.error,
                message: `Не удалось получить данные пользователя по id=${id}`
            });
        });
};

function getFilteredProperty(params) {
    const { model, limit, field, searchValue } = params;

    const condition = {};
    condition[field] = { [Op.like]: `%${searchValue}%` };

    return model.findAll({
        limit: limit,
        order: [[field, "ASC"]],
        where: condition,
        attributes: ["id", [field, "name"]],
        include: {
            model: Role,
            required: true,
            attributes: []
        }
    });        
}

exports.getFilteredUserProperty = (req, res) => {
    const params = {
        model: User,
        limit: req.query.limit,
        field: req.query.field,
        searchValue: req.query.searchValue
    };
    getFilteredProperty(params)
        .then(data => {
            res.send(data);
        })
        .catch(() => {
            res.status(500).send({
                result: globalThis.ReqResult.error,
                message: 'Не удалось получить данные пользователя по атрибуту'
            });
        });
}

// exports.getFilteredUserProperty = (req, res) => {
//     const { limit, field, searchValue } = req.query;

//     const condition = {};
//     condition[field] = { [Op.like]: `%${searchValue}%` };

//     User.findAll({
//         limit: limit,
//         order: [[field, "ASC"]],
//         where: condition,
//         attributes: ["id", [field, "name"]],
//         include: {
//             model: Role,
//             required: true
//         }
//     })
//         .then(data => {
//             res.send(data);
//         })
//         .catch(() => {
//             res.status(500).send({
//                 result: globalThis.ReqResult.error,
//                 message: 'Не удалось получить данные по атрибуту'
//             });
//         });
    
// };

// exports.getFilteredUserRoleProperty = (req, res) => {
//     const { limit, field, searchValue } = req.query;

//     const condition = {};
//     condition[field] = { [Op.like]: `%${searchValue}%` };
    
//     Role.findAll({
//         limit: limit,
//         order: [[field, "ASC"]],
//         where: condition,
//         attributes: ["id", [field, "name"]],
//         include: {
//             model: User,
//             required: true,
//         }
//     })
//         .then(data => {
//             res.send(data);
//         })
//         .catch(() => {
//             res.status(500).send({
//                 result: globalThis.ReqResult.error,
//                 message: "Не удалось получить данные по атрибуту 'Роль'"
//             });
//         });
// };

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
                    message: `Пользователь '${user.username}' успешно обновлён`
                });
            } else {
                res.send({
                    result: globalThis.ReqResult.error,
                    message: `Не удалось обновить пользователя '${user.username}'`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                result: globalThis.ReqResult.error,
                message: `Ошибка обновления пользователя '${user.username}'`
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
                    message: `Пользователь (id=${id}) успешно удалён`
                });
            } else {
                res.send({
                    result: globalThis.ReqResult.error,
                    message: `Не удалось удалить пользователя (id=${id})`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                result: globalThis.ReqResult.error,                
                message: `Ошибка удаления пользователя (id=${id})`
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

// Сортировка пользователей
const getFormattedOrder = (sort) => {
    let order = [];

    if(sort.id) {
        order.push(sort.id);
    }
    if(sort.username) {
        order.push(sort.username);
    }
    if(sort.email) {
        order.push(sort.email);
    }
    if(sort.role) {
        let association = sort.role.slice();
        association.unshift(User.associations.Role);
        order.push(association);
    }

    return order;
};

exports.getUsersAll = (req, res) => {
    const { page, size } = req.query;

    let condition = null;
    if(req.query.filter) {
        const filter = JSON.parse(req.query.filter);

        if(!validateFilter(filter)) {
            res.status(403).send({
                result: globalThis.ReqResult.error,
                message: "Невозможно получение данных по указанному фильтру"
            });
            return;
        }

        condition = getCondition(filter);
    }

    let formattedOrder = null;
    if(req.query.order) {
        const order = JSON.parse(req.query.order);
        formattedOrder = getFormattedOrder(order);
    }

    const { limit, offset } = getPagination(page, size);

    User.findAndCountAll({
        order: formattedOrder,
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
                message: `Не удалось получить пользователей`
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