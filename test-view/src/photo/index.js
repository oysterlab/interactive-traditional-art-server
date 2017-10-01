class PhotoView {
  constructor() {
    const rootView = document.createElement('div')
    rootView.innerHTML = 'photoView'
    this.rootView = rootView
  }

  appendTo(ele) {
    ele.appendChild(this.rootView)
  }

  init(originImgPath) {
    this.rootView.innerHTML = `
      <img src=${originImgPath} />
    `

  }
}

export default PhotoView
