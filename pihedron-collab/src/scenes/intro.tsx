import {
  blur,
  Circle,
  Gradient,
  GradientStop,
  Img,
  Latex,
  Layout,
  makeScene2D,
  Node,
  Polygon,
  Ray,
  Rect,
  Txt,
  View2D,
} from "@motion-canvas/2d";
import palette, { algebraPalette } from "../config/palette";
import {
  all,
  any,
  chain,
  Color,
  createRef,
  createRefArray,
  createSignal,
  delay,
  easeInCubic,
  easeInOutBack,
  easeInOutCirc,
  easeInOutQuad,
  easeInOutQuint,
  easeOutBack,
  easeOutCubic,
  easeOutQuint,
  linear,
  loop,
  range,
  run,
  sequence,
  tween,
  useRandom,
  Vector2,
  waitFor,
  waitUntil,
} from "@motion-canvas/core";
import concrete_texture from "../images/plastered_stone_wall_diff_8k.png";
import { Eqn } from "../components/distortion-scene/Eqn";
import { ShaderBackground } from "../components/gen/background";
import { getScene } from "../components/gen/presets";
import { Vector3 } from "three";
import Line from "../libs/Thrash/objects/Line";
import Camera from "../libs/Thrash/Camera";
import Grid from "../libs/Thrash/objects/Grid";
import { NumberTicker } from "../components/intro-scene/ticker";
import { Glass } from "../components/gen/Glass";

const equations = [
  "y = \\sin(x + \\alpha)",
  "f(x) = x^2 + \\alpha x + 1",
  "x^2 + y^2 = r^2",
  "\\alpha = \\frac{\\Delta y}{\\Delta x}",
  "y = e^{\\alpha x}",
  "\\int_{0}^{\\alpha} x^2 \\, dx",
  "\\sum_{n=0}^{\\infty} \\frac{x^n}{n!}",
  "\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0}",
  "\\frac{d}{dx} \\left( x^2 \\sin x \\right)",
  "y = \\log_{\\alpha}(x)",
  "\\lim_{x \\to \\infty} \\frac{1}{x} = 0",
  "\\det(A - \\lambda I) = 0",
  "x = r\\cos(\\theta),\\; y = r\\sin(\\theta)",
  "\\forall \\epsilon > 0,\\; \\exists \\delta > 0",
  "P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}",
  "a_n = a_{n-1} + d",
  "f'(x) = \\lim_{h\\to0} \\frac{f(x+h)-f(x)}{h}",
  "\\oint_C \\vec{F} \\cdot d\\vec{r} = 0",
  "\\left( \\sum_{i=1}^{n} x_i^2 \\right)^{1/2}",
  "\\vec{a} \\times \\vec{b} = |a||b|\\sin\\",
];

