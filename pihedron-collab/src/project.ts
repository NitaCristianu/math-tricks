import { makeProject } from "@motion-canvas/core";

import "./global.css";

import voice from "./voice/tricks.wav";
import intro from "./scenes/intro?scene";
import explodingLights0 from "./scenes/exploding-lights-0?scene";
import explodingLights1 from "./scenes/exploding-lights-1?scene";
import exams from "./scenes/exams?scene";
import distortion0 from "./scenes/distortion?scene";
import tripletrouble from "./scenes/tripletrouble?scene";
import geometryScene from "./scenes/geometry-scene?scene";
import captured from "./scenes/captured?scene";
import captured1 from "./scenes/captured1?scene";
import captured2 from "./scenes/captured2?scene";

export default makeProject({
  scenes: [distortion0,geometryScene],
  experimentalFeatures: true,
  audio: voice,
});
