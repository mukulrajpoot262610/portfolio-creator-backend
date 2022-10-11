const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");

class UserService {
    async findUser(id) {
        const user = await UserModel.findOne(id);
        return user;
    }

    async getAllUser() {
        const users = await UserModel.find();
        return users;
    }

    async createUser(data) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
        const user = await UserModel.create(data);
        return user;
    }

    async updateUser(filter, data) {
        return UserModel.findOneAndUpdate(filter, data, { new: true });
    }

    async validateUser(data) {
        const user = await UserModel.findOne({ email: data.email });
    }
}

module.exports = new UserService();