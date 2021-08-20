// Globals
exports.initGlobals = (global) => {
    // Possible results of http-request for send additional info to client
    global.ReqResult = Object.freeze({
        success: 1,
        error: 2
    });

    
}