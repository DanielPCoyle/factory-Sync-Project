const fs = require('fs');
const path = require('path');
const appRoot = require('app-root-path');
const {getMetaData} = require("./get");
const {config} = require('dotenv');
if (fs.existsSync('.env.'+process.env.NODE_ENV)) {
  config({ path: '.env.'+process.env.NODE_ENV })
}else{
    config()
}
const {DB,sequelize}  = require(path.resolve(process.env.MODELS_DIR));

export const handleFiles = async (req) =>{
    let {model,id} = req.params;
    const fieldMeta =  await getMetaData(sequelize,model);
    const appendFiles = {}
    if(req.files){
        console.log(req.files)
        const fileFields = req.files.map( ( f )=> f.fieldname ).filter((value, index, self) => {
            return self.indexOf(value) === index;
        })
        fileFields.forEach((field)=>{
            const type = fieldMeta[field].type
            appendFiles[field] = req.files
            .filter( (ff)=>ff.fieldname === field )
            .map( ff=>ff.path.replace(appRoot,".") )
            appendFiles[field] = ( type === "text" ) ? appendFiles[field][0]  : appendFiles[field]
        })
    }
    return {...appendFiles,...req.body};
}
