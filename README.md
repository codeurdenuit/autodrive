# Autodrive

Simulateur physique permettant de tester des stratégies de conduite autonome.
Le simulateur génère des véhicules équipés de capteurs. (caméra, vitesse, …)
Les véhicules spawnnent sur un circuit et sont supervisés par un Controller.
Les véhicules immobilisés, trop lents, ou hors circuit sont réinitialisés.
Créez des Controllers en respectant le pattern indiqué en exemple afin d'élaborer une IA de conduite autonome.

## Environnement 

- Browser

## Installation
```sh
$ npm install
```
## Démarrer
```sh
$ npm run dev
```

## Configuration de la simulation
Fichier index.js
```sh
  const instanceNumber = 4
  const simulator = new Simulator(instanceNumber)
  simulator.start(Controller)
```
