const request = require('superagent')

class TestView {
  constructor() {
    const rootView = document.createElement('div')
    rootView.innerHTML = `<form method=post action="/send_image" enctype=multipart/form-data>
      <p><input type=file name=photo>
        <input name=styleType value=1>
         <input type=submit value=Upload>
    </form>`
    this.rootView = rootView
  }

  appendTo(ele) {
    ele.appendChild(this.rootView)
    console.log('test')
  }
}

export default TestView
