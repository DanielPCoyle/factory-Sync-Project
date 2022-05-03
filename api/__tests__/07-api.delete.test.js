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
		title:"SS-15a | deletes record",
		status:"active",
		test:async () =>{
			const delResponse = await axios.delete("http://localhost:5001/api/post/1")
			return expect(delResponse.data[0].status ).toBe("success")
		}
	},
	{
		title:"SS-15b | deletes record in bulk (via array)",
		status:"active",
		test:async()=>{
			const postList = 		[
	    {
	        "id":2
	    },
	    {
	        "id":3
	    }
		];
			const delResponse = await axios.delete("http://localhost:5001/api/post",{data:postList})
			let check = 0
			delResponse.data.forEach((record)=>{
				if(record.status === "success"){
					check = check + 1;
				}
			})

			return expect(check).toBe(delResponse.data.length)
		}
	},
	{
		title:" SS-15c | delete records in bulk (via filter)",
		'status':'active',
		test:async()=>{
			const checkResponseA = await axios.get("http://localhost:5001/api/user?filter=type eq 'admin'")
			if(!checkResponseA.data?.length){
				return expect(checkResponseA.data.length).toBeGreaterThanOrEqual(1)
			}
			// const delResponse = await axios.delete("http://localhost:5001/api/user?filter=type eq 'admin'")
			const checkResponseB = await axios.get("http://localhost:5001/api/user?filter=type eq 'admin'")
			const {data} = checkResponseB
			return expect(data.length).toBe(0)
		}
	},
	{
		title:"S-15d | DELETE CALL Error handling",
		status:"active",
		author:"Dan Coyle",
		test:async()=>{
			try{
				await axios.delete("http://localhost:5001/api/user/99")
			} catch(e){
				expect(e.response.status).toEqual(404)
				expect(e.response.data.errors[0]).toEqual('user record #99 not found')
			}
			try{
				await axios.delete("http://localhost:5001/api/notAModel")
			} catch(e){
				expect(e.response.status).toEqual(200)
				expect(e.response.data[0].status).toEqual('error')
				expect(e.response.data[0].message).toEqual('user record #99 was not deleted. Please check your request.')
			}
		}
	},
	{
		title:"SS-15e | onDelete column in sheet is properly being parsed and applied to DB deletions.",
		status:"todo",
		author:"Dan Coyle",
	},
	{
		title:"S-15f | before_delete event function is firing",
		status:"active",
		author:"Dan Coyle",
		test:async ()=>{
			const {clientToken} = await getTokens();
			const config = {headers: { Authorization: `Bearer ${clientToken}` } };
			const results = await axios.delete("http://localhost:5001/api/data_types/1",config);
			return expect(results.data[0].errors[0]).toEqual("Should not work")
		}
	},
	{
		title:"S-15g | after_delete event function is firing",
		status:"active",
		author:"Dan Coyle",
		test:()=>{
			
		}
	}
]
describe('HTTP DELETE calls',()=>{
	tests.forEach((test)=>{
		if(test.status === "active"){
			it(test.title,test.test)
		}else if(test.status === 'todo' || !Boolean(test.status)){
			it.todo(test.title)
		}
	})
})