import { exec } from "child_process";
import { config } from 'dotenv';
import fs from 'fs';
import Sequelize from "sequelize";
import util from 'util';
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


const ex = util.promisify(exec);
const doCall = async (call) => await ex(`NODE_ENV=test `+call);

export const tests = [
	{
		title:"SS-5a | Creates new tables that did not exist if they were not included in previous migration sync",
		status:"active",
		author:"Dan Coyle",
		test:async()=>{
			await doCall("yarn do sync removeRows --sheetName fields --where '{\"table\":\"custom_user_fields\"}'")

			const newTable = [
				{
					table:"custom_user_fields",
					field:"id",
					type:"int",
					primary:"TRUE",
					autoIncrement:"TRUE",
					allowNull:"FALSE",
					unique:"TRUE"
				},
				{
					table:"custom_user_fields",
					field:"key",
					type:"string",
				},
				{
					table:"custom_user_fields",
					field:"value",
					type:"text",
				},
				{
					table:"custom_user_fields",
					field:"user_id",
					type:"int",
					references:"table:user|as:custom_user_field|type:hasMany|belongsToAs:user"
				},
			]

			const call = `yarn do sync addRows --sheetName fields --data ${JSON.stringify(JSON.stringify(newTable))}`;
			await doCall(call)
			await doCall('yarn do sync fields')
		 	await doCall('yarn do sync models');
			await doCall('yarn do migrate')
		 	let tables  =  await sequelize.query(`SHOW TABLES`, {
		      type: sequelize.QueryTypes.SELECT
		    });
		    expect(tables.map(t=>t['Tables_in_'+settings.database]).includes("custom_user_fields")).toBe(true)
		}
	},
	{
		title:"SS-5b | Creates new fields on existing tables if fields did not exist in previous migration sync",
		status:"active",
		author:"Dan Coyle",
		test: async()=>{
			const newFieldOnExistingTable = [
				{
					table:"custom_user_fields",
					field:"new_field_1",
					type:"string"
				},
				{
					table:"custom_user_fields",
					field:"new_field_2",
					type:"string"
				},
			]
			const call = `yarn do sync addRows --sheetName fields --data ${JSON.stringify(JSON.stringify(newFieldOnExistingTable))}`;
			await doCall(call)
			await doCall('yarn do sync fields')
		 	await doCall('yarn do sync models');
			await doCall('yarn do migrate')
			let columns  =  await sequelize.query(`SHOW columns FROM ${settings.database}.custom_user_fields`, {
		      type: sequelize.QueryTypes.SELECT
		    });
		    expect(columns.map(c=>c.Field).includes('new_field_1')).toBe(true)
		    expect(columns.map(c=>c.Field).includes('new_field_2')).toBe(true)
		}
	},
	{
		title:"SS-5e | Applies changes in data types, field name, and other properties that are tracked from one migration sync to the next",
		status:"active",
		author:"Dan Coyle",
		test:async()=>{
			await doCall("yarn do sync updateRows --sheetName fields --where '{\"table\":\"custom_user_fields\",\"field\":\"new_field_1\"}' --data '{\"type\":\"text\"}'")
			await doCall('yarn do sync fields')
			await doCall('yarn do migrate')
			const q = `SHOW FULL COLUMNS FROM custom_user_fields`	
			 let data = await sequelize.query(q, {
	      		type: sequelize.QueryTypes.SELECT
	    	});
			 expect(data.find(row=>row.Field === "new_field_1").Type).toEqual("text")
		}
	},
	{
		title:"SS-5c | Removes fields that did exist in previous migration sync but do not in current migration.",
		status:"active",
		author:"Dan Coyle",
		test:async()=>{
			const call = `yarn do sync removeRows --sheetName fields --where ${JSON.stringify(JSON.stringify({table:"custom_user_fields",field:"new_field_1"}))}`
			await doCall(call)
			await doCall(`yarn do sync removeRows --sheetName fields --where ${JSON.stringify(JSON.stringify({table:"custom_user_fields",field:"new_field_2"}))}`)
			await doCall('yarn do sync fields')
		 	await doCall('yarn do sync models');
			await doCall('yarn do migrate')
			let columns  =  await sequelize.query(`SHOW columns FROM ${settings.database}.custom_user_fields`, {
		      type: sequelize.QueryTypes.SELECT
		    });
		    expect(columns.map(c=>c.Field).includes('new_field_1')).toBe(false)
		    expect(columns.map(c=>c.Field).includes('new_field_2')).toBe(false)
		}
	},
	{
		title:"SS-5d | Drops tables that existed in previous migration but not current migration",
		status:"active",
		author:"Dan Coyle",
		test:async()=>{
			await doCall(`yarn do sync removeRows --sheetName fields --where ${JSON.stringify(JSON.stringify({table:"custom_user_fields"}))}`)
			await doCall('yarn do sync fields')
			await doCall('yarn do migrate')
			let tables  =  await sequelize.query(`SHOW TABLES`, {
		      type: sequelize.QueryTypes.SELECT
		    });
		    expect(tables.map(t=>t['Tables_in_'+settings.database]).includes("custom_user_fields")).toBe(false)
		}
	}
]


describe('migrations up', ()=>{
	tests.forEach((test)=>{
			if(test.status === "active"){
				it(test.title,test.test)
			}else if(test.status === 'todo' || !Boolean(test.status)){
				it.todo(test.title)
			}
		})
})