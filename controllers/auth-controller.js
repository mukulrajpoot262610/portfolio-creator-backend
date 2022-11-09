const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const tokenService = require("../services/token-service");
const userService = require("../services/user-service");
const emailService = require("../services/email-service");
const { default: hashService } = require("../services/hash-service");
const APIResponse = require('../helpers/APIResponse')

function setTokensInCookie(res, token) {
    // put it in cookie
    res.cookie("metrackAccessCookie", token.accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
    });

    res.cookie("metrackRefreshCookie", token.refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
    });
}


class AuthController {
    async sendVerificationLink(req, res) {
        const { email, password, name } = req.body;

        if (!email || !name || !password) {
            return res.status(400).json({ msg: "All Fields are required" });
        }

        //sendLink
        try {
            let user = await userService.findUser({ email });

            if (user) {
                return res.status(400).json({ msg: "User Already Exists" });
            }

            const token = tokenService.generateActivationToken({
                email,
                name,
                password,
            });

            await emailService.sendVerificationEmail(email, token);
            res.status(200).json({ msg: "Email Sent" });
        } catch (err) {
            console.log(err.message);
            res.status(500).json({ msg: "Email sending failed" });
        }
    }

    async registerUser(req, res) {
        const { name, email, password } = req.body;

        try {
            let user = await userService.findUser({ email });

            if (user) {
                return APIResponse.validationError(res, "user already exists");
            }

            user = await userService.createUser({
                name,
                email,
                password,
            });

            // generate new token
            const { accessToken, refreshToken } = tokenService.generateToken({
                _id: user._id,
                role: user.role,
            });

            // save refresh token in db
            const savedToken = tokenService.storeRefreshToken(
                user._id,
                refreshToken
            );
            if (!savedToken) {
                return APIResponse.errorResponse(res);
            }

            setTokensInCookie(res, { accessToken, refreshToken });

            user.password = "";
            return APIResponse.successResponseWithData(
                res,
                user,
                "account created"
            );
        } catch (err) {
            console.log(err);
            return APIResponse.errorResponse(res);
        }
    }

    async loginUser(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "All Fields are required" });
        }

        try {
            let user = await userService.findUser({ email });

            if (!user) {
                return res
                    .status(400)
                    .json({ msg: "User with this email doesn't exist." });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ msg: "Invalid Credentials" });
            }

            // token
            const { accessToken, refreshToken } = tokenService.generateToken({
                _id: user._id,
                activated: false,
            });

            await tokenService.storeRefreshToken(refreshToken, user._id);

            res.cookie("accessCookie", accessToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
                httpOnly: true,
            });

            res.cookie("refreshCookie", refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
                httpOnly: true,
            });

            res.status(200).json({ auth: true, user });
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    }

    async forgetPassword(req, res) {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: "All Fields are required" });
        }

        try {
            let user = await userService.findUser({ email });

            if (!user) {
                return res
                    .status(400)
                    .json({ msg: "User with this email does not exist" });
            }

            const { name } = user;
            const userEmail = user.email;

            const token = tokenService.generateResetToken({ userEmail, name });

            user.resetPasswordLink = token;
            await user.save();

            await emailService.sendResetEmail(userEmail, token);

            res.status(200).json({ msg: "Email Sent" });
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    }

    async resetPassword(req, res) {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ msg: "All Fields are required" });
        }

        try {
            try {
                await tokenService.verifyResetToken(token);
            } catch (err) {
                console.log(err.message);
                return res.status(400).json({ msg: "Link Expired" });
            }

            let user = await userService.findUser({ resetPasswordLink: token });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            return res.status(200).json({ msg: "Updated Successfully" });
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    }

    async refresh(req, res) {
        // get refresh token from header
        const { refreshCookie: refreshTokenFromCookie } = req.cookies;

        // check if token is valid
        let userData;
        try {
            userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
        } catch (err) {
            return res.status(401).json({ msg: "Invalid Token" });
        }

        // check the token is in the db
        try {
            const token = await tokenService.findRefreshToken(
                userData._id,
                refreshTokenFromCookie
            );
            if (!token) {
                return res.status(401).json({ msg: "Invalid Token" });
            }
        } catch (err) {
            return res.status(500).json({ msg: "Internal Server Error" });
        }

        // check valid user
        const user = await userService.findUser({ _id: userData._id });
        if (!user) {
            return res.status(404).json({ msg: "Invalid User" });
        }

        // generate new token
        const { accessToken, refreshToken } = tokenService.generateToken({
            _id: userData._id,
        });

        // update refresh token
        try {
            tokenService.updateRefreshToken(userData._id, refreshToken);
        } catch (err) {
            return res.status(500).json({ msg: "Internal Server Error" });
        }

        // put it in cookie
        res.cookie("accessCookie", accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
        });

        res.cookie("refreshCookie", refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
        });

        // response
        res.status(200).json({ user });
    }

    async logout(req, res) {
        const { refreshCookie } = req.cookies;

        try {
            await tokenService.removeToken(refreshCookie);
            res.clearCookie("refreshCookie");
            res.clearCookie("accessCookie");
            res.status(200).json({ user: null, auth: false });
        } catch (err) {
            console.log(err)
            res.status(500).json({ err: 'Internal Server Error' });
        }
    }

    async getUserDetails(req, res) {
        const id = req.user._id;
        try {
            const user = await UserModel.findOne({ _id: id }).select("-password");
            res.status(200).json({ user });
        } catch (err) {
            console.log(err.message);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    }

    async updatePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;
            let { user } = req;
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    }

    async updateUserDetails(req, res) {
        const id = req.user._id;
        try {
            const data = {
                name: req.body.name,
                legalName: req.body.legalName,
                shortBio: req.body.shortBio,
                fullBio: req.body.fullBio,
                github: req.body.github,
                twitter: req.body.twitter,
                instagram: req.body.instagram,
                linkedin: req.body.linkedin,
                website: req.body.website,
            };

            const user = await UserModel.findOneAndUpdate({ _id: id }, data, {
                new: true,
            }).select("-password");
            res.status(200).json({ user });
        } catch (err) {
            console.log(err.message);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    }
}

module.exports = new AuthController();