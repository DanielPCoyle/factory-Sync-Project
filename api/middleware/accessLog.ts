import morgan from "morgan";
import path from "path";
import fs from "fs";

// const nocache = require('nocache')
export const accessLog = (app:any) => {
  const accessLogStream = fs.createWriteStream(path.resolve("./api/logs/access.logs"), { flags: 'a' });
  app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
    ].join(' ');
  }, { stream: accessLogStream }));
};
