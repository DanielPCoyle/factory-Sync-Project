const fs = require('fs');
const path = require('path');
const {config} = require('dotenv');
if (fs.existsSync('.env.'+process.env.NODE_ENV)) {
  config({ path: '.env.'+process.env.NODE_ENV })
}else{
    config()
}
const {DB,sequelize}  = require(path.resolve(process.env.MODELS_DIR));
const modelMeta = require(path.resolve(process.env.MODELS_DIR+"/model-meta.json"));
const { Op,fn,col, cast } = require("sequelize");
const context = require('express-http-context');

export const getAssociations = (model) => {
	const result:any = [];
	Object.keys(model.associations).forEach((key) => {
		const association = {};
		// all needed information in the 'options' object
		if (model.associations[key].hasOwnProperty('options')) {
			association[key] = {...
				model.associations[key].options,
				...{
					associationType:model.associations[key].associationType,
					target:model.associations[key].target.name
				}
			};
		}
		result.push(association);
	});
	return result;
}

export const getMetaData = async (sequelize, model) => {

	const tableRawMeta = await sequelize.query(`SHOW FULL COLUMNS FROM ${model};`, {
		type: sequelize.QueryTypes.SELECT
	});

	const uids = {}
	if(tableRawMeta){
		tableRawMeta.forEach((field)=>{
			uids[field.Field]  = JSON.parse(field.Comment).uid;
		})
	}

	const query = `SELECT * FROM sync_meta WHERE uid in ('${Object.values(uids).join("','")}');`
	const meta = await sequelize.query(query, {
		type: sequelize.QueryTypes.SELECT
	});

	
	const dataToReturn = {};
	Object.keys(uids).map(field=>{
		
		if(!dataToReturn[field]){
			dataToReturn[field] = {};
		}
		meta.filter(m=>m.uid === uids[field]).forEach(attr=>{
			if(attr.key === "type"){
				attr.key = "type_on_sheet"
			}
			dataToReturn[field][attr.key] = attr.value
		})
	})


	Object.keys(dataToReturn).forEach(field=>{
		if(dataToReturn[field].enum){
			dataToReturn[field].enum = dataToReturn[field].enum.split(",")
		}
		dataToReturn[field].type = tableRawMeta.find(f=>f.Field === field).Type
		if(['tinyint(1)'].includes(dataToReturn[field].type)){ dataToReturn[field].type = "boolean" }
		if(dataToReturn[field].type.includes("enum")){ dataToReturn[field].type = "enum" }
		if(dataToReturn[field].type.includes("decimal")){ dataToReturn[field].type = "decimal" }
	})

	return dataToReturn
}

export const where = (filter)=>{
	const queryPartsAnds = filter.split(" and ")
	const queryPartsOrs = filter.split(" or ")

	let special = false;
	const parseQueryPart = (part)=>{
		const fullQuery = part.split("'");
		let array = fullQuery[0].split(" ").map((part)=>part.trim())
		array.pop()
	
		// TODO: Security around what fields can be queried and by who.
		if(array[1] === "loose"){
			array[1] = "like";
			fullQuery[1] = `%${fullQuery[1]}%`
		}
	
		if(["in"].includes(array[1])){
			fullQuery[1] = fullQuery[1].split(",")
		}
		
		if(array[1] === "JSON_CONTAINS"){
			special = true;
			return fn('JSON_CONTAINS', col(array[0]),fullQuery[1])
		}
		return {
			[array[0]]:{
				[Op[array[1]]]:fullQuery[1]
			}
		}
	}

	const results = queryPartsAnds.map((part)=>parseQueryPart(part))
	if(special){
		return results[0]
	}
	return results

}

const buildIncludes = (expand) => {
	return [{
		model:DB[expand.model],
		as:expand.model,
		where:expand?.filter ? where(expand?.filter) : [],
		include:expand?.expand ? buildIncludes(expand.expand) : []
	}]
}


