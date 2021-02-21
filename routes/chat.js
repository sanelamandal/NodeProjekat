const { response } = require('express');
var express = require('express');
var router = express.Router();
var io = null;
var poruke = [];
var prvi_id = 13;

router.get('/chat', function(req,res) {
    if(!io){
        io = require('socket.io')(req.connection.server);

        io.sockets.on('connection', function(client){
            console.log('konektovan');
            
            client.emit('sve_poruke', poruke.toString());
            if(!prvi_id) {
                prvi_id = client.id;
            }
            client.on('disconnect', function(){
                console.log('disconnected event');
            });


            client.on('klijent_salje_poruku', function(d) {
                poruke.push(d);
                io.emit('poruka_sa_servera', d);
                io.to(prvi_id).emit('poruka_sa_servera');
            })
        });
    }
    res.render('chat/chat')
});

module.exports = router;