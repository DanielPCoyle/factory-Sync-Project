const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const args = [{
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_12_0\"}"
    },
    string: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_12\"}"
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_13\"}"
    },
    enum: {
      type: DataTypes.ENUM('a', 'b'),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_14\"}"
    },
    json: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_15\"}"
    },
    double: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_16\"}"
    },
    decimal: {
      type: DataTypes.DECIMAL(10, 0),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_17\"}"
    },
    'date-time': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_18\"}"
    },
    'date-only': {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_19\"}"
    },
    int: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_20\"}"
    },
    bigint: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_21\"}"
    },
    float: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_22\"}"
    },
    real: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_23\"}"
    },
    boolean: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_24\"}"
    },
    text_array: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_25\"}"
    },
    enum_array: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_26\"}"
    },
    blob: {
      type: DataTypes.BLOB,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_27\"}"
    },
    uuid: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_28\"}"
    },
    cidr: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_29\"}"
    },
    range: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_32\"}"
    },
    geometry: {
      type: DataTypes.GEOMETRY,
      allowNull: true,
      comment: "{\"comment\":\"\",\"uid\":\"test_33\"}"
    }
  }, {
    sequelize,
    tableName: 'data_types',
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
    ]
  }]

  return sequelize.define('data_types', args[0], args[1]);
};