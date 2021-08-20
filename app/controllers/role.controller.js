const db = require("../models");
const Op = db.Sequelize.Op;

const Role = db.role;
const Permission = db.permission;
const Action = db.action;
const Subject = db.subject;

const { validateFilter, getFilteredProperty } = require("../common/dropdownFiltering");

//////////// Filtering ///////////////////
const approval = ["roleId"];

exports.getAllRoles = (req, res) => {
    let condition = null;
    if(req.query.filter) {
        let filter = JSON.parse(req.query.filter);
        validateFilter(filter, approval);
        condition = getCondition(filter);
    }

    Role.findAll({       
        attributes: [["id", "value"], ["name", "label"]],
        where: condition
    }).then(
        data => {
            res.send(data);
        },
        () => {
            res.status(500).send({
                result: globalThis.ReqResult.error,
                message: "Не удалось получить список ролей"
            });
        }
    );
};

exports.addRole = (req, res) => {
    // Save Role to Database

    const { name } = req.body;

    Role.create({
        name: name        
    })
        .then(() => {
            res.send({
                result: globalThis.ReqResult.success,
                message: `Роль '${name}' успешно создана.`
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
            console.log(err);
            res.status(500).send({
                result: globalThis.ReqResult.error,
                message: `Не удалось создать роль '${name}'`
            });
        });
};

exports.updateRole = (req, res) => {
    const id = req.params.id;

    const { name } = req.body;
    
    Role.update({ name: name },
    { where: { id: id } })
        .then(num => {
            if (num == 1) {
                res.send({
                    result: globalThis.ReqResult.success,
                    message: `Роль '${name}' успешно обновлена`
                });
            } else {
                res.send({
                    result: globalThis.ReqResult.error,
                    message: `Не удалось обновить роль '${name}'`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                result: globalThis.ReqResult.error,
                message: `Ошибка обновления роли '${name}'`
            });
        });
};

exports.deleteRole = (req, res) => {
    const id = req.params.id;
    const { name } = req.query;

    Role.destroy({
        where: {id: id}
    })
        .then(num => {
            if(num == 1) {
                res.send({
                    result: globalThis.ReqResult.success,                    
                    message: `Роль '${name}' успешно удалена`
                });
            } else {
                res.send({
                    result: globalThis.ReqResult.error,
                    message: `Не удалось удалить роль '${name}'`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                result: globalThis.ReqResult.error,                
                message: `Ошибка удаления роли '${name}'`
            });
        });
};

function getCondition(filter) {
    let condition = {};
    
    if(filter.roleId) {
        condition.id = filter.roleId;
    }   

    return condition;
};

exports.getFilteredRoleProperty = (req, res) => {
    const { field, value, limit } = req.query;
    const params = {
        model: Role,
        include: null,
        limit: limit,
        field: field,
        searchValue: value
    };

    getFilteredProperty(params)
        .then(data => {
            res.send(data);
        })
        .catch(() => {
            res.status(500).send({
                result: globalThis.ReqResult.error,
                message: 'Не удалось получить данные роли по атрибуту'
            });
        });
};