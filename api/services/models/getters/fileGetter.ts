import path from "path";
const env = require(path.resolve(`./src/__core/env/${process.env.NODE_ENV ?? "development"}.json`))
export default (rawValue)=>{
    return rawValue?.replace('./uploads',env.api_url+"/__file__")
}