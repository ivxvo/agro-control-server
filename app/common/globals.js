// Globals
exports.initGlobals = (global) => {
    // Possible results of http-request for send additional info to client
    global.ReqResult = Object.freeze({
        success: 1,
        error: 2
    });

    global.PermissionSubjects = Object.freeze({
        administration: 1,
        fields: 2,
        cropRotation: 3,
        crop: 4,
        grow: 5
    });
    
    global.PermissionActions = Object.freeze({
        create: 1000,
        read: 2000,
        update: 3000,
        delete: 4000,
        manage: 5000
    });
}