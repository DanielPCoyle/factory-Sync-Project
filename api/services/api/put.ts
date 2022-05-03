const fs = require('fs');
const path = require('path');
const {config} = require('dotenv');
const {where} = require('./get');
const {getCall} = require("./get");
const eventFunctions = require("./eventFunctions");
const {writeTransformer} = require("./post");
const {getMetaData} = require("./get");
const appRoot = require('app-root-path');
const {handleFiles} = require('./util');

if (fs.existsSync('.env.'+process.env.NODE_ENV)) {
  config({ path: '.env.'+process.env.NODE_ENV })
}else{
    config()
}
const {DB,sequelize}  = require(path.resolve(process.env.MODELS_DIR ?? "./api/server/models" ?? "./api/server/models"));
const modelMetaRaw = require(path.resolve((process.env.MODELS_DIR ?? "./api/server/models")+"/model-meta.json"));

const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export const putCall = async (req) => {
	try {
		let {model,id} = req.params;
		let {filter} = req.query;
		const fieldMeta =  await getMetaData(sequelize,model);
		req.body = await handleFiles(req)
		Object.keys(req.body).forEach((key)=>{
			if(req.body[key] === 'null'){
				req.body[key] = null
			}
		})

		const modelMeta = modelMetaRaw.find(m=>m.model === model);
		const fields = Object.keys(DB[model].rawAttributes);
		const reqArray = Array.isArray(req.body) ? req.body : [req.body]
		const failedIds:any = [];
		const results = await Promise.all(reqArray.map( async(post)=>{
			let data:any = {};
			fields.filter(field=>Boolean(post[field])).forEach(field=>{
				data[field] = post[field]
			})

			data = await writeTransformer({fieldMeta,callData:data,model})
			if(filter){
				 const putAction = await DB[model].update(data,{
					 omitNull: false,
					where: where(filter)});
				 const results =  await getCall(req);
				 return results;
			}

			if(!Boolean(id)){
				if(data.id){
				const dataId = data.id;
				delete(data.id);
				console.log(">>>>",data)
					 const putAction = await DB[model].update(data,{
						omitNull: false, 
						where: { id: dataId }});
					 if(!arraysEqual(putAction,[0])){
					 	return dataId
					 } else{
					 	failedIds.push(dataId)
					 	return 0;
					 }
				}
			}

			if(Number.isInteger(Number(id))){
				if(Boolean(eventFunctions?.[modelMeta?.before_put])){
					data = await eventFunctions[modelMeta.before_put](data)
					if(Boolean(data?.errors)){
						return data;
					}
				}
				try{
					const update = await DB[model].update(data,{
						omitNull: false,
						where: { id: id }});
					console.log(update,"C")
					if(arraysEqual(update,[0])){
						return {
							status:404,
							errors:[ "No update made." ]
						}
					}
				 	data =  await getCall(req);
				 	if(Boolean(eventFunctions?.[modelMeta?.after_put])){
						data = await eventFunctions[modelMeta.after_put](data)	
					}
					return await data
				} catch(e){
					console.log("ERROR::",e)
				}
			}
		}))

		if(id || filter){
			return results[0];
		} else{
			req.query.filter = `id in '${results.join(",")}'`
			const returnData:any = {}
				returnData.data = await getCall(req);
			if(failedIds.length){
				returnData.errors = await Promise.all(failedIds.map(async(fid)=>{
						const check = await DB[model].findByPk(fid);
						if(Boolean(check)){
							return "#"+fid+" has no changes."
						} else{
							return "#"+fid+" does not exists.";
						}
				}))
			}
			return returnData
		}
	} catch (e) {
		console.log("ERROR:::",e)
	}
}

export default putCall