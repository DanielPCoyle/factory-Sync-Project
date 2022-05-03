const path = require("path");
const fs = require("fs");
const {deepEqual} = require("../util");
const faker = require('faker');
// const eventFunctions = require( path.resolve("api/services/api/eventFunctions") )
const {config} = require('dotenv');

if (fs.existsSync('.env.'+process.env.NODE_ENV)) {
  config({ path: '.env.'+process.env.NODE_ENV })
}else{
    config()
}

const models  = require(path.resolve((process.env.MODELS_DIR || 'api/server/models/')+"/model-meta"));

module.exports = {
  up:(timeStamp) => async (queryInterface, Sequelize) => {
    const path1 = path.resolve(process.env.SEEDERS_DIR);
    let tables  =  await queryInterface.sequelize.query(`SHOW TABLES`, {
      type: queryInterface.sequelize.QueryTypes.SELECT
    });

    tables = tables.map(t=>{
      const k = Object.keys(t)[0]
      return t[k]
    })

    const fields = {}
    await Promise.all(tables.map(async (table)=>{
      fields[table] = await queryInterface.sequelize.query(` SHOW FULL COLUMNS FROM ${table};`, {
        type: queryInterface.sequelize.QueryTypes.SELECT
      });
    }))
    
    const order = models.sort((a, b) => (a.seed_order > b.seed_order) ? 1 : -1)
    .map(mod => mod.model);

    const seeds  = require(path.resolve(path1,`${timeStamp}-seeds`));
    return await Promise.all(order.map(async (table)=>{
        const tableDef = fields[table]
        if(typeof seeds[table] === "undefined"){
          return
        }
        
        await Promise.all(seeds[table].map(async (row,i)=>{
          try{
            
            const exitstingRow  =  await queryInterface.sequelize.query(`SELECT * FROM ${table} WHERE id = '${row.id}' `, {
                type: queryInterface.sequelize.QueryTypes.SELECT
              });

            if(Boolean(exitstingRow.length)){
              await Promise.all(Object.keys(row).map( async (col)=>{
               

              if(row[col].includes("$$")){
                  row[col] = row[col].split(" ").map(part=>{
                   part =  part.replace(/\$\$/g,"").split(".")
                   part = faker[part[0]][part[1]](part[2] || null);
                  return part;
                }).join(" ")
              } 

              if(col !== "id"){
                let query = null;
                const colType = tableDef.find(f=>f.Field === col).Type
                if(table === "addresses"){
                  console.log("\n\n\nTYPE>>>",col, table, colType);
                }

                if(colType === 'json' ){
                  if(row[col][0] === "{"){
                    row[col] = JSON.parse(row[col])
                  } else{
                    row[col] = row[col].split(',').map(v=>v.trim())
                  }
                  if(!deepEqual(row[col],exitstingRow[0][col])){
                     query = `UPDATE ${table} set ${col} = '${JSON.stringify(row[col])}' WHERE id = ${row.id}`
                  }

                } else if(["int",'decimal'].includes(colType)){
                  if(Number(exitstingRow[0][col]) !== Number(row[col])){
                     query = `UPDATE ${table} set ${col} = '${row[col]}' WHERE id = ${row.id}`
                  }
                } else if(colType === "tinyint(1)"){
                    row[col] = row[col].toLowerCase() === "true" ? 1 : 0
                    if(row[col] !== exitstingRow[0][col]){
                       query = `UPDATE ${table} set ${col} = '${row[col]}' WHERE id = ${row.id}`
                    }
                } 
                else if(colType === "geometry"){
                  row[col] = queryInterface.sequelize.fn('ST_GeomFromText', `POINT(${row[col].coordinates[0]} ${row[col].coordinates[1]})`)
                  if(row[col] !== exitstingRow[0][col]){
                    // TODO update GEOMETRY
                    //  query = `UPDATE ${table} set ${col} = '${row[col]}' WHERE id = ${row.id}`
                  }
                } 
                else{
                  if(Boolean(exitstingRow[0][col]) && row[col] !== exitstingRow[0][col]){
                     query = `UPDATE ${table} set ${col} = '${row[col]}' WHERE id = ${row.id}`
                  }
                }

               if(row[col][0] === "$"){
                  if(col !== "password"){
                    let fakeData = row[col].replace(/\$/g,"").split(".")
                    fakeData = faker[fakeData[0]][fakeData[1]]();
                    row[col] = fakeData;
                  }
                } 

                if(query){
                  await queryInterface.sequelize.query(
                    query, {
                    type: queryInterface.sequelize.QueryTypes.SELECT
                  })
                }
              }
              }))
            } else{
              Object.keys(row).forEach(col=>{

              if(row[col]){
    
                if(row[col].includes("$$")){
                  row[col] = row[col].split(" ").map(part=>{
                     part =  part.replace(/\$\$/g,"").split(".")
                     part = faker[part[0]][part[1]](part[2] || null);
                    return part;
                  }).join(" ")
                } 
                const colData = tableDef.find(f=>{  
                  return f.Field === col
                })


                if(!Boolean(colData?.Type)){
                  console.log("ERROR!::",table,col,colData)
                  return;
                }
                const colType = colData.Type;

                if(colType === "json" && row[col][0] !== "{"){
                  row[col] = JSON.stringify(row[col].split(",").map(val=>val.trim()))
                }
                if(colType === "tinyint(1)"){
                  const check =  row[col]
                  row[col] = Boolean(check === "true" || check === "TRUE") ? 1 : 0
                } 
                if(colType === "geometry"){
                  const d = JSON.parse(row[col]);
                  row[col] = queryInterface.sequelize.fn('ST_GeomFromText', `POINT(${d.coordinates[0]} ${d.coordinates[1]})`)
                } 
                if(Number.isInteger( Number(row[col]) )){
                  row[col] = Number(row[col])
                }
              }
            })

              try{
                // if( Boolean( mMeta?.before_post ) ){
                //   if(eventFunctions?.[mMeta.before_post]){
                //     row = await eventFunctions[mMeta.before_post](row)
                //   }
                // }
                await queryInterface.bulkInsert(table,[row]);  
              } catch (e) {
                console.log({
                  table,
                  row,
                  error: e?.original?.sqlMessage || e, 
                  sql : e?.original?.sql 
                })                
              }
            }
          } catch (e) {
            console.log("ERROR:::",e)
          }
      }))
  }))
  },
  down:(timeStamp)=>{
    
  }
};