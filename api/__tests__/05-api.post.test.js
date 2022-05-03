import axios from "axios";
import { config } from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env.'+process.env.NODE_ENV)) {
	config({ path: '.env.'+process.env.NODE_ENV })
}else{
	config()
}

const getTokens = async ()=> {
	const clientTestingPassword = "TryMeGuy341!";
	const clientTestingEmail = "testClientCreation@gmail.com";
	const adminTestingPassword = "TryMeGuy341!";
	const adminTestingEmail = "testAdminCreation@gmail.com";
	const clientResults = await axios.post("http://localhost:5001/login",{email:clientTestingEmail, password:clientTestingPassword})
	const clientToken = clientResults.data.token
	const adminResults = await axios.post("http://localhost:5001/login",{email:adminTestingEmail, password:adminTestingPassword})
	const adminToken = adminResults.data.token
	return {clientToken,adminToken}
}

export const tests = [
	{
		title:"S-13a | creates single record", 
		status:'active',
		author:'Dan Coyle',
		test:async ()=>{
			const testPost = {
				title:"New unseeded test post",
				content:"hey hey my my, spiders and files",
				auth_id:1,
			}
			const response = await axios.post("http://localhost:5001/api/post",testPost)
			const {data} = response;
			return expect(data[0].id).toBeGreaterThan(0);
		}
	},
	{
		title:"S-13b | creates records in bulk",
		status:'active',
		author:'Dan Coyle',
		test:async ()=>{
			const testPost = [
			{
				title:"New bulk test unseeded test post",
				content:"hey hey my my, spiders and files",
				auth_id:1,
			},
			{
				title:"New bulk test2 unseeded test post",
				content:"hey hey my my, spiders and files",
				auth_id:1,
			},
			]
			const response = await axios.post("http://localhost:5001/api/post",testPost)
			const {data} = response;
			if(!data.length){
				return expect(data.length).toBeGreaterThan(0);
			}
			let check = 0;
			data.forEach((d)=>{
				if(d?.id > 0){
					check = check +1;
				}
			})
			return expect(check).toBe(data.length)
		}
	},
	{
		title:"S-13c | creates child records",
		status:'todo',
		author:'Dan Coyle'
	},
	{
		title:"S-13d | before_post event functions are working",
		status:'active',
		author:'Dan Coyle',
		test:async ()=>{
		const {clientToken} = await getTokens();	
		const config = {headers: { Authorization: `Bearer ${clientToken}` } };

		const testData = {
			string:"Testing beforeEvent Function",
		}
		const response = await axios.post("http://localhost:5001/api/data_types",testData,config)
		const {data} = response;
		return expect(data[0].string.includes("successfully appeneded")).toBe(true);
		}
	},
	{
		title:"S-13e | after_post event functions are working",
		status:'active',
		author:'Dan Coyle',
		test:async ()=>{
		const {clientToken} = await getTokens();	
		const config = {headers: { Authorization: `Bearer ${clientToken}` } };
		const testData = {
			string:"Testing after_post Function",
		}
		const response = await axios.post("http://localhost:5001/api/data_types",testData,config)
		const {data} = response;
		return expect(data[0].json).toEqual({"message":"hidden"});
		}
	},
	{
		title:"S-13f | POST CALL Error handling",
		status:"todo",
		author:"Dan Coyle"
	}
]

describe('HTTP POST calls', ()=>{
	tests.forEach((test)=>{
			if(test.status === "active"){
				it(test.title,test.test)
			}else if(test.status === 'todo' || !Boolean(test.status)){
				it.todo(test.title)
			}
		})
})

describe('HTTP POST calls error handling', ()=>{})
