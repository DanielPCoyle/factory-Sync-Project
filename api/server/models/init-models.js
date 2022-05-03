var DataTypes = require("sequelize").DataTypes;
var _addresses = require("./addresses");
var _user = require("./user");

function initModels(sequelize) {
	var addresses = _addresses(sequelize, DataTypes);
	var user = _user(sequelize, DataTypes);
	user.hasMany(addresses, { as: "addresses", foreignKey: "user_id"});
	addresses.belongsTo(user, { as: "user", foreignKey: "user_id"});

	return {
		addresses,
		user

	}

}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;