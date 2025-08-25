import { makeScene2D, Rect, Txt } from "@motion-canvas/2d";
import Scene3D from "../libs/Thrash/Scene";
import Lights from "../libs/Thrash/components/Lights";
import EnvMap from "../libs/Thrash/utils/EnvMap";
import Camera from "../libs/Thrash/Camera";
import {
  Color,
  Euler,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  Vector2,
  Vector3,
} from "three";
import Model from "../libs/Thrash/objects/Model";
import {
  all,
  chain,
  createRef,
  delay,
  easeInOutQuint,
  easeOutQuint,
  range,
  Reference,
  sequence,
  tween,
  useLogger,
  waitFor,
  waitUntil,
} from "@motion-canvas/core";
import InstancedModelGroup from "../libs/Thrash/objects/InstancedMeshGroup";
import { Label3D } from "../libs/Thrash/components/Label3D";
import { Glass } from "../components/gen/Glass";
import { PTxt } from "../components/gen/Ptxt";

const specialindexes = getMultiples();

function* colorPulse(bulbs: Reference<InstancedModelGroup>) {
  yield* all( // sequence with wait of 0.2
    ...bulbs().specialMeshes.map((mesh) => {
      const tagraw = mesh.userData.__tag;
      const tag = specialindexes.findIndex((n) => n == tagraw);
      // Target color by tag
      const targetColor =
        tag % 2 === 0
          ? new Color("blue") // rgba(15, 147, 255)
          : tag % 2 === 1
          ? new Color("red") // rgba(235, 81, 81)
          : null;

      if (!targetColor) return all();

      // Get the first child mesh to sample the current color
      const firstMesh = mesh.getObjectByProperty("type", "Mesh") as Mesh;
      if (!firstMesh || !(firstMesh.material instanceof MeshStandardMaterial))
        return all();

      const startColor = firstMesh.material.color.clone();

      return tween(0.5, (t) => {
        t = easeInOutQuint(t);
        const r = startColor.r + (targetColor.r - startColor.r) * t;
        const g = startColor.g + (targetColor.g - startColor.g) * t;
        const b = startColor.b + (targetColor.b - startColor.b) * t;

        mesh.traverse((child) => {
          if (
            child instanceof Mesh &&
            child.material instanceof MeshStandardMaterial
          ) {
            const fade = child.material.opacity ?? 1;
            child.material.transparent = true;
            child.material.opacity = fade + (1 - fade) * t;

            const animatedColor = new Color(r, g, b);
            child.material.color.copy(animatedColor);
            child.material.emissive.copy(animatedColor);
            child.material.emissiveIntensity = t * 5;
            child.scale.copy(
              child.scale.clone().multiplyScalar(0.95 + 0.1 * t)
            );
          }
        });
      });
    })
  );
}

export function getMultiples(downscale = 0.3) {
  const collection: number[] = [];
  var a = Math.floor(42 * downscale); // 42
  var b = Math.floor(69 * downscale); // simulate 69
  while (a < 1000 && b < 1000) {
    collection.push(a);
    collection.push(b);
    b += Math.floor(69 * downscale);
    a += Math.floor(42 * downscale);
  }
  return collection;
}

