const configCamera = {
  width: 300,
  height: 100
}

export default class Controller {

  constructor(id) {
    this.id = id
    this.cameraWidth = 150
    this.cameraHeight = 50
    this.inputs = {
      forward: false,
      left: false,
      right: false,
      reverse: false
    }
    if (id !== 0) return // only the first car 
    document.onkeydown = (evt) => {
      switch (evt.key) {
        case "ArrowLeft":
          this.inputs.left = true;
          break;
        case "ArrowRight":
          this.inputs.right = true;
          break;
        case "ArrowUp":
          this.inputs.forward = true;
          break;
        case "ArrowDown":
          this.inputs.reverse = true;
          break;
      }
    }
    document.onkeyup = (evt) => {
      switch (evt.key) {
        case "ArrowLeft":
          this.inputs.left = false;
          break;
        case "ArrowRight":
          this.inputs.right = false;
          break;
        case "ArrowUp":
          this.inputs.forward = false;
          break;
        case "ArrowDown":
          this.inputs.reverse = false;
          break;
      }
    }
  }

  attempt(sensors, actuators) {
    sensors.camera.renderLayer(1, true, configCamera)

    actuators.steeringForce = 0
    if (this.inputs.left) {
      actuators.steeringForce += 1.5
    }
    if (this.inputs.right) {
      actuators.steeringForce -= 1.5
    }
    actuators.engineForce = 0
    if (this.inputs.forward) {
      actuators.engineForce = 2000
    }

    actuators.breakingForce = 0
    if (this.inputs.reverse) {
      actuators.breakingForce = 200
    }

  }

  evaluation(sensors) {

  }

  displayData() {

  }

}
