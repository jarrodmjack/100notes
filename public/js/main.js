const deleteText = document.querySelectorAll('.fa-trash')
const thumbText = document.querySelectorAll('.fa-star')

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