const SPIRAL_AMMOUNT = 12; // SWTICH BACK TO 12 !!
function* spiralScrollEffect(view: Node) {
  const SPIRAL_INCREASE = createSignal(230);
  const SPIRAL_START = createSignal(200);
  const ACTVIATE_LATEX = createSignal(0);
  const texCount = 8;
  const generator = useRandom(777);

  const spirals = range(SPIRAL_AMMOUNT).map((i) => {
    const stopCount = generator.nextInt(2, 3);
    var stops: GradientStop[] = [];

    for (let k = 0; k < stopCount; k++) {
      const offset = generator.nextFloat(0, 1);

      const isHighlight = false; //generator.nextFloat() < 0.5; DISABLE HIGHLIGHTS
      const baseColor = new Color(
        ["#1e1e1e", "#2a2a2a", "#333333", "#3a3a3a", "#444444"][
          generator.nextInt(0, 5)
        ]
      );

      stops.push({ offset, color: baseColor });
      stops = stops.map((stop) => ({
        offset: stop.offset,
        color:
          i > 0
            ? (stop.color as Color).darken((i / SPIRAL_AMMOUNT) * 3).darken(1)
            : "#000",
      }));

      if (isHighlight) {
        const highlightColor = new Color(
          ["#bbbbbb", "#eeeeee", "#ffcc88"][generator.nextInt(0, 3)]
        );
        const tinyOffset = offset + 0.005 + generator.nextFloat(0, 0.003); // ultra narrow highlight band

        // Add spike highlight right after base stop
        stops.push({ offset: Math.min(tinyOffset, 1), color: highlightColor });

        // Optional: fade back to base immediately
        const fadeOffset = tinyOffset + 0.005;
        if (fadeOffset < 1) {
          stops.push({ offset: fadeOffset, color: baseColor });
        }
      }
    }

    // Ensure smooth loop
    stops.push({
      offset: 1,
      color: stops[0].color,
    });

    return (
      <Circle
        zIndex={SPIRAL_AMMOUNT - i}
        rotation={i * 90}
        size={() => SPIRAL_START() + i * SPIRAL_INCREASE()}
        fill={() =>
          new Gradient({
            type: "conic",
            from: 0,
            to: SPIRAL_START() + i * SPIRAL_INCREASE(),
            stops,
          })
        }
      >
        <Circle
          size={() => SPIRAL_START() + i * SPIRAL_INCREASE()}
          clip
          layout
          opacity={0.3}
        >
          <Img
            src={concrete_texture}
            size={"100%"}
            skew={[-4, 0]}
            opacity={0.6}
          />
        </Circle>
      </Circle>
    );
  });

  spirals.forEach((spiral) => view.add(spiral));

  spirals.forEach((spiral, i) => {
    const radius = SPIRAL_START() - 50 + i * SPIRAL_INCREASE() * 0.5;
    const texCount = 7; // number of texes per circle

    for (let j = 0; j < texCount; j++) {
      const angle = (Math.PI * 2 * j) / texCount;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const saved_float = createSignal(generator.nextFloat(0.4, 0.9));

      const tex = (
        <Latex
          tex={
            equations[Math.floor(generator.nextFloat(0, 1) * equations.length)]
          }
          position={[x, y]}
          fontSize={32}
          rotation={(angle * 180) / Math.PI + 90 + generator.nextInt(-5, 5)}
          zIndex={100 + i}
          skew={[-generator.nextInt(-30, 30), 0]}
          shadowBlur={() => ACTVIATE_LATEX() * 30}
          shadowColor={"#ff9d00"}
          opacity={() => Math.min(saved_float() + ACTVIATE_LATEX(), 1)}
          fill={() =>
            new Gradient({
              type: "linear",
              from: [0, -20],
              to: [0, 20],
              stops: [
                {
                  offset: 0,
                  color: new Color("#aaaaaa").lerp("#fff", ACTVIATE_LATEX()),
                },
                { offset: 0.5, color: new Color("#ffffff") },
                {
                  offset: 1,
                  color: new Color("#aaaaaa").lerp("#fff", ACTVIATE_LATEX()),
                },
              ],
            })
          }
        />
      );
      spiral.add(tex);
    }
  });

  yield all(view.rotation(360, 6), view.scale(20.4, 6.2, easeInOutQuint));
  yield* waitFor(1);
  yield all(SPIRAL_INCREASE(100, 6, easeOutCubic), ACTVIATE_LATEX(1, 0.5));
}

function parseSteps(chain: string[], stepIndex: number): string {
  return chain.slice(0, stepIndex + 1).join("  \\, ");
}

const chains: string[][] = [
  [
    "\\vec{F} = m \\vec{a},\\; m = 2,\\; \\vec{a} = \\langle 3, 4 \\rangle",
    "\\vec{F} = 2 \\cdot \\langle 3, 4 \\rangle = \\langle 6, 8 \\rangle",
    "|\\vec{F}| = \\sqrt{6^2 + 8^2} = 10",
  ],
  [
    "s(t) = \\frac{1}{2}at^2,\\; a = 9.8",
    "s(3) = 4.9 \\cdot 9 = 44.1",
    "v(t) = at \\Rightarrow v(3) = 29.4",
  ],
  [
    "f(x) = x^2 + \\alpha x + 1",
    "\\alpha = \\frac{4}{3},\\; f'(x) = 2x + \\frac{4}{3}",
    "f'(x) = 0 \\Rightarrow x = -\\frac{2}{3}",
  ],
  [
    "r = 2,\\; \\theta = \\frac{\\pi}{3}",
    "x = 2\\cos\\theta = 1,\\; y = 2\\sin\\theta = \\sqrt{3}",
    "r^2 = x^2 + y^2 = 4",
  ],
  [
    "y = e^{2x},\\; \\frac{dy}{dx} = 2e^{2x}",
    "\\int_0^1 e^{2x}dx = \\frac{1}{2}(e^2 - 1)",
    "\\lim_{x\\to -\\infty} e^{2x} = 0",
  ],
];

