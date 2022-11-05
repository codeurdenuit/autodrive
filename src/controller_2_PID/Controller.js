import { pid, computeRoadPointCenter } from './utils'
import { displayInputPoint } from './display'

export default class Controller {

  constructor(id) {
    this.id = id
    this.outputs = []
    this.input = 0

    this.cameraWidth = 150
    this.cameraHeight = 40
    this.rowHeight = 0.5 // %
    this.enginePower = 500
  }

  attempt(sensors, actuators, dt) {
    sensors.camera.renderLayer(3, true)

    this.input = computeRoadPointCenter(sensors.camera, this.rowHeight)

    const target = this.cameraWidth / 2
    const P = 0.14
    const I = 0.000001
    const D = 0.02

    actuators.steeringForce = 0
    actuators.steeringForce += pid(this.input, target, dt, P, I, D, this.id)
    actuators.engineForce = this.enginePower
  }

  displayData(sensors) {
    displayInputPoint(this.input, sensors.camera, this.rowHeight)
  }

}
