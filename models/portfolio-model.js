const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        domain: { type: String, unique: true },
        template: { type: String },
        heroTitle: { type: String },
        heroContent: { type: String },
        avatar: { type: String },
        name: { type: String },
        bio: { type: String },
        skills: [{ type: String }],
        email: { type: String },
        phone: { type: String },
        github: { type: String },
        linkedin: { type: String },
        twitter: { type: String },
        leetcode: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Portfolio", PortfolioSchema);