import { config } from 'dotenv';
import fs from 'fs';
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

const checkField = async (field,type)=>{
	const q = `SHOW FULL COLUMNS FROM data_types`	
	let data = await sequelize.query(q, {
			type: sequelize.QueryTypes.SELECT
	});
	const fieldRow =  data.find(row=>row.Field === field)
	return Boolean(fieldRow.Type === type)
}

export const tests = [
	{
		title:"SS-1a | string data type",
		status:"active",
		test: async()=>{
			const check = await checkField("string",'varchar(255)')
			return expect(check).toBe(true)
		}
	},
	{
		title:"SS-1b | text data type",
		status:"active",
		test: async()=>{
			const check = await checkField("text",'text')
			return expect(check).toBe(true)
		}
	},
	{
		title:"SS-1c | enum data type",
		status:"active",
		test: async()=>{
			const check = await checkField("string",'varchar(255)')
			return expect(check).toBe(true)
		}
	},
	{
		title:"SS-1d | json data type",
		status:"active",
		test: async()=>{
			const check = await checkField("json",'json')
			return expect(check).toBe(true)
		}
	},
	{
		title:"SS-1e | double data type",
		status:"active",
		test: async()=>{
			const check = await checkField("double",'double')
			return expect(check).toBe(true)
		}
	},
	{
		title:"SS-1f | decimal data type",
		status:"active",
		test: async()=>{
			const check = await checkField("decimal",'decimal(10,0)')
			return expect(check).toBe(true)
		}
	},
	{
		title:"SS-1g | date-time data type",
		status:"active",
		test: async()=>{
			const check = await checkField("date-time",'datetime')
			return expect(check).toBe(true)
		}
	},
	{
		title:"SS-1h | date-only data type",
		status:"active",
		test: async()=>{
			const check = await checkField("date-only",'date')
			return expect(check).toBe(true)
		}
	},
	{
		title:"SS-1i | int data type",
		status:"active",
		test: async()=>{
			const check = await checkField("int",'int')
			return expect(check).toBe(true)
		}
	},
	{
		title:"SS-1j | bigint data type",
		status:"active",
		test: async()=>{
			const check = await checkField("bigint",'bigint')
			return expect(check).toBe(true)
		}
	},
	{
		title:"SS-1k | float data type",
		status:"active",
		test: async()=>{
			const check = await checkField("float",'float')
			return expect(check).toBe(true)
		}
	},
	// {
	// 	title:"SS-1l | real data type (POSTGRES ONLY)",
	// 	status:"todo",
	// 	test: async()=>{

	// 	}
	// },
	{
		title:"SS-1m | boolean data type",
		status:"active",
		test: async()=>{
			const check = await checkField("boolean",'tinyint(1)')
			return expect(check).toBe(true)
		}
	},
	// {
	// 	title:"SS-1n | text array data type (POSTGRES ONLY)",
	// 	status:"todo",
	// 	test: async()=>{

	// 	}
	// },
	// {
	// 	title:"SS-1o | enum array data type (POSTGRES ONLY)",
	// 	status:"todo",
	// 	test: async()=>{

	// 	}
	// },
	{
		title:"SS-1p | blob data type",
		status:"active",
		test: async()=>{
			const check = await checkField("blob",'blob')
			return expect(check).toBe(true)
		}
	},
	{
		title:"SS-1q | uuid data type",
		status:"active",
		test: async()=>{
			const check = await checkField("uuid",'char(36)')
			return expect(check).toBe(true)
		}
	},
	// {
	// 	title:"SS-1e | cidr data type (POSTGRES ONLY)",
	// 	status:"todo",
	// 	test: async()=>{

	// 	}
	// },
	// {
	// 	title:"SS-1s | inet data type  (POSTGRES ONLY)",
	// 	status:"todo",
	// 	test: async()=>{

	// 	}
	// },
	// {
	// 	title:"SS-1t | macaddr data type  (POSTGRES ONLY)",
	// 	status:"todo",
	// 	test: async()=>{

	// 	}
	// },
	// {
	// 	title:"SS-1u | range data type  (POSTGRES ONLY)",
	// 	status:"todo",
	// 	test: async()=>{

	// 	}
	// },
	{
		title:"SS-1v | geometry data type",
		status:"active",
		test: async()=>{
			const check = await checkField("geometry",'geometry')
			return expect(check).toBe(true)
		}
	}
]

describe("Data types are migrating correctly", ()=>{
	tests.forEach((test)=>{
		if(test.status === "active"){
			it(test.title,test.test)
		}else if(test.status === 'todo' || !Boolean(test.status)){
			it.todo(test.title)
		}
	})
})