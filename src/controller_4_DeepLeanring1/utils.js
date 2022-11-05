
export function stacking(value, stack, dt, stackDuration, period) {
  const l = stackDuration.length
  let duration = 0
  let i = 0
  for (i = l - 1; i > -1; i--) {
    duration += stackDuration[i]
    if (duration > period) {
      stack.splice(i, l)
      break
    }
  }
  stack.push(value)
  stackDuration.push(dt)
}

export function integration(stack) {
  return stack.reduce((a, b) => a + b, 0) / stack.length
}

export function derivation(stack, dt) {
  return (stack[stack.length - 1] - stack[stack.length - 2]) / (dt + 0.00001)
}

export function computeRoadPointCenter(camera, percentHeight) {
  const width = camera.width
  const height = camera.height
  const buffer = camera.getPixelBuffer()
  const line = Math.floor(height * percentHeight)
  return computeLineCenter(buffer, line, width)
}

function computeLineCenter(buffer, y, width, previousX) {
  const threshold = 100
  let pixel
  let sumX = 0
  let ctn = 0

  if (previousX === undefined) { // looking for where the road is displayed for this line
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
    return 0
  } else {
    return Math.round(sumX / ctn)
  }
}

function searchValidPixelInLine(buffer, y, threshold, width) { // looking for where the road is displayed for this li
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

export function pid(errCurrent, errDerive, dt, P, D, id, stackSize = 1000) {
  return [(errCurrent * P + errDerive * D), 1]
}
