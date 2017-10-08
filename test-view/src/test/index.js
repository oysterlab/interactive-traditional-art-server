const request = require('superagent')

class TestView {
  constructor() {
    const rootView = document.createElement('div')
    rootView.innerHTML = `<form id='uploadForm' method=post action="/send-image" enctype=multipart/form-data>
      <p><input type=file name=photo>
        <input name=styleType id='styleType' value=0>
    </form> <div id='uploadBtn'> Upload. </div>`
    this.rootView = rootView
  }

  appendTo(ele) {
    ele.appendChild(this.rootView)

    const uploadBtn = document.getElementById('uploadBtn')
    uploadBtn.addEventListener('click', () => {
      const uploadForm = document.getElementById('uploadForm')
      const styleId = document.getElementById('styleType').value
      request
        .get('/selected-style?styleId='+styleId)
        .end(function(err, res){
     if (err || !res.ok) {
       console.log(err)
     } else {
       uploadForm.submit()
     }})

    })
  }
}

export default TestView
