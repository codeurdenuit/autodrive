

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

export function displayInputs(inputs, camera, percentStart, step = 1) {
  const width = camera.width
  const height = camera.height

  if (!initalized) initCanvas(width, height)
  context.clearRect(0, 0, width, height)
  context.fillStyle = 'red'
  const start = percentStart * height
  let x, y
  for (let i = 0; i < inputs.length; i++) {
    x = inputs[i]
    y = height - (start + i * step)
    context.fillRect(x, y, 1, 1)
  }
}
