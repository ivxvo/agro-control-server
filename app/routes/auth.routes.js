const { verifySignUp, authJwt } = require("../middleware");
const controller = require("../controllers/auth.controller.js");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/auth/signup",
        [
            authJwt.verifyToken,
            authJwt.isExistUser,
            verifySignUp.checkDuplicateUsernameOrEmail,
            verifySignUp.checkRolesExisted
        ],
        controller.signup
    );

    app.post("/api/auth/signin", controller.signin);

    app.get("/api/auth/verify",
        [
            authJwt.verifyToken,
            authJwt.isExistUser
        ],
        controller.getCredentials
    );

    app.post("/api/auth/refreshsession", controller.refreshSession);
    
};