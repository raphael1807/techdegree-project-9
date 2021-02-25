'use strict';
const { Model, DataTypes } = require('sequelize');

// ------------------------------------------
// COURSE MODEL 
// title, description, estimatedTime, materialsNeeded
// ------------------------------------------

module.exports = (sequelize) => {
  class Course extends Model { }
  Course.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Please provide a title"
        },
        notNull: {
          msg: "A title is required",
        },
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Please provide a description"
        },
        notNull: {
          msg: "A description is required",
        },
      }
    },
    estimatedTime: {
      type: DataTypes.STRING
    },
    materialsNeeded: {
      type: DataTypes.STRING
    }
  }, { sequelize });

  // ------------------------------------------
  // MODEL ASSOCIATIONS
  // belongsTo() Method
  // Tells Sequelize that Courses model is one-to-one association between the Course and User models
  // ------------------------------------------
  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      allowNull: false,
      foreignKey: {
        fieldName: 'userId',
      }
    });
  };

  return Course;
};
