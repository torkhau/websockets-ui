import { startWSServer } from './build/index.js';
import { httpServer } from './src/http_server/index.js';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const WSPort = startWSServer();

console.log(`Start websocket server on the ${WSPort} port!`);