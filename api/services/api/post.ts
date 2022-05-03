const fs = require('fs');
const path = require('path');
const {config} = require('dotenv');
if (fs.existsSync('.env.'+process.env.NODE_ENV)) {
  config({ path: '.env.'+process.env.NODE_ENV })
}else{
    config()
}
const {DB,sequelize}  = require(path.resolve(process.env.MODELS_DIR));
const modelMetaRaw = require(path.resolve(process.env.MODELS_DIR+"/model-meta.json"));
const eventFunctions = require("./eventFunctions");
const transformers = require("./transformers");
const {getMetaData} = require("./get");
const {handleFiles} = require('./util');
const moment = require("moment");

export const writeTransformer = async ({fieldMeta,callData,model}) => {
	const fields = Object.keys(DB[model].rawAttributes);
	let data = {};
	let errors:any = [];
	await Promise.all( fields.filter(field=>Boolean(callData[field]) ).map(async field=>{
		if(fieldMeta[field]?.write_transformer && transformers[fieldMeta[field]?.write_transformer]){
			const nField  = await transformers[fieldMeta[field]?.write_transformer]({
				field,
				data:callData,
			})
			if(Boolean(nField.errors)){
				errors = [...errors,...[
					{
						field,
						value:callData[field],
						errors:nField.errors,

					}
				]]
			} else{
				data[field] = nField[field]
			}
		} else{
			data[field] = callData[field]
		}

		if(fieldMeta[field]?.type.includes("json") && typeof callData[field] === "string"){
			const check = moment(moment(callData[field]).format("MM/DD/YYYY"), "MM/DD/YYYY", true).isValid() || typeof callData[field] === "string"
			if( !check ){
				data[field] = JSON.parse(callData[field])
			}
		}
	}))

	if(errors.length){
		return {
			data:callData,
			errors
		}
	}
	return data;
}


export const postCall = async (req)=>{

	try{
		let {model} = req.params;
		const modelMeta = modelMetaRaw.find(m=>m.model === model);
		req.body = Array.isArray(req.body) ? await Promise.all(req.body.map(async(body)=>{
			return await handleFiles({params:{
				model
			},body})
		})) : await handleFiles(req)

		const reqArray = Array.isArray(req.body) ? req.body : [req.body]
		const results = await Promise.all(reqArray.map( async(post)=>{
			
			const fieldMeta =  await getMetaData(sequelize,model);
			
			let data:any = await writeTransformer({fieldMeta,callData:post,model})
			if(Boolean(data?.errors)){
				return data
			}

			if( Boolean(eventFunctions[modelMeta?.before_post]) ){
				data = await eventFunctions[modelMeta?.before_post](data);
				if(Boolean(data?.errors)){
					return data;
				}
			}
			console.log(">>>",data)
			let create =  await DB[model].create(data);

			if( Boolean(eventFunctions[modelMeta?.after_post]) ){
				create = await eventFunctions[modelMeta?.after_post](create);
			}
			return create;

		}))
		return results

	} catch(e:any){
		console.log(e)
	}

}

export const expandedPostCall = async (req)=>{
	let {model,id,expandedModel} = req.params;
}

export default postCall;