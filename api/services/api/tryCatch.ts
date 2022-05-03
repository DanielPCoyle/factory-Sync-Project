import util from 'util';
import fs from "fs";
import path from "path"
const appendFile = util.promisify(fs.appendFile);

export const tryCatch = async (func, res, message = "Something went wrong with your request.") => {
    try {
        return await func();
    } catch (error:any) {
        process.env.NODE_ENV !== "production" && console.log("ERROR!!::",error )
        message = error.message ?? message
        appendFile(path.resolve("./api/logs/access.logs"), "ROUTE ERROR:"+JSON.stringify(error))
        console.log("MESSAGE>>>>",message)
        return res.status(403).json({ status: "error", message });
    }
};
