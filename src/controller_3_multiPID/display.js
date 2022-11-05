

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

export function displayInputLine(deltaCenters, camera, percentStart) {
  const width = camera.width
  const height = camera.height

  if (!initalized) initCanvas(width, height)
  context.clearRect(0, 0, width, height)
  context.fillStyle = 'red'
  const start = percentStart * height
  let dx = 0, x, y
  for (let i = 0; i < deltaCenters.length; i++) {
    dx = deltaCenters[i]
    x = dx
    y = height - (start + i)
    context.fillRect(x, y, 1, 1)
  }
}

