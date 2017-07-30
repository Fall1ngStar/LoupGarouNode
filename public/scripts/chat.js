var socket = io.connect("http://192.168.0.13:8080")
socket.emit("hello", "Connected from web page")
var connectedClients = []

init()

function sendMessage() {
    var area = document.getElementById("user-input")
    var data = area.value
    area.value = ""
    if (data != "") {
        appendMessage("<strong>You :</strong> " + data)
        socket.emit("message-sent", data)
    }
}
socket.on("receive", (message) => {
    appendMessage(message)
})

socket.on("client-list", (list) => {
    connectedClients = list
    updateConnectedClientList()
})

socket.on("set-id", (id) => {
    document.getElementById("id").innerHTML = "ID Client : " + id
})

function appendMessage(message) {
    var messages = document.getElementById("messages")
    var remain = messages.innerHTML
    messages.innerHTML = ('<div class="message">' + message + "</div>").concat(remain)
    //+ remain
}

socket.on("start-timer", (duration) => {
    clearInterval(0)
    var remaining = duration
    var timer = setInterval(()=>{
        console.log(remaining)
        document.getElementById("timer").innerHTML = remaining-- + " s"
        if(remaining == 0){
            clearInterval(timer)
        }
    },1000)
})

function updateConnectedClientList() {
    var html = document.getElementById("client-list")
    html.innerHTML = ""
    connectedClients.forEach(e => {
        html.innerHTML += "<p>Client " + e + "</p>"
    })
}

function init() {
    document.getElementById("user-input").addEventListener("keypress", (e) => {
        if (e.keyCode == 13) {
            sendMessage()
        }
    })
    updateConnectedClientList()
}

