const Sequelize = require("sequelize");

function isObject(object) {
  return object != null && typeof object === 'object';
}

const convertTime12to24 = (time12h) => {
  const time = time12h.replace("PM","").replace("AM","");

  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }
  

  if (time12h.includes('PM')) {
    hours = parseInt(hours, 10) + 12;
  }

  return [Number(hours),Number(minutes)];
}


function deepEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      (areObjects && !deepEqual(val1, val2)) 
      ||
      (!areObjects && val1 !== val2)
    ) {
      return false;
    }
  }
  return true;
}


const getMigrationType = (fieldType,field) => {
  const lType = fieldType?.toLowerCase();
  const value =  lType === "int" ? Sequelize.DataTypes.INTEGER :
        ["string"].includes(lType) ? Sequelize.DataTypes.STRING :
         lType === "boolean" ? Sequelize.DataTypes.BOOLEAN :
         ["file","text","image"].includes(lType) ? Sequelize.DataTypes.TEXT :
         lType === "decimal" ? Sequelize.DataTypes.DECIMAL :
         lType === "double" ? Sequelize.DataTypes.DOUBLE :
         lType === "date-time" ? Sequelize.DataTypes.DATE :
         lType === "date-only" ? Sequelize.DataTypes.DATEONLY :
         lType === "bigint" ? Sequelize.DataTypes.BIGINT :
         lType === "text-array" ? Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.TEXT) :
         lType === "enum-array" ? Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.ENUM) :
         lType === "enum" ? `Sequelize.ENUM(${field?.enum?.split(",")?.map(e=>`"${e}"`)?.join(",") || ""})` :
         ["files","images","json-array","json"].includes(lType) ? Sequelize.DataTypes.JSON :
         lType === "blob" ? Sequelize.DataTypes.BLOB :
         lType === "uuid" ? Sequelize.DataTypes.UUID :
         lType === "inet" ? Sequelize.DataTypes.INET :
         lType === "macaddr" ? Sequelize.DataTypes.MACADDR :
         lType === "float" ? Sequelize.DataTypes.FLOAT :
         lType === "geometry" ? Sequelize.DataTypes.GEOMETRY :
         Sequelize.DataTypes.STRING
   return value;
} 

const  makeField = (f) => ({
    name:f.field,
    table:f.table,
    allowNull:Boolean( f.allowNull?.toLowerCase() !== "false" ),
    type: typeof getMigrationType( f.type,f ) === "string" ?
     // TODO: look into fixing this! It might be ok if it never runs in production.
     eval(getMigrationType( f.type,f )) : // eslint-disable-line
     getMigrationType( f.type,f ),
    primaryKey:Boolean( f.primary?.toLowerCase() === "true" ),
    autoIncrement:Boolean( f.autoIncrement?.toLowerCase() === "true" ),
    comment:f.comment,
    unique:Boolean( f.unique?.toLowerCase() === "true" ),
})

 const parseURL = (req) =>{
	const fullUrl = req.originalUrl.split("?")[0];
	const reqData = fullUrl.split("/");
let id
	reqData.shift();
	reqData.shift();
	const model = reqData.shift();
	const subModels = {};
	reqData.forEach((part,i)=>{
		if(i === 0){
			id = part
		} else{
			if(i % 2 !== 0){
				subModels[part] = Number(reqData[i+1]) ? 
					Number(reqData[i+1]) : 
					null
			}
		}
	})
	return {model,id,subModels}
}

module.exports = {
	deepEqual,
	getMigrationType,
	makeField,
  parseURL,
  convertTime12to24
}

