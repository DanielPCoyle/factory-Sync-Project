const cors = require('cors');
export default (app: any) => {
    app.use(cors({
      orgin:"*"
    }))
};
