import 'dotenv/config'
import express from 'express' 
// moment-timezone module provides methods whith which we can pass clients timzone as an argument and they return the date and time
import moment from 'moment-timezone'
import mongo from 'mongodb'
const { MongoClient } = mongo

const app = express()
const PORT = 8000

// these two variables are declared to be assigned the client timezone from client side js and the date.
// see post request below (at the very end). they are at the global scope because they need to be accessed
// by multiple code blocks.
let dateAdded
let clientTimeZone

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = '100notes'

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())



app.get('/', async (request, response) => {
    try {
        // this line of code (below) uses a mongodb method that counts the number of documents (notes) in a collection.
        const count = await db.collection('100notes').countDocuments()
        // logs the total number of notes in the db and the remaining number (from the 100)
        console.log(`Total number of notes: ${count}`)
        console.log(`Remaining notes:${100 - count}`)

        const data = await db.collection('100notes').find().sort({ likes: -1 }).toArray()
        response.render('index.ejs', { info: data })
    } catch (error) {
        console.error(error)
    }
})




app.post('/addNote', async (request, response) => {
    // this function returns true if there are less than 100 notes, and false otherwise
    async function checkNoteCount() {
        // this line of code (below) uses a mongodb method that counts the number of documents (notes) in a collection.
        const noteCount = await db.collection('100notes').countDocuments()
        return noteCount < 100
    }

    if (!await checkNoteCount()) { // there are already 100 notes
        // at the 101st click, stop saving notes and take the user to a "Limit notice page" using the 'notes-limit-reached.ejs' template
        // the user can deeelaytay notes and free up space to add other notes; therefore, saving the environment.
        response.render('notes-limit-reached.ejs')
    } else {// the number of notes is less than 100
        
        // added the dateAdded variables to the document so it can be retrieved from the main template
        try {
            await db.collection('100notes').insertOne({ noteTitle: request.body.noteTitle.trim().replace(/ +/g, ' '), noteBody: request.body.noteBody, likes: 0, dateAdded })
            console.log('Note Added')
        } catch (error) {
            console.log(error)
        } finally {
            response.redirect('/')
        }
    }
})



app.put('/addOneLike', (request, response) => {
    db.collection('100notes').updateOne({ noteTitle: request.body.noteTitleS.trim(), noteBody: request.body.noteBodyS.trim(), likes: request.body.likesS }, {
        $set: {
            likes: Number(request.body.likesS + 1)
        }
    }, {
        sort: { _id: -1 },
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
        const result = await db.collection('100notes').deleteOne({ noteTitle: request.body.noteTitleS.trim() })
        console.log('Note Deleted')
        response.json('Note Deleted')
    } catch (error) {
        console.error(error)
    }
})



//
app.post('/sendDateInfo', async(request, response) => {
           
    try {
        // await db.collection('100notes').updateOne({dateAdded: dateAdded, clientTimeZone: clientTimeZone})
     const    clientTimeZone = request.body.timeZone 
    // const clientTimeSessionStart = request.body.date
   const   dateAdded = moment().tz(clientTimeZone).format()

        // console.log(dateAdded);
        response.json('Date Received, thanks client side Js!')
    } catch(error) {
        console.log(error)
    }
})



// receives timezone info from client side js
app.post('/sendDateInfo', async(request, response) => {
           
    try {
        // assign the variable clientTimeZone the timezone from client side js
      clientTimeZone = await request.body.timeZone 
      // use moment-timezone methods and pass client time zone as an arument to get the date 
      dateAdded = moment().tz(clientTimeZone).format()
      // codewar to get the date only (the method return the time and timezone aswell)
      dateAdded = dateAdded.split('').slice(0, dateAdded.indexOf('T')).join('')

        // send something back to client side js (it's expecting something)
        response.json('Date Received, thanks client side Js!')
    } catch(error) {
        console.log(error)
    }  
})




MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {

        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
        // db.collection.drop('100notes')

        db.collection('100notes').createIndex({ noteTitle: 1 }, { unique: true })
        app.listen(process.env.PORT || PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch(error => console.log(error))

