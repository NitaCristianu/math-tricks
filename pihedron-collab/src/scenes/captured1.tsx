import {
  makeScene2D,
  Layout,
  Txt,
  Icon,
  Line,
  Rect,
  Circle,
  Polygon,
  Ray,
  Shape,
} from "@motion-canvas/2d";
import {
  all,
  chain,
  createRef,
  createSignal,
  easeInOutElastic,
  easeOutBack,
  easeOutCubic,
  fadeTransition,
  sequence,
  waitFor,
  waitUntil,
  Vector2,
  easeInOutExpo,
  delay,
} from "@motion-canvas/core";
import { ShaderBackground } from "../components/gen/background";
import { PTxt } from "../components/gen/Ptxt"; // assuming you have this for styled text
import { Glass } from "../components/gen/Glass";

export default makeScene2D(function* (view) {
  view.fill("black");
  const background_luminosity = createSignal<number>(1);
  view.add(
    <ShaderBackground preset="mindmaze" opacity={background_luminosity} />
  );

  yield* waitUntil("start");
  yield background_luminosity(0.5, 1, easeInOutElastic);

  const rules = createRef<Layout>();
  const rulesHeader = createRef<Layout>();

  const RULE_TEXT = [
    "There are 7 boxes. One has the key.",
    "Each prisoner knows 1 box attribute.",
    "You don't know who knows what.",
    "You may ask them any number of times.",
    "They answer only yes or no.",
    "No other form of communication is allowed.",
    "Only 1 attempt to pick the box.",
  ];

  view.add(
    <Layout
      ref={rules}
      layout
      y={0}
      direction={"column"}
      alignItems={"center"}
      gap={30}
    >
      <Layout
        ref={rulesHeader}
        layout
        y={-330}
        direction={"row"}
        alignItems={"center"}
        gap={20}
        width={"100%"}
      >
        <Line
          points={[() => [-300, 0], () => [-50, 0]]}
          lineWidth={2}
          stroke="#aaaaaa"
          end={0}
        />
        <PTxt
          text="RULES"
          fontSize={40}
          fontWeight={600}
          fill="#f0f0f0"
          letterSpacing={4}
          opacity={0}
          scale={0.5}
        />
        <Line
          points={[() => [50, 0], () => [100, 0]]}
          lineWidth={2}
          stroke="#aaaaaa"
          start={1}
        />
      </Layout>
      {RULE_TEXT.map((text, i) => (
        <Layout
          key={`rule-${i}`}
          layout
          direction="row"
          alignItems="center"
          gap={20}
          opacity={0}
          scale={0.5}
          width={"100%"}
        >
          <Icon
            icon={
              [
                "lucide:box",
                "lucide:eye",
                "lucide:shuffle",
                "lucide:mic",
                "lucide:check",
                "lucide:ban",
                "lucide:target",
              ][i]
            }
            size={42}
            color="#cfa8ff"
          />
          <PTxt text={text} fontSize={48} fontWeight={200} fill="#e0e0e0" />
        </Layout>
      ))}
    </Layout>
  );

  // Animate bullet list one by one
  yield* sequence(
    0.2,
    all(
      rulesHeader().childAs<Line>(0).end(1, 1),
      rulesHeader().childAs<Line>(2).start(0, 1),
      rulesHeader().childAs<PTxt>(1).opacity(1, 0.8),
      rulesHeader().childAs<PTxt>(1).scale(1, 0.8)
    ),
    ...rules()
      .children()
      .map((node) =>
        all(node.opacity(1, 0.8, easeOutCubic), node.scale(1, 1, easeOutCubic))
      )
  );

  yield* waitUntil("question");

  const question = (
    <PTxt
      y={380}
      x={-420}
      fontSize={52}
      fontWeight={300}
      fill="#fff"
      shadowBlur={20}
      shadowColor={"#fff8"}
    />
  ) as PTxt;
  const stickman = (
    <Rect fill={"red"} x={500} size={[400, 800]}>
      <PTxt>STICK MAN</PTxt>
    </Rect>
  );
  view.add(stickman);

  view.add(question);
  yield* all(
    question.text(
      "What is the probability that you succeed\nif you play optimally?",
      1,
      easeOutCubic
    ),
    question.x(-320, 1),
    rules().position([-300, -100], 1)
  );

  yield* waitUntil("boxes");
  yield sequence(
    0.1,
    question.x(-2000, 1),
    stickman.x(2000, 1),
    rules().x(-2000, 1)
  );
  yield* waitFor(0.5);
  const row1 = createRef<Layout>();
  const row2 = createRef<Layout>();

  view.add(
    <Layout scale={1.5} direction="column" gap={150}>
      <Layout y={-100} ref={row1} layout direction="row" gap={80} />
      <Layout y={100} ref={row2} layout direction="row" gap={80} />
    </Layout>
  );

  // Common visual style
  const shadowColor = "#0008";
  const shadowBlur = 32;

  // === Row 1 ===
  const redCircle = (
    <Circle
      size={100}
      stroke="#fa7b9c"
      lineWidth={8}
      scale={0}
      shadowColor={shadowColor}
      shadowBlur={shadowBlur}
    /> // Circle
  );

  const redSquare = (
    <Rect
      size={100}
      stroke="#fa7b9c"
      lineWidth={8}
      scale={0}
      shadowColor={shadowColor}
      shadowBlur={shadowBlur}
    /> // Rect
  );

  const tealSquare = (
    <Rect
      size={100}
      stroke="#5eead4"
      lineWidth={8}
      scale={0}
      shadowColor={shadowColor}
      shadowBlur={shadowBlur}
    /> // Rect
  );

  const tealTriangle = (
    <Polygon
      sides={3}
      size={100}
      fill="#5eead4"
      scale={0}
      shadowColor={shadowColor}
      shadowBlur={shadowBlur}
    /> // Polygon
  );

  row1().add(
    <>
      {redCircle}
      {redSquare}
      {tealSquare}
      {tealTriangle}
    </>
  );

  yield* sequence(
    0.1,
    redCircle.scale(1, 0.6, easeOutBack),
    redSquare.scale(1, 0.6, easeOutBack),
    tealSquare.scale(1, 0.6, easeOutBack),
    tealTriangle.scale(1, 0.6, easeOutBack)
  );

  // === Row 2 ===
  const stripedCircle = (
    <Circle
      size={100}
      stroke="#5eead4"
      lineWidth={8}
      scale={0}
      clip
      shadowColor={shadowColor}
      shadowBlur={shadowBlur}
    /> // Circle
  ) as Circle;

  row2().add(<>{stripedCircle}</>);

  // Stripes
  const stripes = [];
  for (let i = -40; i <= 40; i += 12) {
    const line = (
      <Line
        points={[
          [i, -60],
          [i + 40, 60],
        ]}
        stroke="#5eead4"
        lineWidth={6}
        end={0}
      />
    );
    stripedCircle.add(line);
    stripes.push(line);
  }

  const yellowSquare = (
    <Rect
      size={100}
      stroke="#fde047"
      lineWidth={8}
      scale={0}
      shadowColor={shadowColor}
      shadowBlur={shadowBlur}
    /> // Rect
  );

  const yellowTriangle = (
    <Polygon
      sides={3}
      size={100}
      fill="#fde047"
      scale={0}
      shadowColor={shadowColor}
      shadowBlur={shadowBlur}
    /> // Polygon
  );

  row2().add(
    <>
      {yellowSquare}
      {yellowTriangle}
    </>
  );

  const prisoner_icon = (
    <Glass size={100} radius={1000} borderModifier={-0.8}>
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

  const prisoner_icon2 = (
    <Glass size={100} radius={1000} borderModifier={-0.8}>
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
  const prisoner_icon3 = (
    <Glass size={100} radius={1000} borderModifier={-0.8}>
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
  const attributes = [prisoner_icon, prisoner_icon2, prisoner_icon3];
  attributes.map((icon, i) =>
    icon.position(
      new Vector2(i != 1 ? -250 + 250 * i : new Vector2(-250, 250)).mul(2.4)
    )
  );
  const bar = <Rect />;
  bar.add(attributes);
  view.add(bar);
  yield* sequence(
    0.1,
    stripedCircle.scale(1, 0.6, easeOutBack),
    ...stripes.map((line: Line, i) => line.end(1, 0.5, easeOutBack)),
    yellowSquare.scale(1, 0.6, easeOutBack),
    yellowTriangle.scale(1, 0.6, easeOutBack)
  );

  const target: Shape = stripedCircle;
  const key = <Icon size={120} opacity={0} icon={"solar:key-linear"}><PTxt left={[500, 0]}></PTxt></Icon>;
  key.absolutePosition(target.absolutePosition);

  view.add(key);
  target.zIndex(12);
  target.parent().zIndex(12);
  yield sequence(
    0.1,
    ...attributes.map((attr) =>
      attr.absolutePosition(target.absolutePosition(), 1, easeOutCubic)
    ),
    ...attributes.map((attr) => attr.scale(0, 2, easeOutCubic))
  );
  yield* waitFor(.5);
  yield all(
    target.scale(1.3, .6, easeInOutExpo),
    ...[...row1().childrenAs<Shape>(), ...row2().childrenAs<Shape>()].map(
      (child) => (child != target ? child.opacity(0.3, 1) : null)
    )
  );
  yield* all(
    key.opacity(1,1),
    key.position(key.position().add([0, -200]), 1),
    delay(0.5, key.childAs<Txt>(0).text("Example : Key was here", 1))
  );

  yield* waitUntil("end");
});
