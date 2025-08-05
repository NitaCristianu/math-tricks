import { Icon, Layout, makeScene2D, Rect } from "@motion-canvas/2d";
import {
  all,
  chain,
  createRef,
  createRefArray,
  createSignal,
  easeInCubic,
  easeInOutBack,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  loop,
  run,
  sequence,
  useRandom,
  waitFor,
  waitUntil,
} from "@motion-canvas/core";
import Scene3D from "../libs/Thrash/Scene";
import Camera from "../libs/Thrash/Camera";
import EnvMap from "../libs/Thrash/utils/EnvMap";
import DirectionalLightObject from "../libs/Thrash/utils/lights/directional-light";
import HemisphereLightObject from "../libs/Thrash/utils/lights/hemisphere-light";
import { Vector2, Vector3 } from "three";
import AmbientLightObject from "../libs/Thrash/utils/lights/ambient-light";
import PointLightObject from "../libs/Thrash/utils/lights/point-light";
import Model from "../libs/Thrash/objects/Model";
import { Label3D } from "../libs/Thrash/components/Label3D";
import { Glass } from "../components/gen/Glass";
import { PTxt } from "../components/gen/Ptxt";

export default makeScene2D(function* (view) {
  const lights = createRefArray<PointLightObject>();
  const camera = createRef<Camera>();
  const fogFar = createSignal<number>(10);
  const keybox = createRef<Model>();
  const prisoners = createRefArray<Model>();
  const scene = (
    <Scene3D
      fogNear={5}
      fogFar={fogFar}
      fogColor="rgba(0, 0, 0, 1)"
      background={"#000000ff"}
    >
      <Camera
        ref={camera}
        localPosition={new Vector3(1, 2, -5)}
        lookAt={new Vector3(0, 2, 10)}
        zoom={0.6}
      />
      <EnvMap url="/textures/autumn_field_puresky_4k.hdr" />

      {/* ✨ Soft key light – neutral daylight */}
      <DirectionalLightObject
        localPosition={new Vector3(0, 2, 0)}
        lookAt={new Vector3(0, 3.5, 0)}
        intensity={2.8}
        color={"#ffffff"} // clean white, soft
        castShadow={true}
        ref={lights}
      />

      {/* ✨ Magical rim light – purple haze */}
      <DirectionalLightObject
        localPosition={new Vector3(-8, 0, 5)}
        lookAt={new Vector3(0, -1.5, 0)}
        intensity={21.5}
        color={"rgba(0, 0, 0, 0.45)"} // purple glow
        castShadow={true}
        ref={lights}
      />

      {/* ✨ Dreamy hemisphere ambient fill */}
      <HemisphereLightObject
        localPosition={new Vector3(0, 3, 0)}
        skyColor={0xe4f1ff} // dreamy blue-white sky
        groundColor={0x2c2c2c}
        intensity={0.65}
        ref={lights}
      />

      {/* ✨ Soft lavender ambient */}
      <AmbientLightObject
        ref={lights}
        localPosition={new Vector3(0, -1, 0)}
        color={"#000000ff"} // lavender
        intensity={0.9}
      />

      {/* ✨ Artistic warmth spot – color pop */}
      <PointLightObject
        localPosition={new Vector3(2, 0, 0)}
        intensity={5}
        color={"rgba(250, 197, 127, 1)"} // soft orange
        decay={1}
        distance={8}
        ref={lights}
      />

      <PointLightObject
        localPosition={new Vector3(-5, 2, 4)}
        intensity={5}
        color={"rgba(250, 197, 127, 1)"} // soft orange
        decay={1}
        distance={2}
        ref={lights}
      />

      <PointLightObject
        localPosition={new Vector3(-5, 1, 0.5)}
        intensity={5}
        color={"rgba(250, 197, 127, 1)"} // soft orange
        decay={1}
        distance={3}
        ref={lights}
      />

      <DirectionalLightObject
        localPosition={new Vector3(4, 1, 0.5)}
        lookAt={new Vector3(-2, -1.5, 0.5)}
        intensity={3.5}
        color={"rgba(126, 14, 14, 1)"} // purple glow
        castShadow={true}
        ref={lights}
      />

      {/* Ceiling light – front center */}
      <PointLightObject
        localPosition={new Vector3(0, 3, -3)}
        intensity={2}
        color={"#ffffff"}
        decay={2}
        distance={8}
        ref={lights}
      />

      {/* Ceiling light – midroom */}
      <PointLightObject
        localPosition={new Vector3(0, 3, -2)}
        intensity={2.2}
        color={"#fefdf9"} // off-white warm
        decay={2}
        distance={8}
        ref={lights}
      />

      {/* Ceiling light – back right pop */}
      <PointLightObject
        localPosition={new Vector3(2.5, 3, 0)}
        intensity={1.8}
        color={"rgba(255, 105, 105, 1)"} // pink-red warmth
        decay={2}
        distance={10}
        ref={lights}
      />

      {/* Ceiling light – front left fill */}
      <PointLightObject
        localPosition={new Vector3(-2.5, 3.9, -2)}
        intensity={2.2}
        color={"#ffffff"}
        decay={2}
        distance={6}
        ref={lights}
      />

      <Model
        src="models/captured.glb"
        localScale={new Vector3(1, 1, 1).multiplyScalar(40)}
      />
      <Model
        src="models/specialbox.glb"
        ref={keybox}
        localScale={new Vector3(1, 1, 1).multiplyScalar(40)}
      />
      <Model
        src="models/prisoner1.glb"
        localScale={new Vector3(1, 1, 1).multiplyScalar(40)}
        ref={prisoners}
      />
      <Model
        src="models/prisoner2.glb"
        localScale={new Vector3(1, 1, 1).multiplyScalar(40)}
        ref={prisoners}
      />
      <Model
        src="models/prisoner3.glb"
        localScale={new Vector3(1, 1, 1).multiplyScalar(40)}
        ref={prisoners}
      />
      <Model
        src="models/strippedCircle.glb"
        localScale={new Vector3(1, 1, 1).multiplyScalar(40)}
      />
      <Model
        src="models/circle.glb"
        localScale={new Vector3(1, 1, 1).multiplyScalar(40)}
      />
      
    </Scene3D>
  ) as Scene3D;
  scene.init();
  view.add(scene);

  const POSITION_BUFFER = {
    looksAtCell: {
      position: new Vector3(1, 1.5, -5),
      lookAt: new Vector3(0, 1.5, 10),
    },
    hallwayView: {
      position: new Vector3(-10, 1.5, -3),
      lookAt: new Vector3(10, 1.5, -3),
    },
    looksAtBoxes: {
      position: new Vector3(1, 1.5, 3),
      lookAt: new Vector3(-10, -0.5, 2.5),
    },
    looksAtPrisoners: {
      position: new Vector3(1, 1.5, 3),
      lookAt: new Vector3(-3, 1.2, -1.5),
    },
    looksAtPrionersDirectly: {
      position: new Vector3(-2, 1.5, 5),
      lookAt: new Vector3(-2, 1.4, -1.5),
    },
    lookAtPrisoner1: {
      position: new Vector3(-3.3, 1.5, 3),
      lookAt: new Vector3(-3.3, 1.4, -1.5),
    },
    lookAtPrisoner2: {
      position: new Vector3(-2, 1.5, 3),
      lookAt: new Vector3(-2, 1.4, -1.5),
    },
  };

  yield* camera().lookTo(POSITION_BUFFER.hallwayView.lookAt, 0);
  yield* camera().moveAt(POSITION_BUFFER.hallwayView.position, 0);
  yield* waitUntil("start");

  yield* all(
    camera().lookTo(POSITION_BUFFER.looksAtCell.lookAt, 5),
    camera().moveAt(POSITION_BUFFER.looksAtCell.position, 3)
  );
  yield* waitFor(1);
  yield* all(
    camera().lookTo(POSITION_BUFFER.looksAtBoxes.lookAt, 5),
    camera().moveAt(POSITION_BUFFER.looksAtBoxes.position, 3)
  );

  yield* waitUntil("key");
  yield* all(keybox().moveUP(0.2, 0.5));
  yield* waitFor(1);
  yield* all(keybox().moveUP(-0.2, 0.5));
  yield* all(
    camera().lookTo(POSITION_BUFFER.looksAtPrisoners.lookAt, 1, easeOutCubic),
    camera().moveAt(POSITION_BUFFER.looksAtPrisoners.position, 1, easeOutCubic)
  );
  yield* waitUntil("whoknows");
  yield* all(
    camera().lookTo(POSITION_BUFFER.looksAtPrionersDirectly.lookAt, 3.5),
    camera().moveAt(POSITION_BUFFER.looksAtPrionersDirectly.position, 2)
  );
  yield* waitUntil("attributes");
  yield* sequence(
    0.2,
    ...prisoners.map((prisoner) =>
      chain(prisoner.moveUP(0.05, 0.5), prisoner.moveUP(-0.05, 0.5))
    )
  );
  yield* waitUntil("shape");
  const prisoner_icon = (
    <Glass
      position={() =>
        scene
          .projectToScreen(prisoners[0].localPosition())
          .sub(new Vector2(1350, 1200))
      }
      scale={0}
      size={100}
      radius={1000}
      borderModifier={-0.8}
    >
      <Icon
        zIndex={1}
        icon={"lucide:triangle"}
        size={60}
        color={"rgba(253, 228, 153, 1)"}
        shadowColor={"rgba(253, 228, 153, .4)"}
        shadowBlur={20}
      />
    </Glass>
  );
  view.add(prisoner_icon);

  yield* sequence(
    0.2,
    prisoners[0].scaleTo(new Vector3(40, 40, 40).addScalar(1), 1, easeOutBack),
    all(
      prisoner_icon.scale(1, 0.6, easeOutBack),
      prisoner_icon.opacity(1, 0.6, easeOutCubic)
    )
  );

  yield* waitUntil("color");
  const prisoner_icon2 = (
    <Glass
      position={() =>
        scene
          .projectToScreen(prisoners[1].localPosition())
          .sub(new Vector2(800, 1200))
      }
      size={100}
      radius={1000}
      scale={0}
      borderModifier={-0.8}
    >
      <Icon
        zIndex={2}
        icon={"lucide:droplet"}
        size={60}
        color={"rgba(253, 228, 153, 1)"}
        shadowColor={"rgba(253, 228, 153, .4)"}
        shadowBlur={20}
      />
    </Glass>
  );
  view.add(prisoner_icon2);

  yield* sequence(
    0.4,
    all(
      prisoner_icon.position([-250, -340], 1, easeInOutCubic),
      prisoner_icon.scale(2, 1, easeInOutCubic),
      prisoners[0].scaleTo(
        new Vector3(40, 40, 40).addScalar(-1),
        1,
        easeInOutCubic
      ),
      prisoners[1].scaleTo(new Vector3(40, 40, 40).addScalar(1), 1, easeOutBack)
    ),
    all(
      prisoner_icon2.scale(1, 0.6, easeOutBack),
      prisoner_icon2.opacity(1, 0.6, easeOutCubic)
    )
  );

  yield* waitUntil("pattern");
  const prisoner_icon3 = (
    <Glass
      position={() =>
        scene
          .projectToScreen(prisoners[2].localPosition())
          .sub(new Vector2(250, 1200))
      }
      scale={0}
      size={100}
      radius={1000}
      borderModifier={-0.8}
    >
      <Icon
        zIndex={1}
        icon={"lucide:grid-2x2"}
        size={60}
        color={"rgba(253, 228, 153, 1)"}
        shadowColor={"rgba(253, 228, 153, .4)"}
        shadowBlur={20}
      />
    </Glass>
  );
  view.add(prisoner_icon3);

  yield* sequence(
    0.4,
    all(
      prisoner_icon2.position([0, -340], 1, easeInOutCubic),
      prisoner_icon2.scale(2, 1, easeInOutCubic),
      prisoners[1].scaleTo(
        new Vector3(40, 40, 40).addScalar(-1),
        1,
        easeInOutCubic
      ),
      prisoners[2].scaleTo(new Vector3(40, 40, 40).addScalar(1), 1, easeOutBack)
    ),
    all(
      prisoner_icon3.scale(1, 0.6, easeOutBack),
      prisoner_icon3.opacity(1, 0.6, easeOutCubic)
    )
  );
  yield* waitFor(0.7);
  yield* all(
    prisoner_icon3.scale(2, 0.6),
    prisoner_icon3.position([250, -340], 0.6),
    prisoners[2].scaleTo(new Vector3(40, 40, 40).addScalar(-1), 1)
  );

  yield* waitUntil("secret"); // you don't know which attribute is what
  // shufle
  const generator = useRandom(1);
  const icons = [prisoner_icon, prisoner_icon2, prisoner_icon3];
  yield* loop(3, () =>
    run(function* () {
      const prisoner0 = generator.nextInt(0, prisoners.length);
      var prisoner1: number = prisoner0;
      while (prisoner0 == prisoner1)
        prisoner1 = generator.nextInt(0, prisoners.length);
      const firstpos = icons[prisoner0].position();
      const secondpos = icons[prisoner1].position();
      yield* all(
        icons[prisoner0].position(secondpos, 0.3),
        icons[prisoner1].position(firstpos, 0.3)
      );
    })
  );
  yield* waitUntil("interview");
  yield* all(
    ...icons.map((icon) =>
      icon.position(
        icon
          .position()
          .add([0, -500])
          .sub(icon.position().scale(1 / 5)),
        1
      )
    ),
    camera().lookTo(POSITION_BUFFER.lookAtPrisoner1.lookAt, 2),
    camera().moveAt(POSITION_BUFFER.lookAtPrisoner1.position, 1)
  );
  const subtitle = (
    <Layout
      layout
      y={300}
      direction={"column"}
      alignItems={"center"}
      shadowColor={"#fffa"}
    >
      <PTxt
        fontWeight={200}
        fontSize={40}
        fill={"rgba(228, 228, 228, 1)"}
        text={"."}
      />
      <PTxt
        fontWeight={200}
        fontSize={40}
        fill={"rgba(228, 228, 228, 1)"}
        text={"."}
      />
    </Layout>
  );
  view.add(subtitle);
  yield* chain(
    subtitle.childAs<PTxt>(0).text("You : Do you know which has the key?", 1),
    subtitle.childAs<PTxt>(1).text("Prisoner 1 : No.", 1)
  );
  yield* waitFor(0.5);
  yield* all(
    ...subtitle.childrenAs<PTxt>().map((child) => child.text(".", 0.5))
  );
  yield* all(
    camera().lookTo(POSITION_BUFFER.lookAtPrisoner2.lookAt, 1),
    camera().moveAt(POSITION_BUFFER.lookAtPrisoner2.position, 1)
  );
  yield* sequence(
    0.6,
    subtitle.childAs<PTxt>(0).text("You : Do you kn-", 1),
    subtitle.childAs<PTxt>(1).text("Prisoner 2 : Yes.", 1)
  );
  yield* all(subtitle.shadowBlur(40, 2), subtitle.scale(1.5, 1));
  yield* waitFor(1);
  yield* all(
    subtitle.shadowBlur(0, 2),
    subtitle.scale(1, 1)
  )
  yield* all(
    sequence(
      .95,
      subtitle
        .childAs<PTxt>(0)
        .text("You: Who wins between 100 unarmed men and a gorila?", 1),
      subtitle.childAs<PTxt>(1).text("Prisoner 2 : ...", 1),
    ),
  );

  yield* waitUntil("end");
});
