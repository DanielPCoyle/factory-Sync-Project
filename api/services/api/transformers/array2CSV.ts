export const array2CSV = async (postData)=>{
	const {field,data} = postData;
	const value = data[field].join(",");
	data[field] = value;
	return data
}


