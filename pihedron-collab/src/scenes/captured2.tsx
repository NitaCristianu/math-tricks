import { blur, Icon, Layout, makeScene2D, Rect } from "@motion-canvas/2d";
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
  const strippedCircle = createRef<Model>();
  const emptycircle = createRef<Model>();

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
        src="models/strippedCircle.glb"
        localScale={new Vector3(1, 1, 1).multiplyScalar(40)}
        ref={strippedCircle}
      />
      <Model
        src="models/circle.glb"
        localScale={new Vector3(1, 1, 1).multiplyScalar(40)}
        ref={emptycircle}
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

  yield* camera().lookTo(POSITION_BUFFER.looksAtPrionersDirectly.lookAt, 0);
  yield* camera().moveAt(POSITION_BUFFER.looksAtPrionersDirectly.position, 0);
  yield* waitUntil("start");

  const prisoner_data = createRef<Layout>();
  const bgr = createRef<Rect>();
  view.add(<Rect
    size={'100%'}
    fill={'black'}
    opacity={0}
    ref={bgr}
  />)
  
  view.add(
    <Layout
      ref={prisoner_data}
      layout
      direction="column"
      gap={40}
      alignItems="start"
      shadowBlur={20}
      shadowColor={"#0005"}
    />
  );
  prisoner_data().save();

  const aRow = (
    <Layout layout direction="row" gap={20} alignItems="center">
      <Icon
        icon="lucide:grid-2x2"
        size={50}
        color="#fde499"
        shadowColor="#fde49966"
        shadowBlur={20}
      />
      <PTxt text="Let A be the pattern prisoner" fontSize={40} opacity={0} />
    </Layout>
  );

  const bRow = (
    <Layout layout direction="row" gap={20} alignItems="center">
      <Icon
        icon="lucide:triangle"
        size={50}
        color="#fde499"
        shadowColor="#fde49966"
        shadowBlur={20}
      />
      <PTxt text="Let B be the shape prisoner" fontSize={48} opacity={0} />
    </Layout>
  );

  const cRow = (
    <Layout layout direction="row" gap={20} alignItems="center">
      <Icon
        icon="lucide:droplet"
        size={50}
        color="#fde499"
        shadowColor="#fde49966"
        shadowBlur={20}
      />
      <PTxt text="Let C be the colour prisoner" fontSize={56} opacity={0} />
    </Layout>
  );
  const dislikeIconA = (
    <Icon
      icon="lucide:thumbs-down"
      size={0}
      color="#ff5e5e"
      shadowColor="#ff5e5e99"
      shadowBlur={24}
      opacity={0}
    />
  ) as Icon;
  aRow.add(dislikeIconA);
  const dislikeIconB = (
    <Icon
      icon="lucide:thumbs-down"
      size={0}
      color="#ff8a8a"
      shadowColor="#ff8a8a66"
      shadowBlur={20}
      opacity={0}
    />
  ) as Icon;

  const dislikeIconC = (
    <Icon
      icon="lucide:thumbs-down"
      size={0}
      color="#ff8a8a"
      shadowColor="#ff8a8a66"
      shadowBlur={20}
      opacity={0}
    />
  ) as Icon;
  aRow.add(dislikeIconA);
  bRow.add(dislikeIconB);
  cRow.add(dislikeIconC);

  prisoner_data().add(
    <>
      {aRow}
      {bRow}
      {cRow}
    </>
  );

  const texts = [
    aRow.children()[1] as PTxt,
    bRow.children()[1] as PTxt,
    cRow.children()[1] as PTxt,
  ];

  yield* sequence(
    0.3,
    ...texts.map((t) =>
      all(t.opacity(1, 0.6, easeOutCubic), t.fontSize(40, 0.6, easeOutCubic))
    )
  );
  yield* waitUntil("ideal");
  yield* all(
    camera().lookTo(POSITION_BUFFER.looksAtBoxes.lookAt, 3),
    camera().moveAt(POSITION_BUFFER.looksAtBoxes.position, 2),
    prisoner_data().bottomRight([-260, 460], 2)
  );
  yield* strippedCircle().moveRight(0.25, 1);
  yield* waitUntil("remove stripped");
  yield* all(
    dislikeIconA.opacity(1, 0.5, easeOutBack),
    dislikeIconA.size(38, 0.5, easeOutBack)
  );
  yield* all(
    aRow.opacity(0, 0.5, easeInCubic),
    strippedCircle().moveBack(4, 1)
  );

  yield* waitUntil("no");
  yield* sequence(
    2,
    all(
      dislikeIconB.opacity(1, 0.5, easeOutBack),
      dislikeIconB.size(38, 0.5, easeOutBack)
    ),
    all(
      dislikeIconC.opacity(1, 0.5, easeOutBack),
      dislikeIconC.size(38, 0.5, easeOutBack)
    )
  );
  yield* all(
   emptycircle().moveBack(4, 1),
   camera().lookTo(camera().lookAt().clone().add(new Vector3(0,0,-.8))),
   camera().zoomIn(1.6),
  );

  yield* waitUntil("reverse");
  yield* all(
    prisoner_data().position(0,1),
    aRow.opacity(1,1),
    dislikeIconA.size(0,0),
    dislikeIconB.size(0,1),
    dislikeIconC.size(0,1),
    scene.filters([blur(20)], 1),
     bgr().opacity(.5,.5)
  );

  const generator = useRandom(1);
  const icons = prisoner_data().children();
  prisoner_data().layout(false);
  yield* all(...icons.map((icon, i)=>icon.y(-100 + i * 100, 1, easeOutCubic)))
  yield* loop(3, () =>
    run(function* () {
      const prisoner0 = generator.nextInt(0, prisoners.length);
      var prisoner1: number = prisoner0;
      while (prisoner0 == prisoner1)
        prisoner1 = generator.nextInt(0, prisoners.length);
      const firstpos = icons[prisoner0].position();
      const secondpos = icons[prisoner1].position();
      yield* all(
        icons[prisoner0].position(secondpos, 0.7),
        icons[prisoner1].position(firstpos, 0.7)
      );
    })
  );

  yield* waitUntil("end");
});
