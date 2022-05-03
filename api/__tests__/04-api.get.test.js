import axios from "axios";
import { config } from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env.'+process.env.NODE_ENV)) {
	config({ path: '.env.'+process.env.NODE_ENV })
}else{
	config()
}


export const tests = [
	{
		title:"SS-12a | returns an array of records when no id is supplied",
		author:"Dan Coyle",
		status:'active',
		test:async()=>{
			const response = await axios.get("http://localhost:5001/api/user");
			const {data} =  response;
			return expect(Array.isArray(data)).toBe(true)
		}
	},
	{
		title:"SS-12b | returns a a single record when an id is supplied",
		author:"Dan Coyle",
		status:'active',
		test: async()=>{
			const response = await axios.get("http://localhost:5001/api/user/1");
			const {data} =  response;
			return expect(Boolean(typeof data === "object")).toBe(true)
		}
	},
	{
		title:"SS-12e | limits data when the limit query param is applied",
		status:"active",
		author:"Dan Coyle",
		test:async()=>{
			const check = await axios.get("http://localhost:5001/api/post?limit=1")
			const {data} = check
			return expect(data.length).toBe(1)
		}
	},
	{
		title:"SS-12f | applies pagination to data returned when the page query param is applied",
		status:"active",
		author:"Dan Coyle",
		test:async ()=>{
			const check = await axios.get("http://localhost:5001/api/post?limit=1&page=2")
			const {data} = check
			return expect(data[0].id).toBe(2)
		}
	},
	{
		title:"SS-12g | applies pagination to data returned when the page query param is applied",
		status:"active",
		author:"Dan Coyle",
		test:async ()=>{
			const check = await axios.get("http://localhost:5001/api/post?limit=1&page=2")
			const {data} = check
			return expect(data[0].id).toBe(2)
		}
	},
	{
		title:"SS-12h | expands related data specified by the expand query param",
		author:"Dan Coyle",
		status:'active',
		test:async ()=>{
			const check = await axios.get("http://localhost:5001/api/user/1?expand=post")
			const {data} = check
			return expect(Boolean(data.post.length)).toBe(true)
		}
	},
	{
		title:"SS-12i | searches records in DB based on the search query param and specified searchable fields from syncing 'fields' sheet",
		author:"Dan Coyle",
		status:'active',
		test:async()=>{
			const searchWord = "suplex";
			const response = await axios.get("http://localhost:5001/api/post?search="+searchWord)
			const {data} =  response;
			if(!data.length){
				return expect(data.length).toBeGreaterThanOrEqual(1)
			}
			let searchCheck = 0;
			data.forEach((record)=>{
				if(record.title.toLowerCase().includes(searchWord) || record.content.toLowerCase().includes(searchWord)){
					searchCheck = searchCheck+1;
				}
			})
			return expect(searchCheck).toEqual(data.length)
		}
	},
	{
		title:"SS-12j | orders returning data based on the order query param",
		author:"Dan Coyle",
		status:'active',
		test:async()=>{
			const response1 = await axios.get("http://localhost:5001/api/post")
			const data1 = response1.data;
			if(!data1.length){
				return expect(data1.length).toBeGreaterThanOrEqual(1)
			}
			const response2 = await axios.get("http://localhost:5001/api/post?order=title")
			const data2 = response2.data;

			return expect(data1.sort((a, b) => (a.title > b.title) ? 1 : -1)).toEqual(data2)
		}
	},
	{
		title:"SS-12k | filters data when the filter query param is applied",
		author:"Dan Coyle",
		status:'active',
		test:async ()=>{
			const searchWord = "test";
			const response = await axios.get("http://localhost:5001/api/user?filter=name loose '"+searchWord+"'")
			const {data} =  response;
			if(!data.length){
				return expect(data.length).toBeGreaterThanOrEqual(1)
			}
			let searchCheck = 0;
			data.forEach((record)=>{
				if(record.name.toLowerCase().includes(searchWord)){
					searchCheck = searchCheck+1;
				}
			})
			return expect(searchCheck).toEqual(data.length)
		}
	},
	{
		title:"SS-12l | selects specific fields from the data specified by the select query param ",
		author:"Dan Coyle",
		status:'active',
		test:async()=>{
			const selectedFields = ["id","name"]
			const response = await axios.get("http://localhost:5001/api/user/1?select="+selectedFields.join(","))
			const {data} =  response;
			return expect(Object.keys(data)).toEqual(selectedFields)
		}
	},
	{
		title:"SS-12m | returns meta data along with data when withMeta is included in query params",
		author:"Dan Coyle",
		status:'active',
		test:async()=>{
			const response = await axios.get("http://localhost:5001/api/user?withMeta=true")
			const {data} =  response;
			return expect(Object.keys(data).sort()).toEqual(['meta','data'].sort())
		}
	},
	{
		title:"SS-12n | returns a count of the records when count is included in query params",
		status:"active",
		author:"Dan Coyle",
		test:async()=>{
			const response = await axios.get("http://localhost:5001/api/user?count=true")
			const {data} =  response;
			return expect(data).toBeGreaterThanOrEqual(0)

		}
	},
	{
		title:"S-12o | GET CALL Error handling",
		status:"active",
		author:"Dan Coyle",
		test:async ()=>{
			try{
				await axios.get("http://localhost:5001/api/user/99")
			} catch(e){
				expect(e.response.status).toEqual(404)
				expect(e.response.data.errors[0]).toEqual('user record #99 not found')
			}
			try{
				await axios.get("http://localhost:5001/api/notAModel")
			} catch(e){
				expect(e.response.status).toEqual(404)
				expect(e.response.data.errors[0]).toEqual('model notAModel not found')
			}
		}
	}
];

describe('HTTP GET calls',()=>{
	tests.forEach((test)=>{
		if(test.status === "active"){
			it(test.title,test.test)
		}else if(test.status === 'todo' || !Boolean(test.status)){
			it.todo(test.title)
		}
	})
})

describe('HTTP GET calls error handling', ()=>{})
