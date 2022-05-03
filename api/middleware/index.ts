import cors from './cors';
import context from './context';
import expressJson from './expressJson';
import { accessLog } from './accessLog';
import  staticFiles  from './staticFiles';

export default (app: any) => {
  cors(app);
  expressJson(app);
  context(app);
  accessLog(app);
  staticFiles(app);
};
