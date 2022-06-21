import 'dotenv/config'
import express from 'express'
import fetch from 'node-fetch'
import mongo from 'mongodb'
const { MongoClient } = mongo

const app = express()
const PORT = 8000

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = '100notes'
    
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


// this async function fetches the date and time of the user from an API according to their ip address
async function getDate() {
    try {
        // fun fact fetch requests are relatively new in node.js
        const response = await fetch("https://worldtimeapi.org/api/ip")
        const data = await response.json()
         // data.datetime gives us the date and time
         // the date returned by the API is jumbled with the time of the day including seconds
        // so I guess I did a codewars (below) and extracted the date out of the string
        const date = data.datetime.split('').slice(0, data.datetime.indexOf('T')).join('')
        console.log(date)
        return date
        
    } catch(error) {
        console.log(error)
    }
}


app.get('/', async (request, response) => {
    try {
        // this line of code (below) uses a mongodb method that counts the number of documents (notes) in a collection.
        const count = await db.collection('100notes').countDocuments()
        // logs the total number of notes in the db and the remaining number (from the 100)
        console.log(`Total number of notes: ${count}`)
        console.log(`Remaining notes:${100 - count}`) 

        const data = await db.collection('100notes').find().sort({likes: -1}).toArray()
        response.render('index.ejs', { info: data })  
    } catch(error) {
        console.error(error)
    }
})


app.post('/addNote', async (request, response) => {

    async function checkNoteCount() {
    // this line of code (below) uses a mongodb method that counts the number of documents (notes) in a collection.
    const noteCount =  await db.collection('100notes').countDocuments()

    //  we assign the async function that fetches the date from an api a variable below. It will give us the date the note was added because the post request
    // is triggered "whenever" the user adds the note.
    const dateAdded = await getDate()

    // conditionals below will check if the number of notes is greater or equal than 100 
    // at the 101st click, it'll stop saving notes and take the user to a "Limit notice page" using the 'notes-limit-reached.ejs' template 
    // the user can deeelaytay notes and free up space to add other notes; therefore, saving the environment.
        if(noteCount >= 100) {
            response.render('notes-limit-reached.ejs')
        }  else {
            // if the number of notes is less than 100 the following code will run

            // added the dateAdded variables to the document so it can be retrieved from the main template
            try {
                db.collection('100notes').insertOne({noteTitle: request.body.noteTitle,
                noteBody: request.body.noteBody, likes: 0, dateAdded})

                console.log('Note Added')
                response.redirect('/')
            } catch(error) {
                console.log('Failed to add note')
                console.log(error)
            }
        }

    }
    checkNoteCount()
//    .catch(error => console.log(error))
})



app.put('/addOneLike', (request, response) => {
    db.collection('100notes').updateOne({noteTitle: request.body.noteTitleS, noteBody: request.body.noteBodyS,likes: request.body.likesS},{
        $set: {
            likes:request.body.likesS + 1
          }
    },{
        sort: {_id: -1},
        upsert: true
    })
    .then(result => {
        console.log('Added One Like')
        response.json('Like Added')
    })
    .catch(error => console.error(error))

})

app.delete('/deleteNote', async (request, response) => {
    // console.log(request.body.noteTitleS)
    try {
        const result = await db.collection('100notes').deleteOne({noteTitle: request.body.noteTitleS.trim()})
        console.log('Note Deleted')
        response.json('Note Deleted')
    } catch(error) {
        console.error(error)
    }
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
    .catch(error => console.log(error))

