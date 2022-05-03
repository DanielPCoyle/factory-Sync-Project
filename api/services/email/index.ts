import path from "path";
require('dotenv').config();
const {template} = require("./template");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const OAuth2 = google.auth.OAuth2;
const settings = require(path.resolve(`./src/__core/env/${process.env.NODE_ENV ?? "development"}.json`))

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );
  
    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN
    });
  
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject();
        }
        resolve(token);
      });
    });
  
    const transporter = nodemailer.createTransport({
      service: settings.email_service,
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        accessToken,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
      }
    });
  
    return transporter;
  };

export const sendEmail = async (emailOptions) => {
    let emailTransporter = await createTransporter();

    let {button,user,...options} = emailOptions;
    options.html = template({
        user,
        button,
        text:options.text
    })
    options.to = emailOptions.to ?? user.email
    await emailTransporter.sendMail(options);
  };
  
