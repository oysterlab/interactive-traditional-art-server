const THREE = require('n3d-threejs')
import Particle from './Particle'

class StyleParticles {

  constructor(img, position) {
    this.img = img
    const vertexShader = `
      varying vec4 vColor;

      attribute vec3 particle_position;
      attribute vec4 particle_color;

      void main() {

        vec4 pos = vec4(position + particle_position, 1.0);
        vColor = particle_color;

        gl_PointSize = 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * pos;
      }
    `
    const fragmentShader = `
      varying vec4 vColor;

      void main() {
        gl_FragColor = vColor;
      }
    `

    const geom = new THREE.InstancedBufferGeometry()
//    geom.copy(new THREE.PlaneBufferGeometry(2, 2))
    geom.copy(new THREE.BoxBufferGeometry(2, 2, 2))
    geom.dynamics = false

    const imgHeight = img.height
    const imgWidth = img.width

    const particlePositions = new Float32Array(imgHeight * imgWidth * 3)
    const colors = new Float32Array(imgHeight * imgWidth * 4)

    geom.addAttribute('particle_position', new THREE.InstancedBufferAttribute(particlePositions, 3, 1));
    geom.addAttribute('particle_color', new THREE.InstancedBufferAttribute(colors, 4, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(
      geom,
      material
    )

    const lumi = [0.2126, 0.7152, 0.0722]

    const particles = []

    for (let y = 0; y < imgHeight; y++) {
      for (let x = 0; x < imgWidth; x++) {
        const z = 4000
        const i = (y * imgWidth + x)
        const i3 = i * 3
        const i4 = i * 4

        const l = r * lumi[0] + g * lumi[1] + b * lumi[2]

        const fromX = x - imgWidth / 2 + position[0]
        const fromY = y - imgHeight / 2 + position[1]
        const fromZ = z + (z + position[2]) * Math.pow(l, 4)

        const toX = x - imgWidth / 2 + position[0]
        const toY = imgHeight - y - imgHeight / 2 + position[1]
        const toZ = position[2] + Math.pow(1 - l, 4) * 12

        const r = img.data[(y * imgWidth + x) * 4 + 0] / 255
        const g = img.data[(y * imgWidth + x) * 4 + 1] / 255
        const b = img.data[(y * imgWidth + x) * 4 + 2] / 255
        const a = 1.0

        const ratio = i / (imgWidth * imgHeight)
        const m = (1 - l) * 0.3 + Math.pow((1. - ratio), 4) * 0.2
        const particle = new Particle(
          i,
          new THREE.Vector4(r, g, b, a),
          new THREE.Vector3(fromX, fromY, fromZ),
          new THREE.Vector3(toX, toY, toZ),
          mesh.geometry.attributes.particle_position,
          mesh.geometry.attributes.particle_color,
          m,
          l
        )
        particles.push(particle)

        particlePositions[i3 + 0] = fromX
        particlePositions[(imgHeight * imgWidth * 3 - i3) + 1] = fromY
        particlePositions[i3 + 2] = fromZ

        colors[i4 + 0] = r
        colors[i4 + 1] = g
        colors[i4 + 2] = b
        colors[i4 + 3] = a
      }
    }

    this.mesh = mesh
    this.particles = particles

    this.hide()
  }

  show() {
    const { particles } = this
    particles.forEach((particle) => {
      particle.m = (1. - particle.l) * 0.5
      particle.toPos = particle.initToPos.clone()
    })
  }

  hide() {
    const { particles } = this

    particles.forEach((particle, i, particles) => {
      const ratio = particle.idx / particles.length
      const l = particle.l
      const m = Math.pow(1. - l, 2) * 0.3 + Math.random() * 0.01
                //(1 - l) * 0.3 + Math.pow((1. - ratio), 4) * 0.2

      particle.m = m
      particle.toPos = particle.initFromPos.clone() //particle.initPos.clone().sub(new THREE.Vector3(0, 0, 4000))
      particle.toPos.z = 3000
      particle.toPos.x = (Math.random() - 0.5) * 3000
      particle.toPos.y = (Math.random()) * 3000
    })
  }

  update(pos, s) {
    const { mesh, particles, img } = this

    particles.forEach((particle) => {
      const i = particle.idx
      const i3 = i * 3

      // if(pos) {
      //   const x = (-0.5 + pos.x) * img.width * 2
      //   const y = (pos.y) * img.height
      //
      //   const l = Math.sqrt(Math.pow((x - particle.currPos.x), 2) + Math.pow((y - particle.currPos.y), 2))
      //
      //   if(l < s * 100 * Math.random()) {
      //     particle.vel.x = particle.currPos.x + 100 * (Math.random() - .5)
      //     particle.vel.y = particle.currPos.y + 100 * (Math.random() - .5)
      //     particle.vel.z = particle.currPos.z + 100 * (Math.random() - .5)
      //   }
      // }

      particle.update()
    })

    if(mesh) {
      mesh.geometry.attributes.particle_position.needsUpdate = true
      mesh.geometry.attributes.particle_color.needsUpdate = true
    }
  }

  distroy() {
    const { mesh } = this

    // this.particles = null
    // mesh.geometry.dispose();
    // mesh.material.dispose();
    //
    // mesh.geometry.attributes.particle_position.array = null
    // mesh.geometry.attributes.particle_color.array = null
    //
    // // delete this.particles
    // // delete this.mesh
    // this.mesh = null
    // this.particles = []
  }
}

export default StyleParticles
