
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import displayNetwork from './monitoring'

let bestFitness = -1
let bestNetwork = null
let networkId

export default class Brain {

  constructor(config, id) {
    this.id = id
    this.layers = [].concat(config.hiddenLayers).concat(config.outputs)
    this.neuronsPros = null
    this.neuronsValue = null
    this.neuronsLink = null
    this.outputs = new Array(config.outputs).fill(0)
    this.inputsSize = 0
  }

  attempt(inputs) {
    this.buildNeurons(inputs)

    let wi, bias
    let signal = 0 // input value of current neuron
    let value // value of current neuron
    let size = 0 // layer Size

    let pLayerEnd = this.inputsSize // previous layer end
    let pLayerBegin = 0 // previous layer begin

    //////////// signal propagation ///////////////////
    let iProps = 0 // index of neuron props
    let iNeuron = 0 // index of neuron

    for (let i = 0; i < this.layers.length; i++) { // for each layers
      size = this.layers[i]
      for (let k = 0; k < size; k++) { // for each neurons of current layer
        value = 0
        for (let v = pLayerBegin; v < pLayerEnd; v++) { // for each input of current neuron
          signal = i > 0 ? this.neuronsValue[v] : inputs[v]
          wi = this.neuronsPros[iProps++]
          value += signal * wi
        }
        bias = this.neuronsPros[iProps++]
        this.neuronsValue[iNeuron++] = /*Math.tanh(*/value + bias/*)*/
      }
      pLayerBegin = iNeuron - size
      pLayerEnd = iNeuron
    }

    const ol = this.outputs.length
    const nvl = this.neuronsValue.length

    for (let i = 0; i < ol; i++) {
      this.outputs[i] = this.neuronsValue[nvl - (ol - i)]
    }

    return this.outputs
  }

  buildNeurons(inputs) {
    if (this.neuronsPros) return

    this.neuronsPros = new Array()
    this.neuronsValue = new Array(this.layers.reduce((a, b) => a + b, 0)).fill(0);
    this.inputsSize = inputs.length

    let ls = 0 // Layer Size
    let pls = 0 // Previous Layer Size
    let irn = 0 // Relative index of neuron
    let il = 0 // Layer index
    let irnn = 0 // Relative index of neuron in previous layer

    for (il = 0; il < this.layers.length; il++) { // for each layers
      ls = this.layers[il]
      pls = this.layers[il - 1] || this.inputsSize// if no back layer, then those are the inputs
      for (irn = 0; irn < ls; irn++) { // for each neurons of current layer
        for (irnn = 0; irnn < pls; irnn++) { // for each input of current neuron
          this.neuronsPros.push(0) // add wi
        }
        this.neuronsPros.push(0) // add bias
      }
    }
    if (!networkId) {
      networkId = `${this.inputsSize}_${this.layers.join('_')}` //used by localstorage
    }
  }

  learning(fitness, duration) {
    if (!this.neuronsPros) return
    if (bestFitness < fitness) {
      bestFitness = fitness
      bestNetwork = this.neuronsPros.slice()
    }

    const random = this.id === 0 ? 0.5 * Math.random() : Math.random()

    const varianceMax = 0.1

    if (!bestNetwork) {
      this.fullRandomisation(this.neuronsPros, varianceMax)
    } else {

      if (random < 0.23) {
        this.neuronsPros = bestNetwork.slice()
        this.randomisation(this.neuronsPros, 0.05, 0.01 * varianceMax)
      } else if (random < 0.3) {
        this.neuronsPros = bestNetwork.slice()
        this.randomisation(this.neuronsPros, 0.1, 1 * varianceMax)
      } else if (random < 0.75) {
        this.neuronsPros = bestNetwork.slice()
        this.randomisation(this.neuronsPros, 0.2, 2 * varianceMax)
      } else if (random < 0.95) {
        this.neuronsPros = bestNetwork.slice()
        this.randomisation(this.neuronsPros, 0.3, 5 * varianceMax)
      } else if (random < 0.97) {
        this.neuronsPros = bestNetwork.slice()
        this.randomisation(this.neuronsPros, 1, varianceMax * 20)
      } else {
        this.fullRandomisation(this.neuronsPros, varianceMax * 40)
      }

    }

    if (this.id === 0) {
      displayNetwork(this.neuronsPros, this.inputsSize, this.layers)
    }
  }

  randomisation(neuronsPros, percentOfProps, variance) {
    const l = neuronsPros.length
    let propsNumber = Math.max(Math.floor(percentOfProps * l), 1)
    while (propsNumber--) {
      const index = Math.floor(Math.random() * l)
      neuronsPros[index] = (Math.random() - 0.5) * 2 * variance
    }
  }

  fullRandomisation(neuronsPros, variance) {
    console.log('full random')
    const l = neuronsPros.length
    for (let i = 0; i < l; i++) {
      neuronsPros[i] = (Math.random() - 0.5) * 2 * variance
    }
  }

  static removeBestNetwork() {
    localStorage.removeItem(networkId + 'props')
    localStorage.removeItem(networkId + 'fit')
    console.log('removeBestNetwork')
  }

  static saveBestNetwork() {
    localStorage.setItem(networkId + 'props', JSON.stringify(bestNetwork))
    localStorage.setItem(networkId + 'fit', JSON.stringify(bestFitness))
    console.log('saveBestNetwork')
  }

  static loadBestNetwork() {
    const string = localStorage.getItem(networkId + 'props')
    if (string) {
      bestNetwork = JSON.parse(string)
      bestFitness = JSON.parse(localStorage.getItem(networkId + 'fit'))
      console.log('loadBestNetwork')
    }
  }
}

const gui = new GUI()
gui.domElement.className += ' network'
gui.title('For this network configuration')
gui.add(Brain, 'loadBestNetwork').name('load current state in memory');
gui.add(Brain, 'saveBestNetwork').name('save current state  in memory');

