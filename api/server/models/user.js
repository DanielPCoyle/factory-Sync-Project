const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const args = [{
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "{\"comment\":\"\",\"uid\":\"adfas\"}"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"fdgf\"}"
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"werbg\"}",
      unique: "email"
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"hjyhjh\"}"
    },
    photo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"zxvbn\"}"
    },
    type: {
      type: DataTypes.ENUM('client', 'staff', 'admin'),
      allowNull: false,
      defaultValue: "client",
      comment: "{\"comment\":\"\",\"uid\":\"retuiol\"}"
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: "inactive",
      comment: "{\"comment\":\"\",\"uid\":\"sdghjkmn\"}"
    },
    stripe_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"aslfksdj2d\"}"
    },
    push_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"dfsdf3ff\"}"
    },
    onboarded: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      comment: "{\"comment\":\"\",\"uid\":\"ddds3fe2\"}"
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"dsdf3vvfd\"}"
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