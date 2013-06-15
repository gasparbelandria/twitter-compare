var app = require('express').createServer(),
    twitter = require('ntwitter'),
    io = require('socket.io').listen(app),
    opt1 = 0,
    opt2 = 0,
    total = 0;

app.listen(3000);

var twit = new twitter({
  consumer_key: 'mwsD9ixKoInML6sGanGFA',
  consumer_secret: 'D1KwwvlHbctNBQmLrxogX7wwbhIXBTKCFSjpEyie0M',
  access_token_key: '48748677-HikDSFHUVtfpPkaKFac5X5SNKQGtSE5UjHGuMl3iI',
  access_token_secret: '7JC96ff5ISIvbxyan8wuIk7nttMKehJ29b0QF0lZcE'
});

io.sockets.on('connection', function (socket) {
  socket.on('opts', function (opts, callback) {
    console.log(opts[0] + " - " + opts[1]);
    twit.stream('statuses/filter', { track:opts.join(',') }, function(stream) {
      stream.destroy;
      stream.on('data', function (data) {
        if (data.text) { 
          var text = data.text.toLowerCase();
          if (text.indexOf(opts[0]) != -1) {
            opt1++
            total++
            io.sockets.volatile.emit('option1', { 
              user: data.user.screen_name, 
              text: data.text,
              avatar: data.user.profile_image_url_https
            });
          }
          if (text.indexOf(opts[1]) != -1) {
            opt2++
            total++
            io.sockets.volatile.emit('option2', { 
              user: data.user.screen_name, 
              text: data.text,
              avatar: data.user.profile_image_url_https
            });
          }
          io.sockets.volatile.emit('percentages', { 
            opt1: (opt1/total)*100,
            opt2: (opt2/total)*100
          });
        }
        callback(true);
      });
      stream.on('destroy', function(){
        console.log('Streaming has destroy!');
      })
    });
  });
  socket.on('disconnect', function () {
    console.log('... disconnected');
  });
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

