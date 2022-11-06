import Simulator from './simulation/Simulator';

/*----------------Controller used by vehicles--------------    */
//import Controller from './controller_1_manualDrive/Controller'
//import Controller from './controller_2_PID/Controller'
//import Controller from './controller_3_multiPID/Controller'
//import Controller from './controller_4_DeepLeanring1/Controller'
//import Controller from './controller_5_DeepLeanring2/Controller' 
import Controller from './controller_6_DeepLeanring3/Controller'  

window.addEventListener('load', () => {
  const instanceNumber = 10
  const simulator = new Simulator(instanceNumber)
  simulator.start(Controller)
})
