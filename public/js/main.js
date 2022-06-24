const deleteText = document.querySelectorAll('.fa-trash')
const thumbText = document.querySelectorAll('.fa-star')
const deleteAll = document.querySelector('.deleteAllBtn')

// on the submit button click this will run a function that'll send the user time zone to the server
document.querySelector('#button').addEventListener('click', sendDateInfo)


// (e) => deleteNote(e.target) is a callback on the eventListener and it
// works because (e) => deleteNote(e.target) returns the function 
// deleteNote(e.target), where e is the event that triggered the
// EventListener, and e.target is the specific element that was clicked
// on.  We need to use the anonymous function (e) => deleteNote(e.target) to avoid running 
// deleteNote when the eventListener is added.  The anonymous function runs immediately,
// but since it returns a function, the returned function is what gets called when 
// the element gets clicked on.
//
// we also could have called e anything, but typically it gets named e, or event, or 
// similiar.  Sometimes you want to pass e directly to the function, but in this case
// we're mostly interested in e.target so we can get the id from it
Array.from(deleteText).forEach((element)=>{
    element.addEventListener('click', (e) => deleteNote(e.target))
})

Array.from(thumbText).forEach((element)=>{
    element.addEventListener('click', (e) => addLike(e.target))
})

// DELETE ALL BUTTON
deleteAll.addEventListener('click', deleteAllNotes)

// targ here refers to e.target in the eventlistener's call to this function
// it will refer to the DOM element that was clicked on to trigger the event
async function deleteNote(targ){
    console.log('delete button click')

    // const sTitle = this.parentNode.childNodes[1].innerText
    // const sBody = this.parentNode.childNodes[3].innerText

    // getting title from the trash can icon
    // remove the -delete from the end of the id, then convert '-' to ' ' to get back
    // the original note title before we altered it to create a unique id
    const sTitle = targ.getAttribute('id').replace(/-delete$/, '').replace(/-/g, ' ')
    // console.log(sTitle, sBody)
    // this.parentNode.childNodes.forEach((item, i) => {
    //     console.log(item.innerText,i)
    // })

    // call deleteNote on the server to remove the note
    try{
        const response = await fetch('deleteNote', {
            method: 'delete',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              'noteTitleS': sTitle
            //   'noteBodyS': sBody
            })
          })
        const data = await response.json()
        console.log(data)
        location.reload()

    }catch(err){
        console.log(err)
    }
}

async function addLike(targ){
    console.log('like button click')
    // const sTitle = this.parentNode.childNodes[1].innerText.trim()
    // const sBody = this.parentNode.childNodes[4].innerText
    // const tLikes = Number(this.parentNode.childNodes[7].innerText)
    // document.querySelector(`${this.innerText}`)
    // console.log(this.innerText)
    
    // split returns an array of substrings, since we made the id the modified 
    // title and the number of likes, we use destructing assignment to put 
    //the into sTitle and tLikes
    let [sTitle, tLikes] = targ.getAttribute('id').split('---')
    // Convert the tLikes into an integer
    tLikes = Number(tLikes)
    // get the note body by the idea.  Since that's the title with white space 
    // replaced with '-' and ending with -body we can re-create the id for it here. 
    // Trim the whitespace to prevent duplication problems on the server side
    const sBody = document.getElementById(`${sTitle}-body`).innerText.trim()
    // since we created the title id by replacing the note title's spaced with '-'
    // we replace all '-' in the id with ' ' to get the original title of the note
    sTitle = sTitle.replace(/-/g, ' ')

    console.log(sTitle, tLikes, sBody)

    // call the server to update the note
    try{
        const response = await fetch('addOneLike', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              'noteTitleS': sTitle,
              'noteBodyS': sBody,
              'likesS': tLikes
            })
          })
        const data = await response.json()
        console.log(data)
        location.reload()

    }catch(err){
        console.log(err)
    }
}





//recent 
// grabs the date and timezone of the client and send it to server
// that way we get clients date according to their machines, not servers.
async function sendDateInfo() {
    const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  
     try{
        const send = await fetch('sendDateInfo', {
           method: 'post',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({
              timeZone: `${clientTimeZone}`
           })
         
        })
        const data = await send.json()

        // console.log(data)
        
 
       } catch(err) {
           console.log(err)
       }  
}



async function deleteAllNotes(){


    


    try{
        const response = await fetch('deleteAllNotes', {
            method: 'delete',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({})
          })

        
        
        location.reload()

    }catch(err){
        console.log(err)
    }

}