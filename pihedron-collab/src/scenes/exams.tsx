import { Gradient, Icon, Img, makeScene2D, Rect, Txt } from "@motion-canvas/2d";
import {
  all,
  any,
  createRef,
  createRefArray,
  easeInCubic,
  easeInOutExpo,
  easeInOutSine,
  easeOutBack,
  easeOutCirc,
  easeOutCubic,
  easeOutQuart,
  range,
  sequence,
  tween,
  useRandom,
  waitFor,
  waitUntil,
  Vector2,
  easeOutElastic,
  linear,
  easeInBack,
  delay,
  easeInOutCubic,
  easeInOutBack,
  createSignal,
  createEffect,
  easeInCirc,
  run,
  easeInExpo,
} from "@motion-canvas/core";
import Scene3D from "../libs/Thrash/Scene";
import { Color, Euler, Mesh, Vector3 } from "three";
import EnvMap from "../libs/Thrash/utils/EnvMap";
import Lights from "../libs/Thrash/components/Lights";
import Camera from "../libs/Thrash/Camera";
import Model from "../libs/Thrash/objects/Model";
import HemisphereLightObject from "../libs/Thrash/utils/lights/hemisphere-light";
import DirectionalLightObject from "../libs/Thrash/utils/lights/directional-light";
import AmbientLightObject from "../libs/Thrash/utils/lights/ambient-light";
import PointLightObject from "../libs/Thrash/utils/lights/point-light";
import { PTxt } from "../components/gen/Ptxt";
import { Glass } from "../components/gen/Glass";
import openai from "../images/llms/openai.png";
import gemini from "../images/llms/gemini.png";
import anthropic from "../images/llms/anthropic.png";
import grok from "../images/llms/grok.png";
import meta from "../images/llms/meta.png";
import mistral from "../images/llms/mistral.png";

