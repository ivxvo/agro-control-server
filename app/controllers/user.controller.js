const sequelize = require("../models").sequelize;
const db = require("../models");
const User = db.user;
const Role = db.role;
const Permission = db.permission;
const Action = db.action;
const Subject = db.subject;

let bcrypt = require("bcryptjs");

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
                    message: "User was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `${err}. Error updating User with id=${id}`
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
                    message: "User was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete User with id=${id}. Maybe User was not found!`
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({
                message: `Cannot delete User with id=${id}`
            });
        });
};

exports.getUsersAll = async (req, res) => {
    let users = await User.findAll({
        include: {
            model: Role,
            required: true,
            through: {
                attributes: []
            },
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
        
    }
    );

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

    res.status(200).send(users);
};

exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
};