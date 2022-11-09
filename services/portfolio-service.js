const PortfolioModel = require("../models/portfolio-model");
const bcrypt = require("bcrypt");

class PortfolioService {
    async findDomain(id) {
        const domain = await PortfolioModel.findOne(id);
        return domain;
    }

    async getAllUser() {
        const users = await PortfolioModel.find();
        return users;
    }

    async createPortfolio(data) {
        const portfolio = await PortfolioModel.create(data);
        return portfolio;
    }

    async updateUser(filter, data) {
        return PortfolioModel.findOneAndUpdate(filter, data, { new: true });
    }

    async validateUser(data) {
        const user = await PortfolioModel.findOne({ email: data.email });
    }
}

module.exports = new PortfolioService();