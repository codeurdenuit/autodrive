
import * as THREE from 'three'

let canvas = document.createElement('canvas');
canvas.className = 'sensor'
let renderer = null
let initialized = false
let targetTexture = null
let pixelBuffer

export default class Sensor {

  constructor(parent, parentId, width = 140, height = 50) {
    this.parentId = parentId
    this.camera = new THREE.PerspectiveCamera(80, 3, 0.2, 2000)
    this.camera.position.set(0, 3, 2)
    this.camera.rotation.y = Math.PI
    this.camera.rotation.x = Math.PI / 5
    this.camera.layers.enable(3)
    this.width = width
    this.height = height
    parent.add(this.camera)
    this.initRenderer()
  }

  initRenderer() {
    if (initialized) return
    canvas.width = this.width
    canvas.height = this.height;
    renderer = new THREE.WebGLRenderer({ canvas, preserveDrawingBuffer: true, antialias: false })
    renderer.setSize(this.width, this.height)
    targetTexture = new THREE.WebGLRenderTarget(this.width, this.height)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    pixelBuffer = new Uint8Array(4 * this.width * this.height)
    initialized = true
  }

  renderLayer(index, showCanvas) {
    const scene = this.camera.parent.parent.parent
    renderer.setRenderTarget(targetTexture)
    this.camera.layers.enable(index)
    renderer.render(scene, this.camera)
    renderer.readRenderTargetPixels(targetTexture, 0, 0, this.width, this.height, pixelBuffer)
    if (this.parentId === 0 && showCanvas) {
      if (!canvas.parentElement) document.body.appendChild(canvas)
      renderer.setRenderTarget(null)
      renderer.render(scene, this.camera)
    }
  }

  getPixelBuffer() {
    return pixelBuffer
  }

}