export default makeScene2D(function* (view) {
  const camera = createRef<Camera>();
  const button = {
    frames: createRef<InstancedModelGroup>(),
    actions: createRef<InstancedModelGroup>(),
  };
  const bulbs = createRef<InstancedModelGroup>();

  const scene = (
    <Scene3D
      fogNear={23}
      fogFar={700}
      fogColor="#50505069"
      background={"#b8b8b8"}
    >
      <Camera ref={camera} localPosition={new Vector3(0.2, 6, 16)} zoom={1.2} />
      <EnvMap url="/textures/autumn_field_puresky_4k.hdr" />
      // Base Scene
      <Lights
        keyLight={{
          color: 0xe0f7ff, // soft pastel blue
          intensity: 2.8,
          position: new Vector3(6, 10, 5),
          castShadow: true,
        }}
        rimLight={{
          color: 0xffeedd, // soft peach glow
          intensity: 13.5,
          position: new Vector3(-8, 7, 5),
          castShadow: true,
        }}
        hemiLight={{
          color: 0xcce6ff, // gentle sky blue
          intensity: 0.7,
        }}
        ambientLight={{
          color: 0x9999ff, // bright neutral
          intensity: 0.6,
        }}
        enableBloom={false}
        bloom={{
          strength: 1.1,
          radius: 0.05,
          threshold: 1.15,
        }}
      />
      <Model src="/models/lights-scene.glb" />
      <InstancedModelGroup
        src="/models/lightbulb.glb"
        amount={1000}
        ref={bulbs}
        positionFn={(i) => new Vector3(0, 0, 4 * i)}
        fixedRotation={new Euler(Math.PI / 2, 0, 0)}
        fixedScale={new Vector3(10, 10, 10)}
        localPosition={new Vector3(0, 10, 25)}
        specialIndices={specialindexes}
        applyModification={(g, material, i) => {
          if (i === 1) {
            material.transparent = true;
            material.opacity = 0.4;
          }
        }}
      />
      <InstancedModelGroup
        src="/models/switch-frame.glb"
        ref={button.frames}
        amount={1000}
        positionFn={(i) => new Vector3(1, 0, 4 * i)}
        fixedScale={new Vector3(1, 0.3, 1).multiplyScalar(0.25)}
        localPosition={new Vector3(0, 10, 25)} // + 0.6
        fixedRotation={new Euler(0, 0, Math.PI)}
      />
      <InstancedModelGroup
        src="/models/switch-action.glb"
        ref={button.actions}
        amount={1000}
        positionFn={(i) => new Vector3(1, 0, 4 * i)}
        fixedScale={new Vector3(1, 0.5, 1).multiplyScalar(0.2)}
        fixedRotation={new Euler(0, 0, Math.PI)}
        localPosition={new Vector3(0, 9.85, 25)} // + 0.6
      />
    </Scene3D>
  ) as Scene3D;
  scene.init();
  view.add(scene);

  yield* waitUntil("start");
  yield camera().zoomOut(0.8, 3);
  yield* all(camera().lookTo(new Vector3(0.2, 4, -1), 0));
  yield* waitUntil("grass");
  yield* all(
    camera().moveAt(new Vector3(0.2, 8, 30), 0.5, easeOutQuint),
    camera().lookTo(new Vector3(0.2, 2, 13), 0.5)
    //     camera().zoomOut(1.2, 1)
  );
  yield* waitUntil("hallway");
  yield* all(
    camera().moveAt(new Vector3(5, 8, 815), 6, easeInOutQuint),
    camera().lookTo(new Vector3(0, 10, 770), 6, easeInOutQuint)
  );

  const rect = (
    <Rect
      width={250}
      height={110}
      bottomRight={() => [1920 / 2 - 80, 1080 / 2 - 80]}
      // lightness={-0.2}
      scale={0}
    >
      <PTxt
        zIndex={1}
        fill={"rgba(195, 228, 255, 1)"}
        y={-20}
        fontSize={24}
        text={"Bob - blue"}
        shadowBlur={10}
        fontWeight={300}
        shadowColor={"rgba(12, 10, 134, 1)"}
      />
      <PTxt
        zIndex={1}
        fill={"rgba(248, 199, 205, 1)"}
        y={20}
        fontSize={24}
        text={"Alice - red"}
        shadowBlur={10}
        shadowColor={"rgba(109, 30, 10, 1)"}
        fontWeight={300}
      />
      <PTxt
        zIndex={1}
        fill={"#17193f"}
        y={70}
        textAlign={"center"}
        fontSize={20}
        text={"*The current scene is downscaled\n for learning purposes."}
        shadowBlur={10}
        shadowColor={"#17193f"}
        fontWeight={300}
      />
    </Rect>
  );
  view.add(rect);

  yield delay(
    0.4,
    all(
      // button.actions().moveAllDown(0.6, 1, easeOutQuint),
      // button.frames().moveAllDown(0.6, 1, easeOutQuint)
    )
  );

  yield* waitFor(2);
  yield* all(
    rect.scale(1.3, 1),
    button.actions().moveSelectedDown(specialindexes, 0.5, 1, easeOutQuint),
    colorPulse(bulbs)
  );

  yield* waitUntil("inspect");
    yield* colorPulse(bulbs);
    yield* waitFor(0.3);
  // look at light
  yield* all(
    camera().moveAt(new Vector3(6, 5, 794), 1),
    camera().lookTo(new Vector3(0, 9.5, 792.7), 1)
  );
  yield* waitUntil("trigger");
  yield* chain(
    button.actions().moveAllDown(-0.05, 0.5, easeOutQuint),
    button.actions().moveAllDown(0.1, 0.5, easeInOutQuint)
  );

  yield* waitUntil("next");
});
