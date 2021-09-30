const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

let corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// globals
const { initGlobals } = require("./app/common/globals.js");
initGlobals(globalThis);

// db //
const db = require("./app/models");
db.sequelize.sync();

// // In development, you may need to drop existing tables and re-sync database. Just use 'force: true'
// db.sequelize.sync({ force: true }).then(() => {
//     console.log("Drop and re-sync db.");
// })

/// db ///

// API //

// API/auth
require("./app/routes/auth.routes.js")(app);

// API/user
require("./app/routes/user.routes.js")(app);

// API/role
require("./app/routes/role.routes.js")(app);

/// API ///

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})