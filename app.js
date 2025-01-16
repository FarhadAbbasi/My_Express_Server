const express= require('express') ;
const app= express() ;


app.get('/', function (req, res) {
    res.send('Hi farhad from express server')
})

var server = app.listen(3001, function(){
    var host= server.address().address
    var port= server.address().port
    
    console.log('Server app is listening at http://%s:%s', host, port)
})

// Now run  "npm start"
