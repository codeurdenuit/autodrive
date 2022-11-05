import { pid, computeRoadPath } from './utils'
import { displayInputLine } from './display'

export default class Controller {

  constructor(id) {
    this.id = id
    let index = 1
    this.ids = new Array(100).fill(0).map(a => (id + '_' + index++))
    this.outputs = []
    this.inputs = []

    this.cameraWidth = 300
    this.cameraHeight = 100
    this.steeringForceMax = 2
    this.speedMax = 50
    this.rowStart = 0.3 // %
    this.rowEnd = 0.65 // %
    this.enginePower = 2000
  }

  attempt(sensors, actuators, dt) {

    actuators.engineForce = 0
    actuators.breakingForce = 0
    actuators.steeringForce = 0

    sensors.camera.renderLayer(3, true)

    this.inputs = computeRoadPath(sensors.camera, this.rowStart, this.rowEnd)
    const inputL = this.inputs.length
    const speedStep = this.speedMax / inputL


    // PID for  steering
    const P = 0.14
    const I = 0.000001
    const D = 0.025
    for (let i = 0; i < inputL; i++) {
      const deltaSpeed = Math.min(Math.abs(sensors.speed - ((i + 1) * speedStep)), speedStep)
      const weighting = 1 - deltaSpeed / speedStep
      const value = this.inputs[i]
      const target = sensors.camera.width / 2
      actuators.steeringForce += pid(value, target, dt, P, I, D, this.ids[i]) * weighting * this.steeringForceMax
    }

    // PID for engineForce
    const Pv = 2
    const Iv = 0.0
    const Dv = 0.5

    const curvatureMax = this.cameraWidth / 4
    const deltaEndPath = Math.min(Math.abs(this.inputs[this.inputs.length - 1] - this.cameraWidth / 2), curvatureMax)
    const factor = 1 - deltaEndPath / curvatureMax //0 to 1
    const value = sensors.speed
    const target = factor * this.speedMax

    const traction = pid(value, target, dt, Pv, Iv, Dv, this.id) * this.enginePower

    if (traction > 0) {
      actuators.engineForce = traction
    } else {
      actuators.breakingForce = -traction / 10 //breakingForce is 10 times less powerful
    }

  }

  displayData(sensors) {
    displayInputLine(this.inputs, sensors.camera, this.rowStart, this.rowEnd)
  }
}
