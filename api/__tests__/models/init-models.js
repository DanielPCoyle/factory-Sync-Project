var DataTypes = require("sequelize").DataTypes;
var _user = require("./user");
var _post = require("./post");
var _data_types = require("./data_types");

function initModels(sequelize) {
	var user = _user(sequelize, DataTypes);
	var post = _post(sequelize, DataTypes);
	var data_types = _data_types(sequelize, DataTypes);
	user.hasMany(post, { as: "post", foreignKey: "auth_id"});
	post.belongsTo(user, { as: "owner", foreignKey: "auth_id"});

	return {
		user,
		post,
		data_types

	}

}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;