import * as THREE from 'three'
const loaderMap = new THREE.TextureLoader()
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function loaderGLTF(src) {
  return new Promise((resolve, reject) => {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(src, (gltf) => {
      const root = gltf.scene;
      resolve(root)
    });
  })
}

export function loaderTexture(src) {
  return new Promise((resolve, reject) => {
    loaderMap.load(src, resolve)
  })
}
