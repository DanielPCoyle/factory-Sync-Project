const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const args = [{
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "{\"comment\":\"\",\"uid\":\"CD42E81E\"}"
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"CD42E81F\"}",
      references: {
        model: 'user',
        key: 'id'
      }
    },
    line1: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"12941C6F\"}"
    },
    line2: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"A51D0E8D\"}"
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "Philadelphia",
      comment: "{\"comment\":\"\",\"uid\":\"1DF1A9FC\"}"
    },
    postal_code: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"C71A5E7A\"}"
    },
    state: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "PA",
      comment: "{\"comment\":\"\",\"uid\":\"36884368\"}"
    },
    geo: {
      type: DataTypes.GEOMETRY,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"fjved2331\"}"
    }
  }, {
    sequelize,
    tableName: 'addresses',
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
        name: "user_id",
        using: "BTREE",
        fields: [{
          name: "user_id"
        }, ]
      },
    ]
  }]

  return sequelize.define('addresses', args[0], args[1]);
};