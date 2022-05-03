import dotenv from 'dotenv';
import httpContext from 'express-http-context';

export default async (req:any,res:any,next:any)=>{
	dotenv.config({path: process.env.ENV_FILE})
    httpContext.set("db_config",{
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE,
    })
    httpContext.set("auth0_config",{
		jwksURI:process.env.AUTH_JWKS_URI,
		user:process.env.REACT_APP_AUTH0_AUDIENCE,
		issuer:process.env.AUTH_ISSUER,
		audience:process.env.REACT_APP_AUTH0_AUDIENCE,
		domain:process.env.REACT_APP_AUTH0_DOMAIN,
		clientId:process.env.REACT_APP_AUTH0_CLIENT_ID,
		v2Api:process.env.V2_API,
		socketPath:process.env.SOCKET_PATH,
		news_rss:process.env.NEWS_RSS,
		give_tips_rss:process.env.GIVE_TIPS_RSS,
		request_tips_rss:process.env.REQUEST_TIPS_RSS,
    })
	next();
}