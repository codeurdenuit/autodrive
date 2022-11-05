
export function stacking(value, stack, stackSize) {
  stack.push(value)
  if (stack.length > stackSize) {
    stack.shift()
  }
}

export function computeIntegral(stack) {
  return stack.reduce((a, b) => a + b, 0)
}

export function computeDerive(stack, dt) {
  return (stack[stack.length - 1] - stack[stack.length - 2]) / (dt + 0.00001)
}

const stacks = {}

export function pid(value, target, dt, P, I, D, id, stackSize = 1000) {

  if (!stacks[id]) stacks[id] = [0, 0]
  const stack = stacks[id]

  const errCurrent = target - value

  stacking(errCurrent, stack, stackSize)

  const errIntegral = computeIntegral(stack)

  const errDerive = computeDerive(stack, dt)

  return errCurrent * P + errIntegral * I + errDerive * D
}

let inputs
export function computeRoadPath(camera, percentStart, percentEnd, step = 1) {
  const width = camera.width
  const height = camera.height
  const buffer = camera.getPixelBuffer()
  const lineEnd = Math.floor(height * percentEnd)
  const lineStart = Math.floor(height * percentStart)

  if (!inputs) inputs = [] // new Array(lineEnd-lineStart)

  let x = 0, index = 0
  let previousCenter
  for (let y = lineStart; y < lineEnd; y += step) {
    x = computeLineCenter(buffer, y, width, previousCenter)
    inputs[index++] = x
    previousCenter = x
  }
  return inputs
}

function computeLineCenter(buffer, y, width, previousX) {
  const threshold = 100
  let pixel
  let sumX = 0
  let ctn = 0

  if (previousX === undefined) { // looking for where the road is displayed for previous line
    previousX = searchValidPixelInLine(buffer, y, threshold, width)
  }

  for (let x = previousX; x > -1; x--) {
    pixel = buffer[(y * width + x) * 4 + 2]
    if (pixel > threshold) { //if road
      sumX += x //sum of xPosition
      ctn++
    } else {
      break//leave road
    }
  }

  for (let x = previousX + 1; x < width; x++) {
    pixel = buffer[(y * width + x) * 4 + 2]
    if (pixel > threshold) {
      sumX += x
      ctn++
    } else {
      break
    }
  }


  if (ctn === 0) {
    return width / 2
  } else {
    return Math.round(sumX / ctn)
  }
}


function searchValidPixelInLine(buffer, y, threshold, width) {
  const half = Math.floor(width / 2)
  let x = 0
  let pixel
  for (let i = 0; i < half; i++) {
    x = i + half
    pixel = buffer[(y * width + x) * 4 + 2]
    if (pixel > threshold) return x
    x = Math.max(half - i, 0)
    pixel = buffer[(y * width + x) * 4 + 2]
    if (pixel > threshold) return x
  }
  return 0
}
