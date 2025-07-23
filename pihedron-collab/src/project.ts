import { makeProject } from "@motion-canvas/core";

import "./global.css";

import voice from "./voice/tricks.wav";

import distortion0 from "./scenes/distortion?scene";
import intro from "./scenes/intro?scene";
import explodingLights0 from "./scenes/exploding-lights-0?scene";
import explodingLights1 from "./scenes/exploding-lights-1?scene";

export default makeProject({
  scenes: [explodingLights1],
  experimentalFeatures: true,
  audio: voice,
});
