import {
  Circle,
  Gradient,
  Grid,
  Latex,
  Layout,
  Line,
  makeScene2D,
  Node,
  Rect,
  View2D,
} from "@motion-canvas/2d";
import {
  all,
  chain,
  createRef,
  createSignal,
  DEFAULT,
  delay,
  easeInBack,
  easeInCubic,
  easeInElastic,
  easeInExpo,
  easeInOutBack,
  easeInOutElastic,
  easeOutBack,
  easeOutCubic,
  easeOutElastic,
  easeOutExpo,
  sequence,
  waitFor,
  waitUntil,
} from "@motion-canvas/core";
import palette, { algebraPalette } from "../config/palette";
import { Eqn } from "../components/distortion-scene/Eqn";
import { Lvl } from "../components/gen/Lvl";
import { math } from "../components/gen/Pitex";
import { PTxt } from "../components/gen/Ptxt";
import { ShaderBackground } from "../components/gen/background";

function createTask(text: string, color: string) {
  return (<PTxt fontSize={0} fill={color} opacity={0} text={text} />) as PTxt;
}

function* startIntroScene(view: View2D) {
  const scale = createSignal(150);
  const container = <Node />;
  view.add(container);

  const fns = [
    (x: number) => Math.sin(x),
    (x: number) => Math.cos(x),
    (x: number) => Math.cos(2 * x) / 3,
    (x: number) => (x * x) / 100 - 2,
    (x: number) => Math.atan(x) * 3,
    (x: number) => Math.exp((-x * x) / 4) * 2, // Gaussian bump
  ];

  const strokes = [
    palette.secondary,
    palette.accent,
    palette.primary,
    palette.success,
    palette.highlight,
    palette.border,
  ];

  const eqns = fns.map(
    (fn, i) =>
      (
        <Eqn
          func={fn}
          unitSize={scale}
          stroke={strokes[i]}
          showGrid={i === 4}
        />
      ) as Eqn
  );

  for (const e of eqns) container.add(e);

  const level = (
    <Lvl levelName="Problem" level={3} palette={algebraPalette} scale={0} />
  ) as Lvl;
  const overlay = (<Circle fill={algebraPalette.gradient} />) as Circle;
  view.add(overlay);
  view.add(level);

  yield* all(
    sequence(0.25, ...eqns.map((e) => e.pop())),
    container.scale(2, 5, easeInCubic)
  );

  yield sequence(
    0.4,
    level.scale(1, 0.5, easeOutBack),
    all(overlay.size(3000, 0.5, easeInExpo)),
    level.extendBadge(),
    delay(0, () => eqns.forEach((eq) => eq.remove()))
  );
  yield* waitFor(0.5);
}

// 🎬 Main Scene – show target function
function* startMainScene(view: View2D) {
  const group = <Node />;
  view.add(group);
  const scale = createSignal(100);
  const f = (
    <Eqn
      y={100}
      func={(x) => {
        const c = Math.cos(x);
        return c <= 0 ? c : 999999;
      }}
      stroke={algebraPalette.primary}
      unitSize={scale}
      resolution={50}
      opacity={0}
    />
  ) as Eqn;
  const tex = (
    <Latex
      scale={[0.5, 0]}
      opacity={0}
      height={100}
      y={350}
      tex={math("cos(x) = min(y,0)")}
      fill={algebraPalette.primary}
    />
  );
  group.add(f);
  group.add(tex);

  const taskList = createRef<Layout>();
  const taskLayout = (
    <Layout layout direction="column" gap={40} ref={taskList} y={300} />
  );
  group.add(<>{taskLayout}</>);

  // Add tasks to the layout
  const tasks: PTxt[] = [
    createTask("1. Reflect across x-axis", "#eee"),
    createTask("2. Translate up", "#eee"),
    createTask("3. Stretch horizontally", "#eee"),
  ];
  for (const t of tasks) taskLayout.add(t);

  yield all(f.pop(true, 0), f.opacity(1, 1));
  yield* waitUntil("equation");
  yield* all(
    tex.scale(1, 0.33, easeOutCubic),
    tex.opacity(1, 0.33, easeOutCubic)
  );

  yield* waitUntil("reflection");
  yield* all(
    tex.y(2000, 1),
    tasks[0].opacity(1, 1),
    tasks[0].fontSize(64, 1),
    taskLayout.y(-300, 1)
  );
  yield* all(f.scale([1, -1], 1));
  yield* waitUntil("translate");
  yield* all(f.y(-50, 1), tasks[1].opacity(1, 1), tasks[1].fontSize(64, 1));
  yield* waitUntil("strech");
  yield* all(
    f.scale([2, -1], 2, easeInOutBack),
    tasks[2].opacity(1, 1),
    tasks[2].fontSize(64, 1)
  );

  yield* waitUntil("change");

  const bgr = (<ShaderBackground opacity={0} />) as ShaderBackground;
  view.add(bgr);
  yield* sequence(
    0.4,
    group.y(-1100, 0.6, easeInExpo),
    all(bgr.opacity(0.5, 0.5, easeOutCubic), f.opacity(0, 0.7))
  );

  const finalLayout = (
    <Layout layout direction="row" alignItems={"center"} gap={40} />
  );
  view.add(finalLayout);

  const parts = [
    <Latex
      tex={math("\\cos")}
      fill="rgba(255, 73, 73, 1)" // cyan deschis
      shadowBlur={30}
      shadowColor={"rgba(255, 73, 73, 1)"}
      opacity={0}
      height={0}
      offsetX={1}
      offsetY={0.5}
    />,
    <Latex
      tex={math("\\left(x\\right)")}
      fill="#fff"
      opacity={0}
      height={0}
      scale={1.2}
    />,
    <Latex
      tex={math("=")}
      fill="#fff" // neutru
      opacity={0}
      height={0}
    />,
    <Latex
      tex={math("min")}
      opacity={0}
      fill={"rgba(245, 217, 57, 1)"}
      shadowBlur={20}
      shadowColor={"rgba(245, 217, 57, 1)"}
      height={0}
    />,
    <Latex
      height={0}
      tex={"\\left(y,0\\right)"}
      fill="#fff"
      opacity={0}
      scale={1.2}
    />,
  ] as Latex[];

  parts.forEach((p) => finalLayout.add(p));

  yield* sequence(
    0.2,

    // ✴️ Highlight COS
    chain(
      all(parts[0].opacity(1, 0.3), parts[0].height(80, 0.3)),
      parts[0].scale(1.2, 0.5, easeOutCubic),
      parts[0].scale(0.75, 0.5, easeInCubic)
    ),

    all(parts[1].opacity(1, 0.4), parts[1].height(80, 0.4)),

    all(parts[2].opacity(1, 0.4), parts[2].height(80, 0.4)),

    // ✴️ Highlight MIN
    chain(
      all(parts[3].opacity(1, 0.3), parts[3].height(80, 0.3)),
      parts[3].scale(1.2, 0.5, easeOutCubic),
      parts[3].scale(1, 0.5, easeInCubic)
    ),

    all(parts[4].opacity(1, 0.4), parts[4].height(80, 0.4))
  );
  yield* sequence(
    0.1,
    ...parts.map((part) => all(part.fill("#fff", 1), part.shadowBlur(0, 0.5)))
  );

  yield* waitUntil("explain");
  yield* sequence(
    0.1,
    ...parts.map((part) => all(part.opacity(0, 0.33, easeInCubic)))
  );
}

