const fs = require('fs');
const path = require('path');
const {config} = require('dotenv');
const {where} = require('./get');
const eventFunctions = require("./eventFunctions");

if (fs.existsSync('.env.'+process.env.NODE_ENV)) {
  config({ path: '.env.'+process.env.NODE_ENV })
}else{
    config()
}
const {DB,sequelize}  = require(path.resolve(process.env.MODELS_DIR));
const modelMetaRaw = require(path.resolve(process.env.MODELS_DIR+"/model-meta.json"));

export const deleteCall = async(req) => {
	let {model,id} = req.params;
	let {filter} = req.query;
		const modelMeta = modelMetaRaw.find(m=>m.model === model);

	let delResult;
	if(filter){
		 const filterDelResults = await DB[model].destroy({where: where(filter)});

		if(filterDelResults === 1){
			return {
				status:'success',
				message:model+" records matching filter "+filter+" have been deleted" 
			}
		} else{
			return {
				status:'error',
				message:model+" records matching filter "+filter+" have NOT been deleted"

			}
		}

	}

	const fields = Object.keys(DB[model].rawAttributes);
	const reqArray = Array.isArray(req.body) ? req.body : [req.body]
	const results = await Promise.all(reqArray.map( async(post)=>{
		let data:any = {};
		fields.filter(field=>Boolean(post[field])).forEach(field=>{
			data[field] = post[field]
		})

		if( Boolean(eventFunctions[modelMeta?.before_delete]) ){
			data = await eventFunctions[modelMeta?.before_delete](data);
			if(Boolean(data?.errors)){
				return data;
			}
		}

		if(!Boolean(id)){
			if(data.id){
				const dataId = data.id;
				delResult =  await DB[model].destroy({where: { id: dataId }});
			} else{
				delResult =  await DB[model].destroy({where: data });
			}
		}

		if(Number.isInteger(Number(id))){
			delResult =  await DB[model].destroy({where: { id: id }});
		}

		let returnData;
		if(delResult === 1){
			returnData = {
				status:'success',
				message:model+" record #"+(id || data.id)+" successfully deleted."
			}
		} else{
				throw new Error(" record #"+(id || data.id)+" was not deleted. Please check your request.")
		}
		return returnData;
	}))
	return results;
}



export default deleteCall