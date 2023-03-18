const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require("socket.io");
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
const wbsckt = require('ws')

// A simple broadcast ws
const wss = new wbsckt.WebSocketServer({
    port: 3001,
});
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('message', function message(data,isBinary) {
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === wbsckt.WebSocket.OPEN) {
                client.send(data, { binary: isBinary });
            }
        });
    });
});
app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            // Be sure to pass `true` as the second argument to `url.parse`.
            // This tells it to parse the query portion of the URL.
            const parsedUrl = parse(req.url, true)
            const { pathname, query } = parsedUrl

            if (pathname === '/a') {
                await app.render(req, res, '/a', query)
            } else if (pathname === '/b') {
                await app.render(req, res, '/b', query)
            } else {
                await handle(req, res, parsedUrl)
            }
        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.end('internal server error')
        }
    })
        .once('error', (err) => {
            console.error(err)
            process.exit(1)
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`)
        })
})
