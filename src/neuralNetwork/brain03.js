let bestFitness = {}
let bestNetwork = {}

export default class Brain {

  constructor(config) {
    this.id = config.id
    this.build(config)
  }

  attempt(inputs, outputs) {
    let layer, neuron, index, neuinputs
    for (let i = 0; i < this.layers.length; i++) {
      layer = this.layers[i]
      for (let k = 0; k < layer.length; k++) {
        neuron = layer[k]
        neuinputs = neuron.inputs
        neuron.value = neuron.bias
        for (let p = 0; p < neuinputs.length; p++) {
          index = neuinputs[p]
          if (i > 0) {
            neuron.value += this.layers[i - 1][index].value * neuron.weights[p]
          } else {
            neuron.value += inputs[index] * neuron.weights[p]
          }
        }
        neuron.value = neuron.activation(neuron.value)
      }
    }

    const lastLayer = this.layers[this.layers.length - 1]

    for (let i = 0; i < lastLayer.length; i++) {
      outputs[i] = lastLayer[i].value
    }

    return outputs
  }

  build(config) {
    this.layers = []
    const layers = config.layers
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i]
      this.layers[i] = []
      for (let k = 0; k < layer.length; k++) {
        const neuron = layer[k]
        this.layers[i][k] = {
          weightVar: neuron.weightVar,
          biasVar: neuron.biasVar,
          weights: new Array(neuron.inputs.length).fill(0),
          bias: 0,
          activation: neuron.activation === 'tanh' ? a => Math.tanh(a) : a => a,
          inputs: neuron.inputs,
          value: 0
        }
      }
    }
    this.propsNumber = this.propsCount(this.layers)
  }

  propsCount(layers) {
    let propsNumber = 0
    let layer
    for (let i = 0; i < layers.length; i++) {
      layer = layers[i]
      for (let k = 0; k < layer.length; k++) {
        if( layer[k].biasVar > 0) {
          propsNumber++
        }
        propsNumber += layer[k].inputs.length
      }
    }
    return propsNumber
  }

  networkToArray(layers) {
    let index = 0, weights, layer
    const array = []
    for (let i = 0; i < layers.length; i++) {
      layer = layers[i]
      for (let k = 0; k < layer.length; k++) {
        if( layer[k].biasVar > 0) {
          array[index++] = layer[k].bias
        }
        weights = layer[k].weights
        for (let p = 0; p < weights.length; p++) {
          array[index++] = weights[p]
        }
      }
    }
    return array
  }

  arrayToNetwork(array, layers) {
    let index = 0, weights, layer
    for (let i = 0; i < layers.length; i++) {
      layer = layers[i]
      for (let k = 0; k < layer.length; k++) {
        if( layer[k].biasVar > 0) {
          layer[k].bias = array[index++]
        }
        weights = layer[k].weights
        for (let p = 0; p < weights.length; p++) {
          weights[p] = array[index++] 
        }
      }
    }
    return layers
  }


  learning(fitness) {

    if(bestFitness[this.id]===undefined) {
      bestFitness[this.id] = 0
    }

    if (bestFitness[this.id] < fitness) {
      bestFitness[this.id] = fitness
      bestNetwork[this.id] = this.networkToArray(this.layers)
      console.log('best scrore')
    }

    if(!bestNetwork[this.id]) {
      this.randomisation(1,1)
    } else {
      this.layers = this.arrayToNetwork(bestNetwork[this.id], this.layers)
      const random = Math.random()
      let percentVariance, percentProps
      if (random < 0.23) {
        percentProps = 0.05
        percentVariance = 0.01
      } else if (random < 0.3) {
        percentProps = 0.1
        percentVariance = 0.1
      } else if (random < 0.75) {
        percentProps = 0.2
        percentVariance = 0.1
      } else if (random < 0.95) {
        percentProps = 0.33
        percentVariance = 0.1
      } else if (random < 1) {
        percentProps = 1
        percentVariance = 1
      }
      this.randomisation(percentProps, percentVariance)
    }
  }

  randomisation(percentOfProps, variance) {
    let iterations = Math.max(Math.floor(percentOfProps * this.propsNumber), 1)
    const layersNumber = this.layers.length
    let layerIndex, neuronIndex, weightsIndex, layer, neuron
    while (iterations--) {
      layerIndex = Math.floor(Math.random() * layersNumber)
      const layer = this.layers[layerIndex]
      neuronIndex = Math.floor(Math.random() * layer.length)
      const neuron = layer[neuronIndex]
      if(neuron.biasVar===0) {
        weightsIndex = Math.floor(Math.random() * neuron.weights.length)
        neuron.weights[weightsIndex] += variance*neuron.weightVar*(Math.random()*2 - 1) 
      } else {
        weightsIndex = Math.floor(Math.random() * neuron.weights.length+1)
        if(weightsIndex === neuron.weights.length) {
          neuron.bias +=  variance*neuron.biasVar*(Math.random()*2 - 1) 
        } else {
          neuron.weights[weightsIndex] += variance*neuron.weightVar*(Math.random()*2 - 1) 
        }
      }
    }
  }

  saveBestNetwork() {
    localStorage.setItem(this.id + 'props', JSON.stringify(bestNetwork[this.id]))
    localStorage.setItem(this.id + 'fit', JSON.stringify(bestFitness[this.id]))
    console.log(bestNetwork[this.id])
    console.log('saveBestNetwork')
  }

  loadBestNetwork() {
    const string = localStorage.getItem(this.id + 'props')
    if (string) {
      bestNetwork[this.id] = JSON.parse(string)
      bestFitness[this.id] = JSON.parse(localStorage.getItem(this.id + 'fit'))
      console.log(bestNetwork[this.id])
      console.log('loadBestNetwork')
    }
  }

}
