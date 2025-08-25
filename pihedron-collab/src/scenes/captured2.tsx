import {
  blur,
  Circle,
  Gradient,
  Icon,
  Img,
  Latex,
  Layout,
  Line,
  makeScene2D,
  Polygon,
  Ray,
  Rect,
  Shape,
} from "@motion-canvas/2d";
import {
  all,
  any,
  chain,
  createRef,
  createRefArray,
  createSignal,
  delay,
  easeInCubic,
  easeInOutBack,
  easeInOutCubic,
  easeInOutExpo,
  easeOutBack,
  easeOutCubic,
  easeOutExpo,
  loop,
  range,
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
import { Group, Vector2, Vector3 } from "three";
import AmbientLightObject from "../libs/Thrash/utils/lights/ambient-light";
import PointLightObject from "../libs/Thrash/utils/lights/point-light";
import Model from "../libs/Thrash/objects/Model";
import { Label3D } from "../libs/Thrash/components/Label3D";
import { Glass } from "../components/gen/Glass";
import { PTxt } from "../components/gen/Ptxt";

import Ximg from "../images/icons/x.png";
import Yimg from "../images/icons/y.png";
import Zimg from "../images/icons/z.png";

function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(remaining)) {
      result.push([current, ...perm]);
    }
  }
  return result;
}

