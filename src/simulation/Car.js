import * as THREE from 'three'
import Ammo from 'ammo.js'
import Sensor from './Sensor'
import { loaderGLTF, loaderTexture } from '../utils'

let geometryChassis
let geometryWheelL
let geometryWheelR
let texture

const minYawFrequency = 0.1 // loop
const maxYawFrequency = 2 // unstable vehicle
const minSpeedAverage = 2.5

const DISABLE_DEACTIVATION = 4;

const chassisWidth = 1.7
const chassisHeight = .9
const chassisLength = 4
const massVehicle = 800

const wheelAxisPositionBack = -1.8
const wheelRadiusBack = .4
const wheelWidthBack = .3
const wheelHalfTrackBack = 1
const wheelAxisHeightBack = .39

const wheelAxisFrontPosition = 2.15
const wheelHalfTrackFront = 1
const wheelAxisHeightFront = .35
const wheelRadiusFront = .40
const wheelWidthFront = .2

const friction = 1000
const suspensionStiffness = 20.0
const suspensionDamping = 2.3
const suspensionCompression = 4.4
const suspensionRestLength = 0.6
const rollInfluence = 0.2

const realignmentFactor = 0.007
const steeringClamp = .5
const maxEngineForce = 2000
const maxBreakingForce = 100

const FRONT_LEFT = 0
const FRONT_RIGHT = 1
const BACK_LEFT = 2
const BACK_RIGHT = 3

const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0)
const wheelAxleCS = new Ammo.btVector3(-1, 0, 0)

let counter = 0

export default class Car {

  constructor(point, Controller) {
    this.id = counter++

    this.root3D = null

    this.physicsEngine = null
    this.vehicleSimulation = null

    this.sensors = null
    this.actuators = null
    this.controller = new Controller(this.id)

    this.initGraphic()
    this.initPhysic()
    this.initSensors(point)
    this.reset()
  }

  initGraphic() {
    this.root3D = new THREE.Object3D()
    this.initGraphicChassis(this.root3D)
    this.initGraphicWheels(this.root3D)
  }

  initPhysic() {
    this.initPhysicEngine()
    this.initGround()
    this.initPhysicVehicule()
    this.initPhysicWheels()
  }

  update(dt, circuit) {
    this.updatePhysic(dt)
    this.updateGraphic()
    this.updateSensors(dt, circuit)
  }

  initGraphicChassis(parent3D) {
    const material = new THREE.MeshPhongMaterial({ map: texture })
    const mesh = new THREE.Mesh(geometryChassis, material)
    mesh.layers.set(1)
    mesh.position.y = -99999
    parent3D.add(mesh)
  }

  initGraphicWheels(parent3D) {
    const createWheel = (right) => {
      const geometry = right ? geometryWheelR : geometryWheelL
      const material = new THREE.MeshPhongMaterial({ map: texture })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.layers.set(1)
      parent3D.add(mesh)
    }

    createWheel(true)
    createWheel(false)
    createWheel(true)
    createWheel(false)
  }

  initSensors(point) {
    const chassis3D = this.root3D.children[0]

    this.sensors = {
      position: new THREE.Vector3(),
      distance: 0,
      lifetime: 0,
      camera: new Sensor(chassis3D, this.id, this.controller.cameraWidth, this.controller.cameraHeight),
      pointStarting: point,
      speed: 0,
      yawVelocity: 0,
      yawVelocitySign: 0,
      yawCounter: 0,
      yawVelocitySignPrevious: 0,
      yawFrequency: 0,
      yawAmount: 0,
      collision: 0
    }
  }