function* LtxPath(container: Node) {
  const ltxs = createRefArray<Latex>();
  const ltx = createRef<Latex>();
  const all_ltxs: () => Latex[] = () => [...ltxs, ltx()];
  const generator = useRandom();

  const ltx_container = (
    <Node>
      <>
        <Layout layout direction="row" y={-576}>
          <Latex
            fontSize={24}
            tex={parseSteps(chains[0], 0)}
            fill={"#ececec"}
            ref={ltxs}
          />
        </Layout>
        <Layout layout direction="row" y={-432}>
          <Latex
            fontSize={28}
            tex={parseSteps(chains[1], 0)}
            fill={"#ececec"}
            ref={ltxs}
          />
        </Layout>
        <Layout layout direction="row" y={-288}>
          <Latex
            fontSize={34}
            tex={parseSteps(chains[2], 0)}
            fill={"#ececec"}
            ref={ltxs}
          />
        </Layout>
        <Layout layout direction="row" y={-144}>
          <Latex
            fontSize={48}
            tex={parseSteps(chains[3], 0)}
            fill={"#ececec"}
            ref={ltxs}
          />
        </Layout>
        <Layout layout direction="row" y={0}>
          <Latex
            fontSize={100}
            tex={parseSteps(chains[4], 0)}
            fill={"#ececec"}
            ref={ltx}
          />
        </Layout>
        <Layout layout direction="row" y={144}>
          <Latex
            fontSize={48}
            tex={parseSteps(chains[0], 0)}
            fill={"#ececec"}
            ref={ltxs}
          />
        </Layout>
        <Layout layout direction="row" y={288}>
          <Latex
            fontSize={34}
            tex={parseSteps(chains[1], 0)}
            fill={"#ececec"}
            ref={ltxs}
          />
        </Layout>
        <Layout layout direction="row" y={432}>
          <Latex
            fontSize={28}
            tex={parseSteps(chains[2], 0)}
            fill={"#ececec"}
            ref={ltxs}
          />
        </Layout>
        <Layout layout direction="row" y={576}>
          <Latex
            fontSize={24}
            tex={parseSteps(chains[3], 0)}
            fill={"#ececec"}
            ref={ltxs}
          />
        </Layout>
      </>
    </Node>
  );

  const background = <Rect size={"100%"}>{ltx_container}</Rect>;
  const overlay = (
    <Circle clip size={300} opacity={0}>
      {background}
      <ShaderBackground
        zIndex={-1}
        opacity={0.5}
        preset="sunset"
        size={() => overlay.size().mul(2)}
        position={() => overlay.position()}
      />
    </Circle>
  ) as Circle;
  container.add(overlay);

  const scale = createSignal(150);
  const fns = [
    (x: number) => Math.sin(x) + 3,
    (x: number) => Math.abs(x / 10) - 1 - 3, // V-shape
    (x: number) => Math.cos(x) + 2,
    (x: number) => Math.sin(x) * Math.exp((-x * x) / 16), // Damped wave
    (x: number) => Math.tan(x) / 3 - 4,
    (x: number) => (x * x) / 100 - 2,
    (x: number) => Math.sign(x) + 5, // Step function
    (x: number) => (1 / (1 + x * x)) * 5 + 2, // Lorentzian
    (x: number) => Math.atan(x) * 3 + 3,
    (x: number) => Math.exp((-x * x) / 4) * 2 - 4, // Gaussian bump
  ];

  const strokes = [
    palette.secondary,
    palette.accent,
    palette.primary,
    palette.success,
    palette.highlight,
    palette.border,
    palette.text,
    palette.warning,
    palette.secondary,
    palette.accent,
  ];
  const eqns = fns.map(
    (fn, i) =>
      (
        <Eqn
          func={fn}
          unitSize={scale}
          stroke={strokes[i]}
          opacity={0.2}
          showGrid={i == 4}
          resolution={100}
        />
      ) as Eqn
  );

  for (const e of eqns) overlay.add(e);

  yield ltx_container.scale(2, 25, linear);
  yield all(sequence(1, ...eqns.map((e) => e.pop())));

  yield* waitFor(1);

  // movement
  yield loop(5, (stepn) =>
    all(
      ...all_ltxs().map((ltx, i) =>
        all(
          run(function* () {
            const child = (
              <Latex
                tex={parseSteps(chains[i % chains.length], stepn)}
                fontSize={0}
                fill={ltx.fill()}
              />
            ) as Latex;
            if (ltx.parent()) {
              ltx.parent().add(child);
              yield* all(
                child.fontSize(ltx.fontSize(), 1, easeInOutCirc),
                overlay.scale(generator.nextFloat(1.3, 2), 1),
                overlay.position(
                  new Vector2(
                    generator.nextInt(-200, 200) + 100,
                    generator.nextInt(-200, 200)
                  ),
                  1
                )
              );
            }
            yield* waitFor(0.6);
          })
        )
      )
    )
  );
  yield* sequence(0.2, overlay.opacity(1, 0.4), overlay.size(3500, 1));

  yield* waitUntil("change");
  yield all(container.scale(20, 8, easeInCubic));
}

