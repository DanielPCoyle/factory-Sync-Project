const fs = require("fs");
const path = require("path");
const util = require('util');
const readdir = util.promisify(fs.readdir);
const {prepareFieldChange} = require("./updateServices");
const {deepEqual,makeField} = require("../util");
const {config} = require('dotenv');

if (fs.existsSync('.env.'+process.env.NODE_ENV)) {
  config({ path: '.env.'+process.env.NODE_ENV })
}else{
    config()
}

const migrationPath = path.resolve(process.env.MIGRATION_DIR);

const initMigration = (timeStamp) => {
   const fields  = require(migrationPath+`/${timeStamp}-fields`);
   const dbCreateTables = {};
   const dbModifyTables = {};
   const fieldMeta = {};
   
   fields.forEach((f)=>{
      if(!Boolean(dbCreateTables[f.table])){
        dbCreateTables[f.table] = {};
        dbModifyTables[f.table] = {};
        fieldMeta[f.table] = {};
      }

     dbCreateTables[f.table][f.field] = makeField(f);
     fieldMeta[f.table][f.field] = f;

     if(f.defaultValue){
     dbCreateTables[f.table][f.field].defaultValue = f.defaultValue;
    }

    if(f.notNull){
      dbCreateTables[f.table][f.field].allowNull = false;
    }

    dbCreateTables[f.table][f.field].comment = JSON.stringify({
      comment:f?.comment,
      uid:f?.uid,
    })

    if(f.references){
      const refObj = {};
      f.references.split("|").forEach(bit=>{
        bit = bit.split(":")
        refObj[bit[0]] = bit[1]
      })

      if(!Boolean(dbModifyTables[f.table][f.field])){
        dbModifyTables[f.table][f.field] = {};
      }
      dbModifyTables[f.table][f.field].references = {
        model:refObj.table,
        key:refObj?.key || 'id',
      }
    }

    if(f.onDelete){
      if(!Boolean(dbModifyTables[f.table][f.field])){
        dbModifyTables[f.table][f.field] = {};
      }
      dbModifyTables[f.table][f.field].onDelete = f.onDelete
    }
 
  });

   return {
    dbCreateTables,
    dbModifyTables,
    fieldMeta
   }
}

const handleMeta = async (tableMeta,queryInterface) => {
const dbFields = ["uid", "table", "field", "comment", "allowNull", "defaultValue", "primary", "autoIncrement", "unique"]
const tags = {
  searchable:['api']
}

const inserts = [];
  Object.keys(tableMeta).forEach((field)=>{
     Object.keys(tableMeta[field]).forEach((key)=>{
      if(!dbFields.includes(key) && tableMeta[field][key]){
        const obj = {
          uid:tableMeta[field].uid,
          tags:tags?.[key] ? JSON.stringify(tags[key]) : null,
          key,
          value:tableMeta[field][key]
        }
        inserts.push(obj)
      }
    })
  })
  if(inserts.length){
    await queryInterface.bulkInsert('sync_meta',inserts); 
  }
}

const migration = async (timeStamp) => {
    const currentData  = require(migrationPath+`/${timeStamp}-fields`);
    const path1 = path.resolve(migrationPath);
    const newTableFields = {};
    const deletedTableFields = {};
    const newFields = [];
    const updateFields = [];
    const deleteFields = [];
    let files = await readdir(path1)
    files = files.filter(f => f.includes(".json"))
    const fIndex = files.findIndex(f=>{
      return f.includes(timeStamp)
    })
    const prevFile = files[fIndex-1]
    const previousData  = require( path.resolve(path1+"/"+prevFile) );

    currentData.forEach((field)=>{
      const prevField = previousData.find((f)=>f.uid === field.uid)
      if(Boolean(prevField)){
        if(!deepEqual(field,prevField)){
          field.comment = JSON.stringify({
            comment:field?.comment,
            uid:field?.uid,
          })

          updateFields.push({
            current:makeField(field),
            previous:makeField(prevField)
          });
        }
      } else{
          // Does table exisits?
          if(!Boolean(previousData.filter(f=>f.table === field.table).length)){
            if(!Boolean(newTableFields[field.table])){
              newTableFields[field.table] = {};
            }
            newTableFields[field.table][field.field] = makeField(field)
            newTableFields[field.table][field.field].comment = JSON.stringify({
              comment:field?.comment,
              uid:field?.uid,
            })
          }else{
             field.comment = JSON.stringify({
              comment:field?.comment,
              uid:field?.uid,
            });

            newFields.push(makeField(field));
          }
      }
    })

     previousData.forEach(field => {
        if( !Boolean(currentData.find(c=>c.uid === field.uid)) ){
          if(!Boolean(currentData.filter(f=>f.table === field.table).length)){
            if(!Boolean(deletedTableFields[field.table])){
              deletedTableFields[field.table] = [];
            }
            deletedTableFields[field.table].push(makeField(field))
          }else{
            deleteFields.push(makeField(field))
          }
        }
     })

    return {
      newTableFields,
      deletedTableFields,
      newFields,
      updateFields,
      deleteFields
    }
}

