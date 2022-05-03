import fs from "fs";
import path from "path"
import {parseURL} from "../../services/util";
import jwt from "jsonwebtoken";
import jwt_decode from "jwt-decode";
import {DB} from "../../server/models";
import httpContext from 'express-http-context';
import util from 'util';

const appendFile = util.promisify(fs.appendFile);

const modelMeta = require(path.resolve((process.env.MODELS_DIR ?? "./api/server/models")+"/model-meta.json"));
export const authenticateMiddleware = async (req:any, res:any, next:any) => {
    const {method} = req;
    const { authorization } = req.headers;
    if(!Boolean(authorization)){
      return res.sendStatus(403);
    }
    const {model,id} = parseURL(req);
    const meta = modelMeta.find(m=>m.model === model )
    const SECRET_KEY = 'secret';
    const accessColumnRule = method.toLowerCase()+"_access";
    try{
      const token = authorization && authorization.split(" ")[1];
      const decode:any = jwt_decode(token);
      const user = await DB.user.findByPk(decode.user.id)

      if(!Boolean(user)){
        return res.sendStatus(403);
      }
      if(!Boolean(user?.type)){
        return res.sendStatus(403);
      }

      httpContext.set('user',user)
    if(meta?.[accessColumnRule]){
      if (!Boolean(user)) return res.sendStatus(401);
        if(!meta?.[accessColumnRule].split(",").includes(user?.type)){
            return res.sendStatus(403);
        }
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
        });
    }
  } catch(e:any){
    appendFile(path.resolve("./api/logs/access.logs"), "AUTH ERROR:"+JSON.stringify(e))
    return res.sendStatus(403);
  }
    next();
  };

  export default authenticateMiddleware