// const express= require('express') ;
// const app= express() ;
// console.log('Hi,  express app is starting')

// // app.get('/|/index.html', (req, res)=> {
//     app.get('^/$|/index(.html)?', (req, res)=> {   // ^/$ means starts with and ends at "/". And ()? means it's optional, weather put or not.
//     console.log('here')
//     // res.download('server.js')
//     // res.status(500).json({Message: 'Error'})
//     // res.sendStatus(305)
//     // res.send('Hi from Express server')
//     res.sendFile('./index.html', {root: __dirname})
// })

// app.get('/NewPage(.html)?', (req, res)=> {
//     res.sendFile('./NewPage.html', {root: __dirname})
// })

// app.get('/OldPage(.html)?', (req, res)=> {
//     res.redirect(301, '/NewPage.html');  // 302 by default (temp moved). 301 means permanently moved.
// })

// // -------------------------   Route Handler   -----------------------------||
// app.get('/hello(.html)?', (req, res, next)=> {
//     console.log('attempted to load hello.html, which we dont have yet');
//     next()
// }, (req, res)=> {
//     // res.sendFile('./NewPage.html', {root: __dirname})
//     res.send('Hello User... ')
// })

// // ------------   Chain Handler   ------------------

// const one= (req, res, next)=> {
//     console.log("This is One") ;
//     next() ;
// }
// const two= (req, res, next)=> {
//     console.log("This is two") ;
//     next() ;
// }
// const three= (req, res)=> {
//     console.log("This is three") ;
//     res.send('Chain Finished... ')

     
// }
// app.get('/chain(.html)?', [one, two, three]) ;

// // ---------------------------------------------------------------------||

// //Default route
// app.get('/*', (req, res)=> {  
//     res.status(404).sendFile('index.html', {root: __dirname})
// })


// var server = app.listen(3000, ()=>{
//     console.log('Server is running on port 3000')
// })


// //now run "npm start" or "npm run dev" (for nodemon)

