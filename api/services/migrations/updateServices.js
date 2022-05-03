const {deepEqual} = require("../util");
 const prepareFieldChange = (fieldGroup) => {
  const changes = [];
  const {current,previous} = fieldGroup;
  const currentOptions = {...current};
  const previousOptions = {...previous};
  delete(currentOptions.name)
  delete(currentOptions.table)
  delete(previousOptions.name)
  delete(previousOptions.table)

  if(current.name !== previous.name){
    changes.push(
       (queryInterface)=> queryInterface.renameColumn(current.table,previous.name,current.name)
     )
  }

  if(current.table !== previous.table){
    changes.push(
       (queryInterface)=> queryInterface.removeColumn(previous.table,previous.name),
       (queryInterface)=> queryInterface.addColumn(current.table,current.name,currentOptions.type,currentOptions),
    )
  }

  if(!deepEqual(currentOptions,previousOptions)){
    changes.push(
       (queryInterface)=> queryInterface.changeColumn(current.table,current.name,currentOptions),
    )
  }

  return changes
}

module.exports = {
  prepareFieldChange
}