export default makeScene2D(function* (view) {
  const camera = createRef<Camera>();

  const generator = useRandom(0);

  const classmates = createRefArray<Model>();
  const lights = createRefArray<PointLightObject>();

  const scene = (
    <Scene3D
      fogNear={5}
      fogFar={18}
      fogColor="#270c5269"
      background={"#2c0e0eff"}
    >
      <Camera
        ref={camera}
        localPosition={new Vector3(-3, 2, -4.9)}
        lookAt={new Vector3(5, 0, 10)}
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
        lookAt={new Vector3(0, 1.5, 0)}
        intensity={15.5}
        color={"rgba(129, 51, 219, 0.45)"} // purple glow
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
        color={"#dddfff"} // lavender
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

      <PointLightObject
        localPosition={new Vector3(-3.5, 3, -3.8)} // near top-left back corner
        intensity={12.4}
        color={"#ffffffff"} // warm soft fill
        decay={2}
        distance={6}
        ref={lights}
      />

      <Model src="/models/classroom.glb" localScale={new Vector3(1, 1, 1)} />
      {Array.from({ length: 20 }).map((_, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        const spacingX = 1.1;
        const spacingZ = 1.3;

        const x = -2 + col * spacingX + generator.nextFloat(0, 0.15);
        const z = -3 + row * spacingZ + generator.nextFloat(0, 0.15);
        const yRot = -0.05 + generator.nextFloat(0, 0.1);

        const hasBook = generator.nextInt(0, 10) < 6; // 40% chance a desk has a book
        const modelSrc = hasBook ? "/models/desk-book.glb" : "/models/desk.glb";

        return (
          <Model
            key={`desk-${i}`}
            ref={classmates}
            src={modelSrc}
            localPosition={new Vector3(x, 0, z)}
            localRotation={new Vector3(0, yRot, 0)}
            localScale={new Vector3(0.9, 0.9, 0.9)}
          />
        );
      })}
    </Scene3D>
  ) as Scene3D;
  scene.init();
  view.add(scene);

  const mathRef = createRef<Glass>();
  const englishRef = createRef<Glass>();
  const scienceRef = createRef<Glass>();

  const mathIcon = createRef<Icon>();
  const englishIcon = createRef<Icon>();
  const scienceIcon = createRef<Icon>();

  const mathTxt = createRef<PTxt>();
  const englishTxt = createRef<PTxt>();
  const scienceTxt = createRef<PTxt>();

  const overlay = (
    <Glass
      size={2500}
      translucency={1}
      lightness={-0.02}
      radius={3000}
      scale={0}
      y={-2000}
    />
  );
  overlay.save();
  view.add(overlay);
  const data = (
    <Rect width={"100%"} height={140} top={[-40, -1080 / 2 + 20]}>
      {/* Math */}
      <Glass
        ref={mathRef}
        height={95}
        width={330}
        position={[-650, -280]} // start offscreen
        translucency={0.5}
        lightness={-0.3}
        scale={new Vector3(1.1, 1.1, 1.1)} // initial pop scale
        fill={"#49d84952"}
      >
        <PTxt
          zIndex={1}
          fill={"#8efb8e"}
          fontSize={70}
          right={[-90, 0]}
          shadowColor={"#92e49288"}
          shadowBlur={8}
        >
          16
        </PTxt>
        <PTxt
          zIndex={1}
          ref={mathTxt}
          fill={"#8efb8e"}
          fontSize={60}
          left={[50, 0]}
          shadowColor={"#92e49288"}
          shadowBlur={8}
        >
          math
        </PTxt>
        <Icon
          zIndex={1}
          icon={"tabler:math-integral-x"}
          size={80}
          color={"#8efb8e"}
          position={[0, 0]}
          ref={mathIcon}
          opacity={0}
          scale={0.5}
          shadowColor={"#92e49288"}
          shadowBlur={8}
        />
      </Glass>

      {/* English */}
      <Glass
        ref={englishRef}
        height={95}
        width={360}
        position={[-100, -280]} // start offscreen
        translucency={0.5}
        lightness={-0.3}
        scale={new Vector3(1.1, 1.1, 1.1)}
        fill={"#408be752"}
      >
        <PTxt
          zIndex={1}
          fill={"#b9ddfdff"}
          fontSize={70}
          right={[-110, 0]}
          shadowColor={"#9dc5f688"}
          shadowBlur={8}
        >
          13
        </PTxt>
        <PTxt
          zIndex={1}
          ref={englishTxt}
          fill={"#b6d9f7ff"}
          fontSize={60}
          left={[50, 0]}
          shadowColor={"#9dc5f688"}
          shadowBlur={8}
        >
          english
        </PTxt>
        <Icon
          zIndex={1}
          icon={"tabler:book"}
          size={80}
          color={"#cae2ffff"}
          position={[-10, 0]}
          opacity={0}
          ref={englishIcon}
          scale={0.5}
          shadowColor={"#9dc5f688"}
          shadowBlur={8}
        />
      </Glass>

      {/* Science */}
      <Glass
        ref={scienceRef}
        height={95}
        width={380}
        position={[470, -280]} // start offscreen
        translucency={0.5}
        lightness={-0.3}
        scale={new Vector3(1.1, 1.1, 1.1)}
        fill={"#f5549c52"}
      >
        <PTxt
          zIndex={1}
          fill={"#ffc1dc"}
          fontSize={70}
          right={[-120, 0]}
          shadowColor={"#f6aece88"}
          shadowBlur={8}
        >
          12
        </PTxt>
        <PTxt
          zIndex={1}
          ref={scienceTxt}
          fill={"#ffc1dc"}
          fontSize={60}
          left={[50, 0]}
          shadowColor={"#f6aece88"}
          shadowBlur={8}
        >
          science
        </PTxt>
        <Icon
          zIndex={1}
          icon={"tabler:flask"}
          ref={scienceIcon}
          size={80}
          color={"#ffc1dc"}
          position={[-30, 0]}
          opacity={0}
          scale={0.5}
          shadowColor={"#f6aece88"}
          shadowBlur={8}
        />
      </Glass>
    </Rect>
  );

  view.add(data);

  // HELPERS
  function pickRandomIndices(total: number, count: number) {
    const pool = range(total);
    const selected: number[] = [];

    while (selected.length < count && pool.length > 0) {
      const idx = generator.nextInt(0, pool.length - 1);
      selected.push(pool[idx]);
      pool.splice(idx, 1);
    }

    return selected;
  }
  function* highlightDesk(
    index: number,
    hexColor: number | string = "#ffff88"
  ) {
    const desk = classmates[index];
    const originalScale = desk.localScale();
    const originalRotation = desk.localRotation();
    const targetScale = originalScale.clone().multiplyScalar(1.1);
    const targetRotation = originalRotation
      .clone()
      .add(
        new Vector3(
          generator.nextFloat(-0.1, 0.1),
          generator.nextFloat(-0.1, 0.1),
          generator.nextFloat(-0.1, 0.1)
        )
      )
      .divideScalar(3);
    const colorTarget = new Color(hexColor);

    // Capture all meshes with materials
    const meshList: Mesh[] = [];
    desk.core.traverse((child) => {
      if ((child as Mesh).isMesh && (child as Mesh).material) {
        meshList.push(child as Mesh);
      }
    });

    // Record original colors
    const originalColors = meshList.map((mesh) =>
      (mesh.material as any).color?.clone()
    );

    // Animate transform and color in
    yield* all(
      desk.scaleTo(targetScale, 0.3, easeOutCirc),
      desk.rotateTo(targetRotation, 0.3, easeOutCirc),
      ...meshList.map((mesh, i) =>
        tween(0.3, (t) => {
          t = easeOutCubic(t);
          const orig = originalColors[i];
          if (orig) {
            const mat = mesh.material as any;
            mat.color.lerpColors(orig, colorTarget, t);
          }
        })
      )
    );

    // Animate transform and color back
    yield* all(
      desk.scaleTo(originalScale, 0.4, easeInOutSine),
      desk.rotateTo(originalRotation, 0.4, easeInOutSine)
    );
  }
  function* revertDeskHighlight(index: number, originalColor?: Color) {
    const desk = classmates[index];

    // Collect mesh list
    const meshList: Mesh[] = [];
    desk.core.traverse((child) => {
      if ((child as Mesh).isMesh && (child as Mesh).material) {
        meshList.push(child as Mesh);
      }
    });

    // Store current colors
    const currentColors = meshList.map((mesh) =>
      (mesh.material as any).color?.clone()
    );

    const targetColor = originalColor ?? new Color("#dddddd");

    // Animate transform + material color reset
    yield* all(
      ...meshList.map((mesh, i) =>
        tween(0.3, (t) => {
          t = easeInCubic(t);
          const current = currentColors[i];
          if (current) {
            const mat = mesh.material as any;
            mat.color.lerpColors(current, targetColor, t);
          }
        })
      )
    );
  }
  function* revertAllExcept(
    passed: number[],
    all: number[],
    color = "#dddddd"
  ) {
    const failed = all.filter((i) => !passed.includes(i));
    yield* sequence(
      0.02,
      ...failed.map((i) => revertDeskHighlight(i, new Color(color)))
    );
  }
  function* animateCard(
    ref: Glass,
    icon: Icon,
    txt: PTxt,
    initial: Vector2,
    final: Vector2,
    widthShrink = 140,
    contentShift = 60
  ) {
    // Pop in
    yield* all(
      ref.position(initial, 0.6, easeOutBack),
      ref.scale(1, 0.6, easeOutBack)
    );

    yield* waitFor(0.5);
    const txt2 = txt
      .parent()
      .findFirst((child) => child instanceof Txt && child != txt);
    // Step 2: Collapse and shift contents
    yield* any(
      ref.width(ref.width() - widthShrink, 0.4, easeInOutSine),
      ref.position(final, 0.6, easeInOutExpo),
      txt.opacity(0, 0.5),
      txt.scale(0.8, 0.5),
      txt2.position(txt2.position().addX(contentShift), 0.5, easeInOutSine),
      icon.opacity(1, 0.5),
      icon.scale(1, 0.5),
      icon.position(
        icon.position().addX(contentShift * 0.9),
        0.5,
        easeInOutSine
      )
    );
  }

  yield* waitUntil("start");

  const intensity_buffer = lights.map((light) => light.intensity());
  yield* lights.map((light) => light.intensityTo(0, 0));
  yield* waitFor(1);

  yield* sequence(
    0.1,
    ...lights.map((light, i) =>
      light.intensityTo(intensity_buffer[i], 0.2, easeOutCirc)
    )
  );
  yield* waitFor(0.5);
  yield* all(
    camera().moveAt(new Vector3(0.45, 3, 4.7), 2.2, easeInOutExpo),
    camera().lookTo(new Vector3(0.45, 0.5, 0), 2.2, easeInOutSine),
    camera().zoomTo(0.44, 2.2, easeInOutExpo)
  );
  const palette = {
    passed_math: "#77dd77", // soft green
    passed_english: "#84b6f4", // calm blue
    passed_science: "#f49ac2", // gentle pink
  };

  const total = classmates.length;
  const allIndices = range(total);

  // Step 1 : Math
  yield* waitUntil('passings');
  const passedMath = pickRandomIndices(total, 16);
  yield* sequence(
    0.02,
    animateCard(
      mathRef(),
      mathIcon(),
      mathTxt(),
      new Vector2(0, 0),
      new Vector2(-790, 0),
      110
    ),
    ...passedMath.map((i) => highlightDesk(i, palette.passed_math))
  );
  yield* revertAllExcept(passedMath, allIndices);

  // Step 2: English
  const passedEnglish = pickRandomIndices(total, 13);
  yield* sequence(
    0.02,
    animateCard(
      englishRef(),
      englishIcon(),
      englishTxt(),
      new Vector2(0, 0),
      new Vector2(-540, 0)
    ),
    ...passedEnglish.map((i) => highlightDesk(i, palette.passed_english))
  );
  yield* revertAllExcept(passedEnglish, allIndices);

  // Step 3: Science
  const passedScience = pickRandomIndices(total, 12);
  yield* sequence(
    0.02,
    animateCard(
      scienceRef(),
      scienceIcon(),
      scienceTxt(),
      new Vector2(0, 0),
      new Vector2(-300, 0),
      160,
      80
    ),
    ...passedScience.map((i) => highlightDesk(i, palette.passed_science))
  );
  yield* revertAllExcept(passedScience, allIndices);
  yield* waitFor(1);
  yield all(
    revertAllExcept([], allIndices),
    overlay.scale(1, 2, easeOutCirc),
    overlay.y(0, 1, easeOutCirc)
  );
  yield* waitFor(0.7);
  const question = (
    <PTxt
      textAlign={"center"}
      fontWeight={600}
      fill={"rgba(10, 10, 10, 1)"}
      opacity={0}
      scale={0.6}
      fontSize={80}
      y={-50}
      // shadowBlur={10}
      // shadowColor={"rgba(45, 45, 46, 0.5)"}
    />
  ) as PTxt;
  view.add(question);
  data.save();
  question.save();
  yield* all(
    data.position([500, 150], 1),
    question.scale(1, 1),
    question.opacity(1, 1),
    question.text(
      "What is the minimum number of students\nthat passed all subjects?",
      1
    )
  );

  const llms = [openai, gemini, anthropic, mistral, grok, meta].map((llm) => (
    <Glass
      size={250}
      rotation={generator.nextInt(-360, 360)}
      position={
        new Vector2(generator.nextInt(-250, 250), generator.nextInt(-250, 250))
      }
    >
      <Img
        zIndex={1}
        src={llm}
        scale={
          openai == llm || meta == llm || mistral == llm || grok == llm
            ? 0.25
            : 0.5
        }
      />
    </Glass>
  ));
  view.add(<>{...llms}</>);
  llms.forEach((llm) => {
    llm.save();
    llm.position(
      new Vector2(
        generator.nextInt(-600, 600),
        generator.nextInt(-400, 400)
      ).addY(1000)
    );
  });
  const safetext = (
    <PTxt
      textAlign={"center"}
      fontWeight={600}
      text={"You're safe for now..."}
      fill={"rgba(27, 27, 27, 1)"}
      opacity={0}
      scale={0.6}
      fontSize={50}
      y={-50}
      shadowBlur={40}
      shadowColor={"rgba(45, 45, 46, 0.5)"}
    />
  );
  view.add(safetext);
  yield* waitUntil("restore");
  yield all(...llms.map((llm) => llm.restore(2.5, easeOutElastic)));
  yield all(
    ...llms.map((llm) =>
      llm.rotation(
        llm.rotation() + 360 * 12 * generator.nextFloat(1.1, -1.1),
        24
      )
    )
  );
  yield question.text("", 1);
  yield* all(
    data.restore(1),
    data.y(-1000, 1),
    question.restore(1),
    overlay.restore(1)
  );
  yield* waitUntil("disolve");
  yield delay(
    1,
    all(safetext.scale(3, 1, easeOutBack), safetext.opacity(1, 1))
  );
  yield* sequence(0.25, ...llms.map((llm) => llm.y(1000, 1, easeInBack)));
  yield* waitFor(1);
  yield* all(safetext.opacity(0, 1, easeInCubic));
  yield* waitUntil("rotate");
  yield* all(camera().rotateTo(new Euler(-0.4, 0.05, Math.PI), 1));
  const randomselected = pickRandomIndices(total, 19);
  yield* sequence(
    0.1,
    ...randomselected.map((i) => highlightDesk(i, "rgba(226, 93, 93, 1)"))
  );
  yield* all(
    overlay.scale(1, 2, easeOutCirc),
    overlay.y(0, 1, easeOutCirc),
    question.scale(1, 1),
    question.opacity(1, 1),
    question.position([-800, -50], 1),
    question.text(
      "What is the maximum number of people\nwho failed any subject?",
      1
    )
  );

  const failed = createSignal(12);
  const passed = createSignal(() => total - failed());

  const failLabel = createSignal(0);
  const passLabel = createSignal(0);
  const bar1 = createSignal(0);
  const bar2 = createSignal(0);
  const bar3 = createSignal(0);

  yield* waitUntil("bars");
  const bars = (
    <Rect
      layout
      direction="row"
      alignItems="center"
      justifyContent="center"
      gap={160}
      padding={120}
      shadowBlur={20}
      shadowColor={"#0008"}
    >
      {/* Left Labels */}
      <Rect layout direction="column" gap={60} alignItems="end">
        <Rect
          layout
          direction="row"
          gap={40}
          alignItems="center"
          scale={() => failLabel()}
          opacity={() => failLabel()}
        >
          <Icon
            icon="mdi:close-circle-outline"
            size={144}
            color="#e45a5a"
            shadowBlur={6}
            shadowColor="#e45a5a55"
          />
          <PTxt
            text={() => `${failed().toFixed(0)} failed`}
            fontSize={116}
            fill="#e45a5a"
          ></PTxt>
        </Rect>

        <Rect
          layout
          direction="row"
          gap={40}
          alignItems="center"
          scale={() => passLabel()}
          opacity={() => passLabel()}
        >
          <Icon
            icon="mdi:check-circle-outline"
            size={144}
            color="#6adc6a"
            shadowBlur={6}
            shadowColor="#6adc6a55"
          />
          <PTxt
            text={() => `${passed().toFixed(0)} passed`}
            fontSize={116}
            fill="#6adc6a"
          ></PTxt>
        </Rect>
      </Rect>

      {/* Right Bars */}
      <Rect layout direction="column" gap={40}>
        {/* Fail Bar */}
        <Rect
          scale={() => bar1()}
          opacity={() => bar1()}
          width={800}
          height={60}
          radius={30}
          fill={
            new Gradient({
              from: Vector2.down.mul(50),
              to: Vector2.up.mul(50),
              stops: [
                { offset: 0, color: "#f1f1f1ff" },
                { offset: 1, color: "#d3cfcf" },
              ],
            })
          }
          shadowBlur={16}
        >
          <Rect
            height={60}
            size={() => [(failed() / total) * 800, 60]}
            radius={30}
            fill={
              new Gradient({
                from: Vector2.down.mul(50),
                to: Vector2.up.mul(50),
                stops: [
                  { offset: 0, color: "#ff9c9c" },
                  { offset: 1, color: "#ff4d4d" },
                ],
              })
            }
          />
        </Rect>

        {/* Pass Bar */}
        <Rect
          scale={() => bar2()}
          opacity={() => bar2()}
          width={800}
          height={60}
          radius={30}
          fill={
            new Gradient({
              from: Vector2.down.mul(50),
              to: Vector2.up.mul(50),
              stops: [
                { offset: 0, color: "#f0fff0" },
                { offset: 1, color: "#bdc7bdff" },
              ],
            })
          }
          shadowBlur={16}
        >
          <Rect
            height={60}
            size={() => [(passed() / total) * 800, 60]}
            radius={30}
            fill={
              new Gradient({
                from: Vector2.down.mul(50),
                to: Vector2.up.mul(50),
                stops: [
                  { offset: 0, color: "#b8ffb8" },
                  { offset: 1, color: "#6adc6a" },
                ],
              })
            }
          />
        </Rect>

        {/* Combined Bar */}
        <Rect
          scale={() => bar3()}
          opacity={() => bar3()}
          width={800}
          height={60}
          radius={30}
          fill="#eeeeee"
          shadowBlur={12}
        >
          <Rect
            height={60}
            size={() => [(failed() / total) * 800, 60]}
            radius={[30, 0, 0, 30]}
            fill={
              new Gradient({
                from: Vector2.down.mul(50),
                to: Vector2.up.mul(50),
                stops: [
                  { offset: 0, color: "#ffb5b5" },
                  { offset: 1, color: "#ff4d4d" },
                ],
              })
            }
          />
          <Rect
            height={60}
            position={() => [(failed() / total) * 800, 0]}
            size={() => [(passed() / total) * 800, 60]}
            radius={[0, 30, 30, 0]}
            fill={
              new Gradient({
                from: Vector2.down.mul(50),
                to: Vector2.up.mul(50),
                stops: [
                  { offset: 0, color: "#c8ffc8" },
                  { offset: 1, color: "#6adc6a" },
                ],
              })
            }
          />
        </Rect>
      </Rect>
    </Rect>
  );
  view.add(bars);

  // Animate in sequence
  yield question.text("", 1);
  yield* sequence(
    0.15,
    failLabel(1, 0.5, easeOutBack),
    passLabel(1, 0.5, easeOutBack),
    bar1(1, 0.5, easeOutBack),
    bar2(1, 0.5, easeOutBack),
    bar3(1, 0.5, easeOutBack)
  );
  yield all(
    camera().lookTo(new Vector3(0.45, 0.5, 0), 2.2, easeInOutSine),
    bars.scale(0.5, 1),
    bars.position([450, 400], 1),
    overlay.scale(0, 1),
    overlay.position([700, 600], 1)
  );
  const end = 7;
  for (let i = 0; i < end; i++) {
    const value = i == end-1 ? 19 : generator.nextInt(1, total);
    yield* failed(value, 0.5);

    const failedIndices = pickRandomIndices(total, value);
    const passedIndices = range(total).filter(
      (i) => !failedIndices.includes(i)
    );

    yield* all(
      ...failedIndices.map((i) => highlightDesk(i, "#ff4d4d")),
      ...passedIndices.map((i) => highlightDesk(i, "#6adc6a"))
    );

    yield* waitFor(0.5); // optional pause between transitions
  }
  yield revertAllExcept([], allIndices),
    yield* all(
      bars.opacity(0, 0.4, easeInCirc),
      bars.scale(0.2, 0.4, easeInCirc),
      data.restore(1),
      data.position([500, 450], 1)
    );
  const failedSoFar = new Set<number>();

  function getNewFailures(previous: Set<number>, totalFails: number): number[] {
    const needed = totalFails - previous.size;
    const available = range(total).filter((i) => !previous.has(i));
    const chosen = pickRandomIndices(available.length, needed).map(
      (i) => available[i]
    );
    chosen.forEach((i) => previous.add(i));
    return chosen;
  }

  yield* all(
    sequence(
      0.3,
      sequence(
        0.2,
        ...data
          .children()
          .flatMap((child) =>
            child
              .children()
              .map((child2) =>
                child2 instanceof Txt && !isNaN(Number(child2.text()))
                  ? child2.rotation(360, 0.6, easeInOutExpo)
                  : null
              )
          )
      ),
      sequence(
        0.2,
        ...data.children().flatMap((child) =>
          child.children().map((child2, i) =>
            child2 instanceof Txt && !isNaN(Number(child2.text()))
              ? all(
                  child2.text(`-${total - Number(child2.text())}`, 0.2),
                  child
                    .y(child.y() - 30, 0.5, easeOutBack)
                    .back(0.5, easeInOutBack),
                  run(function* () {
                    const fails = getNewFailures(
                      failedSoFar,
                      total - Number(child2.text()) + failedSoFar.size
                    );
                    yield* sequence(
                      0.07,
                      ...fails.map((i) => highlightDesk(i, "#ff4d4d"))
                    );
                  })
                )
              : null
          )
        )
      )
    )
  );
  yield* waitFor(0.6);
  yield all(
    ...data
      .children()
      .map((child) =>
        all(
          child.position([-500, 0], 0.4, easeInExpo),
          child.scale(0.5, 0.4, easeInExpo),
        )
      )
  );
  const totalRef = createRef<Glass>();
  const totalIcon = createRef<Icon>();
  const totalTxt = createRef<PTxt>();

  const totalCard = (
    <Glass
      ref={totalRef}
      height={110}
      width={420}
      position={[-500, 0]} // offscreen right
      translucency={0.6}
      lightness={-0.1}
      scale={[0.5, 0]}
      fill={"#6e602b22"} // gold tone
    >
      <PTxt
        fill={"#fae281ff"}
        fontSize={70}
        right={[-140, 0]}
        shadowColor={"#ffd96688"}
        shadowBlur={8}
      >
        19
      </PTxt>
      <PTxt
        ref={totalTxt}
        fill={"#fff1b8"}
        fontSize={60}
        left={[50, 0]}
        shadowColor={"#ffd96688"}
        shadowBlur={8}
      >
        max fails
      </PTxt>
    </Glass>
  );
  data.add(totalCard);
  yield* waitFor(0.3);
  yield* all(
    totalRef().position([-500, 0], 0.8, easeOutBack),
    totalRef().scale(1, 0.8, easeOutBack)
  );
  
  yield* waitUntil("final");
  
  const classmate = classmates[classmates.length - 1];
  yield* all(
    highlightDesk(classmates.length - 1, "rgba(93, 250, 88, 1)"),
    data.y(600, .4, easeInCubic),
    camera().lookTo(
      classmate.localPosition().clone().add(new Vector3(0, 0.6, 0)),
      1
    ),
    camera().zoomIn(2, 1)
  );

  yield* waitUntil("next");
});
