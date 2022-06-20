const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 8000
require('dotenv').config()

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = '100notes'

    
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get('/',(request, response)=>{
    db.collection('100notes').find().sort({likes: -1}).toArray()
    .then(data => {
        response.render('index.ejs', { info: data })
    })
    .catch(error => console.error(error))
})

app.post('/addNote', (request, response) => {
    db.collection('100notes').insertOne({noteTitle: request.body.noteTitle.trim(),
    noteBody: request.body.noteBody, likes: 0})
    
    .then(result => {
        console.log('Note Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

// app.put('/addOneLike', (request, response) => {
//     db.collection('100notes').updateOne({noteTitle: request.body.noteTitleS, noteBody: request.body.noteBodyS,likes: request.body.likesS},{
//         $set: {
//             likes:request.body.likesS + 1
//           }
//     },{
//         sort: {_id: -1},
//         upsert: true
//     })
//     .then(result => {
//         console.log('Added One Like')
//         response.json('Like Added')
//     })
//     .catch(error => console.error(error))

// })

app.delete('/deleteNote', (request, response) => {
    // console.log(request.body.noteTitleS)
    db.collection('100notes').deleteOne({noteTitle: request.body.noteTitleS.trim()})
    .then(result => {
        console.log('Note Deleted')
        response.json('Note Deleted')
    })
    .catch(error => console.error(error))

})

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
        // db.collection.drop('100notes')

        db.collection('100notes').createIndex({noteTitle:1}, {unique:true})
        app.listen(process.env.PORT || PORT, ()=>{
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch(err => console.log(err))

