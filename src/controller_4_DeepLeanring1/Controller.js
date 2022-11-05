import Brain from '../neuralNetwork/brain01'
import { computeRoadDeltaCenter, integration, derivation, stacking } from './utils'
import { displayInputPoint } from './display'

const configBrain = {
  hiddenLayers: [3],
  outputs: 2
}
export default class Controller {

  constructor(id) {
    this.id = id
    this.brain = new Brain(configBrain, id)
    this.outputs = []
    this.inputs = [0, 0, 0]

    this.periodIntegral = 1
    this.stack = [0]
    this.stackDuration = [0]
    this.value = 0

    this.cameraWidth = 150
    this.cameraHeight = 50
    this.row = 0.5 // %
    this.enginePower = 500
  }

  attempt(sensors, actuators, dt) {

    actuators.engineForce = 0
    actuators.breakingForce = 0
    actuators.steeringForce = 0

    sensors.camera.renderLayer(3, true)

    this.value = computeRoadPointCenter(sensors.camera, this.row) // center position of road

    const error = this.cameraWidth / 2 - this.value

    stacking(error, this.stack, dt, this.stackDuration, this.periodIntegral)

    const derivative = derivation(this.stack, dt)
    const integral = integration(this.stack)

    this.inputs[0] = error
    this.inputs[1] = derivative
    this.inputs[2] = integral
    //this.inputs[2] = sensors.speed

    this.outputs = this.brain.attempt(this.inputs)

    actuators.steeringForce = this.outputs[0]
    actuators.engineForce = this.outputs[1] * this.enginePower
  }

  evaluation(sensors, duration) {
    const yawAmount = sensors.yawAmount
    const lifetime = sensors.lifetime
    const distance = sensors.distance
    const stability = distance / yawAmount
    const speed = distance / lifetime

    const bestyawAmount = 50 // manual scroring
    const bestLifetime = 90 // manual scroring
    const bestDistance = 1700 // 1609 in real
    const bestStability = bestDistance / bestyawAmount
    const bestSpeed = bestDistance / bestLifetime

    const fitnessStability = Math.min(stability / bestStability, 1)
    const fitnessSpeed = Math.min(speed / bestSpeed, 1)
    const fitnessDistance = Math.min(distance / bestDistance, 1)

    const fitness = (fitnessStability + fitnessSpeed + fitnessDistance) * fitnessDistance

    this.brain.learning(fitness, duration)

    this.stack = [0]
    this.stackDuration = [0]
  }

  displayData(sensors) {
    displayInputPoint(this.value, sensors.camera, this.row)
  }
}
