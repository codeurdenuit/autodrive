
// autopilot system
export default class Controller {

  constructor(id) {
    this.cameraWidth = 150 // necessary for the operation of the visual sensor
    this.cameraHeight = 50 // read by sensor instance
  }

  attempt(sensors, actuators) { // called for each frame
    const buffer = sensors.camera.getPixelBuffer()

    //TODO

    actuators.engineForce = 0
    actuators.breakingForce = 0
    actuators.steeringForce = 0
  }

  evaluation(sensors) { // called when a car is removed

  }

  displayData() { // called for each frame

  }

}
