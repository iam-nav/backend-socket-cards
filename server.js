const express = require('express')
const app = express()
var server = app.listen(3001)
const io = require('socket.io').listen(server);
const router = require('./router')
const cors = require('cors')
const {addUser,getUsersInRoom,getUser,removeUser,findRoom } = require('./functions/users')
const {shuffle,deck,DistributeCards,PlayersJoin,DeleteCard,activeUSers} = require('./functions/functions')


// const PORT = process.env.PORT || 3001

app.use(cors())

io.on('connection', (socket) => {
    console.log("we have new connection")
    socket.on('join',({name,room},callback)=>{
    const { error, user } =addUser({ id: socket.id, name, room })     
    if(error) return callback(error);
    socket.join(user.room)
    let con_users =getUsersInRoom(user.room)
    io.in(user.room).emit('message', ({text:con_users}));
    socket.emit('welcome',({text:`welcome! ${user.name} you are in ${user.room}`,user:user.id}));
    // var CountPlayers_room = io.sockets.adapter.rooms[user.room].length;  
    // console.log(CountPlayers_room)
    //  io.sockets.in(user.room).emit('message',({CountPlayers_room})) 
   })


   socket.on('sendcard',({cardnumber,Id,room})=>{
    io.sockets.in(room).emit('catchcards',{card:cardnumber,Id:Id});
   })

   
   socket.on('addCardToAnotherPlayer',({cards,id,room})=>{
     console.log(id)
    io.sockets.in(room).emit('pushCardToOpponet', {cards,id});
   })

   
   socket.on('send_From_Specific_Cards',({cardnumber,Id,room})=>{
    io.sockets.in(room).emit('send_From_Specific_Cards',{card:cardnumber,Id:Id});
   })


   socket.on('playgame',({players,room})=>{
      io.in(room).emit('players',({players}));
   })


   socket.on('joinedUsers',({room})=>{
     socket.join(room)
     let players = getUsersInRoom(room)
     let totalPlayers = Object.keys(players).length
     let shuffles = shuffle(deck())
     let cardsarrange = DistributeCards(shuffles,PlayersJoin(totalPlayers))
    io.in(room).emit('cards_and_players',({players,cardsarrange}))
   })

   
   socket.on('disconnect', function() {
    // let room =  findRoom(socket.id) 
    // console.log(room)
    // let user =  getUser(socket.id)
      // console.log(user)
    // console.log(user["name"])
    // io.in(User).emit('message', ({text:totalUsers}));
    var clients = socket.client.conn.emit.length;
    console.log('Got disconnect!',clients);
  })



})


app.use(router)
 