export const makeCall = async (req) =>{
	const user = context.get('user')
	let {model,id,subModels} = req.params;
	let {filter,limit,page,expand,select,count,order,search,withMeta} = req.query;
	page = Boolean(page) ?  page.replace(/\D/g,'') : 1;

	if(!Boolean(DB[model])){
		return {
			status:404,
			errors:["model "+model+" not found"]
		}
	}

	const rawModelMeta = modelMeta.filter(m=>m.model.trim() === model)[0];
	const fieldMeta =  await getMetaData(sequelize,model);
	const mMeta:any = {};
	if(rawModelMeta){
		Object.keys(rawModelMeta).map((k)=>{
			if(k !== "model"){
				mMeta[k] = rawModelMeta[k]
			}
		})
	}


	const buildExpand = (subModels,i) => {
		const keys = Object.keys(subModels);
		return {
			model:keys[i],
			filter:subModels[keys[i]] ?  `id eq '${subModels[keys[i]]}'` : undefined,
			expand:keys[i+1] ? buildExpand(subModels,i+1) : undefined
		}
	}

	if(subModels && Object.keys(subModels).length){
		 expand =  Boolean(expand) ? 
			(expand +  JSON.stringify(buildExpand(subModels,0)) )  : 
			JSON.stringify(buildExpand(subModels,0)) 
	}

	if(Boolean(mMeta?.api_expand) && (!Object.keys(subModels).length  )){
		expand = Boolean(expand) ? (mMeta.expand+"|"+expand) : mMeta.api_expand
	}

	if(Boolean(mMeta?.api_limit)){
		limit = Boolean(limit && limit < mMeta.api_expand) ? limit : mMeta.api_limit
	}


	if(id === "model-meta"){
		const expandMeta = {};
		expand?.split("|")?.forEach((expandModel)=>{
			expandMeta[expandModel] = modelMeta.filter(m=>m.model.trim() === expandModel)[0];
		})
		return {
			...mMeta,
			...{
				expand:expandMeta
			}
		}
	}

	if(id === "field-meta"){
		Object.keys(fieldMeta).forEach(field=>{
			if(select){
				if(!select.split(",").includes(field)){
					delete(fieldMeta[field])
				}
			}
		});
		if(expand){
			await Promise.all(expand.trim().split("|").map(async (expModel)=>{
				expModel = expModel.trim();
				fieldMeta[expModel] =  await getMetaData(sequelize,expModel);
			}))
		}
		return fieldMeta
	}		

	let options:any = {}
	options.order = [];

	if(expand){
		options.include = [];
		const associations =  getAssociations(DB[model])
		await Promise.all(expand.split("|").map(async (field,i)=>{
			let hasSubOrder = false;
			let expandedOptions:any = {where:[]}
			expandedOptions['required'] = false;
			let expandedField = field;
				if(field.includes("{")){
					let expandRaw = JSON.parse(field);
					expandedField = expandRaw.model;

						if(expandRaw?.filter){
							expandedOptions['where'] = where(expandRaw?.filter);
						}

						if(expandRaw?.search){
							const expMeta =  await getMetaData(sequelize,expandedField);
							const obj = {};
							Object.keys(expMeta).forEach((metaField)=>{
								if(Boolean(expMeta[metaField]?.searchable?.toLowerCase() === "true")){
									return obj[metaField] = {
										[Op.like]:`%${expandRaw?.search}%`
									} 
								}
							})
							expandedOptions['where'].push({[Op.or]:obj})
						}
						if(expandRaw?.required){
							expandedOptions['required'] = Boolean(
								expandRaw?.required.toLowerCase() === "true" ? 
								true : false
							)
						}
		
						if(expandRaw?.expand){
							if(typeof expandRaw?.expand === "object"){
								expandedOptions["include"] = [expandRaw?.expand].map((part)=>{
									return {
										model:DB[part.model],
										 as:part.model,
										 required:false,
										 where:part?.filter ? [where(part.filter)] : [],
										 include:part?.expand ? buildIncludes(part.expand) : [],
										 limit:part?.limit ? part.limit : 250
										}
								})
							} else{
								expandedOptions["include"] = expandRaw?.expand.split(",").map((part)=>{
									return {model:DB[part], as:part,required:false}	
								})
							}	
						}

						if(expandRaw?.order){
							hasSubOrder = true
							options.order.push(
								expandRaw?.order.split(",")
							)
						}

						if(expandRaw?.select){
							expandedOptions["attributes"] = expandRaw?.select.split("|")
						}

						if(expandRaw?.limit){
							expandedOptions["limit"] = Number(expandRaw?.limit)
							expandedOptions["separate"] = true
						}

						if(expandedOptions.where.length === 0 ){
							delete(expandedOptions.where)
						}
				}

			associations.map((ass)=>{
				if(Object.keys(ass).includes(expandedField)){
					const targetModel = DB[ass[expandedField].target];
					if(hasSubOrder){
						options.order[options.order.length-1] = [...[targetModel],...options.order[options.order.length-1]]
					}
					const expansion = {
						...{model:targetModel, as:ass[expandedField].as},
						...expandedOptions
					};
					options.include.push(expansion)
				}
			})
		}))
	}

	if(select){
		options.attributes = select.split(",").map(attr=>attr.trim())
		options.include = options?.include?.filter(i=>options.attributes.includes(i.as));
		if(options?.include?.length){
				options.attributes = options.attributes.filter(a=> !options?.include.map(i=>i.as).includes(a) )
		}
	}


	if(filter){
		const find = where(filter);
		options = {
			...options,
			...{
				where:[find]
			}}
	} 

		options = {
			...options,
			...{
				limit:250,
				offset:((page-1)*(limit ||250)) || 0,
			}
		}
		if(limit && limit <= 250){
			options.limit = Number(limit)
		}

 
			if(search){
				const obj = {};
				Object.keys(fieldMeta).forEach((metaField)=>{
					if(Boolean(fieldMeta[metaField]?.searchable?.toLowerCase() === "true")){
						return obj[metaField] = {
							[Op.like]:`%${search}%`
						} 
					}
				})
				if(typeof options.where === "undefined"){
					options.where = []
				}
				options.where.push({[Op.or]:obj})
			}

			if(order){
				options.order = [...options.order,...order.split("|").map(pair=>{
					pair = pair.split(",")
					return [pair[0],pair[1] || "ASC"]
				})]
			}


			if(subModels && Object.keys(subModels).length){
				options.where = [];
				let subOptions = {...options}
				delete(subOptions.include)
				if(filter){
				subOptions = {
					...subOptions,
					...{
						where:[where(filter)]
					}}
				} 

				delete(subOptions.order)
				delete(subOptions.limit)
				delete(subOptions.offset)
				options.include[options.include.length-1] = {...options.include[options.include.length-1],...subOptions}
			}


			if(options.where){
				options.where = options.where?.length > 1 ? options.where : options.where[0]
			}

			
			if(id){
				if(withMeta){
					return {
						data: await DB[model].findByPk(id,options),
						meta:rawModelMeta
					}
				} else{
					return await DB[model].findByPk(id,options)
				}
			} else {

				if(count){
					return await DB[model].count(options)
				}

				if(withMeta){
					return {
						data:await DB[model].findAll(options),
						meta:rawModelMeta
					}
				} else{
					return await DB[model].findAll(options)
				}
			}
}


export const getModels = ()=>{
	const user = context.get('user')
	return modelMeta.filter(m=>!Boolean(m.get_access) || m?.get_access?.includes(user?.type)).map((obj,i)=>{
		const nObj = 	{}
		Object.keys(obj).forEach((key)=>{
			// if(key.includes("ui_") || key === "model"){
				nObj[key.replace("ui_","")] = obj[key]
			// }
		})
		return nObj;
	})
}

export const getCall = async(req) => {
	const {subModels} = req.params;
	const model = await makeCall(req)
	return model;
}

