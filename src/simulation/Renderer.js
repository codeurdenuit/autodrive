import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'

export default class Renderer {

  constructor() {

    const canvas = document.getElementById('canvas')

    this.scene = new THREE.Scene()

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setClearColor(0x000000)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000)
    this.camera.position.set(0, 100, 0)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))

    this.camera.layers.enable(1)
    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    this.lightAmbient = new THREE.AmbientLight(0x888888)
    this.scene.add(this.lightAmbient);

    this.lightDir = new THREE.DirectionalLight(0xffffff, 1)
    this.lightDir.position.set(-10, 10, -5)
    this.scene.add(this.lightDir)
  }

  add(instance) {
    this.scene.add(instance.root3D)
  }

  render(dt) {
    this.controls.update(dt);
    this.renderer.render(this.scene, this.camera)
  }

}
