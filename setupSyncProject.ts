    const fs = require( "fs" );
    const path = require( "path" );

    const createDirIfNone = (dir:string)=>{
        if( !fs.existsSync(dir) ){
            fs.mkdirSync(dir);
            console.log("created "+dir+" directory");
        }
    }

    createDirIfNone("./api");
    
    createDirIfNone("./api/server");
    createDirIfNone("./api/server/migrations");
    createDirIfNone("./api/server/models");
    createDirIfNone("./api/server/seeders");
    createDirIfNone("./src");
    createDirIfNone("./src/ui_data");
    createDirIfNone("./src/ui_data/env");
    createDirIfNone("./config");

if( !fs.existsSync("./config/config.json") ){
    const configContent = `{
        "local": {
          "username": "root",
          "password": null,
          "database": "factory-sync",
          "host": "127.0.0.1",
          "dialect": "mysql",
          "logging":false
        },
        "development": {},
        "test": {},
        "production": {}
      }`

      fs.writeFileSync("./config/config.json",configContent)
}
if( !fs.existsSync("./.env") ){
    const envContent = `SHEET_ID=[ENTER_SHEET_ID_HERE]`
    fs.writeFileSync("./.env",envContent)
}