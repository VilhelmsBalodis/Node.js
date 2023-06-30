const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User must have a name'],
    },
    photo: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'User must have a e-mail'],
      validate: [validator.isEmail, 'Provide a valid e-mail address'],
      unique: true,
      lowercase: true,
    },
    role: { type: String, enum: ['user', 'guide', 'lead-guide', 'admin'], default: 'user' },
    password: {
      type: String,
      required: [true, 'User must have a password'],
      minLength: [8, 'Password must be minimum 8 characters'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        }, // works only when creating and saving user
        message: 'Passords must be identical',
      },
    },
    passwordChanged: Date,
    resetTokenExpires: Date,
    passwordResetToken: String,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.pre('save', async function (next) {
  // runs if password is actually modified
  if (!this.isModified('password')) return next();
  // hashes the password with cost of 12 (?)
  this.password = await bcrypt.hash(this.password, 12);
  // 'deletes' passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChanged = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.passwordCompare = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

userSchema.methods.passwordChange = function (JWTTimestamp) {
  if (this.passwordChanged) {
    // checks if password was changed after token creation
    const changeTimestamp = parseInt(this.passwordChanged.getTime() / 1000, 10);
    return JWTTimestamp < changeTimestamp;
  }
  return false;
};

userSchema.methods.passwordReset = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  // console.log({ resetToken }, this.passwordResetToken);
  this.resetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
