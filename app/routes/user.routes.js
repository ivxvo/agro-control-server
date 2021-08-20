const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    
    app.get("/api/admin/users", 
        [authJwt.verifyToken],
        controller.getUsersAll
    );
    
    app.get("/api/admin/user/:id", 
        [authJwt.verifyToken],
        controller.getUserById
    );

    app.put("/api/admin/user/:id", 
        [authJwt.verifyToken],
        controller.updateUser
    );

    app.delete("/api/admin/user/:id", 
        [authJwt.verifyToken],
        controller.deleteUser
    );

    app.get("/api/admin/users/filtered",
        [authJwt.verifyToken],
        controller.getFilteredUserProperty
    );

    // app.get("/api/users/roles/filtered",
    //     [authJwt.verifyToken],
    //     controller.getFilteredUserRoleProperty
    // );
};