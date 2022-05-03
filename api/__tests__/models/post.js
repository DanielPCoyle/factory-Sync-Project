const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const args = [{
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_7\"}"
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_8\"}"
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "{\"comment\":\"\",\"uid\":\"test_9\"}"
    },
    auth_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "{\"comment\":\"\",\"uid\":\"test_10\"}",
      references: {
        model: 'user',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('published', 'draft', 'hidden'),
      allowNull: false,
      defaultValue: "published",
      comment: "{\"comment\":\"\",\"uid\":\"test_11\"}"
    }
  }, {
    sequelize,
    tableName: 'post',
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
        name: "auth_id",
        using: "BTREE",
        fields: [{
          name: "auth_id"
        }, ]
      },
    ]
  }]

  return sequelize.define('post', args[0], args[1]);
};