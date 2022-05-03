import { exec } from "child_process";
import path from 'path';
import fs from 'fs';
import util from 'util';
import {config} from 'dotenv';
import Sequelize from "sequelize";
import Settings from "../../config/config.json";

if (fs.existsSync('.env.'+process.env.NODE_ENV)) {
  config({ path: '.env.'+process.env.NODE_ENV })
}else{
    config()
}

const env = process.env.NODE_ENV || 'development';
let sequelize;
let settings = Settings[env];

if (typeof(settings.use_env_variable) !== "undefined") {
  sequelize = new Sequelize(process.env[settings.use_env_variable], settings);
} else {
  sequelize = new Sequelize(settings.database, settings.username, settings.password, settings);
}


const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const ex = util.promisify(exec);
const doCall = async (call) => await ex(`NODE_ENV=test `+call);


const getDbSchemaData = async()=>{
	let tables  =  await sequelize.query(`SHOW TABLES`, {
      type: sequelize.QueryTypes.SELECT
    });
	
	tables = tables.map((t)=>{
		return t[Object.keys(t)[0]];
	}).sort();


	let dbSchemaData = [];
	await Promise.all(tables.map(async (table)=>{
		const q = `SHOW FULL COLUMNS FROM ${table}`	
		 let data = await sequelize.query(q, {
		      		type: sequelize.QueryTypes.SELECT
		    	});
		 data = data.map(d=>{
		 	d.table = table
		 	d.uid = Boolean(d?.Comment) ? JSON.parse(d.Comment).uid : null
		 	return d;
		 })
		 dbSchemaData = [...dbSchemaData,...data];
	}))
	return dbSchemaData;
}


const mostRecentMigration = async () => {
	const migrationDir = path.resolve(process.env.MIGRATION_DIR);
	let files = await readdir(migrationDir)
	files = files.filter(file=>file.includes(".json"))
	if(files[files.length-1]){
		let mostRecentData = await readFile(migrationDir+"/"+files[files.length-1], "binary")
		mostRecentData = JSON.parse(mostRecentData)
		return mostRecentData;
	}
	return null;
}



