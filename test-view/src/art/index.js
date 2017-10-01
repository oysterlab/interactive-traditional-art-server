import StarryNight from './StarryNight'

class ArtView {
  constructor() {
    const rootView = document.createElement('div')
    rootView.innerHTML = 'artView'
    this.rootView = rootView
    this.currentArt = null
  }

  init(origin, styled, style) {
    if (this.currentArt) {
      this.currentArt.distroy()
    }

//    if (style == 'starrynight') {
      const starryNight = new StarryNight()
      starryNight.appendTo(this.rootView)
      starryNight.update(origin, styled)
      this.currentArt = starryNight
//    }
  }

  appendTo(ele) {
    ele.appendChild(this.rootView)
  }
}

export default ArtView
