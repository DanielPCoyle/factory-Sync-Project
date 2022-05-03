const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const args = [{
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_1\"}"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_2\"}"
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_3\"}",
      unique: "email"
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_4\"}"
    },
    photo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_5\"}"
    },
    type: {
      type: DataTypes.ENUM('client', 'staff', 'admin'),
      allowNull: false,
      defaultValue: "client",
      comment: "{\"comment\":\"\",\"uid\":\"test_6\"}"
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: "inactive",
      comment: "{\"comment\":\"\",\"uid\":\"test_6a\"}"
    }
  }, {
    sequelize,
    tableName: 'user',
    timestamps: false,
    indexes: [{
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [{
          name: "id"
        }, ]
      },
      {
        name: "id",
        unique: true,
        using: "BTREE",
        fields: [{
          name: "id"
        }, ]
      },
      {
        name: "email",
        unique: true,
        using: "BTREE",
        fields: [{
          name: "email"
        }, ]
      },
    ]
  }]

  return sequelize.define('user', args[0], args[1]);
};