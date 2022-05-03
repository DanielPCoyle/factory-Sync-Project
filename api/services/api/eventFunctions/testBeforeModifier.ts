export const testBeforeModifier = (data)=>{
	data.string = data.string + "| test - successfully appeneded to name";
	return data;
}