const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        isEmailVerified: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false },
        email: { type: String, unique: true },
        password: { type: String },
        name: { type: String },
        resetPasswordLink: { type: String },
        portfolios: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio'
                }
            ]
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);