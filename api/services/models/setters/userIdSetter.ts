import httpContext from 'express-http-context';
export default (value,field,model) => {
    model.setDataValue(field, Boolean(value) ? value : httpContext.get("user").id);
}