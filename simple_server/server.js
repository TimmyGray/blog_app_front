import Express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import procces  from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const server = Express();

const apppath = __dirname;
console.log(apppath);

const port = procces.env.Port || procces.argv[2]||3300;
server.use(Express.static(apppath));

server.get('/', (req, res) => {

  res.sendFile(join(apppath,'/index.html'));

});

server.listen(port, () => {

  console.log(`Server listen on port ${port}`);

})
