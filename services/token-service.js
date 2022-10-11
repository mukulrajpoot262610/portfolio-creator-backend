const jwt = require("jsonwebtoken");
const refreshModel = require("../models/refresh-model");

class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
            expiresIn: '6h'
        })
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, {
            expiresIn: '1y'
        })

        return { accessToken, refreshToken }
    }

    generateActivationToken(payload) {
        const activationToken = jwt.sign(
            payload,
            process.env.JWT_ACTIVATION_TOKEN_SECRET,
            {
                expiresIn: "10m",
            }
        );

        return activationToken;
    }

    generateResetToken(payload) {
        const resetToken = jwt.sign(payload, process.env.JWT_RESET_TOKEN_SECRET, {
            expiresIn: "10m",
        });

        return resetToken;
    }

    async verifyResetToken(token) {
        return jwt.verify(token, process.env.JWT_RESET_TOKEN_SECRET);
    }

    async verifyActivationToken(token) {
        return jwt.verify(token, process.env.JWT_ACTIVATION_TOKEN_SECRET);
    }

    async decodeToken(token) {
        return jwt.decode(token);
    }

    async storeRefreshToken(token, userId) {
        try {
            await refreshModel.create({
                token,
                userId,
            });
        } catch (err) {
            console.log(err.message);
        }
    }

    async verifyAccessToken(token) {
        return jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET)
    }

    async verifyRefreshToken(token) {
        return jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET)
    }

    async findRefreshToken(userId, refreshToken) {
        return await refreshModel.findOne({ userId: userId, token: refreshToken })
    }

    async updateRefreshToken(userId, refreshToken) {
        return await refreshModel.updateOne({ userId: userId }, { token: refreshToken })
    }

    async removeToken(refreshToken) {
        return await refreshModel.deleteOne({ token: refreshToken })
    }

    async getSessionByUserId(id) {
        return await refreshModel.find({ userId: id })
    }
}

module.exports = new TokenService();