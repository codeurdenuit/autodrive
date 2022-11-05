

const canvas = document.createElement('canvas')
canvas.className = 'sensor'

let initalized = false
let context

function initCanvas(width, height) {
  document.body.appendChild(canvas)
  canvas.width = width
  canvas.height = height
  context = canvas.getContext("2d")
  context.msImageSmoothingEnabled = false
  context.mozImageSmoothingEnabled = false
  context.webkitImageSmoothingEnabled = false
  context.imageSmoothingEnabled = false;
  initalized = true
}

export function displayInputPoint(deltaCenter, camera, percentHeight) {
  const width = camera.width
  const height = camera.height

  if (!initalized) initCanvas(width, height)

  const y = height - height * percentHeight
  const x = deltaCenter

  context.clearRect(0, 0, width, height)
  context.fillStyle = 'red'
  context.fillRect(x, y, 1, 1)
}
