const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { generateMessage, newMessage } = require('./helpers/messageHelper')
const config = require('./server/config')
const jwt = require("jsonwebtoken");



const userIndexRouter = require("./routers/userRouter/index")
const userCrudRouter = require("./routers/userRouter/user")

const adminIndexRouter = require("./routers/adminRouter/index")
const adminCrudRouter = require("./routers/adminRouter/admin")

const responseHelper = require("./helpers/responseHelper");
const fileLogger = require("./helpers/logHelper");
const cors = require('cors')

const app = express()

app.use(
  cors({
    exposedHeaders: ["x-access-token", "refresh-token", "Access-Control-Allow-Origin"],
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    //  'preflightContinue': false
  })
);

const port = process.env.PORT || 3000

app.use(express.json())

app.use(responseHelper.setReponse)

app.use("/users", userIndexRouter)
app.use("/users", userCrudRouter)

app.use("/admin", adminIndexRouter)
app.use("/admin", adminCrudRouter)


app.use(function (error, req, res, next) {
  error.code != 404 &&
    error.code != 401 &&
    fileLogger.error(error);

  res.locals.message = error.message;
  res.locals.error = req.app.get("env") === "development" ? error : {};
  if (error.code && typeof error.code == "number") {
    if (req.response) {
    }
    req.response.message = error.code ? error.message : "Something went wrong";
    res.status(error.code || 500);
    res.json(req.response);
  } else {
    req.response.message = "Internal Server error";
    res.status(500);
    res.json(req.response);
  }
})

const server = app.listen(port, () => {
  console.log('Server is listening on port ' + port)
})


const io = require('./helpers/socketHelper').init(server)

io.use((socket, next) => {
  jwt.verify(socket.handshake.query.acess, config.jwt_secret, async function (err, decoded) {
    if (decoded) {
      uid = decoded.user_uid
      next()
    }
  })
})

users = []

io.on('connection', socket => {
  
  console.log("New Web Socket Connection")

  socket.emit('message1', generateMessage("Welcome!", socket.handshake.query.acess))
 
  socket.on('username', (uid) => {
    users.push({
      id: socket.id,
      userName: uid
    })

    let len = users.length;
    len--

    io.emit('userList', users, users[len].id)
  })

  socket.on('getMsg', (data, callback) => {
    socket.broadcast.to(data.toid).emit('sendMsg', newMessage(data.msg, data.name, socket.handshake.query.acess))
    callback('Message Delivered')
  })

  socket.on('disconnect', () => {
    for (let i = 0; i < users.length; i++) {

      if (users[i].id === socket.id) {
        users.splice(i, 1);
      }
    }
    io.emit('exit', users);
  })
})
