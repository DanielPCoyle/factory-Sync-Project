import express from 'express';
import middleware from './middleware';
import routes from './routes';
import http from 'http';

const settings = require('../src/ui_data/env/'+(process.env.NODE_ENV || 'local')+".json") 
const app = express();
middleware(app);
routes(app); 

const server = http.createServer(app);
const io = require('socket.io')(server,{
  cors: {
    origin: '*',
  }
});

app.set('io',io)

const port = settings?.api_port ?? 5001;

//Whenever someone connects this gets executed
io.on('connection', function(socket:any) {
  console.log('A user connected');
  socket.on('disconnect', function () {
     console.log('A user disconnected');
  });
});

server.listen(port);
server.on('error', (e)=>console.log("ERROR::::",e));
server.on('listening',()=>console.log(`App listening at http://localhost:${port} in "${process.env.NODE_ENV || "development"}" environment`));


export default app;