export const tests = [
	{
		title:'SS-3a | creates DB tables included in the initial fields.json file generated by sync located in migration directory' ,
		status:"active",
		test:async()=>{
		await doCall('NODE_ENV=test yarn do migrate')
	 	let tables  =  await sequelize.query(`SHOW TABLES`, {
	      type: sequelize.QueryTypes.SELECT
	    });
		
		tables = tables.map((t)=>{
			return t[Object.keys(t)[0]];
		}).sort();

		const mostRecentData = await mostRecentMigration();
		const syncFileTables = [
		...mostRecentData.map(row=>row.table.trim()).filter((value, index, self) => {
		  return self.indexOf(value) === index;
		}),
		...[
			"SequelizeMeta",
			"sync_meta"
		]
		].sort()
		await expect(tables).toEqual(syncFileTables);
	}
	},
	{
		title:'SS-3c | establishes if field is nullable based on the "allowNull" column value from the "fields" sheet',
		status:"active",
		test:async ()=>{
		const dbSchemaData = await getDbSchemaData();
		const mostRecentData = await mostRecentMigration();
		let nullCheck = true
		mostRecentData.forEach(row=>{
			let dbField = dbSchemaData.find((dbS)=>{
				return Boolean(dbS.table === row.table && dbS.Field === row.field)
			})
			if(typeof row?.allowNull === "undefined" && dbField.Null !== "YES" ){
				nullCheck = false;
			}
			if(row?.allowNull?.toLowerCase()?.trim() === "true" && dbField.Null !== "YES" ){
				nullCheck = false;
			}
			if(row?.allowNull?.toLowerCase()?.trim() === "false" && dbField.Null !== "NO" ){
				nullCheck = false;
			}
		})
		return await expect(nullCheck).toBe(true)
	}
	},
	{
		title:'SS-3d | establishes if field is auto_incremented based on the "auto_increment" column value from the "fields" sheet',
		status:"active",
		test:async ()=>{
		const dbSchemaData = await getDbSchemaData();
		const mostRecentData = await mostRecentMigration();
		let aiCheck = true
		mostRecentData.forEach(row=>{
			let dbField = dbSchemaData.find((dbS)=>{
				return Boolean(dbS.table === row.table && dbS.Field === row.field)
			})
			if(typeof row?.autoIncrement === "undefined" && dbField.Extra.includes("auto_increment") ){
				aiCheck = false;
			}
			if( row?.autoIncrement?.toLowerCase()?.trim() === "true" && !dbField.Extra.includes("auto_increment") ){
				aiCheck = false;
			}
			if( row?.autoIncrement?.toLowerCase()?.trim() === "false" && dbField.Extra.includes("auto_increment") ){
				aiCheck = false;
			}
		})
		return await expect(aiCheck).toBe(true)
	}
	},
	{
		title:'SS-3e | establishes if field is unique based on the "unique" column value from the "fields" sheet',
		status:"active",
		test:async ()=>{
		const mostRecentData = await mostRecentMigration();
		let uniqueCheck = true;
		mostRecentData.map(async row=>{
			if(row?.unique?.toLowerCase()?.trim() === "true"){
				const q = `SHOW INDEXES
				FROM ${row.table}
				WHERE Column_name='${row.field}'
				AND NOT Non_unique`
				const indexes = await sequelize.query(q, {
				type: sequelize.QueryTypes.SELECT
				});
				if(Boolean(indexes[0].Non_unique > 0)){
					uniqueCheck = false;
				}
			}
	 })
		return expect(uniqueCheck).toBe(true)
	}
	},
	{
		title:'SS-3f | establishes the field\'s default value based on the "defaultValue" column value from the "fields" sheet',
		status:"active",
		test:async ()=>{
		const dbSchemaData = await getDbSchemaData();
		const mostRecentData = await mostRecentMigration();
		let defaultValueCheck = true
		mostRecentData.forEach(row=>{
			let dbField = dbSchemaData.find((dbS)=>{
				return Boolean(dbS.table === row.table && dbS.Field === row.field)
			})
			if(row?.defaultValue && (row?.defaultValue !== "") && (row?.defaultValue !== null)){
				if(dbField.Default !== row.defaultValue){
					defaultValueCheck = false;
				}
			}
		})
		return await expect(defaultValueCheck).toBe(true)
	}
	},
	{
		title:'SS-3g | establishes if the field is a primary key based on the "primary" column value from the "fields" sheet',
		status:"active",
		test:async ()=>{
		const dbSchemaData = await getDbSchemaData();
		const mostRecentData = await mostRecentMigration();
		let primaryCheck = true
		mostRecentData.forEach(row=>{
			let dbField = dbSchemaData.find((dbS)=>{
				return Boolean(dbS.table === row.table && dbS.Field === row.field)
			})
			if(row?.primary?.toLowerCase().trim() === "true"){
				if(dbField.Key !== "PRI"){
					primaryCheck = false;
				}
			}
		})
		return await expect(primaryCheck).toBe(true)
	}
	},
	{
		title:'SS-3h | adds DB comment to field if "comment" column value from the "fields" sheet is filled out',
		status:"active",
		test:async ()=>{
		const dbSchemaData = await getDbSchemaData();
		const mostRecentData = await mostRecentMigration();
		let commentCheck = true
		mostRecentData.forEach(row=>{
			let dbField = dbSchemaData.find((dbS)=>{
				return Boolean(dbS.table === row.table && dbS.Field === row.field)
			})
			if(row?.comment && (row?.comment !== "") && (row?.comment !== null)){
				if(JSON.parse(dbField.Comment).comment !== row.comment){
					commentCheck = false;
				}
			}
		})
		return await expect(commentCheck).toBe(true)
	}
	},
	{
		title:'SS-3i | establishes relationships by parsing the references column values from the "fields" sheet',
		status:"active",
		test:async()=>{
		const mostRecentData = await mostRecentMigration();
		let referencesCheck = true

			const q = `SELECT 
			TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME, REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME
			FROM
			INFORMATION_SCHEMA.KEY_COLUMN_USAGE
			WHERE
			REFERENCED_TABLE_SCHEMA = '${settings.database}'`;

			const indexes = await sequelize.query(q, {
	      type: sequelize.QueryTypes.SELECT
	    });

		mostRecentData.forEach(row=>{
			let dbField = indexes.find((dbS)=>{
				return Boolean(dbS.TABLE_NAME === row.table && dbS.COLUMN_NAME === row.field)
			})
			if(row?.references && (row?.references !== "") && (row?.references !== null)){
				const ref = {}
				row.references.split("|").forEach((p)=>{
					p = p.split(":")
					ref[p[0]] = p[1]
				})
				if(ref.table !== dbField?.REFERENCED_TABLE_NAME){
					referencesCheck = false
				}
			}
		})
		return await expect(referencesCheck).toBe(true)
	}
	},
	{
		title:'SS-3j | writes non DB migration fields data to sync meta table',
		status:"active",
		test:async()=>{
		const syncMeta = await sequelize.query(`SELECT * FROM sync_meta`, {
				type: sequelize.QueryTypes.SELECT
				})
		
		return await expect(Boolean(syncMeta.filter(sm=>sm.key === "input_type").length)).toBe(true)
	}
	}

]


describe('migrations up init',()=>{

	beforeAll(async()=>{
		const migrationDir = path.resolve(process.env.MIGRATION_DIR);
		const files = await readdir(migrationDir)
		if(files.length){
			files.forEach((file)=>{
				fs.unlinkSync(migrationDir+"/"+file)
			})
		}
	
		 await doCall('NODE_ENV=test yarn do sync fields');
		 await doCall('NODE_ENV=test yarn do sync models');
		    
		try{
			await doCall('npx sequelize-cli db:drop')
			await doCall('npx sequelize-cli db:create')

		} catch(e){
			console.log("ERROR>>>>>",e)
		}
	})

	tests.forEach((test)=>{
		if(test.status === "active"){
			it(test.title,test.test)
		}else if(test.status === 'todo' || !Boolean(test.status)){
			it.todo(test.title)
		}
	})

})


describe('Migration error handling', ()=>{})
