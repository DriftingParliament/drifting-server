const mongoose = require('mongoose');
const toJSON = require('./toJSON.plugin');
const { roles } = require('../config/roles');
const passportLocalMongoose = require("passport-local-mongoose")

const Session = new mongoose.Schema({
  refreshToken: {
    type: String,
    default: "",
  },
})

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
     
        role: {
            type: String,
            enum: roles,
            default: 'STUDENT',
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
         refreshToken: {
    type: [Session],
  },
   authStrategy: {
    type: String,
    default: "local",
  }
    },
    {
        timestamps: true,
    }
);

const passportOptions ={
    usernameQueryFields: ["email"]
}
// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(passportLocalMongoose,passportOptions);

/* userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
}; */

/* userSchema.methods.isPasswordMatch = async function (password) {
    const user = this;
    return bcrypt.compare(password, user.password);
}; */

/* userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
