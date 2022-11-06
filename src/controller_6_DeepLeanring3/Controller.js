import Brain from '../neuralNetwork/brain03'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { computeRoadPath, integration, derivation, stacking } from './utils'
import { displayInputs } from './display'

/*const networkConfig = {
  id: 1,
  layers : [
    [
      { activation:'linear', weightVar:0.5, biasVar:0, inputs:[0,1,3,4] },
      { activation:'linear', weightVar:0.5, biasVar:0, inputs:[0,1,3,4] },
      { activation:'linear', weightVar:0.5, biasVar:0, inputs:[0,1,3,4] },
      { activation:'linear', weightVar:0.1, biasVar:0, inputs:[2,5] },
    ], 
    [
      { activation:'linear', weightVar:0.5, biasVar:0, inputs:[0,1,2] },
      { activation:'linear', weightVar:0.5, biasVar:0, inputs:[0,1,2] },
      { activation:'tanh', weightVar:0.5, biasVar:0.1, inputs:[3] },
    ],
    [
      { activation:'linear', weightVar:0.1, biasVar:0, inputs:[0,1] },
      { activation:'linear', weightVar:1, biasVar:0, inputs:[2] },
    ]
  ]
}*/

const networkConfig = {
  id: 1,
  layers : [
    [
      { activation:'linear', weightVar:0.5, biasVar:0, inputs:[0,1,3,4] },
      { activation:'linear', weightVar:0.5, biasVar:0, inputs:[0,1,3,4] },
      { activation:'linear', weightVar:0.5, biasVar:0, inputs:[0,1,3,4] },
      { activation:'linear', weightVar:0.1, biasVar:0.1, inputs:[2,5] },
    ], 
    [
      { activation:'linear', weightVar:0.1, biasVar:0, inputs:[0,1,2] },
      { activation:'linear', weightVar:1, biasVar:0.1, inputs:[3] },
    ]
  ]
}


export default class Controller {

  constructor(id) {
    this.id = id
    this.brain = new Brain(networkConfig)
    this.outputs = []
    this.inputs = []
    this.stacks = null
    this.stacksDuration = null
    this.values
    this.switchFitness = true
    this.periodIntegral = 3 // s
    this.cameraWidth = 150
    this.cameraHeight = 50
    this.rowStart = 0.42 // %
    this.rowEnd = 0.7 // %
    this.step = 7 // space between road points
    this.enginePower = 2000/3


    const gui = new GUI()
    gui.domElement.className += ' network'
    gui.title('For this network configuration')
    gui.add(this.brain, 'loadBestNetwork').name('load current state in memory');
    gui.add(this.brain, 'saveBestNetwork').name('save current state  in memory');
  }

  attempt(sensors, actuators, dt) {

    actuators.engineForce = 0
    actuators.breakingForce = 0
    actuators.steeringForce = 0

    sensors.camera.renderLayer(3, true)

    this.values = computeRoadPath(sensors.camera, this.rowStart, this.rowEnd, this.step)

    if (!this.stacks) {
      this.stacks = new Array(this.values.length).fill([0])
      this.stacksDuration = new Array(this.values.length).fill([0])
    }

    let ctn = 0
    for (let i = 0; i < this.values.length; i++) {
      const error_instant = this.cameraWidth / 2 - this.values[i]
      const stack = this.stacks[i] // history data for this line
      const stackDuration = this.stacksDuration[i] // history timing for this line
      stacking(error_instant, stack, dt, stackDuration, this.periodIntegral)
      const error_derivative = derivation(stack, dt)
      //const error_integral = integration(stack)
      this.inputs[ctn++] = error_instant
      this.inputs[ctn++] = error_derivative
      this.inputs[ctn++] = Math.abs(error_instant)
      //this.inputs[ctn++] = error_integral
    }

    this.outputs = this.brain.attempt(this.inputs, this.outputs)

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

    const fitness = (fitnessStability + fitnessSpeed + fitnessDistance*4) * fitnessDistance

    this.brain.learning(fitness)

    this.stacks = null
  }

  displayData(sensors) {
    displayInputs(this.values, sensors.camera, this.rowStart, this.step)
  }
}
