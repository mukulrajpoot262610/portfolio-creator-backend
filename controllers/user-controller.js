const userService = require("../services/user-service")
const slugify = require('slugify');
const portfolioService = require("../services/portfolio-service");
const APIResponse = require('../helpers/APIResponse')

class UserController {

    async checkDomain(req, res) {
        const { domain } = req.body;

        try {
            const sluggedDomain = slugify(domain, {
                lower: true,
            })
            const check = await portfolioService.findDomain({ domain: sluggedDomain })

            if (check) {
                return res.status(404).json({ msg: 'Domain Name is not available.' })
            }

            res.status(200).json({ msg: "Domain Name is Available" })

        } catch (err) {
            console.log(err)
            res.status(500).json({ msg: 'Internal Server Error' })
        }
    }

    async buildPortfolio(req, res) {
        const userId = req.user._id;
        const payload = req.body;

        try {
            const sluggedDomain = slugify(payload.domain, {
                lower: true,
            })

            const portfolio = await portfolioService.createPortfolio({ domain: sluggedDomain, user: userId, ...payload })
            await portfolio.save()

            res.status(200).json({ msg: "Website Created", data: portfolio })

        } catch (err) {
            console.log(err)
            res.status(500).json({ msg: 'Internal Server Error' })
        }

    }

    async getAllPortfolios(req, res) {
        const userId = req.user._id;

        try {
            const portfolios = await portfolioService.getAllPortfolio({ user: userId })

            return APIResponse.successResponseWithData(
                res,
                portfolios,
                "All Portfolio Fetched"
            );

        } catch (err) {
            console.log(err)
            res.status(500).json({ msg: 'Internal Server Error' })
        }
    }

    async getPortfolio(req, res) {
        const { domain } = req.body;

        try {
            const portfolio = await portfolioService.findDomain({ domain })

            return APIResponse.successResponseWithData(
                res,
                portfolio,
                "Portfolio Fetched"
            );

        } catch (err) {
            console.log(err)
            res.status(500).json({ msg: 'Internal Server Error' })
        }
    }
}

module.exports = new UserController()