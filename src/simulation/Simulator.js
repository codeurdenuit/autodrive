
import * as THREE from 'three'
import Renderer from './Renderer'
import Car from './Car'
import Circuit from './Circuit'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'

export default class Simulator {

  constructor(carNumber = 10) {
    this.timefactor = 1
    this.carNumber = carNumber || 10
    this.carInterval = 1500
    this.cars = []

    this.renderer = new Renderer(canvas)
    this.circuit = new Circuit(300, 300)
    this.renderer.add(this.circuit)
    this.gui = new GUI().title('ttetet')
    this.gui.add(this, 'timefactor').min(0).max(8).step(1).name('time factor')
    this.clock = new THREE.Clock(true);
  }

  update(dt, duration) {
    this.renderer.render(dt)
    for (let i = 0; i < this.cars.length; i++) {
      this.cars[i].update(dt, this.circuit) // update physics and graphics
      this.cars[i].checking(duration) // inefficient or off-track cars must be reset
    }
  }

  async start(CarController) {
    await this.circuit.build()
    await Car.loadAssets()
    this.populate(CarController)
    this._duration = 0
    const tick = () => {
      requestAnimationFrame(tick)
      const dt = this.clock.getDelta() * this.timefactor
      this._duration += dt
      this.update(dt, this._duration)
    };
    tick()
  }

  populate(CarController) {
    const interval = setInterval(() => {
      const car = new Car(this.circuit.startingPoint, CarController)
      this.cars.push(car)
      this.renderer.add(car) // to display the car
      if (this.cars.length === this.carNumber) {
        clearInterval(interval)
      }
    }, this.carInterval)
  }

}
