const request = require('superagent')

class HistoryView {
  constructor() {
    const rootView = document.createElement('div')
    rootView.innerHTML = 'historyView'
    this.rootView = rootView

    this.loadHistory()

    this.goStyleListeners = []
  }

  appendTo(ele) {
    ele.appendChild(this.rootView)
  }

  goStyle(filename){
    this.goStyleListeners.forEach((callback) => {
      callback(filename)
    })
  }

  addNewItem({
    createdTime,
    ext,
    originName
  }) {
    const img = new Image()
    img.style.width = '100px'
    img.src = './styled/' + originName
    this.rootView.appendChild(img)

    img.addEventListener('click', () => {
      this.goStyle(originName)
    })
  }

  loadHistory(){
    request.get('/history').end((err, { body }) => {
      const history = body

      history.forEach((item) => this.addNewItem(item))
    })
  }
}

export default HistoryView
