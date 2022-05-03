import fs from "fs";
import multer from 'multer';
import path from "path";
import {parseURL} from "../../services/util";
import {getMetaData} from "../../services/api/get";
const {config} = require('dotenv');
if (fs.existsSync('.env.'+process.env.NODE_ENV)) {
  config({ path: '.env.'+process.env.NODE_ENV })
}else{
    config()
}
const {sequelize}  = require(path.resolve(String(process.env.MODELS_DIR)));

export const upload = async (req, res, next) => {
	const {model} = parseURL(req);
	const fieldMeta =  await getMetaData(sequelize,model);
	
	var storage = multer.diskStorage({
		destination: function (req, file, cb) {
			const meta = fieldMeta[file.fieldname];
			const dest = path.resolve(meta?.dest ? meta?.dest  :"./uploads");
			if (!fs.existsSync(dest)) { 
				fs.mkdirSync(dest);
			  } 
			cb(null,dest)
		},
		filename: function (req, file, cb) {
			cb(null, file.fieldname + '-' + Date.now()+"."+file.originalname.split(".").filter((x,i)=>i !== 0).join("."))
		}
	})
	const upload = multer({ storage  });
	
		upload.any()(req,res,()=>{
			next();
		})


}