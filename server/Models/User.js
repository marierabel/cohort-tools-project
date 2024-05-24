const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "name is required"],
  },

  email: {
    type: String,
    required: [true, "email is required"],
    unique: [true, "email is already used"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
});

const User = model("User", userSchema);

module.exports = User;
