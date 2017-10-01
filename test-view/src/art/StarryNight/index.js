const THREE = require('n3d-threejs')
const OrbitControls = require('three-orbit-controls')(THREE)

import StyleParticles from './StyleParticles'
import SimpleTexture from './SimpleTexture'

class StarryNight {
  constructor() {
    const WIDTH = window.innerWidth
    const HEIGHT = window.innerHeight
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    })
    renderer.setSize(WIDTH, HEIGHT)
    renderer.setClearColor(0x000000, 1)

    const camera = new THREE.PerspectiveCamera(120, WIDTH / HEIGHT, 1, 10000)
    camera.up = new THREE.Vector3(0,0,1);
    camera.lookAt(new THREE.Vector3(0,0,0));
    camera.rotation.set(0.08527637827622801, 0.07939923273348698, 0.07042089804446282)
    camera.position.set(-41.49491723759695, -206.5706870604613, 400.8359262485214)

    const MAX_WIDTH = 800
    const scene = new THREE.Scene()

    this.WIDTH = WIDTH
    this.HEIGHT = HEIGHT
    this.MAX_WIDTH = MAX_WIDTH

    this.renderer = renderer
    this.camera = camera
    this.scene = scene

    const styleParticles = null
    this.styleParticles = styleParticles

    const render = () => {
      requestAnimationFrame(render)

      if (this.styleParticles && scene.children.length > 0) {
        this.styleParticles.update()
        renderer.render(scene, camera)
      }

    }
    requestAnimationFrame(render)

    window.addEventListener('keydown', ({key}) => {
      if(key == '1' && this.styleParticles) {
        this.styleParticles.show()
      } else if (key == '2' && this.styleParticles) {
        this.styleParticles.hide()
      }
    })

    const controls = new OrbitControls(camera, renderer.domElement)

  }

  appendTo(ele) {
    const { renderer } = this
    ele.innerHTML = ''
    ele.appendChild(renderer.domElement)
  }

  update(originPath, styledPath) {
    const {
      WIDTH, HEIGHT, MAX_WIDTH,
      camera, scene, renderer
    } = this

    const img = new Image()
    img.src = styledPath

    console.log(originPath)
    console.log(styledPath)

    img.onload = () => {

      while (scene.children.length)
      {
          scene.children.remove(scene.children[0]);
      }

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if(img.width > MAX_WIDTH) {
        const r = img.height / img.width
        img.width = MAX_WIDTH
        img.height = MAX_WIDTH * r
      }

      canvas.width = img.width
      canvas.height = img.height

      context.fillStyle = context.drawImage(img, 0, 0, img.width, img.height)
      const imgData = context.getImageData(0, 0, img.width, img.height).data

      const imgInfo = {
        width: img.width,
        height: img.height,
        data: imgData,
      }

      const artPosition = [0, 0, 0]
      // const originTexture = new SimpleTexture({
      //   width: img.width,
      //   height: img.height,
      //   texture: THREE.ImageUtils.loadTexture( originPath )
      // }, artPosition)
      // scene.add(originTexture.mesh)

      this.styleParticles = new StyleParticles(imgInfo, artPosition)
      scene.add(this.styleParticles.mesh)

      setTimeout(() => {
        if(this.styleParticles) {
          this.styleParticles.show()
        }
      }, 1000)
    }
  }

  distroy() {
    const { scene } = this
    scene.traverse( function ( object ) {
    	if ( object.geometry ) object.geometry.dispose();
    	if ( object.material ) {
    		if (object.material.map) object.material.map.dispose();
    		object.material.dispose();
    	}
    	scene.remove(object);
    } );
  }
}

export default StarryNight