const modify = async (queryInterface,dbModifyTables,dbCreateTables) => {
  await Promise.all(Object.keys(dbModifyTables)
  .filter(table => Object.keys(dbModifyTables[table]).length )
  .map(async (table)=>{
   await Promise.all(Object.keys(dbModifyTables[table]).map(async field=>{
        await queryInterface.changeColumn(table, field, {
          ...dbCreateTables[table][field],
          ...dbModifyTables[table][field]
        })
      }
    ))
  }))
}

const initUp = (initMigration) => async (queryInterface, Sequelize) => {
  const {dbCreateTables,dbModifyTables,fieldMeta} = initMigration;

  await queryInterface.createTable('sync_meta', {
    id:{
       name:'id',
      table:'meta',
      allowNull:false,
      type: Sequelize.DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true,
      unique:true,
    },
    uid:{
       name:'uid',
      table:'meta',
      allowNull:false,
      type: Sequelize.DataTypes.STRING,
      primaryKey:false,
      autoIncrement:false,
      unique:false,
    },
    tags:{
      name:'tags',
      table:'meta',
      allowNull:true,
      type: Sequelize.DataTypes.JSON,
      primaryKey:false,
      autoIncrement:false,
      unique:false,
    },
    key:{
       name:'key',
      table:'meta',
      allowNull:false,
      type: Sequelize.DataTypes.STRING,
      primaryKey:false,
      autoIncrement:false,
      unique:false,
    },
    value:{
      name:'value',
      table:'meta',
      allowNull:false,
      type: Sequelize.DataTypes.STRING,
      primaryKey:false,
      autoIncrement:false,
      unique:false,
    },
  });

  await Object.keys(dbCreateTables).map( async (table)=>{
    try{
      await queryInterface.createTable(table, dbCreateTables[table]);
      await handleMeta(fieldMeta[table],queryInterface)
    }catch(e){
      console.log("\n\n\nERROR::",e)
    }
  })

  return modify(queryInterface,dbModifyTables,dbCreateTables)
}

const initDown = (initMigration) =>  async (queryInterface, Sequelize) => {
  await queryInterface.dropAllTables();  
}

const up = (datetime) => async (queryInterface, Sequelize) => {
    // TODO: Handle Renaming of tables. 
    const {newFields,updateFields,deleteFields,newTableFields,deletedTableFields} = await migration(datetime);    
    try{


    // NEW FIELDS ON NEW TABLE
    console.log("NEW FIELDS ON NEW TABLES:",newTableFields)

    await Promise.all(Object.keys(newTableFields).map( async (table)=>{
        await queryInterface.createTable(table, newTableFields[table]);
    }))

    // ADD NEW FIELDS TO EXISTING TABLE
    console.log("NEW FIELDS ON EXISITING TABLES:",newFields)
    await Promise.all(
      newFields.map(async (field)=>{
          const attr = {...field};
          delete(attr.name);
          delete(attr.table);
          await queryInterface.addColumn(field.table,field.name,attr);
      })
    )

    // UPDATE EXISTING FIELDS
    console.log("UPDATED FIELDS",updateFields)
    updateFields.map(async (fieldGroup)=>{
      const changes =  prepareFieldChange(fieldGroup);
       await Promise.all(changes.map(async func=>{
        await func(queryInterface)
       }))
    })

    // DELETE FIELDS
    await Promise.all(deleteFields.map(async (field)=>{
      try{
        await queryInterface.removeColumn(field.table,field.name);
      } catch(error){
        console.log("DELETE ERROR::",error)
      }
    }))

    // DELETE TABLE
     await Promise.all(Object.keys(deletedTableFields).map( async (table)=>{
      await queryInterface.dropTable(table, deletedTableFields[table]);
    }))
   } catch(e){
      console.log(e)
   }
}

const down = (migration) => async (queryInterface, Sequelize) => {
    
}

module.exports = {
  initMigration,
  initUp,
  initDown,
  migration,
  up,
  down,
}
