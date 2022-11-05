import * as THREE from 'three'
const color = new THREE.Color(1, 0, 0);
const width = 500
const height = 500
const pi2 = 2 * Math.PI
const radius = 5

const canvas = document.createElement('canvas')
canvas.className = 'network'
canvas.width = width
canvas.height = height
let initalized = false
let context

function initCanvas() {
  document.body.appendChild(canvas)
  context = canvas.getContext("2d")
  context.msImageSmoothingEnabled = false
  context.mozImageSmoothingEnabled = false
  context.webkitImageSmoothingEnabled = false
  context.imageSmoothingEnabled = false;
  initalized = true
}

function drawLine(x1, y1, x2, y2) {
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

function drawCercle(x, y) {
  context.beginPath()
  context.arc(x, y, radius, 0, pi2)
  context.fill()
  context.stroke()
}

export default function displayNetwork(pros, inputsSize, layers) {

  if (!initalized) initCanvas(width, height)

  context.fillStyle = "#444";
  context.fillRect(0, 0, width, height);

  const w = width / (layers.length + 2)
  let h = 0
  let x = w
  let hLine = 0

  // Draw Layers
  let pLayerEnd = inputsSize
  let pLayerBegin = 0
  let iProps = 0
  let iNeuron = 0
  let size
  let branch = 0
  let w0, wi, l
  for (let i = 0; i < layers.length; i++) {
    size = layers[i]
    x += w
    h = height / (size + 1)
    for (let k = 0; k < size; k++) { // for each neurons of current layer
      branch = 0
      if (i === 0) { l = inputsSize } else { l = layers[i - 1] }
      hLine = height / (l + 1)
      for (let v = pLayerBegin; v < pLayerEnd; v++) { // for each input of current neuron
        wi = pros[iProps++]
        color.r = 1
        color.g = 0
        color.b = 0
        color.multiplyScalar((wi / 2) + 0.5)
        context.strokeStyle = '#' + color.getHexString()
        drawLine(x - w, hLine + branch * hLine, x, h + k * h)
        branch++
      }
      w0 = pros[iProps++]
      iNeuron++
    }
    pLayerBegin = iNeuron - size
    pLayerEnd = iNeuron
  }

  h = 0
  x = w
  hLine = 0
  // Draw inputs
  l = inputsSize
  h = height / (l + 1)
  context.fillStyle = "blue"
  context.strokeStyle = "black"
  context.lineWidth = 1
  for (let i = 0; i < l; i++) {
    drawCercle(x, h + i * h)
  }


  iProps = 0
  for (let i = 0; i < layers.length; i++) {
    size = layers[i]
    x = w * (i + 2)
    h = height / (size + 1)
    context.strokeStyle = 'black'
    for (let k = 0; k < size; k++) { // for each neurons of current layer
      branch = 0
      if (i === 0) { l = inputsSize } else { l = layers[i - 1] }
      hLine = height / (l + 1)
      for (let v = pLayerBegin; v < pLayerEnd; v++) { // for each input of current neuron
        wi = pros[iProps++]
        branch++
      }
      w0 = pros[iProps++]

      const output = i === layers.length
      color.r = output ? 1 : 0
      color.g = output ? 0 : 1
      color.b = 0
      color.multiplyScalar((w0 / 2) + 0.5)
      context.fillStyle = '#' + color.getHexString()

      drawCercle(x, h + k * h)
      iNeuron++
    }
    pLayerBegin = iNeuron - size
    pLayerEnd = iNeuron
  }

}



