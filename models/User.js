'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');


// ------------------------------------------
// USER MODEL 
// firstName, lastName, emailAddress, password
// ------------------------------------------
module.exports = (sequelize) => {

  class User extends Model { }
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "A first name is required",
        },
        notEmpty: {
          msg: 'Please provide your first name!'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "A last name is required",
        },
        notEmpty: {
          msg: 'Please also provide your last name!'
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'The email you entered already exists.'
      },
      validate: {
        notNull: {
          msg: 'An email address is required.'
        },
        isEmail: {
          msg: 'Please provide a valid email.'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "A password is required",
        },
        notEmpty: {
          msg: "A passsword is required"
        },
      },

      // ------------------------------------------
      // PASSWORD VALUE VALIDATION & ENCRYPTION 
      // ------------------------------------------

      set(value) { // len validation does not seem to work with a setter
        if (value.length >= 8 && value.length <= 20) {
          this.setDataValue('password', bcrypt.hashSync(value, 10));
        } else {
          throw new Error('Your password should be between 8-20 characters!');
        }
      }
    }
  }, { sequelize });

  // ------------------------------------------
  // MODEL ASSOCIATIONS
  // hasMany() Method
  // Tells Sequelize that User model is one-to-many association between the User and Course models using the hasMany() method.
  // ------------------------------------------
  User.associate = (models) => {
    User.hasMany(models.Course, {
      allowNull: false,
      foreignKey: {
        fieldName: 'userId',
      }
    });
  };

  return User;
};
