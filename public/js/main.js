const deleteText = document.querySelectorAll('.fa-trash')
const thumbText = document.querySelectorAll('.fa-star')
// on page load, if there is no client date and timezone info in sessionStorage, it runs the async function sendDateInfo() (it's at the very end.)
window.onload = _ =>  !sessionStorage.getItem('date sent') ?  sendDateInfo() : 'Date sent!'
// we use session storage because it's less persistant than local storage, we want the data to be deleted once tabs are closed
// that way when the end user upons a tab from a different timezone or manually change their machine timezones for preference, new session storage data is stored.
// an unlikely scenario, but we address it in the interest of accuracy and thoroughness

Array.from(deleteText).forEach((element)=>{
    element.addEventListener('click', (e) => deleteNote(e.target))
})

Array.from(thumbText).forEach((element)=>{
    element.addEventListener('click', (e) => addLike(e.target))
})

async function deleteNote(targ){
    console.log('delete button click')

    // const sTitle = this.parentNode.childNodes[1].innerText
    // const sBody = this.parentNode.childNodes[3].innerText

    // getting title from the trash can icon
    const sTitle = targ.getAttribute('id').replace(/-delete$/, '').replace(/-/g, ' ')
    // console.log(sTitle, sBody)
    // this.parentNode.childNodes.forEach((item, i) => {
    //     console.log(item.innerText,i)
    // })

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
    

    let [sTitle, tLikes] = targ.getAttribute('id').split('---')
    tLikes = Number(tLikes)
    const sBody = document.getElementById(`${sTitle}-body`).innerText.trim()
    sTitle = sTitle.replace(/-/g, ' ')
    console.log(sTitle, tLikes, sBody)

 
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
    const clientDate = new Date
  
     try{
        const send = await fetch('sendDateInfo', {
           method: 'post',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({
              timeZone: `${clientTimeZone}`,
              date: `${clientDate}`
           })
         
        })
        const data = await send.json()

        // console.log(data)
        
    //   sets the 'date sent' local session storage item to true upon receiving server reply "Date received...."
    //   this will stop the code from constantly making this server request.
        if(data === 'Date Received, thanks client side Js!') {
            sessionStorage.setItem('date sent', true)
        }
 
       } catch(err) {
           console.log(err)
       }  
}