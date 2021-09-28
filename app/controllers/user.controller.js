const db = require("../models");

const Op = db.Sequelize.Op;

const User = db.user;
const Role = db.role;
const Permission = db.permission;
const Action = db.action;
const Subject = db.subject;

let bcrypt = require("bcryptjs");

const { getPagination, getPagingData } = require("../common/pagination");

const { validateFilter, getFilteredProperty } = require("../common/dropdownFiltering");

exports.getUserById = (req, res) => {
    const id = req.params.id;

    User.findByPk(id, {
        attributes: ["id", "username", "email", "roleId"]
    })
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

// function getFilteredProperty(params) {
//     const { model, include, limit, field, searchValue } = params;

//     const condition = {};
//     condition[field] = { [Op.like]: `%${searchValue}%` };

//     return model.findAll({
//         limit: limit,
//         order: [[field, "ASC"]],
//         where: condition,
//         attributes: ["id", [field, "name"]],
//         include: {
//             model: include.required,
//             required: true,
//             attributes: []
//         }
//     });        
// }

////////// Фильтрация для получения выпадающего списка //////////
const approvalDropdown = ["username", "email", "name"];

exports.getFilteredUserProperty = (req, res) => {
    const { model, field, value, limit } = req.query;

    if(!approvalDropdown.includes(field)) {
        res.send({
            result: globalThis.ReqResult.error,
            message: 'Фильтрация по атрибуту невозможна'
        });
    }

    let params = {        
        limit: limit,
        field: field,
        searchValue: value
    };
    
    if(model === "User") {
        params.model = User;
        params.include = {
            model: Role           
        };
    } else if(model === "Role") {
        params.model = Role;
        params.include = {
            model: User            
        };
    }

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
                    message: "Не удалось обновить пользователя"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                result: globalThis.ReqResult.error,
                message: "Ошибка обновления пользователя"
            });
        });
};

exports.deleteUser = (req, res) => {
    const id = req.params.id;
    const user = req.query;

    User.destroy({
        where: {id: id}
    })
        .then(num => {
            if(num == 1) {
                res.send({
                    result: globalThis.ReqResult.success,                    
                    message: `Пользователь '${user.username}' успешно удалён`
                });
            } else {
                res.send({
                    result: globalThis.ReqResult.error,
                    message: `Не удалось удалить пользователя '${user.username}'`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                result: globalThis.ReqResult.error,                
                message: `Ошибка удаления пользователя '${user.username}'`
            });
        });
};

/////////// Фильтрация пользователей ////////////////////
const approval = ["userId", "roleId"];

function getCondition(filter) {
    let condition = {};
    
    if(filter.userId) {
        condition.id = filter.userId;
    }   

    if(filter.roleId) {
        condition["$Role.id$"] = filter.roleId;
        
        // else {
        //     condition["$Role.name$"] = { [Op.like]: `%${filter.role}%` };
        // }
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
        let filter = JSON.parse(req.query.filter);        
        validateFilter(filter, approval);
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
                message: "Не удалось получить пользователей"
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