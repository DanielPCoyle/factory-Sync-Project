export default (rawValue)=>{
    if(Boolean(rawValue)){
        return rawValue.map((file)=>{
            return file.replace('./uploads',process.env.api_url+"/__file__")
        });
    }
    return rawValue
}