import { config } from 'dotenv';
import fs from "fs";


if (fs.existsSync('.env.'+process.env.NODE_ENV)) {
  config({ path: '.env.'+process.env.NODE_ENV })
}else{
    config()
}

describe('migrations init down', ()=>{
		test.todo('SS-4a | Any tables created are dropped from the database on initial migration.')
		// 	async () =>{
		// 	 const migrateDownCall = await doCall('yarn do migrate-undo:test');
			 
		// 	 let tables  =  await sequelize.query(`SHOW TABLES`, {
		//       type: sequelize.QueryTypes.SELECT
		//     });
		// 	 tables = tables.map((t)=>{
		// 	 		return t[Object.keys(t)[0]]
		// 	 })
		// 	 return expect(tables).toEqual(['SequelizeMeta'])
		// }
})