const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  image: { type: String, default: "default-user-image.png" },
  friends: {
    type: [{ name: String, image: String, id: String, chatId: String }],
    default: [],
  },
  friendRequests: {
    type: [{ name: String, id: String }],
    default: [],
  },
  sentRequests: {
    type: [{ name: String, id: String }],
    default: [],
  },
});

userSchema.pre("save", function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // hash the password using our new salt
  bcrypt
    .hash(user.password, 10)
    .then((hashedPassword) => {
      this.password = hashedPassword;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

const User = mongoose.model("user", userSchema);

exports.createNewUser = (username, email, password) => {
  return new Promise((resolve, reject) => {
    User.findOne({ email })
      .then((user) => {
        if (user) reject("Email already exists");
        else {
          const newUser = new User({ username, email, password });
          newUser.save();
        }
      })
      .then(() => resolve("New user created"))
      .catch((error) => reject(error));
  });
};

exports.login = (email, password) => {
  return new Promise((resolve, reject) => {
    User.findOne({ email })
      .then((user) => {
        if (!user) reject("Email not found");
        else {
          bcrypt.compare(password, user.password).then((match) => {
            if (!match) reject("Invalid password");
            else resolve(user._id);
          });
        }
      })
      .catch((error) => reject(error));
  });
};

exports.User = User;