function* GraphScene(container: Node) {
  const overlay = <Rect fill={"black"} size={"100%"} opacity={0} />;
  const scene = getScene(new Vector3(5, 8, 5));
  const camera = scene.findFirst((child) => child instanceof Camera) as Camera;
  container.add(overlay);
  overlay.add(scene);
  const points = range(41).map((i) => {
    const t = (i - 20) / 20; // from -1 to 1
    const x = t * 10; // -5 to 5 range
    const z = (x * x) / 5; // quadratic shape, opens upwards
    return new Vector3(x, -0.3, z);
  });
  const newpoints = range(41).map((i) => {
    const t = (i - 20) / 40; // -1 to 1
    const x = t * 10; // -5 to 5
    const baseZ = (x * x) / 5;
    const lift = Math.exp(-(x * x) / 20) * 20; // bell lift near 0
    const z = baseZ - lift;
    return new Vector3(x, lift - 5, baseZ);
  });
  const grid = (
    <Grid
      localPosition={new Vector3(0, -0.2, 0)}
      size={29.5}
      divisions={20}
      alpha={0.4}
    />
  ) as Grid;
  const line = (
    <Line points={points} color={"busData"} smooth lineWidth={12} />
  ) as Line;
  scene.add(grid);
  scene.add(line);
  scene.init();
  const formula = () =>
    `\\lim_{n \\to \\phantom{n}}\\;\\phantom{n} \\sin \\left( \\frac{\\pi}{\\phantom{n}} \\right) = \\phantom{\\pi}`;

  const tick1 = createRef<NumberTicker>();
  const tick2 = createRef<NumberTicker>();
  const tick3 = createRef<NumberTicker>();
  const tick4 = createRef<NumberTicker>();

  const tex = (
    <Latex
      tex={formula}
      fill={"white"}
      width={1200}
      opacity={0.1}
      y={-2000}
      shadowBlur={3}
      shadowColor={"#fffa"}
      filters={[blur(240)]}
    />
  );
  container.add(
    <Node y={() => tex.y()} zIndex={4}>
      <NumberTicker
        opacity={0}
        ref={tick1}
        x={-340}
        y={90}
        maxValue={100}
        scale={3.5}
      />
      <NumberTicker
        opacity={0}
        ref={tick2}
        x={-280}
        y={0}
        maxValue={100}
        scale={4}
      />
      <NumberTicker
        opacity={0}
        ref={tick3}
        x={190}
        y={70}
        maxValue={100}
        scale={3.5}
      />
      <NumberTicker
        opacity={0}
        ref={tick3}
        x={190}
        y={70}
        maxValue={100}
        scale={3.5}
      />
      <NumberTicker
        opacity={0}
        ref={tick4}
        x={600}
        y={0}
        maxValue={Math.PI}
        scale={3.5}
        decimal
        endSymbol={"\\pi"}
      />
    </Node>
  );
  const shader = (
    <ShaderBackground
      opacity={0.2}
      preset="sunset"
      position={() => overlay.position()}
    />
  );
  container.add(shader);
  container.add(tex);

  const piEquations = [
    "e^{i\\pi} + 1 = 0",
    "\\int_{0}^{2\\pi} \\sin(x)\\,dx = 0",
    "y = \\sin(\\pi x) + \\frac{\\sin(2\\pi x)}{2}",
    "\\phi = \\frac{1+\\sqrt{5}}{2},\\; \\pi \\approx \\phi^2 + 1",
    "\\lim_{x\\to 0} \\frac{\\sin(\\pi x)}{x} = \\pi",
    "x = r\\cos(\\theta),\\; y = r\\sin(\\theta)",
    "\\int_{-\\pi}^{\\pi} \\cos(nx)\\,dx = 0",
    "f(x) = \\frac{\\sin(\\pi x)}{\\pi x}",
    "r = 1 + \\sin(6\\theta)",
    "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}",
    "\\pi = 4 \\sum_{n=0}^{\\infty} \\frac{(-1)^n}{2n+1}",
    "\\int_0^1 \\frac{4}{1 + x^2}\\,dx = \\pi",
    "\\lim_{n \\to \\infty} n \\sin\\left(\\frac{\\pi}{n}\\right) = \\pi",
    "\\int_{-\\infty}^{\\infty} e^{-x^2}dx = \\sqrt{\\pi}",
    "\\frac{d}{dx} \\sin(\\pi x) = \\pi \\cos(\\pi x)",
    "\\det(A - \\lambda I) = 0",
    "\\oint_C \\vec{F} \\cdot d\\vec{r} = 0",
    "x = \\pi \\cdot t",
    "\\vec{a} \\cdot \\vec{b} = |a||b|\\cos\\theta",
    "\\forall \\epsilon > 0,\\; \\exists \\delta > 0",
  ];
  const generator = useRandom(777);
  const RADIUS = 750;
  const RINGS = 6;
  const ELEMENTS_PER_RING = 17;
  const BASE_RADIUS = RADIUS / 2;
  const circleCount = generator.nextInt(30, 100);
  const totalRings = 3;
  const maxRingRadius = BASE_RADIUS + (totalRings - 1) * 450;

  const radiuses: number[] = [];
  const allLatexElements = [];

  for (let ring = 0; ring < RINGS; ring++) {
    const radius = BASE_RADIUS + ring * 450;
    radiuses.push(radius);
    for (let i = 0; i < ELEMENTS_PER_RING; i++) {
      const angle = generator.nextFloat(0, Math.PI * 2);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const eq = piEquations[generator.nextInt(0, piEquations.length)];
      const size = generator.nextInt(30, 60);

      allLatexElements.push(
        <Latex
          tex={eq}
          x={x}
          y={y}
          fontSize={size}
          rotation={(angle * 180) / Math.PI + 90}
          fill={"white"}
          shadowBlur={10}
          shadowColor={"#f005"}
          opacity={0.6}
        />
      );
    }
  }
  const allCircles = range(circleCount).map(() => {
    const angle = generator.nextFloat(0, Math.PI * 2);
    const radius = generator.nextFloat(BASE_RADIUS * 0.6, maxRingRadius * 2.1);
    const x = Math.cos(angle) * radius + generator.nextFloat(-60, 60);
    const y = Math.sin(angle) * radius + generator.nextFloat(-60, 60);
    const size = generator.nextInt(80, 620);
    const hasRay = generator.nextFloat() < 0.35; // ~35% au rază

    const rayLength = size / 2;
    const rayAngle = generator.nextFloat(0, Math.PI * 2);
    const from = new Vector2(0, 0);
    const to = new Vector2(Math.cos(rayAngle), Math.sin(rayAngle)).mul(
      rayLength
    );
    const line = hasRay ? (
      <Ray
        from={from}
        to={to}
        stroke={"#ffffff33"}
        lineWidth={1.5}
        shadowBlur={4}
        endArrow
        arrowSize={15}
        shadowColor={"#ffffff33"}
      />
    ) : null;

    return (
      <Circle
        x={x}
        y={y}
        size={size}
        fill={"#ffffff10"}
        stroke={"#ffffff22"}
        lineWidth={1.5}
        shadowBlur={6}
        shadowColor={"#ffffff08"}
        opacity={0.4}
        scale={0.3}
      >
        {line}
      </Circle>
    );
  });

  const elements_container = createRef<Node>();
  const glass = (
    <Rect size={"100%"} scale={0} opacity={0} zIndex={100} clip />
  ) as Glass;

  const polygon = createRef<Polygon>();
  const dimension = (
    <Rect size={"100%"}>
      <Polygon
        ref={polygon}
        fill={"rgba(255, 44, 44, 0.2)"}
        y={200}
        stroke={"rgba(255, 0, 0, 1)"}
        lineWidth={10}
        radius={33}
        size={350}
        sides={3}
        clip
      >
        <Node ref={elements_container} opacity={0}>
          {allLatexElements} {allCircles}
        </Node>
      </Polygon>
      {/* <Txt
        text={() => `Number of sides: `}
        fontFamily={"Poppins"}
        fontWeight={200}
        fill={"white"}
        x={250}
        y={180}
      /> */}
    </Rect>
  ) as Rect;
  glass.add(dimension);
  container.add(glass);

  yield camera.zoomOut(0.5, 1);
  yield all(camera.moveAt(new Vector3(0, 8, -6), 4));
  yield all(overlay.opacity(1, 5));
  yield* waitFor(2.5);
  yield all(camera.lookUp(160, 10), line.updatePoints(newpoints, 4));
  yield* waitFor(1.3);
  yield all(tex.y(-150, 3), tex.opacity(1, 2));
  yield* waitFor(1);
  yield container.scale(1.2, 5);
  yield* all(
    tex.filters([blur(0)], 2),
    delay(
      2,
      all(
        tick1().opacity(1, 1),
        tick2().opacity(1, 1),
        tick3().opacity(1, 1),
        tick4().opacity(1, 1),
        glass.opacity(1, 0.5, easeOutCubic),
        glass.scale(1, 0.5, easeOutCubic),
        delay(1, all(polygon().sides(100, 4), dimension.fill("#0002", 1)))
      )
    ),
    delay(
      3,
      all(tick1().tick(), tick4().tick(), tick2().tick(), tick3().tick())
    )
  );
  yield* waitFor(1);
  yield polygon().rotation(360, 6, easeInCubic);
  yield* all(
    polygon().size(1500, 1),
    tex.y(0, 1),
    polygon().y(0, 1),
    elements_container().opacity(1, 0.6, easeOutCubic),
    ...[tex, tick4(), tick1(), tick2(), tick3()].map((el) =>
      all(el.filters([blur(50)], 1), el.opacity(0, 1, easeOutCubic))
    )
  );
  yield all(
    sequence(0.1, ...allCircles.map((circle) => circle.scale(1, 1))),
    polygon().size(2000, 1.2),
    elements_container().scale(0.2, 5),
    polygon().shadowBlur(100, 1),
    polygon().shadowColor("#f005", 1),
  );
  yield* waitFor(4);
  yield* all(
    polygon().size(0, 3, easeOutBack),
    polygon().shadowBlur(0, 4),
    polygon().shadowColor("#f005", 4),
  );
}

export default makeScene2D(function* (view) {
  view.fill("#040404");

  yield* waitUntil("start");
  const spiral_cointainer = <Node />;
  view.add(spiral_cointainer);
  yield* spiralScrollEffect(spiral_cointainer);

  const latex_container = <Node />;
  view.add(latex_container);
  yield delay(3, () => spiral_cointainer.remove());
  yield* LtxPath(latex_container);

  const graph_container = <Node />;
  view.add(graph_container);
  yield delay(3, () => latex_container.remove());
  yield* GraphScene(graph_container);

  yield* waitUntil("next");
});
