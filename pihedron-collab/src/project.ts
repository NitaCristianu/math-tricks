import { makeProject } from "@motion-canvas/core";

import "./global.css";

import voice from "./voice/tricks.wav";
import intro from "./scenes/intro?scene";
import chapters from "./scenes/chapters?scene";
import discretemath from "./scenes/discretemath?scene";
import explodingLights0 from "./scenes/exploding-lights-0?scene";
import explodingLights1 from "./scenes/exploding-lights-1?scene";
import explodingLigtsExtra from "./scenes/exploding-ligts-extra?scene";
import exams from "./scenes/exams?scene";
import algebra from "./scenes/algebra?scene";
import distortion0 from "./scenes/distortion?scene";
import newdistortion from "./scenes/newdistortion?scene";
import tripletrouble from "./scenes/tripletrouble?scene";
import geometryScene from "./scenes/geometry-scene?scene";
import captured from "./scenes/captured?scene";
import captured1 from "./scenes/captured1?scene";
import captured2 from "./scenes/captured2?scene";

export default makeProject({
  scenes: [newdistortion],
  experimentalFeatures: true,
  audio: voice,
});
