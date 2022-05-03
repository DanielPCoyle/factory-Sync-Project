import axios from "axios";
import { config } from 'dotenv';
import fs from 'fs';

const clientTestingPassword = "TryMeGuy341!";
const clientTestingEmail = "testClientCreation@gmail.com";
const adminTestingPassword = "TryMeGuy341!";
const adminTestingEmail = "testAdminCreation@gmail.com";

export const getTokens = async ()=> {

	const clientResults = await axios.post("http://localhost:5001/login",{email:clientTestingEmail, password:clientTestingPassword})
	const clientToken = clientResults.data.token
	const adminResults = await axios.post("http://localhost:5001/login",{email:adminTestingEmail, password:adminTestingPassword})
	const adminToken = adminResults.data.token
	return {clientToken,adminToken}
}


if (fs.existsSync('.env.'+process.env.NODE_ENV)) {
  config({ path: '.env.'+process.env.NODE_ENV })
}else{
    config()
}



export const tests = [
	{
		title:"SS-14a | updates a single record", 
		status:"active",
		test:async ()=>{
			const testPost = {
				title:"New updated title",
				content:"hey hey my my, spiders and files",
				auth_id:2,
			}
			const response = await axios.put("http://localhost:5001/api/post/1",testPost)
			const {data} = response;
			return expect(data.title).toBe("New updated title");
		}
	},
	{
		title:"SS-14b | updates records in bulk (via array)",
		"status":'active',
		test:async()=>{
			const testUpdatePosts = [
				{
					id:2,
					title:"This title has been updated",
					content:"This content has been updated"
				},
				{
					id:3,
					title:"This title has also been updated",
					content:"This content has also been updated"
				},
			]
			const response = await axios.put("http://localhost:5001/api/post",testUpdatePosts)
			const {data} = response;
			let check = 0;
			if(!Boolean(data.length)){
				expect(data.length).toBeGreaterThan(0)
			}	
			data.forEach((record)=>{
					const findUpdate = testUpdatePosts.find((tu)=>tu.id === record.id)
					if(Boolean(findUpdate) && (record.title === findUpdate.title) && (record.content === findUpdate.content)){
						check = check + 1;
					}
			})
			expect(check).toBe(data.length)
		}
	},
	{
		title:"SS-14c | update data records in bulk (via filter)",
		"status":'active',
		test:async()=>{
						const testUpdateUser = {
							name:"New name updated via filter",
						}
						const response = await axios.put("http://localhost:5001/api/user?filter=type eq 'admin'",testUpdateUser)
						const {data} = response;
						if(!Boolean(data.length)){
							expect(data.length).toBeGreaterThan(0)
						}	
						let check = 0;
						data.forEach(row=>{
							if(row.name === testUpdateUser.name && row.type === 'admin'){
								check = check + 1;
							}
						})
						return expect(check).toBe(data.length)

		}
	},
		{
		title:"S-14d | before_put event functions are working",
		status:'active',
		author:'Dan Coyle',
		test:async ()=>{


				const {clientToken} = await getTokens();
				const config = {headers: { Authorization: `Bearer ${clientToken}` } };
				const testPut = {
					string:"Testing beforeEvent Function on update",
				}
				const response = await axios.post("http://localhost:5001/api/data_types",{string:"string"},config)
				let {data} = response;
				const id = data[0].id
				const putResponse = await axios.put("http://localhost:5001/api/data_types/"+id,testPut,config)
				return expect(putResponse.data.string).toBe(testPut.string+"| test - successfully appeneded to string 2");
		
		}
	},
		{
		title:"S-14e | after_put event functions are working",
		status:'active',
		author:'Dan Coyle',
		test:async ()=>{
			const {clientToken} = await getTokens();
			const config = {headers: { Authorization: `Bearer ${clientToken}` } };
			const testPut = {
				string:"Testing afterEvent Function on update",
			}
			const response = await axios.post("http://localhost:5001/api/data_types",{string:"string"},config)
			let {data} = response;
			const id = data[0].id
			const putResponse = await axios.put("http://localhost:5001/api/data_types/"+id,testPut,config)
			return expect(putResponse.data.json).toEqual({"message":"also hidden"});
		}
	},
	{
		title:"S-14f | PUT CALL Error handling",
		status:"active",
		author:"Dan Coyle",
		test:async()=>{
				const {clientToken} = await getTokens();
				const config = {headers: { Authorization: `Bearer ${clientToken}` } };
				const response = await axios.put("http://localhost:5001/api/data_types",
					[
						{id:1,string:"string changed| test - successfully appeneded to string 2"},
						{id:99,string:"does not exists will not work"},
					]
					,config)
				const {data} = response;
				expect(data.errors[0]).toEqual("#1 has no changes.")
				expect(data.errors[1]).toEqual("#99 does not exists.")

		}
	}
]

describe('HTTP PUT calls', ()=>{
	tests.forEach((test)=>{
		if(test.status === "active"){
			it(test.title,test.test)
		}else if(test.status === 'todo' || !Boolean(test.status)){
			it.todo(test.title)
		}
	})
})

describe('HTTP PUT calls error handling', ()=>{})