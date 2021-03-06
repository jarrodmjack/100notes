import 'dotenv/config'
import express from 'express' 
// moment-timezone module provides methods with which we can pass the client's timezone as an argument and return their date and time
import moment from 'moment-timezone'
// bcrypt for hashing passwords
import bcrypt from 'bcrypt'
import mongo from 'mongodb'
const { MongoClient } = mongo

const app = express()
const PORT = 8000

/* These two variables are declared to be assigned the client's timezone and date from client side js.
See post request below (at the very end). They are at the global scope because they need to be accessed
by multiple code blocks. */
let dateAdded
let clientTimeZone

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = '100notes'

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())



// class for creating new users
class CreateUser {
    constructor(name, email, password, numberOfNotes, premium) {
        this._name = name,
        this._email = email,
        this._password = password,
        this._numberOfNotes = numberOfNotes,
        this._premium = premium
    }
    get name() {
        return this._name
    }
    get email() {
        return this._email
    }
    get password() {
        return this._password
    }
    get numberOfNotes() {
        return this._numberOfNotes
    }
    get premium() {
        return this._premium
    }
    unlockPremium() {
        return this._premium = true
    }
}


function formatWhiteSpace(str) {
    return str.replace(/[ ]+/g, ' ').trim()
}



app.get('/', async (request, response) => {
    try {
        // This line of code (below) uses a mongodb method that counts the number of documents (notes) in a collection.
        const count = await db.collection('100notes').countDocuments()
        // Logs the total number of notes in the db and the remaining number (from the 100)
        console.log(`Total number of notes: ${count}`)
        console.log(`Remaining notes:${100 - count}`)

        const data = await db.collection('100notes').find().sort({ likes: -1 }).toArray()
        response.render('index.ejs', { info: data })
    } catch (error) {
        console.error(error)
    }
})


// routes for signing in  and signing up
app.get('/signIn', (request,response) => {
    response.render('sign-in.ejs')
})
app.get('/signUp', (request,response) => {
    response.render('sign-up.ejs')
})

app.post('/signIn', async (request,response) => {
  
})

app.post('/signUp', async (request,response) => {
    try {
        // hashing the password using method from bcrypt module 
        const hashedPassword = await bcrypt.hash(request.body.password, 10)
        // creates a new user using the CreateUser class with request name,email,hashedpassword, number of notes 0, premium false)
        const newUser = new CreateUser(request.body.name, request.body.email, hashedPassword, 0,false)
        // save to db
        db.collection('users').insertOne(newUser)
        // take the user to sign in page
        response.render('sign-in.ejs')
    }  catch {
        response.redirect('/signUp')
    } 
})






app.post('/addNote', async (request, response) => {
    // This function returns true if there are less than 100 notes, and false otherwise.
    async function checkNoteCount() {
        // This line of code (below) uses a mongodb method that counts the number of documents (notes) in a collection.
        const noteCount = await db.collection('100notes').countDocuments()
        return noteCount < 100
    }

    if (!await checkNoteCount()) { // There are already 100 notes in the collection.
        /* At the 101st click, stop saving notes and take the user to a "Limit notice page" using the 'notes-limit-reached.ejs' template.
        The user can deeelaytay notes and free up space to add other notes; therefore, saving the environment. */
        response.render('notes-limit-reached.ejs')
    } else { // The number of notes is less than 100.
        
        // Add the dateAdded variables to the document so it can be retrieved from the main template.
        try {
        

            await db.collection('100notes').insertOne({ 
                noteTitle: formatWhiteSpace(request.body.noteTitle), 
                noteBody: formatWhiteSpace(request.body.noteBody),
                likes: 0,
                dateAdded 
            })
            console.log('Note Added')
      
        } catch (error) {
            console.error(error)
        } finally {
            response.redirect('/')
        }
    }
})



app.put('/addOneLike', (request, response) => {
    db.collection('100notes').updateOne({ 
        noteTitle: formatWhiteSpace(request.body.noteTitleS) 
    }, {
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
        const result = await db.collection('100notes').deleteOne({ 
            noteTitle: formatWhiteSpace(request.body.noteTitleS)
        })
        console.log('Note Deleted')
        response.json('Note Deleted')
    } catch (error) {
        console.error(error)
    }
})


app.delete('/deleteAllNotes', async(request, response) => {
    try {
        await db.collection('100notes').deleteMany({})
        console.log('All Notes Deleted')
    } catch (error) {
        console.error(error)
    }finally {
        response.redirect('/')
    }
})



// Receives timezone info from client side js.
app.post('/sendDateInfo', async(request, response) => {
           
    try {
        // Assigns the variable clientTimeZone the timezone from client side js.
      clientTimeZone = await request.body.timeZone 
      // Uses moment-timezone methods and pass client's time zone as an argument to get the date. 
      dateAdded = moment().tz(clientTimeZone).format()
      // Codewar to get the date only (the method return the time and timezone aswell).
      dateAdded = dateAdded.split('').slice(0, dateAdded.indexOf('T')).join('')

        // Sends something back to client side js. As it is expecting something back.
        response.json('Date Received, thanks client side Js!')
    } catch(error) {
        console.error(error)
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
    .catch(error => console.error(error))

