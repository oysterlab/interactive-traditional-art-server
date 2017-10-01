const THREE = require('n3d-threejs')

class Particle {
  constructor(idx, color, pos, toPos,
      geomPariclePosition,
      geomParticleColor,
      m, l) {
    this.idx = idx

    this.initFromPos = pos.clone()
    this.initToPos = toPos.clone()

    this.currPos = pos.clone()
    this.toPos = toPos.clone()
    this.geomPariclePosition = geomPariclePosition

    this.currColor = color.clone()
    this.toColor = color.clone()
    this.geomParticleColor = geomParticleColor

    this.acc = new THREE.Vector3(0, 0, 0)
    this.vel = new THREE.Vector3(0, 0, 0)

    this.m = m
    this.l = l
    this.fraction = new THREE.Vector3(0.4, 0.4, 0.4)
  }

  update() {
    const { idx,
       currPos, toPos,
       currColor, toColor,
       vel, acc, m, fraction,
       geomPariclePosition, geomParticleColor } = this

    const i3 = idx * 3
    const i4 = idx * 4

    const lx = toPos.x - currPos.x
    const ly = toPos.y - currPos.y
    const lz = toPos.z - currPos.z

    acc.set(lx * m, ly * m, lz * m)
    vel.multiply(fraction)
    vel.add(acc)

    currPos.add(vel)

    geomPariclePosition.array[i3 + 0] = currPos.x
    geomPariclePosition.array[i3 + 1] = currPos.y
    geomPariclePosition.array[i3 + 2] = currPos.z

    // geomParticleColor.array[i4 + 0] = currColor.r
    // geomParticleColor.array[i4 + 1] = currColor.g
    // geomParticleColor.array[i4 + 2] = currColor.b
    // geomParticleColor.array[i4 + 3] = currColor.a
  }
}

export default Particle