function* startDistortionExplanation(view: View2D) {
  const axisLines = <Node />;

  const aValue = createSignal(1);
  const f = (
    <Eqn
      func={(x) => {
        const c = Math.cos(x);
        return c <= 0 ? c : 99999;
      }}
      stroke={algebraPalette.primary}
      unitSize={50}
      resolution={150}
      scale={2}
      opacity={0}
    />
  ) as Eqn;
  view.add(f);

  const example_f = (
    <Eqn
      func={(x) => {
        return x * x * aValue() - 1;
      }}
      opacity={0}
      stroke={algebraPalette.primary}
      unitSize={120}
      resolution={150}
      scale={() => [2, 2 / aValue()]}
    />
  ) as Eqn;
  const example_f_ghost = (
    <Eqn
      func={(x) => {
        return x * x * aValue() - 1;
      }}
      opacity={0}
      stroke={"rgba(255, 232, 27, 1)"}
      unitSize={120}
      shadowBlur={20}
      shadowColor={"rgba(255, 232, 27, 1)"}
      resolution={150}
      scale={[1 * aValue(), 1]}
      showGrid={false}
    />
  ) as Eqn;
  const example_eqn = (
    <Latex tex={"y=ax^2"} fill="#fff" opacity={0} y={300} fontSize={64} />
  ) as Latex;
  const example_bar = (
    <Layout
      layout
      width={600}
      height={50}
      y={400}
      opacity={0}
      scale={[0.5, 0]}
      alignItems={"center"}
      alignContent={"center"}
      gap={20}
    >
      <Latex tex={"a"} fill={"#fff"} />
      <Rect
        grow={1}
        stroke={"white"}
        lineWidth={3}
        radius={1000}
        height={"100%"}
        layout
        padding={6}
      >
        <Rect
          width={() => `${Math.round((aValue() / 2.5) * 100)}%`}
          height={"100%"}
          fill={"#fff"}
          radius={1000}
        />
      </Rect>
    </Layout>
  ) as Rect;
  view.add(example_eqn);
  view.add(example_bar);
  view.add(example_f_ghost);
  view.add(example_f);
  yield example_f_ghost.pop(true, 0);

  const eqn = (
    <Latex
      tex={"min(y,0) = cos(x)"}
      fill="#fff"
      opacity={0}
      y={300}
      fontSize={64}
    />
  ) as Latex;
  view.add(eqn);
  yield* sequence(
    0.5,
    all(example_eqn.opacity(1, 0.6)),
    example_f.pop(true, 0),
    example_f.opacity(1, 1)
  );

  const yLines: Line[] = [];
  for (let x = -1920 / 2 + -40 + 200; x <= 1920 / 2; x += 100) {
    const line = (
      <Line
        points={[
          [x, -800],
          [x, 800],
        ]}
        lineWidth={3}
        stroke={
          new Gradient({
            type: "linear",
            from: [0, -500],
            to: [0, 500],
            stops: [
              { offset: 0, color: "#FAD64300" },
              { offset: 0.5, color: "#FAD643" },
              { offset: 1, color: "#FAD64300" },
            ],
          })
        }
        opacity={0}
      />
    );
    axisLines.add(line);
    yLines.push(line as Line);
  }

  const xLines: Line[] = [];
  for (let y = -1080 / 2 + 40 + 200; y <= 1080 / 2 - 200; y += 100) {
    const line = (
      <Line
        points={[
          [-1200, y],
          [1200, y],
        ]}
        lineWidth={3}
        stroke={
          new Gradient({
            type: "linear",
            from: [1000, 0],
            to: [-1000, 0],
            stops: [
              { offset: 0, color: "#FAD64300" },
              { offset: 0.5, color: "#FAD643" },
              { offset: 1, color: "#FAD64300" },
            ],
          })
        }
        opacity={0}
      />
    );
    axisLines.add(line);
    xLines.push(line as Line);
  }

  [...yLines, ...xLines].forEach((line) => axisLines.add(line));
  view.add(axisLines);

  yield* waitUntil("back");
  yield* sequence(
    0.3,
    sequence(
      0.1,
      ...yLines.map((l) => all(l.opacity(1, 1.2, easeOutCubic).back(1)))
    ),
    sequence(
      0.1,
      ...xLines.map((l) => all(l.opacity(1, 1.2, easeOutCubic).back(1)))
    )
  );

  axisLines.remove();

  yield* waitUntil("y axis");
  yield all(example_bar.scale(1, 1), example_bar.opacity(1, 1));
  yield* f.scale([2, 1], 2, easeInOutBack);
  yield* waitFor(1);
  yield* aValue(2, 1);

  yield* waitUntil("aspect ratio");
  yield* example_f_ghost.opacity(0.3, 1);
  yield* waitFor(0.5);
  yield* all(
    // aValue(1, 1),
    example_f.scale(1, 1),
    example_f.findFirst((child) => child instanceof Line).scale([2, 1], 1)
  );
  yield example_f_ghost.opacity(0, 1);

  yield* waitUntil("backtoproblem");
  yield sequence(
    0.3,
    all(example_f.opacity(0, 2), example_f.y(-1000, 1)),
    all(example_bar.y(4000, 1), example_eqn.y(1000, 1)),
    eqn.opacity(1, 1)
  );
  yield* all(f.opacity(1, 1), f.pop(true, 0), f.scale(2, 0));
  yield* waitUntil("reverse");

  const label1 = (
    <PTxt
      text="x axis stretch → x/2"
      y={450}
      fill="#aaa"
      fontSize={48}
      opacity={0}
    />
  );
  view.add(label1);
  yield* all(
    label1.opacity(1, 0.6),
    eqn.tex("\\min(y,0) = \\cos\\left(\\frac{x}{2}\\right)", 1),
    f.scale([2, 1], 1, easeInOutBack)
  );
  yield* waitUntil("pause-1");
  yield* label1.opacity(0, 0.5);
  label1.remove();

  const label2 = (
    <PTxt text="up 1 → y - 1" y={450} fill="#aaa" fontSize={48} opacity={0} />
  );
  view.add(label2);
  yield* all(
    label2.opacity(1, 0.6),
    eqn.tex("\\min(y - 1,0) = \\cos\\left(\\frac{x}{2}\\right)", 1),
    f.findFirst((child) => child instanceof Grid).y(50, 1)
  );
  yield* waitUntil("pause-2");
  yield* label2.opacity(0, 0.5);
  label2.remove();

  const label3 = (
    <PTxt
      text="reflect → -1·(...)"
      y={-400}
      fill="#aaa"
      fontSize={48}
      opacity={0}
    />
  );
  view.add(label3);
  yield* all(
    label3.opacity(1, 0.6),
    eqn.tex("\\min(-(y - 1),0) = \\cos\\left(\\frac{x}{2}\\right)", 1),
    f.scale([2, -1], 1),
    eqn.y(-250, 1)
  );
  const helpTxt = (
    <PTxt
      text="Dividing by -1 flips y. The minus sign moves in front."
      y={-100}
      fontSize={40}
      fill="#888"
      opacity={0}
    />
  );
  view.add(helpTxt);
  yield* waitUntil("context");
  yield* helpTxt.opacity(1, 0.6);
  yield* waitUntil("final");
  yield* all(helpTxt.opacity(0, 0.5), label3.opacity(0, 0.5));
  label3.remove();
  helpTxt.remove();
  yield* label3.opacity(0, 0.5);
  label3.remove();

  yield* all(f.opacity(0, 1), eqn.y(0, 1));
}

export default makeScene2D(function* (view) {
  view.fill(palette.bg);

  yield* waitUntil("start");
  yield* startIntroScene(view);
  yield* startMainScene(view);
  yield* startDistortionExplanation(view);
  yield* waitUntil("next");
});
