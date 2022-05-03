import axios from "axios";
import bcrypt from "bcrypt";
import {makeid} from "@core/components/Form/util";

const clientTestingPassword = "TryMeGuy341!";
const clientTestingEmail = "testClientCreation_"+makeid(8)+"@gmail.com";
const adminTestingPassword = "TryMeGuy341!";
const adminTestingEmail = "testAdminCreation_"+makeid(8)+"@gmail.com";

const getTokens = async ()=> {
	const clientResults = await axios.post("http://localhost:5001/login",{email:clientTestingEmail, password:clientTestingPassword})
	const clientToken = clientResults.data.token
	const adminResults = await axios.post("http://localhost:5001/login",{email:adminTestingEmail, password:adminTestingPassword})
	const adminToken = adminResults.data.token
	return {clientToken,adminToken}
}




export const tests = [
	{
		title:'SS-8a | a user can be created via an api POST call',
		author:"Dan Coyle",
		status:"active",
		test:async()=>{
			const userObj = [
			{
				"name":"test client creation",
				"password":clientTestingPassword,
				"email":clientTestingEmail
			},
			{
				"name":"test admin creation",
				"password":adminTestingPassword,
				"email":adminTestingEmail,
				"type":"admin"
			},
			];
			const response = await axios.post("http://localhost:5001/api/user",userObj)
			const {data} = response;
			expect(data[0].email).toBe(userObj[0].email)
		}
	},
	{
		title:'SS-8b | user\'s password will be hased on creation if the column "write_transformer" has "password" as it\'s value' ,
		author:"Dan Coyle",
		status:"active",
		test:async()=>{
			const response = await axios.get("http://localhost:5001/api/user?filter=email eq '"+clientTestingEmail+"'")
			const {data} = response;
			const check = await bcrypt.compare(clientTestingPassword, data[0].password)
			expect(check).toBe(true)
		}
	},
	{
		title:'SS-8c | user can exchange correct user name and password for access token' ,
		author:"Dan Coyle",
		status:"active",
		test:async()=>{
			const userObj = {
				"password":clientTestingPassword,
				"email":clientTestingEmail
			};
			const response = await axios.post("http://localhost:5001/login",userObj)
			const {data} = response;
			expect(Object.keys(data)).toEqual(['token'])
		}
	},
	{
		title:'SS-8d | user cannot exchange incorrect user name for access token' ,
		author:"Dan Coyle",
		status:"active",
		test:async()=>{
			const userObj = {
				"password":clientTestingPassword,
				"email":"123"+clientTestingEmail
			};
			await axios.post("http://localhost:5001/login",userObj).then().catch((error)=>{
				const {data} = error.response;
				expect(data.message).toEqual('We could not find your user')
			})
		}
	},
	{
		title:'SS-8d | user cannot exchange incorrect password for access token' ,
		author:"Dan Coyle",
		status:"active",
		test:async()=>{
			const userObj = {
				"password":clientTestingPassword+"!",
				"email":clientTestingEmail
			};
			await axios.post("http://localhost:5001/login",userObj).then().catch((error)=>{
				const {data} = error.response;
				expect(data.message).toEqual('Password is incorrect')
			})			
		}
	},
	{
		title:'SS-8e | A user\'s email must be unique' ,
		author:"Dan Coyle",
		status:"active",
		test:async()=>{
			const userObj = {
				"name":"test user creation",
				"password":clientTestingPassword,
				"email":clientTestingEmail
			};


			await axios.post("http://localhost:5001/api/user",userObj).then().catch((error)=>{
				const {data} = error.response;
				expect(data.error).toEqual("Duplicate entry '"+clientTestingEmail+"' for key 'user.email'")
			})		

		}
	},
	{
		title:'SS-8f | A user\'s password must qualify as secure' ,
		author:"Dan Coyle",
		status:"active",
		test:async()=>{
			const testUsers = [
			    {
			    "name":"222 woobadoo",
			    "password":"Password123",
			    "email":"test+1213d1@gmail.com"
			    },

			    {
			    "name":"222 woobadoo",
			    "password":"Password1",
			    "email":"test+1213d@gmail.com"
			    },

			    {
			    "name":"222 woobadoo",
			    "password":"TryMeGuy341!",
			    "email":"test+12113d@gmail.com"
			    }
			]
		
			await axios.post("http://localhost:5001/api/user",testUsers).then().catch((error)=>{
				const {data} = error.response;
				let check = 0;
				check = Boolean(data[0].errors) ? check + 1 : check
				check = Boolean(data[1].errors) ? check + 1 : check
				check = Boolean(data[2].id) ? check + 1 : check
				expect(check).toBe(3)
			})	


		}
	},
	{
		title:'SS-8g | A user\'s cannot make GET calls on secure data without an access token' ,
		author:"Dan Coyle",
		status:"active",
		test:async()=>{
			try{
				await axios.get("http://localhost:5001/api/data_types");
			} catch(e){
				return expect(e.response.statusText).toBe('Unauthorized')
			}
		}
	},
	{
		title:'SS-8h | A user\'s cannot make POST calls on secure data without an access token' ,
		author:"Dan Coyle",
		status:"active",
		test:async()=>{
			try{
				await axios.post("http://localhost:5001/api/data_types",{string:"Hello!"});
			} catch(e){
				return expect(e.response.statusText).toBe('Unauthorized')
			}
		}
	},
	{
		title:'SS-8i | A user\'s cannot make PUT calls on secure data without an access token' ,
		author:"Dan Coyle",
		status:"active",
		test:async()=>{
			try{
				await axios.put("http://localhost:5001/api/data_types/1",{string:"Hello Hello!"});
			} catch(e){
				return expect(e.response.statusText).toBe('Unauthorized')
			}
		}
	},
	{
		title:'SS-8j | A user\'s cannot make DELETE calls on secure data without an access token' ,
		author:"Dan Coyle",
		status:"active",
		test:async()=>{
			try{
				await axios.delete("http://localhost:5001/api/data_types/1");
			} catch(e){
				return expect(e.response.statusText).toBe('Unauthorized')
			}
		}
	},
	{
		title:"SS-8k | A user's cannot make GET calls on secure data with unauthorized access token (Role Based Access)",
		author:"Dan Coyle",
		status:"active",
		test:async()=>{
			const {adminToken} = await getTokens()
			const config = {headers: { Authorization: `Bearer ${adminToken}` } };
			 try{
				await axios.get("http://localhost:5001/api/data_types",config)
			} catch(e){
				return expect(e.response.statusText).toBe('Forbidden')
			}
		}
	},
	{
		title:"SS-8l | A user's cannot make POST calls on secure data with unauthorized access token (Role Based Access)",
		author:"Dan Coyle",
		status:"active",
		test:async()=>{
			const {adminToken} = await getTokens()
			const config = {headers: { Authorization: `Bearer ${adminToken}` } };
			try{
				await axios.post("http://localhost:5001/api/data_types",{string:"Hello!"},config);
			} catch(e){
				return expect(e.response.statusText).toBe('Forbidden')
			}
		}
	},
	{
		title:"SS-8m | A user's cannot make PUT calls on secure data with unauthorized access token (Role Based Access)",
		author:"Dan Coyle",
		status:"active",
		test:async()=>{
			const {adminToken} = await getTokens()
			const config = {headers: { Authorization: `Bearer ${adminToken}` } };
			try{
				await axios.put("http://localhost:5001/api/data_types/1",{string:"Hello Hello!"},config);
			} catch(e){
				return expect(e.response.statusText).toBe('Forbidden')
			}
		}
	},
	{
		title:"SS-8n | A user's cannot make DELETE calls on secure data with unauthorized access token (Role Based Access)",
		author:"Dan Coyle",
		status:"active",
		test:async()=>{
			const {adminToken} = await getTokens()
			const config = {headers: { Authorization: `Bearer ${adminToken}` } };
			try{
				await axios.delete("http://localhost:5001/api/data_types/1",config);
			} catch(e){
				return expect(e.response.statusText).toBe('Forbidden')
			}
		}
	},
{ 
	title:"SS-8o | A user's can make GET calls on secure data with authorized access token (Role Based Access)",
	status:"active",
	test:async()=>{
		const {clientToken} = await getTokens()
		const config = {headers: { Authorization: `Bearer ${clientToken}` } };
		const response =  await axios.get("http://localhost:5001/api/data_types",config)
		return expect(Array.isArray(response.data)).toBe(true)
	}
},
{ 
	title:"SS-8p | A user's can make POST calls on secure data with authorized access token (Role Based Access)",
	status:"active",
	test:async()=>{
		const {clientToken} = await getTokens()
		const config = {headers: { Authorization: `Bearer ${clientToken}` } };
		const response =  await axios.post("http://localhost:5001/api/data_types",{string:"test"},config)
		return expect(response.data[0].id).toBeGreaterThanOrEqual(1)
	}
},
{ 
	title:"SS-8q | A user's can make PUT calls on secure data with authorized access token (Role Based Access)",
	status:"active",
	test:async()=>{
		const {clientToken} = await getTokens()
		const config = {headers: { Authorization: `Bearer ${clientToken}` } };
		const {data} = await axios.post("http://localhost:5001/api/data_types",{string:"this is wrong"},config)
		const response =  await axios.put("http://localhost:5001/api/data_types/"+data[0].id,{string:"string changed"},config)
		return expect(response.data.string).toBe("string changed")
	}
},
{ 
	title:"SS-8r | A user's can make DELETE calls on secure data with authorized access token (Role Based Access)",
	status:"active",
	test:async()=>{
		const {clientToken} = await getTokens()
		const config = {headers: { Authorization: `Bearer ${clientToken}` } };
		const {data} = await axios.post("http://localhost:5001/api/data_types",{string:"Hello!"});
		const response =  await axios.delete("http://localhost:5001/api/data_types/"+data[0].id,config)
		return expect(response.data[0].status).toBe("success")
	}
},
]

describe('API AUTH',()=>{
	tests.forEach((test)=>{
		if(test.status === "active"){
			it(test.title,test.test)
		}else if(test.status === 'todo' || !Boolean(test.status)){
			it.todo(test.title)
		}
	})
})

describe('AUTH error handling', ()=>{})