  initPhysicEngine() {
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
    const broadphase = new Ammo.btDbvtBroadphase()
    const solver = new Ammo.btSequentialImpulseConstraintSolver()
    this.physicsEngine = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration)
    this.physicsEngine.setGravity(new Ammo.btVector3(0, -9.82, 0))
  }

  initGround() {
    const mass = 0
    const friction = 2
    const width = 300
    const height = 300
    const deep = 1
    const geometry = new Ammo.btBoxShape(new Ammo.btVector3(width * 0.5, deep * 0.5, height * 0.5))
    const transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(0, 0, 0))
    transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1))
    const motionState = new Ammo.btDefaultMotionState(transform)
    const localInertia = new Ammo.btVector3(0, 0, 0)
    geometry.calculateLocalInertia(mass, localInertia)
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, geometry, localInertia);
    const floor = new Ammo.btRigidBody(rbInfo);
    floor.setFriction(friction);
    this.physicsEngine.addRigidBody(floor)
  }

  initPhysicVehicule() {
    this.actuators = {
      engineForce: 0,
      breakingForce: 0,
      steeringForce: 0
    }

    this.mecanic = {
      direction: 0,
    }

    const geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5))
    const transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(0, 2, 0))
    transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1))
    const motionState = new Ammo.btDefaultMotionState(transform)
    const localInertia = new Ammo.btVector3(0, 0, 0)
    geometry.calculateLocalInertia(massVehicle, localInertia)
    const chassisSimulation = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, geometry, localInertia))
    chassisSimulation.setActivationState(DISABLE_DEACTIVATION)
    this.physicsEngine.addRigidBody(chassisSimulation)

    this.tuning = new Ammo.btVehicleTuning()
    const rayCaster = new Ammo.btDefaultVehicleRaycaster(this.physicsEngine)
    this.vehicleSimulation = new Ammo.btRaycastVehicle(this.tuning, chassisSimulation, rayCaster)
    this.vehicleSimulation.setCoordinateSystem(0, 1, 2)

    this.physicsEngine.addAction(this.vehicleSimulation);
  }

  initPhysicWheels() {
    const createWheel = (isFront, pos, radius) => {
      const wheelInfo = this.vehicleSimulation.addWheel(pos, wheelDirectionCS0, wheelAxleCS, suspensionRestLength, radius, this.tuning, isFront)
      wheelInfo.set_m_suspensionStiffness(suspensionStiffness)
      wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping)
      wheelInfo.set_m_wheelsDampingCompression(suspensionCompression)
      wheelInfo.set_m_frictionSlip(friction)
      wheelInfo.set_m_rollInfluence(rollInfluence)
    }
    createWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront)
    createWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront)
    createWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack)
    createWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack)
  }

  reset() {
    const position = this.sensors.pointStarting.position
    const quaternion = this.sensors.pointStarting.quaternion

    this.actuators.engineForce = 0
    this.actuators.steeringForce = 0
    this.actuators.breakingForce = 0
    this.mecanic.direction = 0

    this.sensors.distance = 0
    this.sensors.lifetime = 0
    this.sensors.position.copy(position)
    this.sensors.speed = 0
    this.sensors.yawVelocity = 0
    this.sensors.yawVelocitySign = 0
    this.sensors.yawCounter = 0
    this.sensors.yawVelocitySignPrevious = 0
    this.sensors.yawFrequency = 0.5
    this.sensors.yawAmount = 0
    this.sensors.collision = false

    const transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z + 1))
    transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w))

    const chassis = this.vehicleSimulation.getRigidBody()
    chassis.setWorldTransform(transform)
    chassis.setLinearVelocity(new Ammo.btVector3(0, 0, 0))
    chassis.setAngularVelocity(new Ammo.btVector3(0, 0, 0))

    this.vehicleSimulation.applyEngineForce(this.actuators.engineForce, BACK_LEFT)
    this.vehicleSimulation.applyEngineForce(this.actuators.engineForce, BACK_RIGHT)
    this.vehicleSimulation.setBrake(this.actuators.breakingForce / 2, FRONT_LEFT)
    this.vehicleSimulation.setBrake(this.actuators.breakingForce / 2, FRONT_RIGHT)
    this.vehicleSimulation.setBrake(this.actuators.breakingForce, BACK_LEFT)
    this.vehicleSimulation.setBrake(this.actuators.breakingForce, BACK_RIGHT)
    this.vehicleSimulation.setSteeringValue(this.actuators.direction, FRONT_LEFT)
    this.vehicleSimulation.setSteeringValue(this.actuators.direction, FRONT_RIGHT)
  }

  updatePhysic(dt) {

    if (this.sensors.position.y < 1.2) { // the controller only activates if the car is in contact with the road
      this.controller.attempt(this.sensors, this.actuators, dt)
      if (this.id === 0) { // display neural network for first instance only
        this.controller.displayData(this.sensors)
      }
    }

    this.mecanic.direction += dt * this.actuators.steeringForce

    const angularDeviation = 0 - this.mecanic.direction
    this.mecanic.direction += angularDeviation * realignmentFactor * dt * this.sensors.speed * this.sensors.speed

    this.actuators.engineForce = Math.max(0, this.actuators.engineForce)
    this.actuators.engineForce = Math.min(maxEngineForce, this.actuators.engineForce)
    this.mecanic.direction = Math.min(steeringClamp, this.mecanic.direction)
    this.mecanic.direction = Math.max(-steeringClamp, this.mecanic.direction)
    this.actuators.breakingForce = Math.min(maxBreakingForce, this.actuators.breakingForce)

    this.vehicleSimulation.applyEngineForce(this.actuators.engineForce, BACK_LEFT)
    this.vehicleSimulation.applyEngineForce(this.actuators.engineForce, BACK_RIGHT)
    this.vehicleSimulation.setBrake(this.actuators.breakingForce / 2, FRONT_LEFT)
    this.vehicleSimulation.setBrake(this.actuators.breakingForce / 2, FRONT_RIGHT)
    this.vehicleSimulation.setBrake(this.actuators.breakingForce, BACK_LEFT)
    this.vehicleSimulation.setBrake(this.actuators.breakingForce, BACK_RIGHT)
    this.vehicleSimulation.setSteeringValue(this.mecanic.direction, FRONT_LEFT)
    this.vehicleSimulation.setSteeringValue(this.mecanic.direction, FRONT_RIGHT)

    this.physicsEngine.stepSimulation(dt, 10)
  }

  updateGraphic() {
    let tm, p, q, i
    let n = this.vehicleSimulation.getNumWheels()
    for (i = 0; i < n; i++) {
      this.vehicleSimulation.updateWheelTransform(i, true)
      tm = this.vehicleSimulation.getWheelTransformWS(i)
      p = tm.getOrigin()
      q = tm.getRotation()
      this.root3D.children[i + 1].position.set(p.x(), p.y(), p.z())
      this.root3D.children[i + 1].quaternion.set(q.x(), q.y(), q.z(), q.w())
    }

    tm = this.vehicleSimulation.getRigidBody().getWorldTransform()
    p = tm.getOrigin()
    q = tm.getRotation()
    this.root3D.children[0].position.set(p.x(), p.y(), p.z())
    this.root3D.children[0].quaternion.set(q.x(), q.y(), q.z(), q.w())
  }

  updateSensors(dt, circuit) {
    const ss = this.sensors
    const chassis = this.vehicleSimulation.getRigidBody()
    const velocityVector = chassis.getLinearVelocity()
    const position = chassis.getWorldTransform().getOrigin()
    const angularVelocity = chassis.getAngularVelocity()
    const velocity = new THREE.Vector2(velocityVector.x(), velocityVector.z())
    ss.speed = velocity.length()
    ss.distance += ss.speed * dt
    ss.lifetime += dt
    ss.position.set(position.x(), position.y(), position.z())
    ss.yawVelocity = angularVelocity.y()
    ss.yawVelocitySign = Math.sign(ss.yawVelocity)
    ss.yawAmount += Math.abs(ss.yawVelocity) * dt
    ss.yawCounter += ss.yawVelocitySign !== ss.yawVelocitySignPrevious ? 1 : 0
    ss.yawVelocitySignPrevious = ss.yawVelocitySign
    ss.yawFrequency = ss.yawCounter / ss.lifetime
    ss.collision = circuit.getCollision(ss.position.x, ss.position.z)
  }

  checking(duration) { // inefficient or off-track cars must be reset
    const ss = this.sensors
    if (this.controller.evaluation) {
      if (ss.lifetime > 7 && ss.distance / ss.lifetime < minSpeedAverage) {
        this.controller.evaluation(this.sensors, duration)
        this.reset()
      } else if (ss.lifetime > 7 && ss.yawFrequency > maxYawFrequency) { // too much instability
        this.reset()
        this.controller.evaluation(this.sensors, duration)
      } else if (ss.collision) {
        this.controller.evaluation(this.sensors, duration)
        this.reset()
      }
    } else {
      if (ss.collision) {
        this.reset()
      }
    }
  }

  static async loadAssets() {
    texture = await loaderTexture('/tesla.png')
    texture.flipY = false;
    const meshes = await loaderGLTF('./cybertruck.glb')
    const meshChassis = meshes.getObjectByName('chassis')
    const meshWheelL = meshes.getObjectByName('wheel1')
    const meshWheelR = meshes.getObjectByName('wheel2')
    geometryChassis = meshChassis.geometry
    geometryWheelL = meshWheelL.geometry
    geometryWheelR = meshWheelR.geometry
  }
}
