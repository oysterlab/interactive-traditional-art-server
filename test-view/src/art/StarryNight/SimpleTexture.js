const THREE = require('n3d-threejs')

class SimpleTexture {

  constructor(imgInfo, position) {
    const { texture, width, height } = imgInfo
    const vertexShader = `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec4 pos = vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * pos;
      }
    `
    const fragmentShader = `
      varying vec2 vUv;
      uniform sampler2D texture1;

      void main() {

        gl_FragColor = texture2D(texture1, vUv);
      }
    `

    const uniforms = {
      texture1: {type:'t', value: texture}
    }
    texture.needsUpdate = true
//    console.log(texture)

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    })

    const geom = new THREE.PlaneGeometry(width, height)
    const mesh = new THREE.Mesh(geom, material)


    this.mesh = mesh
  }

  update() {}
}

export default SimpleTexture
