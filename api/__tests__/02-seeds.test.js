import { exec } from "child_process";
import path from 'path';
import fs from 'fs';
import util from 'util';
import {config} from 'dotenv';

if (fs.existsSync('.env.'+process.env.NODE_ENV)) {
  config({ path: '.env.'+process.env.NODE_ENV })
}else{
    config()
}

const readdir = util.promisify(fs.readdir);
const ex = util.promisify(exec);
const doCall = async (call) => await ex(`NODE_ENV=test `+call);

export const tests = [
	{
		title:'SS-10a | inserts basic data',
		status:"todo",
		test:async () =>{

		}
	},
	{
		title:'SS-10b | inserts data with relationships',
		status:"todo",
		test:async () =>{

		}
	},
	{
		title:'SS-10c | accepts faker data',
		status:"todo",
		test:async () =>{

		}
	},
	{
		title:'SS-10d | updates data in DB with new synced data from sheet',
		status:"todo",
		test:async () =>{

		}
	},
	{
		title:'SS-10e | removes data in DB when data no longer exisits on sheet',
		status:"todo",
		test:async () =>{

		}
	}

];
describe('SEEDS',()=>{
	
	beforeAll(async()=>{
		const seedsDir = path.resolve(process.env.SEEDERS_DIR);
		const files = await readdir(seedsDir)
		if(files.length){
			files.forEach((file)=>{
				fs.unlinkSync(seedsDir+"/"+file)
			})
		}
		await doCall('yarn do sync seeds')
		await doCall('yarn do seed')
		await doCall('yarn do seed')
	})

	tests.forEach((test)=>{
		if(test.status === "active"){
			it(test.title,test.test)
		}else if(test.status === 'todo' || !Boolean(test.status)){
			it.todo(test.title)
		}
	})
})

describe('Seeds error handling', ()=>{})
