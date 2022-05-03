import httpContext from 'express-http-context';
export default (app:any)=>{
  app.use(httpContext.middleware);
}
