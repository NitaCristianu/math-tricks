import { makeScene2D } from "@motion-canvas/2d";
import Scene3D from "../libs/Thrash/Scene";
import Lights from "../libs/Thrash/utils/Lights";
import EnvMap from "../libs/Thrash/utils/EnvMap";
import Camera from "../libs/Thrash/Camera";
import { Vector3 } from "three";
import Model from "../libs/Thrash/objects/Model";
import {
  all,
  createRef,
  easeInOutQuint,
  easeOutQuint,
  waitFor,
  waitUntil,
} from "@motion-canvas/core";
import InstancedModelGroup from "../libs/Thrash/objects/InstancedMeshGroup";

export default makeScene2D(function* (view) {
  const camera = createRef<Camera>();
  const scene = (
    <Scene3D background={"#b8b8b8"}>
      <Camera ref={camera} localPosition={new Vector3(0.2, 5, 16)} zoom={1} />
      <Lights
        keyLight={{
          color: 0xaad8ff, // icy blue
          intensity: 2.2,
          position: new Vector3(5, 9, 4),
          castShadow: true,
        }}
        rimLight={{
          color: 0x6699ff, // cooler rim blue
          intensity: 2.8,
          position: new Vector3(-7, 6, -6),
          castShadow: false,
        }}
        hemiLight={{
          color: 0x7799cc, // sky tint
          intensity: 0.4,
        }}
        ambientLight={{
          color: 0x1a1a1f, // very dark blue-gray
          intensity: 0.2,
        }}
        enableBloom={true}
        bloom={{
          strength: 0.3,
          radius: 0.2,
          threshold: 0.95,
        }}
        enableSSAO={true}
        enableFog={true}
        fog={{
          color: 0x050c12, // dark teal-black
          density: 0.08,
        }}
      />
      <EnvMap url="/textures/autumn_field_puresky_4k.hdr" />
      // Base Scene
      <Model src="/models/lights-scene.glb" />
      <InstancedModelGroup
        src="/models/lightbulb.glb"
        amount={1000}
        distance={2}
        specialIndices={[]} // indices that would be modified in the future
        localPosition={new Vector3(0, 7, 25)}
      />
    </Scene3D>
  ) as Scene3D;
  scene.init();
  view.add(scene);

  yield* waitUntil("start"); 
  yield* all(camera().lookTo(new Vector3(0.2, 2, -1), 0));
  yield* waitUntil("grass");
  yield* all(
    camera().moveAt(new Vector3(0.2, 8, 30), 0.5, easeOutQuint),
    camera().lookTo(new Vector3(0.2, 2, 13), 0.5)
    //     camera().zoomOut(1.2, 1)
  );
  yield* waitUntil("hallway");
  yield* all(camera().moveAt(new Vector3(2, 7, 830), 8, easeInOutQuint));
  yield* waitFor(1);

  yield* waitUntil("next");
});
