const app = require('express')()
const server = require('http').Server(app)
const next = require('next')
const cors = require('cors')

app.use(cors())

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

const port = 3030

nextApp.prepare().then(() => {

        app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        app.get('*', (req, res) => {
            return nextHandler(req, res)
        })

        server.listen(port, (err) => {
            if (err) throw err
            console.log(`> Server started on port num:${port}`)
        })
    })
    .catch((ex) => {
        console.error(ex.stack)
        process.exit(1)
    })