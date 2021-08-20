const { authJwt } = require("../middleware");
const controller = require("../controllers/role.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    
    app.get("/api/admin/roles", 
        [authJwt.verifyToken],
        controller.getAllRoles
    );
    
    app.post("/api/admin/role", 
        [authJwt.verifyToken],
        controller.addRole
    );
    
    app.put("/api/admin/role/:id", 
        [authJwt.verifyToken],
        controller.updateRole
    );

    app.delete("/api/admin/role/:id", 
        [authJwt.verifyToken],
        controller.deleteRole
    );

    app.get("/api/admin/roles/filtered", 
        [authJwt.verifyToken],
        controller.getFilteredRoleProperty
    );
};