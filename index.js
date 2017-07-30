const express = require('express')
const parser = require('body-parser')
const sockets = require('socket.io')

const port = 8080

var app = express()

app.use(parser.json())
app.use(express.static("public"))

var server = app.listen(port, () => {
    console.log("Server started on port " + port)
})

var io = sockets.listen(server)

const connectedClients = []

io.sockets.on("connection", (socket) => {
    var id
    do {
        id = Math.round(Math.random() * 1000);
    } while (connectedClients.indexOf(id) != -1)
    connectedClients.push(id)
    socket.emit("set-id", id)
    socket.emit("client-list", connectedClients)
    socket.broadcast.emit("client-list", connectedClients)
    socket.broadcast.emit("receive", "<em>Client " + id + " connected</em>")
    socket.on("message-sent", (message) => {
        socket.broadcast.emit("receive", "<strong>Client " + id + " :</strong> " + message)
        socket.broadcast.emit("start-timer",90)
        socket.emit("start-timer",90)
    })
    socket.on('disconnect', (reason) => {
        connectedClients.splice(connectedClients.indexOf(id), 1)
        socket.broadcast.emit("receive", "<em>Client " + id + " disconnected</em>")
        socket.broadcast.emit("client-list", connectedClients)
    })
})

app.route('/')
    .get((req, res) => {})