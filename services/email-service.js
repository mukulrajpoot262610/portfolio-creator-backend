const AWS = require('aws-sdk')

AWS.config.update({
    accessKeyId: process.env.AWS_API_KEY,
    secretAccessKey: process.env.AWS_API_SECRET,
    region: process.env.AWS_REGION
})

const ses = new AWS.SES({ apiVersion: '2010-12-01' })

class EmailService {

    async sendVerificationEmail(email, token) {

        const params = {
            Destination: {
                ToAddresses: [email]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: `<html><body>
                        <h1>Verify your email address</h1>
                        <p>Please use the below link to complete your registration: </p>
                        <p>${"http://localhost:3000"}/auth/verified?master=${token}</p>
                        </body></html>`
                    },
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: 'Complete your registration'
                }
            },
            Source: 'mukulrajpoot262610@gmail.com', // TO BE CHANGE
            ReplyToAddresses: ['mukulrajpoot262610@gmail.com'],
        };

        const sendEmailOnRegister = ses.sendEmail(params).promise()

        sendEmailOnRegister.then(data => {
            console.log(data)
            return data
        }
        ).catch(err => console.log(err.message))

    }

    async sendResetEmail(email, token) {

        const params = {
            Destination: {
                ToAddresses: [email]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: `<html><body>
                        <h1>Reset Password Link</h1>
                        <p>Please use the below link to reset your password: </p>
                        <p>${"http://localhost:3000"}/auth/reset-password?master=${token}</p>
                        </body></html>`
                    },
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: 'Reset Your Password'
                }
            },
            Source: 'mukulrajpoot262610@gmail.com',
            ReplyToAddresses: ['mukulrajpoot262610@gmail.com'],
        };

        const sendEmailOnRegister = ses.sendEmail(params).promise()

        sendEmailOnRegister.then(data => {
            console.log(data)
            return data
        }
        ).catch(err => console.log(err.message))

    }

}

module.exports = new EmailService()