export default makeScene2D(function* (view) {
  const lights = createRefArray<PointLightObject>();
  const camera = createRef<Camera>();
  const fogFar = createSignal<number>(10);
  const redsquare = createRef<Model>();
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
        ref={redsquare}
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
    lookAtPrisoner3: {
      position: new Vector3(-0.8, 1.5, 3),
      lookAt: new Vector3(-0.8, 1.4, -1.5),
    },
  };

  yield* camera().lookTo(POSITION_BUFFER.looksAtPrionersDirectly.lookAt, 0);
  yield* camera().moveAt(POSITION_BUFFER.looksAtPrionersDirectly.position, 0);
  yield* waitUntil("start");

  const prisoner_data = createRef<Layout>();
  const overlay = createRef<Rect>();
  view.add(<Rect size={"100%"} fill={"black"} opacity={0} ref={overlay} />);

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
      color="#ff8a8a"
      shadowColor="#ff8a8a66"
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
    camera().lookTo(camera().lookAt().clone().add(new Vector3(0, 0, -0.8))),
    camera().zoomIn(1.6)
  );

  yield* waitUntil("remove red square");
  yield* all(
    redsquare().moveBack(4, 1),
  );


  yield* waitUntil("lookat p");
  yield* all(
    camera().lookTo(POSITION_BUFFER.looksAtPrionersDirectly.lookAt, 4),
    camera().moveAt(POSITION_BUFFER.looksAtPrionersDirectly.position, 3),
    camera().zoomOut(1 / 1.6, 3)
  );
  yield* waitUntil("reverse");
  yield* all(
    prisoner_data().position(0, 1),
    aRow.opacity(1, 1),
    dislikeIconA.size(0, 0),
    dislikeIconB.size(0, 1),
    dislikeIconC.size(0, 1),
    scene.filters([blur(20)], 1),
    overlay().opacity(0.5, 0.5)
  );

  const generator = useRandom(1);
  const icons = prisoner_data().children();
  prisoner_data().layout(false);
  yield* all(
    ...icons.map((icon, i) => icon.y(-100 + i * 100, 1, easeOutCubic))
  );
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
  yield* waitUntil("goal");
  const goal_text = (
    <PTxt
      textAlign={"center"}
      text={"How will you question them?"}
      opacity={0}
    />
  ) as PTxt;
  view.add(goal_text);
  yield* redsquare().moveBack(-4, 0);
  yield* any(
    prisoner_data().opacity(0, 1),
    goal_text.opacity(1, 1),
    goal_text.scale(2, 8)
  );
  yield* waitUntil("key");
  const key = <Icon size={120} opacity={0} icon={"solar:key-linear"}></Icon>;
  view.add(key);
  yield* all(key.opacity(1, 0.3, easeOutCubic), key.y(-200, 1));
  yield key.rotation(20, 0.3, easeOutBack).back(0.3, easeOutBack);

  yield* waitUntil("strategy");
  yield* all(
    prisoner_data().opacity(1, 1, easeOutBack),
    goal_text.opacity(0, 0.5, easeInCubic),
    goal_text.scale(1, 1),
    key.opacity(0, 0.3, easeInCubic),
    key.y(200, 1),
    overlay().opacity(0, 0.7, easeInOutExpo)
  );
  const looks = [
    POSITION_BUFFER.lookAtPrisoner1,
    POSITION_BUFFER.lookAtPrisoner2,
    POSITION_BUFFER.lookAtPrisoner3,
  ];
  const dislikes = [
    dislikeIconA,
    dislikeIconB,
    dislikeIconC,
    dislikeIconA.clone({}),
    dislikeIconB.clone({}),
    dislikeIconC.clone({}),
    dislikeIconA.clone({}),
  ];
  const rows = [aRow, bRow, cRow];
  dislikes.forEach((dislike, i) => dislike.reparent(rows[i % rows.length]));

  yield* all(
    prisoner_data().y(350, 1),
    loop(7, (i) =>
      all(
        camera().lookTo(looks[i % looks.length].lookAt, 1),
        camera().moveAt(looks[i % looks.length].position, 1),
        delay(
          0.6,
          all(
            dislikes[i % dislikes.length].opacity(1, 0.5, easeOutCubic),
            dislikes[i % dislikes.length].size(40, 0.5, easeOutCubic)
          )
        )
      )
    )
  );
  yield* waitUntil("like");
  yield* all(
    dislikes[6].rotation(180, 0.7, easeInOutBack),
    dislikes[6].color("#9ff598ff", 1),
    dislikes[6].shadowColor("#9ff59866", 1)
  );
  yield* waitUntil("see");
  yield* strippedCircle().moveForward(4, 0);
  yield* emptycircle().moveForward(4, 0);
  yield* all(
    camera().lookTo(POSITION_BUFFER.looksAtBoxes.lookAt, 4),
    camera().moveAt(POSITION_BUFFER.looksAtBoxes.position, 3),
    ...dislikes.map((dislike) =>
      all(dislike.size(0, 1, easeInCubic), dislike.opacity(0, 1))
    )
  );
  yield* waitUntil("highlight C");
  yield* cRow.scale(1.2, 0.5, easeOutCubic).back(0.5);
  yield* waitFor(1);
  yield* all(
    strippedCircle().moveBack(0.25, 1),
    emptycircle().moveBack(0.25, 1)
  );
  yield* waitFor(1);
  yield* redsquare().moveUP(0.55, 1);
  yield* waitUntil("lookagain");
  yield* all(
    camera().lookTo(POSITION_BUFFER.looksAtPrionersDirectly.lookAt, 2.5),
    camera().moveAt(POSITION_BUFFER.looksAtPrionersDirectly.position, 2)
  );
  yield* waitUntil("situation");
  yield* run(function* () {
    const prisoner0 = 1;
    var prisoner1 = 2;
    const firstpos = icons[prisoner0].position();
    const secondpos = icons[prisoner1].position();
    yield* all(
      icons[prisoner0].position(secondpos, 0.7),
      icons[prisoner1].position(firstpos, 0.7)
    );
  });
  yield* waitUntil("worst");
  yield run(function* () {
    const prisoner0 = 0;
    var prisoner1 = 2;
    const firstpos = icons[prisoner0].position();
    const secondpos = icons[prisoner1].position();
    yield* all(
      icons[prisoner0].position(secondpos, 0.7),
      icons[prisoner1].position(firstpos, 0.7)
    );
  });
  yield* waitFor(0.5);
  yield* waitUntil("useless");
  yield* sequence(
    0.6,
    ...dislikes
      .filter((v, i) => i == 1 || i == 2 || i == 3)
      .map((dislike) =>
        all(
          dislike.size(40, 0.4, easeOutCubic),
          dislike.opacity(1, 0.4, easeOutCubic)
        )
      )
  );
  yield* all(
    ...dislikes
      .filter((v, i) => i == 1 || i == 2)
      .map((dislike) =>
        all(
          dislike.opacity(0.3, 1, easeOutCubic),
          all(cRow.opacity(0.5, 1), bRow.opacity(0.5, 1))
        )
      )
  );
  yield* waitUntil("dissapear");
  yield* sequence(
    0.1,
    ...dislikes
      .filter((v, i) => i == 1 || i == 2 || i == 3)
      .map((dislike) =>
        all(dislike.size(0, 1, easeInCubic), dislike.opacity(0, 1, easeInCubic))
      )
  );

  yield* waitUntil("b");
  yield* bRow.opacity(1, 1);
  yield* waitUntil("c");
  yield* cRow.opacity(1, 1);
  yield* waitFor(1.5);
  yield* strippedCircle().moveForward(-2.25, 0);
  yield* emptycircle().moveForward(-2.25, 0);
  yield* redsquare().moveDOWN(0.55, 0);

  yield* all(
    camera().lookTo(
      POSITION_BUFFER.looksAtBoxes.lookAt.add(new Vector3(0, 0, -0.8)),
      2.5
    ),
    camera().zoomIn(1.6, 2.5),
    camera().moveAt(POSITION_BUFFER.looksAtBoxes.position, 2)
  );

  yield* waitUntil("yes");
  yield* all(
    dislikes[dislikes.length - 1].size(40, 1),
    dislikes[dislikes.length - 1].opacity(1, 1)
  );
  yield* waitUntil("!");
  goal_text.fontSize(40);
  goal_text.text(
    "We have to pick the box with the highest\nlikelihood depending on the number of no’s."
  );
  yield* any(
    prisoner_data().opacity(0, 1),
    goal_text.opacity(1, 1),
    goal_text.scale(2, 8),
    overlay().opacity(0.5, 1)
  );
  dislikes[dislikes.length - 1].size(0);
  dislikes[dislikes.length - 1].opacity(0);
  yield* waitUntil("variables");
  yield* all(
    goal_text.opacity(0, 1),
    goal_text.scale(1, 1)
    // overlay().opacity(0,1),
  );

  const permLayout = createRef<Layout>();
  view.add(
    <Layout
      ref={permLayout}
      layout
      direction="column"
      gap={20}
      alignItems="center"
      y={0}
    />
  );
  const permTitle = createRef<PTxt>();
  view.add(
    <PTxt
      ref={permTitle}
      text="All Possible Question Orders"
      fontSize={64}
      fill="#fff"
      y={-380}
      opacity={0}
    />
  );
  yield chain(
    permTitle().opacity(1, 1, easeOutCubic),
    permTitle().scale(1.1, 0.5).back(0.5)
  );

  // 2. Prisoner Icons
  const prisonerIcons = [
    <Icon
      icon="lucide:grid-2x2"
      size={40}
      color="#fde499"
      shadowColor="#fde49966"
      shadowBlur={12}
    />,
    <Icon
      icon="lucide:triangle"
      size={40}
      color="#fde499"
      shadowColor="#fde49966"
      shadowBlur={12}
    />,
    <Icon
      icon="lucide:droplet"
      size={40}
      color="#fde499"
      shadowColor="#fde49966"
      shadowBlur={12}
    />,
  ];

  // 3. Generate 6 permutations
  const permIcons = permutations(prisonerIcons) as any;
  const groups = createRefArray<Layout>();
  const Lmovement = createSignal(0);

  // 4. Animate permutations dropping in from random directions
  for (let i = 0; i < permIcons.length; i++) {
    const randX = createSignal((generator.nextFloat(0, 1) - 0.2) * 1600);
    const randY = (generator.nextFloat(0, 1) - 0.5) * 1000;
    const combo = permIcons[i];

    // Wrap in row layout
    view.add(
      <Layout
        ref={groups}
        layout
        direction="row"
        gap={190}
        alignItems="center"
        x={() => randX() + Lmovement()}
        y={randY}
        opacity={0}
      >
        {combo.map((icon: any) => icon.clone({ size: 100 }))}
      </Layout>
    );

    // Animate in
    yield all(
      groups[i].opacity(1, 0.6),
      groups[i].position(() => [Lmovement(), i * 120 - 230], 1, easeOutBack)
    );
    yield* waitFor(0.4);
  }
  const number42 = (<PTxt text={"42"} scale={0} fontSize={150} />) as PTxt;
  const number6 = (
    <PTxt x={Lmovement} text={"6"} scale={0} fontSize={150} />
  ) as PTxt;
  const number7 = (
    <PTxt x={500} text={"7"} scale={0} fontSize={150} />
  ) as PTxt;
  const multiply = (<PTxt text={"•"} scale={0} fontSize={150} />) as PTxt;
  view.add(number6);
  view.add(number7);
  view.add(multiply);
  view.add(number42);
  yield* waitUntil("multiply");

  yield delay(
    0.8,
    all(
      number6.scale(1, 0.8, easeOutBack),
      number7.scale(1, 0.8, easeOutBack),
      Lmovement(-500, 0.9)
    )
  );

  yield* sequence(
    0.025, // faster sequencing
    ...groups.flatMap((gr) =>
      gr
        .childrenAs<Icon>()
        .map((child) =>
          all(gr.gap(0, 0.8), gr.position(0, 0.8), child.size(0, 1.4))
        )
    ),
    delay(0.5, multiply.scale(1.2, 0.6, easeOutBack))
  );

  yield* all(
    number6.position(0, 1.2, easeInOutExpo),
    number6.scale(0, 1.3, easeInOutExpo),
    number7.position(0, 1.2, easeInOutExpo),
    number7.scale(0, 1.3, easeInOutExpo),
    multiply.scale(0, 1.5),
    delay(0.6, number42.scale(1, 0.8, easeOutCubic)),
    permTitle().text("Possible scenarios", 1),
    permTitle().y(-150, 2)
  );

  yield* waitUntil("24");
  yield* all(number42.y(-50, 1), permTitle().y(700, 1));

  const noIcons: Icon[] = [];
  for (let i = 0; i < 7; i++) {
    const icon = (
      <Icon
        icon="lucide:thumbs-down"
        size={0}
        color="#ff8a8a"
        shadowColor="#ff8a8a66"
        shadowBlur={20}
        opacity={0}
        x={-600 + i * 200}
        y={100}
      />
    ) as Icon;
    noIcons.push(icon);
    view.add(icon);
  }

  const number24 = (
    <PTxt scale={0} y={-100} text={"24"} fontSize={150} />
  ) as PTxt;
  const number18 = (<PTxt text={"18"} fontSize={100} scale={0} />) as PTxt;
  view.add(number24);
  view.add(number18);

  // Animate 7 "no" icons in sequence
  yield sequence(
    0.1,
    ...noIcons.map((icon, i) =>
      all(icon.opacity(1, 0.6, easeOutBack), icon.size(60, 0.6, easeOutBack))
    )
  );
  yield* waitFor(0.5);

  yield* number42.scale(1.5, 0.4, easeOutBack);
  yield all(
    number42.scale(0, 0.4, easeInCubic),
    number24.scale(1, 0.5),
    number24.y(0, 0.5),
    number24.position(number42.position(), 0),
    number18.scale(1, 0.3),
    number18.position(number42.position(), 0)
  );
  yield* waitFor(0.35);

  // ✨ Animate 24 staying + 18 orbiting
  yield* any(
    number24.y(-50, 1, easeOutCubic),
    all(
      number18.y(-700, 3.2, easeOutBack),
      number18.rotation(360, 1.2, easeOutCubic)
    )
  );
  yield* all(
    number24.y(600, 1),
    ...noIcons.map((ic) => ic.y(700, 1)),
    number18.y(0, 2.5),
    number18.rotation(0, 2.2, easeOutCubic),
    number18.scale(2, 3)
  );

  const casesLayout = createRef<Layout>();
  view.add(
    <Layout
      ref={casesLayout}
      direction="column"
      alignItems="center"
      y={0}
      opacity={0}
    />
  );

  // Title
  const caseTitle = (
    <PTxt
      text="Group by number of NOs before yes"
      fontSize={60}
      y={-400}
      opacity={0}
      fill="#fff"
    />
  ) as PTxt;
  view.add(caseTitle);

  // Appear
  yield* all(
    caseTitle.opacity(1, 1, easeOutCubic),
    caseTitle.y(-450, 1, easeOutCubic),
    casesLayout().opacity(1, 1),
    casesLayout().y(50, 1)
  );

  const expectedGroups = [
    { count: 0, color: "#6ee7b7", total: 2 },
    { count: 1, color: "#93c5fd", total: 3 },
    { count: 2, color: "#fcd34d", total: 4 },
    { count: 3, color: "#fb923c", total: 3 },
    { count: 4, color: "#f87171", total: 3 },
    { count: 5, color: "#f56acbff", total: 1 },
    { count: 6, color: "#b73be7ff", total: 1 },
  ];

  yield* waitFor(0.6);
  yield number18.y(1000, 1);
  const blockrows = createRefArray<Layout>();
  for (let i = 0; i < expectedGroups.length; i++) {
    const group = expectedGroups[i];

    const label = (
      <PTxt text={`${group.count} no’s`} fontSize={0} fill={group.color} />
    );

    const icons = Array(group.total)
      .fill(0)
      .map(() => (
        <Icon
          icon="lucide:box"
          size={0}
          color="#fde68a"
          shadowColor="#fde68a55"
          shadowBlur={12}
          opacity={0}
        />
      ));

    const row = (
      <Layout
        ref={blockrows}
        layout
        direction="row"
        gap={40}
        alignItems="center"
        opacity={0}
        y={100 * i - 300}
      >
        {label}
        {...icons}
      </Layout>
    );

    view.add(row);
    const ref = blockrows[i];
    casesLayout().add(row);
    yield all(
      ref.opacity(1, 0.6, easeOutBack),
      ref.margin(30, 1),
      ref.childAs<PTxt>(0).fontSize(48, 0.6),
      ...ref
        .childrenAs<Icon>()
        .slice(1)
        .map((icon, j) =>
          sequence(
            j * 0.1,
            all(icon.opacity(1, 0.6, easeOutBack), icon.size(60, 0.6))
          )
        )
    );
    yield* waitFor(0.1);
  }

  yield* waitUntil("morph");
  const newdata: ("x" | "y" | "z")[][] = [
    ["x", "x"],
    ["x", "x", "y"],
    ["x", "x", "y", "y"],
    ["y", "y", "z"],
    ["y", "z", "z"],
    ["z"],
    ["z"],
  ];
  const CYAN = "#5eead4";
  const CYAN_SHADOW = "#5eead4aa";
  const PINK = "#fa7b9c";
  const PINK_SHADOW = "#fa7b9caa";

  type Ctx = {
    parent: Layout;
    shapesRef: any;
    linesRef?: any;
    pos?: [number, number];
  };

  type Token = { shapeIndex: number; lineRange?: [number, number] };

  const iconsMap = {
    /** x → striped circle */
    x: {
      create: ({ parent, shapesRef, linesRef, pos = [0, 0] }: Ctx): Token => {
        if (!linesRef) throw new Error("linesRef is required for x (striped).");
        const [px, py] = pos;

        parent.add(
          <Circle
            ref={shapesRef}
            position={pos}
            size={80}
            stroke={CYAN}
            shadowColor={CYAN_SHADOW}
            lineWidth={8}
            scale={0}
            clip
            shadowBlur={32}
          >
            {...Array.from({ length: 9 }, (_, i) => {
              const x = -40 -12 + i * 12;
              return (
                <Line
                  ref={linesRef}
                  points={[
                    [x, -60],
                    [x + 40, 60],
                  ]}
                  stroke={CYAN}
                  lineWidth={4}
                  end={0}
                />
              );
            })}
          </Circle>
        );

        const shapeIndex = shapesRef.length - 1;
        const lineEnd = (linesRef as any[]).length - 1;
        const lineStart = lineEnd - 8; // 8 lines added
        return { shapeIndex, lineRange: [lineStart, lineEnd] };
      },

      anim: function* (
        { shapesRef, linesRef }: { shapesRef: any[]; linesRef: any[] },
        t: Token
      ) {
        const circle = shapesRef[t.shapeIndex];
        const lines = linesRef.slice(t.lineRange[0], t.lineRange[1] + 1);
        // pop-in circle then draw hatch
        yield* sequence(
          0.15,
          circle.scale(1, 0.6, easeOutBack),
          ...lines.map((l) => l.end(1, 0.4, easeOutBack))
        );
      },
    },

    /** y → plain circle */
    y: {
      create: ({ parent, shapesRef, pos = [0, 0] }: Ctx): Token => {
        parent.add(
          <Circle
            ref={shapesRef}
            position={pos}
            size={80}
            stroke={PINK}
            lineWidth={8}
            scale={0}
            shadowBlur={32}
            shadowColor={PINK_SHADOW}
          />
        );
        return { shapeIndex: shapesRef.length - 1 };
      },

      anim: function* ({ shapesRef }: { shapesRef: any[] }, t: Token) {
        yield* shapesRef[t.shapeIndex].scale(1, 0.6, easeOutBack);
      },
    },

    /** z → plain rect */
    z: {
      create: ({ parent, shapesRef, pos = [0, 0] }: Ctx): Token => {
        parent.add(
          <Rect
            ref={shapesRef}
            position={pos}
            size={80}
            stroke={PINK}
            lineWidth={8}
            scale={0}
            shadowColor={PINK_SHADOW}
            shadowBlur={32}
          />
        );
        return { shapeIndex: shapesRef.length - 1 };
      },

      anim: function* ({ shapesRef }: { shapesRef: any[] }, t: Token) {
        yield* shapesRef[t.shapeIndex].scale(1, 0.6, easeOutBack);
      },
    },
  } as const;
  function* animateIcon(
    { shapesRef, linesRef }: { shapesRef: any[]; linesRef?: any[] },
    t: Token
  ) {
    const shape = shapesRef[t.shapeIndex];
    if (t.lineRange) {
      const [a, b] = t.lineRange;
      const lines = linesRef!.slice(a, b + 1);
      yield* sequence(
        0.15,
        shape.scale(.8, 0.6, easeOutBack),
        ...lines.map((l) => l.end(1, 0.4, easeOutBack))
      );
    } else {
      yield* shape.scale(.8, 0.6, easeOutBack);
    }
  }
  yield* sequence(
    0.02,
    caseTitle.y(-350, 1),
    ...blockrows.flatMap((row, i) =>
      row.childrenAs<Icon>().map((child, j) =>
        all(
          child instanceof Icon ? child.scale(0, 1) : null,
          run(function* () {
            const children = row.children();
            const shapesRef = createRefArray<Shape>();
            const linesRef = createRefArray<Line>();
            const inconraw = newdata[i][j];
            var newchild: Token;

            if (inconraw == "x") {
              newchild = iconsMap.x.create({
                parent: view,
                shapesRef,
                linesRef,
                pos: [0, 0],
              }) as Token;
            } else if (inconraw == "y") {
              newchild = iconsMap.y.create({
                parent: view,
                shapesRef,
                linesRef,
                pos: [0, 0],
              }) as Token;
            } else if (inconraw == "z"){
              newchild = iconsMap.z.create({
                parent: view,
                shapesRef,
                linesRef,
                pos: [0, 0],
              }) as Token;
            }
            if(newchild){
              const coresponding = children[j + 1];
              if (coresponding) {
                shapesRef[0].absolutePosition(() =>
                  coresponding.absolutePosition()
                );
              }
              yield* animateIcon({ shapesRef, linesRef }, newchild);
            }
          })
        )
      )
    )
  );

  yield* waitUntil("strippedcase");
  yield all(
    casesLayout().x(-1500, 1),
    caseTitle.x(-1500, 1),
    strippedCircle().moveForward(2.5, 1),
    emptycircle().moveForward(2.5, 1),
    camera().lookTo(
      POSITION_BUFFER.looksAtBoxes.lookAt.sub(new Vector3(0, 0, -0.75)),
      1
    ),
    overlay().opacity(0.7, 1)
  );
  // === FINAL TABLE FIXED TO LOOK LIKE GRAPH ===

  const remaining_cases_table = [
    { order: "ABC", stripedCircle: 0, redCircle: 1, redSquare: 2 },
    { order: "ACB", stripedCircle: 0, redCircle: 2, redSquare: 4 },
    { order: "BAC", stripedCircle: 1, redCircle: 3, redSquare: 5 },
    { order: "BCA", stripedCircle: 2, redCircle: 3, redSquare: 4 },
    { order: "CAB", stripedCircle: 1, redCircle: 2, redSquare: 3 },
    { order: "CBA", stripedCircle: 2, redCircle: 4, redSquare: 6 },
  ];

  const SPACING = createSignal(120);
  const orders = createRefArray<Glass>();
  const values = createRefArray<PTxt>();
  const title = createRef<PTxt>();
  const rays = createRefArray<Ray>();
  const caseRows = createRefArray<Rect>();
  const headerShapes = createRefArray<Shape>();
  const headerLines = createRefArray<Line>();

  const remaining_cases = (
    <Rect scale={0.9} x={1200} y={60}>
      {...remaining_cases_table.map((data, i) => (
        <Rect
          ref={caseRows}
          width={1200}
          height={110}
          lineWidth={2}
          radius={32}
          position={() => [
            0,
            ((remaining_cases_table.length - 1) * SPACING()) / -2 +
              i * SPACING(),
          ]}
        >
          {i !== 0 && (
            <Ray
              ref={rays}
              fromX={600}
              toX={-600}
              lineWidth={2}
              y={-60}
              stroke={
                new Gradient({
                  from: new Vector2(-600, 50),
                  to: new Vector2(600, 0),
                  stops: [
                    { offset: 0, color: "#fff0" },
                    { offset: 0.3, color: "#fffa" },
                    { offset: 1, color: "#fff0" },
                  ],
                })
              }
            />
          )}

          {i === 0 && (
            <>
              <PTxt
                fontWeight={200}
                shadowColor={"rgba(255, 255, 255, 1)"}
                ref={title}
                right={[-480, -120]}
              >
                Order
              </PTxt>
              <Layout
                direction="row"
                layout
                justifyContent="space-between"
                width={640}
                right={[420, -120]}
                fontWeight={200}
              >
                <Circle
                  ref={headerShapes}
                  size={80}
                  stroke="#5eead4"
                  shadowColor={"#5eead4aa"}
                  lineWidth={8}
                  scale={0}
                  clip
                  shadowBlur={32}
                >
                  {...Array.from({ length: 8 }, (_, i) => {
                    const x = -40 + i * 12;
                    return (
                      <Line
                        ref={headerLines}
                        points={[
                          [x, -60],
                          [x + 40, 60],
                        ]}
                        stroke="#5eead4"
                        lineWidth={4}
                        end={0}
                      />
                    );
                  })}
                </Circle>
                <Circle
                  ref={headerShapes}
                  size={80}
                  stroke="#fa7b9c"
                  lineWidth={8}
                  scale={0}
                  shadowBlur={32}
                  shadowColor={"fa7b9caa"}
                />
                <Rect
                  ref={headerShapes}
                  size={80}
                  stroke="#fa7b9c"
                  lineWidth={8}
                  scale={0}
                  shadowColor={"fa7b9caa"}
                  shadowBlur={32}
                />
              </Layout>
            </>
          )}

          {...data.order.split("").map((char, j) => (
            <Glass
              ref={orders}
              translucency={1}
              right={() => [60 * j - 500, 0]}
              size={70}
              radius={1000}
              scale={0}
            >
              <PTxt
                color="#fde499"
                shadowColor="#fde49966"
                shadowBlur={20}
                zIndex={1}
                fontWeight={300}
                fontSize={50}
              >
                {char}
              </PTxt>
            </Glass>
          ))}

          <Layout
            direction="row"
            layout
            justifyContent="space-between"
            width={600}
            right={[400, 0]}
            fontWeight={200}
          >
            {...[data.stripedCircle, data.redCircle, data.redSquare].map(
              (n) => <PTxt opacity={0} scale={0} ref={values} text={`${n}`} />
            )}
          </Layout>
        </Rect>
      ))}
    </Rect>
  );
  const info = (
    <Glass
      size={[500, 800]}
      translucency={1}
      borderModifier={-0.5}
      right={[1920 / 2 + 700, 0]}
    >
      <Rect zIndex={1} y={-70}>
        <Icon
          icon="lucide:info"
          size={60}
          color="#38bdf8"
          shadowColor="#38bdf888"
          shadowBlur={40}
          y={-230}
        />
        <PTxt
          y={-160}
          fontSize={32}
          fontWeight={600}
          fill="#e0f2fe"
          shadowColor="#38bdf8"
          shadowBlur={32}
        >
          What does this chart show?
        </PTxt>

        <Icon
          icon="lucide:clock"
          size={48}
          color="#fb923c"
          shadowColor="#fb923c88"
          shadowBlur={40}
          y={-40}
        />
        <PTxt
          fontSize={25}
          fontWeight={300}
          fill="#ffeccc"
          y={30}
          shadowColor="#fb923c"
          shadowBlur={24}
        >
          Each number shows how long it takes{"\n"}before a shape can be
          identified.
        </PTxt>

        <Icon
          icon="lucide:message-square"
          size={48}
          fontSize={25}
          color="#34d399"
          shadowColor="#34d39988"
          shadowBlur={40}
          y={120}
        />
        <PTxt
          fontSize={25}
          fontWeight={300}
          fill="#d1fae5"
          y={190}
          shadowColor="#34d399"
          shadowBlur={24}
        >
          It counts the number of “No” answers{"\n"}before a prisoner can say
          “Yes.”
        </PTxt>

        <Icon
          icon="lucide:target"
          size={48}
          color="#facc15"
          shadowColor="#facc1588"
          shadowBlur={40}
          y={280}
        />
        <PTxt
          fontWeight={300}
          fill="#fef9c3"
          y={350}
          shadowColor="#facc15"
          shadowBlur={24}
          fontSize={25}
        >
          Lower number = shape revealed faster{"\n"}(easy to distinguish).
        </PTxt>
      </Rect>
    </Glass>
  );
  view.add(info);
  view.add(remaining_cases);

  yield remaining_cases.x(-300, 1);
  // === POP-IN ANIMATION ===
  for (let i = 0; i < caseRows.length; i++) {
    const row = caseRows[i];
    const rowOrders = orders.slice(i * 3, i * 3 + 3);
    const rowValues = values.slice(i * 3, i * 3 + 3);
    yield sequence(
      0.15,
      ...rowOrders.map((g) => g.scale(1, 0.5, easeOutBack)),
      ...rowValues.map((t) =>
        all(t.opacity(1, 0.3), t.scale(1, 0.5, easeOutBack))
      )
    );
    yield* waitFor(0.1);
  }

  // === HEADER SHAPES POP-IN ===
  yield* sequence(
    0.15,
    ...headerShapes.slice(1).map((s) => s.scale(1, 0.6, easeOutBack)),
    headerShapes[0].scale(1, 0.6, easeOutBack),
    ...headerLines.map((line) => line.end(1, 0.4, easeOutBack))
  );
  yield* info.x(600, 1);

  yield* waitUntil("highlight");
  yield* sequence(
    0.02,
    ...values.map((value, i) =>
      i == 0 || i == 3 ? value.opacity(1, 0.5) : value.opacity(0.3, 1)
    )
  );
  yield* waitUntil("highlight_striped_circle");
  yield* sequence(
    0.02,
    ...values.map((value, i) =>
      i % 3 === 0 ? value.opacity(1, 0.5) : value.opacity(0.15, 1)
    )
  );
  yield* waitUntil("highlight_red_circle_easy");
  yield* sequence(
    0.02,
    ...values.map((value, i) =>
      i === 1 || i === 4 ? value.opacity(1, 0.5) : value.opacity(0.15, 1)
    )
  );

  yield* waitUntil("highlight_red_circle_hard");
  yield* sequence(
    0.02,
    ...values.map((value, i) =>
      i === 7 || i === 10 || i === 16
        ? value.opacity(1, 0.5)
        : value.opacity(0.15, 1)
    )
  );
  yield* waitUntil("highlight_red_square");
  yield* sequence(
    0.02,
    ...values.map((value, i) =>
      i % 3 === 2 ? value.opacity(1, 0.5) : value.opacity(0.15, 1)
    )
  );
  yield* waitUntil("neutral");
  yield* all(...values.map((value, i) => value.opacity(1, 0.5)));

  yield* waitUntil("highlight_sure_wins");
  const sureWinIndices = [0, 3, 8, 17]; // Example indices from response map
  yield* sequence(
    0.04,
    ...sureWinIndices.map((i) => values[i].fill("#4ade80", 0.4)) // green for guaranteed wins
  );

  yield* waitUntil("highlight_guess_cases");
  const guessIndices = range(18).filter(
    (i) => sureWinIndices.findIndex((v) => v == i) == -1
  ); // remaining 6 cases
  yield* sequence(
    0.04,
    ...guessIndices.map((i) => values[i].fill("#facc15", 0.4)) // yellow for uncertain guesses
  );

  const resultTxt = (
    <PTxt
      y={450}
      x={-470}
      fontSize={32}
      fontWeight={500}
      fill="#fff"
      opacity={0}
      text={`Adding these up for each response,\nwe get 12 cases where we win out of the 18`}
      shadowColor="#fff4"
      shadowBlur={20}
    />
  );
  view.add(resultTxt);

  yield* waitUntil("reveal_result");
  yield* resultTxt.opacity(1, 1);

  yield* waitUntil("revert");
  yield all(
    info.x(1500, 1),
    resultTxt.x(-1500, 1),
    remaining_cases.x(-1500, 1),
    overlay().opacity(0.2, 1),
    camera().lookTo(
      POSITION_BUFFER.looksAtCell.lookAt.add(new Vector3(0, 0, -1000)),
      5
    ),
    camera().moveAt(POSITION_BUFFER.looksAtPrisoners.position, 4),
    camera().zoomTo(0.4, 1)
  );
  const final_tex = (
    <Latex
      tex={"p = \\frac{12 + 6}{42}"}
      fill={"white"}
      fontSize={80}
      scale={0.5}
      opacity={0}
    />
  ) as Latex;
  view.add(final_tex);
  yield* waitFor(2);
  yield* all(final_tex.scale(1, 1), final_tex.opacity(1, 1));
  yield* waitUntil("simplify");
  yield* all(final_tex.tex("p = \\frac{3}{7}", 1), camera().moveForward(5, 4));

  yield* waitUntil("end");
});
