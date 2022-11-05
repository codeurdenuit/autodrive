import * as THREE from 'three'
import { loaderTexture, loaderGLTF } from '../utils'

export default class Circuit {

  constructor(width, height) {
    this.root3D = new THREE.Object3D()
    this.startingPoint = null
    this.width = width
    this.height = height
  }

  async initLayers() {
    const geometry = new THREE.BoxGeometry(this.width, 1, this.height, 1, 1, 1)
    const sceneCircuit = await loaderGLTF('./circuit.glb')
    const meshCircuit = sceneCircuit.children[0]

    // layer with road, cars and colorful texture
    this.materialReal = new THREE.MeshPhongMaterial({ color: 0xcccccc, shininess: 0 })
    this.visualReal = meshCircuit
    this.visualReal.material = this.materialReal
    this.visualReal.position.y = 0.5
    this.visualReal.layers.set(1)

    // layer with road, cars and simplified texture
    this.materialRef = new THREE.MeshPhongMaterial({ color: 0xcccccc, shininess: 0 })
    this.visualRef = new THREE.Mesh(geometry, this.materialRef)
    this.visualRef.position.y = 0.5
    this.visualRef.layers.set(2)

    // layer with road and colorful texture
    this.visualRealAlone = this.visualReal.clone()
    this.visualRealAlone.layers.set(3)

    this.root3D.add(this.visualRef)
    this.root3D.add(this.visualReal)
    this.root3D.add(this.visualRealAlone)

    this.mapReal = null
    this.mapRef = null
    this.mapRoadCenter = null
  }

  async initMaterial() {
    this.mapRef = await loaderTexture('/map.png')
    this.mapReal = await loaderTexture('/circuit.png')

    this.mapRef.magFilter = THREE.NearestFilter
    this.mapRef.minFilter = THREE.NearestFilter
    this.materialRef.map = this.mapRef;
    this.mapRef.needsUpdate = true;

    this.materialReal.magFilter = THREE.NearestFilter
    this.materialReal.minFilter = THREE.NearestFilter
    this.materialReal.map = this.mapReal
    this.materialReal.needsUpdate = true
  }

  initDataMap() {
    const canvas = document.createElement('canvas')
    const image = this.mapRef.image
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, image.width, image.height)
    this.dataMap = context.getImageData(0, 0, image.width, image.height)
  }

  initStartingVector() {
    const data = this.dataMap.data;;
    const w = this.dataMap.width
    const h = this.dataMap.height
    const p1 = new THREE.Vector3()
    const p2 = new THREE.Vector3()
    let r, g, b
    for (let i = 0; i < data.length; i += 4) {
      r = data[i]
      g = data[i + 1]
      b = data[i + 2]
      if (g > 200 && r < 200) {
        p1.x = ((i / 4 % w) / w)
        p1.z = (Math.ceil(i / 4 / w) / h)
      }
      if (g < 200 && r > 200) {
        p2.x = ((i / 4 % w) / w)
        p2.z = (Math.ceil(i / 4 / w) / h)
      }
    }
    const obj = new THREE.Object3D()
    let target = p2.clone().add(p1.clone().negate())
    obj.lookAt(target)

    this.startingPoint = {
      quaternion: obj.quaternion,
      position: new THREE.Vector3(p1.x * this.width - this.width / 2, 2, p1.z * this.height - this.height / 2)
    }
  }

  async build() {
    await this.initLayers()
    await this.initMaterial()
    this.initDataMap()
    this.initStartingVector()
  }

  getCollision(x, z) {
    const dataMap = this.dataMap
    const widthPixel = dataMap.width
    const heightPixel = dataMap.height

    const xPixelA = Math.floor((x + this.width / 2) / this.width * widthPixel)
    const zPixelA = Math.floor((z + this.height / 2) / this.height * heightPixel)

    if (xPixelA > widthPixel || xPixelA < 0) return true
    if (zPixelA > heightPixel || zPixelA < 0) return true

    const value = dataMap.data[zPixelA * widthPixel * 4 + xPixelA * 4 + 2]

    return value < 2
  }
}
