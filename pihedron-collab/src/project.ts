import {makeProject} from '@motion-canvas/core';


import './global.css'

import distortion0 from './scenes/distortion?scene';
import intro from './scenes/intro?scene';

export default makeProject({
  scenes: [intro],
  experimentalFeatures: true,
});
 