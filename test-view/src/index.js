import PhotoView from './photo'
import HistoryView from './history'
import ArtView from './art'
import TestView from './test'

const PHOTO_VIEW = 'photo'
const HISTORY_VIEW = 'history'
const ART_VIEW = 'art'

import config from './config'
const { SOCKET_HOST, SOCKET_PORT } = config
const socket = require('socket.io-client')(SOCKET_HOST + ':' + SOCKET_PORT + '/visual')

const pageType = location.hash.replace('#', '')

const app = document.createElement('app')
document.body.appendChild(app)

let mainView = null

switch(pageType) {
  case PHOTO_VIEW:
    mainView = new PhotoView()
    break;

  case HISTORY_VIEW:
    mainView = new HistoryView()
    // mainView.goStyleListeners.push((filename) => {
    //   socket.emit('show-styled-request', filename)
    //   console.log(filename)
    // })
    break;

  case ART_VIEW:
    mainView = new ArtView()
    // mainView.init(
    //   'origins/sanfrancisco-1506063403196.jpg',
    //   'styled/sanfrancisco-1506063403196-starrynight.jpg',
    //   'starrynight'
    // )
    break;

  default:
    mainView = new TestView()
}

mainView.appendTo(app)

///////////////////////////////////////////////////////

socket.on('started', (data) => {
  console.log('started', data)
})

socket.on('origin-image-uploaded', (data) => {
  console.log('origin', data)
})

socket.on('styled-image-generated', (data) => {
  data = JSON.parse(data)
  console.log('styled', data)

  switch(pageType) {
    case PHOTO_VIEW:
      mainView.init('origins/' + data.originName)
      break;

    case HISTORY_VIEW:
      mainView.addNewItem(data)
      break;

    case ART_VIEW:
      mainView.init(
        'origins/' + data.originName,
        'styled/' + data.styledName,
        data.style
      )
      break;
  }
})

socket.on('show-styled', (data) => {
  console.log(data)
  data = JSON.parse(data)

  switch(pageType) {
    case ART_VIEW:

      mainView.init(
        'origins/' + data.originName,
        'styled/' + data.styledName,
        data.style
      )

      break;
  }
})
