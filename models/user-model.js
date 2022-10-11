const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        isEmailVerified: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false },
        email: { type: String, unique: true },
        password: { type: String },
        name: { type: String },
        shortBio: { type: String },
        fullBio: { type: String },
        github: { type: String },
        instagram: { type: String },
        twitter: { type: String },
        linkedin: { type: String },
        website: { type: String },
        resetPasswordLink: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);