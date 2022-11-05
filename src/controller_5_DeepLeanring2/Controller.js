import Brain from '../neuralNetwork/brain02'
import { computeRoadPath, integration, derivation, stacking } from './utils'
import { displayInputs } from './display'

const configBrain = {
  hiddenLayers: [6, 4],
  outputs: 2
}

export default class Controller {

  constructor(id) {
    this.id = id
    this.brain = new Brain(configBrain, id)
    this.outputs = []
    this.inputs
    this.stacks = null
    this.stacksDuration = null
    this.values

    this.periodIntegral = 3 // s
    this.cameraWidth = 150
    this.cameraHeight = 50
    this.rowStart = 0.42 // %
    this.rowEnd = 0.7 // %
    this.step = 7 // space between road points
    this.enginePower = 2000
  }

  attempt(sensors, actuators, dt) {

    actuators.engineForce = 0
    actuators.breakingForce = 0
    actuators.steeringForce = 0

    sensors.camera.renderLayer(3, true)

    this.values = computeRoadPath(sensors.camera, this.rowStart, this.rowEnd, this.step)
    const l = this.values.length

    if (!this.stacks) {
      this.stacks = new Array(l).fill([0])
      this.stacksDuration = new Array(l).fill([0])
      this.inputs = []
    }

    let ctn = 0
    for (let i = 0; i < l; i++) {
      const error_instant = this.cameraWidth / 2 - this.values[i]
      const stack = this.stacks[i] // history data for this line
      const stackDuration = this.stacksDuration[i] // history timing for this line
      stacking(error_instant, stack, dt, stackDuration, this.periodIntegral)
      const error_derivative = derivation(stack, dt)
      const error_integral = integration(stack)
      this.inputs[ctn++] = error_instant
      this.inputs[ctn++] = error_derivative
      //this.inputs[ctn++] = error_integral
    }

    this.outputs = this.brain.attempt(this.inputs)

    actuators.steeringForce = this.outputs[0]

    const traction = (this.outputs[1]) * this.enginePower
    if (traction > 0) {
      actuators.engineForce = traction
    } else {
      actuators.breakingForce = -traction / 10
    }
  }

  evaluation(sensors, duration) {
    const yawAmount = sensors.yawAmount
    const lifetime = sensors.lifetime
    const distance = sensors.distance
    const stability = distance / yawAmount
    const speed = distance / lifetime

    const bestyawAmount = 50 // manual scroring
    const bestLifetime = 90 // manual scroring
    const bestDistance = 1700 //1609 in real
    const bestStability = bestDistance / bestyawAmount
    const bestSpeed = bestDistance / bestLifetime

    const fitnessStability = Math.min(stability / bestStability, 1)
    const fitnessSpeed = Math.min(speed / bestSpeed, 1)
    const fitnessDistance = Math.min(distance / bestDistance, 1)

    const fitness = (fitnessStability + fitnessSpeed + fitnessDistance) * fitnessDistance

    this.brain.learning(fitness, duration)

    this.stacks = null
    this.stacksDuration = null
  }

  displayData(sensors) {
    displayInputs(this.values, sensors.camera, this.rowStart, this.step)
  }
}
