const express = require('express')
const parser = require('body-parser')
const sockets = require('socket.io')

const port = 8080 //the port to listen to

var app = express()

app.use(parser.json())
app.use(express.static("public"))

var server = app.listen(port, () => {
    console.log("Server started on port " + port)
})

var io = sockets.listen(server)

const connectedClients = []
const timerList = []


// Actions to do on socket creation
io.sockets.on("connection", (socket) => {
    // Define the id of the user 
    var id
    do {
        id = Math.round(Math.random() * 1000);
    } while (connectedClients.indexOf(id) != -1)
    connectedClients.push(id)

    // Send the id to the user
    socket.emit("set-id", id)
    // Update client list for all user
    socket.emit("client-list", connectedClients)
    socket.broadcast.emit("client-list", connectedClients)
    socket.broadcast.emit("receive", "<em>Client " + id + " connected</em>")

    // On message from this client, send it back to all clients
    socket.on("message-sent", (message) => {
        socket.broadcast.emit("receive", "<strong>Client " + id + " :</strong> " + message)
        startTimer(10, socket)
    })

    // On client disconnect, remove the client from the connected list
    // and update client list for all other remaining clients
    socket.on('disconnect', (reason) => {
        connectedClients.splice(connectedClients.indexOf(id), 1)
        socket.broadcast.emit("receive", "<em>Client " + id + " disconnected</em>")
        socket.broadcast.emit("client-list", connectedClients)
    })
})


// Start a new timer and notify all connected clients
function startTimer(duration, socket) {
    var remaining = duration
    socket.broadcast.emit("start-timer", duration)
    socket.emit("start-timer", duration)
    var timer = setInterval(() => {
        if (--remaining == 0) {
            clearTimeout(remaining)
            socket.emit("receive", "Timer finished")
            socket.broadcast.emit("receive", "Timer finished")
            timerList.splice(timerList.indexOf(timer), 1)
        }
    }, 1000)
    timerList.push(timer)
}

app.route('/')
    .get((req, res) => {})