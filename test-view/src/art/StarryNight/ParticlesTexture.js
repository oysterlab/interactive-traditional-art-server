const THREE = require('n3d-threejs')

class DataTexture {

  constructor({width, height, data}, renderer) {
    this.width = width;
    this.height = height;
    this.pixels = data;

    const camera = new THREE.Camera()
    const renderTarget = new THREE.WebGLRendererTarget(w, h)

    const vertexShader = `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.);
      }
    `

    const fragmentShader = `
      varying vec2 vUv;
      uniform sampler2D fromToPosTexture;
      uniform sampler2D posVelTexture;
      uniform sampler2D colorTexture;

      void main() {
        gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
      }
    `

    const fromToCanvas = document.createElement('canvas')
    const fromToContext = fromToCanvas.getContext('2d')

    for (let y = 0; y < height; y++) {
      for(let x = 0; x < width; x++) {
        const i = y * width + x
        fromToContext.
      }
    }



    const material = new THREE.ShaderMaterial({
      uniforms: {
        initPosTexture: {type: 't', value: null},
        posTexture: {type: 't', value: null},
        velTexture: {type: 't', value: null},
        colorTexture: {type: 't', value: null},
      },
      vertexShader,
      fragmentShader
    })

    const geometry = new THREE.PlaneBufferGeometry(2, 2)
    const mesh = new THREE.Mesh(material, geometry)

    const scene = new Scene()
    scene.add(mesh)

    this.renderer = renderer
    this.renderTarget = renderTarget
    this.scene = scene
    this.camera = camera
  }

  update() {
    const { renderer, renderTarget, scene, camera } = this
    renderer.render(scene, camera, renderTarget)
  }
}

export default DataTexture
