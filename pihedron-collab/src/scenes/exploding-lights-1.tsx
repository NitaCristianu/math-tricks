import {
  Icon,
  Latex,
  Layout,
  makeScene2D,
  Node,
  Rect,
  Txt,
  Line,
  Gradient,
} from "@motion-canvas/2d";
import {
  all,
  chain,
  createRef,
  createRefArray,
  createSignal,
  easeOutQuad,
  easeOutQuint,
  sequence,
  useRandom,
  waitUntil,
  Vector2,
  easeInElastic,
  easeInExpo,
  easeOutElastic,
  easeInOutQuint,
  easeInOutExpo,
  tween,
  easeOutCirc,
  easeOutCubic,
  easeInOutCirc,
  waitFor,
  range,
  run,
  easeInCubic,
  delay,
  textLerp,
  Color,
  easeInOutQuad,
  useLogger,
  easeOutBack,
  easeOutExpo,
  linear,
  easeInBack,
  easeInOutCubic,
} from "@motion-canvas/core";
import { PTxt } from "../components/gen/Ptxt";
import { ShaderBackground } from "../components/gen/background";
import { math, Pitex } from "../components/gen/Pitex";

const numberTheoryProblems = [
  { equation: "a^2 + b^2 = c^2", icon: "mdi-light:lightbulb" },
  { equation: "x^2 \\equiv 1 \\mod p", icon: "mdi:sync" },
  { equation: "\\gcd(a, b) = 1", icon: "mdi:link-variant" },
  { equation: "a^x \\equiv b \\mod m", icon: "mdi:calculator" },
  { equation: "\\sum_{d \\mid n} \\phi(d) = n", icon: "mdi:math-integral" },
  { equation: "a^n \\equiv a \\mod n", icon: "mdi:repeat" },
  { equation: "x^2 \\equiv -1 \\mod p", icon: "mdi:help-circle-outline" },
  { equation: "n! \\equiv -1 \\mod p", icon: "mdi:exclamation-thick" },
  { equation: "\\pi(n) \\sim \\frac{n}{\\ln n}", icon: "mdi:chart-bell-curve" },
  { equation: "F_n = F_{n-1} + F_{n-2}", icon: "mdi:leaf" },
  {
    equation: "\\phi(mn) = \\phi(m) \\cdot \\phi(n) \\text{ if } \\gcd(m,n)=1",
    icon: "mdi:code-equal",
  },
  { equation: "p \\mid a^p - a", icon: "mdi:division" },
  {
    equation: "a \\equiv b \\mod m \\Rightarrow a^k \\equiv b^k \\mod m",
    icon: "mdi:arrow-decision-outline",
  },
  {
    equation: "\\binom{2n}{n} \\equiv 0 \\mod p \\text{ for } n \\ge p",
    icon: "mdi:circle-slice-3",
  },
  { equation: "\\sigma(n) = \\sum_{d \\mid n} d", icon: "mdi:sigma" },
  {
    equation:
      "\\mu(n) = \\begin{cases} 1 & \\text{if } n=1 \\\\ (-1)^k & \\text{if } n \\text{ is product of } k \\text{ distinct primes} \\\\ 0 & \\text{otherwise} \\end{cases}",
    icon: "mdi:math-compass",
  },
  {
    equation: "a^b \\not\\equiv b^a \\mod p",
    icon: "mdi:drama-masks", // unexpected, asymmetry
  },
  {
    equation: "n = \\prod_{i=1}^k p_i^{a_i}",
    icon: "mdi:format-list-numbered", // prime factor list
  },
  {
    equation: "\\text{ord}_n(a) \\mid \\phi(n)",
    icon: "mdi:clock-time-eight-outline", // order as time
  },
  {
    equation: "\\exists x: ax \\equiv 1 \\mod m",
    icon: "mdi:key", // modular inverse = key
  },
  {
    equation: "\\forall n, \\exists k: 2^k > n^2",
    icon: "mdi:arrow-up-bold-box", // exponential growth
  },
  {
    equation: "\\text{lcm}(a,b) = \\frac{ab}{\\gcd(a,b)}",
    icon: "mdi:merge", // combining things
  },
  {
    equation: "\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}",
    icon: "mdi:stairs", // sum as staircase
  },
  {
    equation:
      "\\text{If } p \\text{ prime, } \\binom{p}{k} \\equiv 0 \\mod p \\text{ for } 0<k<p",
    icon: "mdi:shield-star-outline", // binomial coefficients and primes
  },
];

export function getOwnedMultiples(downscale = 0.5) {
  const result: { value: number; owner: "alice" | "bob" | "both" }[] = [];

  const stepA = Math.floor(42 * downscale);
  const stepB = Math.floor(69 * downscale);

  let a = stepA;
  let b = stepB;

  while (a < 1000 || b < 1000) {
    if (a < b) {
      result.push({ value: a, owner: "alice" });
      a += stepA;
    } else if (b < a) {
      result.push({ value: b, owner: "bob" });
      b += stepB;
    } else {
      result.push({ value: a, owner: "both" as any }); // shared multiple
      a += stepA;
      b += stepB;
    }
  }

  return result;
}

export default makeScene2D(function* (view) {
  view.fill("#080808ff");
  const bgr = <ShaderBackground preset="sunset" opacity={0.2} />;
  view.add(bgr);

  const text = (
    <PTxt
      fill={"#dfdfdf"}
      shadowBlur={120}
      shadowColor={"rgba(255, 255, 255, .5)"}
      fontSize={128}
      hidden
    >
      Number theory
    </PTxt>
  ) as PTxt;
  view.add(text);
  const problems = createRefArray<Node>();
  const generator = useRandom(574);

  view.add(
    <Node>
      {numberTheoryProblems.map((problem) => {
        return (
          <Node
            ref={problems}
            scale={0}
            opacity={0}
            position={new Vector2(
              generator.nextInt(-1920 / 2, 1920 / 2),
              generator.nextInt(-1080 / 2, 1080 / 2)
            ).mul(generator.nextFloat(1, 3))}
          >
            <Latex
              opacity={0.6}
              tex={problem.equation}
              fontSize={30}
              fill={"#dfdfdf"}
            />
            <Icon
              opacity={0.6}
              icon={problem.icon}
              size={50}
              scale={0}
              color={"#dfdfdf"}
            />
          </Node>
        );
      })}
    </Node>
  );

  yield* waitUntil("start");
  yield view.scale(1.4, 2);
  yield all(
    text.popin(),
    sequence(
      0.05,
      ...problems.map((problem) =>
        chain(
          all(
            problem.position(
              problem.position().scale(generator.nextFloat(0, 0.4)),
              1.5,
              easeOutQuad
            ),
            problem.opacity(1, 0.5, easeOutQuad),
            problem.scale(1, 0.5, easeOutQuint)
          ),
          problem
            .findFirst((child) => child instanceof Latex)
            .scale([0, 0.5], 0.4, easeInExpo),
          all(
            problem.childAs<Icon>(1).scale(1, 1, easeOutElastic),
            problem.position(
              problem.position().scale(generator.nextFloat(0.2, 0.5)),
              2.5,
              easeOutQuad
            ),
            problem.scale(1.4, 0.5, easeOutQuint)
          )
        )
      )
    )
  );
  yield* waitUntil("lightbulbs");
  const bulb = problems[0];
  const bulbpos = bulb.position();

  // COMPUTING GRID
  const grid_WIDTH = 1920 - 750;
  const grid_HEIGHT = 1080 - 500;
  const DOWNSCALE = 5; // move to 5
  const grid_COLUMNS = Math.floor(50 / DOWNSCALE);
  const grid_ROWS = Math.floor(200 / DOWNSCALE);
  const grid_SPACING_X = grid_WIDTH / (grid_COLUMNS - 1);
  const grid_SPACING_Y = grid_SPACING_X;
  const ROWS_ON_SCREEN = Math.ceil(grid_HEIGHT / grid_SPACING_Y);
  const grid_POSITIONS: Vector2[] = [];
  for (let row = 0; row < grid_ROWS; row++) {
    for (let col = 0; col < grid_COLUMNS; col++) {
      const x = -grid_WIDTH / 2 + col * grid_SPACING_X;
      const y = -grid_HEIGHT / 2 + row * grid_SPACING_Y;
      grid_POSITIONS.push(new Vector2(x, y));
    }
  }

  yield* sequence(
    0.7,
    all(
      tween(2.8, (t) => {
        t = easeInOutCirc(t);
        const startpos = bulbpos;
        const endpos = new Vector2(0, -1500);
        const generator = Vector2.createPolarLerp(
          false,
          new Vector2(900, -200)
        );
        bulb.position(generator(startpos, endpos, t));
      }),

      bulb.childAs<Icon>(1).scale(1.6, 1, easeOutCubic),
      bulb.childAs<Icon>(1).opacity(1, 1, easeOutCubic),
      bulb.childAs<Icon>(1).color("rgba(245, 231, 175, 1)", 1, easeOutCubic),
      bulb
        .childAs<Icon>(1)
        .shadowColor("rgba(245, 231, 175, .7)", 1, easeOutCubic),
      bulb.childAs<Icon>(1).shadowBlur(50, 3, easeOutCubic)
    ),
    all(
      text.y(text.y() + 1500, 0.9, easeInExpo),
      bulb.parent().y(bulb.parent().y() + 1500, 0.9, easeInExpo)
    ),
    waitFor(0), // wait in sequence
    waitFor(0),
    all(
      bulb.childAs<Icon>(1).scale(1.2, 1),
      bulb.childAs<Icon>(1).color("rgba(255, 255, 255, 1)", 1),
      bulb
        .childAs<Icon>(1)
        .shadowColor("rgba(255, 255, 255, 0.4)", 1, easeOutCubic),
      bulb.childAs<Icon>(1).shadowBlur(15, 1, easeOutCubic)
    )
  );
  const bulbs_container = <Node />;
  view.add(bulbs_container);
  const grid_ELEMENTS: Icon[] = [];
  yield* sequence(
    0.001,
    bulb.opacity(0, 0.3, easeInCubic),
    ...range(0, grid_ROWS * grid_COLUMNS).map((i) =>
      run(function* () {
        const clone = bulb.childAs<Icon>(1).clone({
          position: Vector2.zero,
          opacity: 0,
          key: "Bulb Icon: " + i,
          scale: 1.2,
          color: "rgba(245, 243, 239, 0.55)",
        });
        grid_ELEMENTS.push(clone);
        bulbs_container.add(clone);
        yield* all(
          delay(
            i < grid_COLUMNS * (ROWS_ON_SCREEN + 1) + 64 ? 0 : 1,
            clone.opacity(1, 1, easeOutCirc)
          ),
          clone.position(grid_POSITIONS[i], 1, easeInOutCirc),
          clone.scale(0.8, 1, easeInOutCirc)
        );
      })
    )
  );
  const collection = getOwnedMultiples(0.25); // mvoe to .6

  const OWNERSIGNAL = createSignal(0); // when 1 represents ALICE, when 0 BOB, 2 is both
  const pov_tex_raw = () =>
    OWNERSIGNAL() <= 1
      ? textLerp("BOB", "ALICE", OWNERSIGNAL())
      : textLerp("ALICE", "SHARED", OWNERSIGNAL() - 1);
  const pov_text = (
    <PTxt hidden bottomRight={[1920 / 2 - 500, 1080 / 2 - 200]} fill={"white"}>
      <Txt text={pov_tex_raw} />
      <Txt
        fontWeight={300}
        text={() =>
          OWNERSIGNAL() <= 1
            ? "'S VIEW"
            : textLerp("'S VIEW", " VIEW", OWNERSIGNAL() - 1)
        }
      />
    </PTxt>
  ) as PTxt;
  view.add(pov_text);
  const bobbase_color = new Color("rgba(71, 118, 248, 1)");
  const alicebase_color = new Color("rgba(255, 65, 97, 1)");
  const initialbase_color = new Color("rgba(245, 243, 239, 0.55)");

  const bobshadow_color = new Color("rgba(120, 180, 255, 0.5)");
  const aliceshadow_color = new Color("rgba(255, 130, 150, 0.5)");
  const initialshadow_color = new Color("rgba(255, 255, 255, 0)");

  yield bulbs_container.y(-4470, 5, easeInOutQuad);
  yield sequence(
    0.01,
    pov_text.popin(),
    ...collection.map((result) => {
      return result.value < grid_ELEMENTS.length
        ? all(
            // COLOR transition
            grid_ELEMENTS[result.value].color(() => {
              const val = OWNERSIGNAL();

              if (val <= 1) {
                return result.owner === "bob"
                  ? Color.lerp(bobbase_color, initialbase_color, val).toString()
                  : Color.lerp(
                      initialbase_color,
                      alicebase_color,
                      val
                    ).toString();
              } else {
                return result.owner === "bob"
                  ? Color.lerp(
                      initialbase_color,
                      bobbase_color,
                      val - 1
                    ).toString()
                  : alicebase_color.toString();
              }
            }, 1),

            // SHADOW transition
            grid_ELEMENTS[result.value].shadowColor(() => {
              const val = OWNERSIGNAL();

              if (val <= 1) {
                return result.owner === "bob"
                  ? Color.lerp(
                      bobshadow_color,
                      initialshadow_color,
                      val
                    ).toString()
                  : Color.lerp(
                      initialshadow_color,
                      aliceshadow_color,
                      val
                    ).toString();
              } else {
                return result.owner === "bob"
                  ? Color.lerp(
                      initialshadow_color,
                      bobshadow_color,
                      val - 1
                    ).toString()
                  : aliceshadow_color.toString();
              }
            }, 1)
          )
        : null;
    })
  );

  yield* waitFor(1.5);
  yield* OWNERSIGNAL(1, 1);
  yield* waitFor(1.5);
  yield* OWNERSIGNAL(2, 1);

  const logger = useLogger();
  const shared = collection.find((item) => item.owner === "both");
  if (!shared || grid_ELEMENTS.length < shared.value)
    logger.error("No common owner found");
  const sharedbulb = grid_ELEMENTS[shared.value];
  const y = sharedbulb.position().y;

  const indicator = (
    <PTxt
      fill={"rgba(255, 238, 187, 1)"}
      fontWeight={200}
      fontSize={30}
      textAlign={"center"}
      left={[150, 0]}
      opacity={0}
      scale={0.7}
    />
  ) as PTxt;
  sharedbulb.add(indicator);
  yield* waitUntil("find multiple");
  yield* bulbs_container.y(-y, 2.5);
  yield* all(
    sharedbulb.color("rgba(255, 238, 187, 1)", 0.5, easeOutCubic),
    sharedbulb.shadowColor("rgba(255, 238, 187, .9)", 0.5, easeOutCirc),
    sharedbulb.scale(1.8, 1, easeOutBack),
    sharedbulb.shadowBlur(60, 1, easeOutBack),
    delay(
      0.3,
      all(
        indicator.opacity(1, 0.5, easeOutCubic),
        indicator.scale(1, 0.5, easeOutCubic),
        indicator.text("This light bulb\nwill explode.", 0.7)
      )
    ),
    ...grid_ELEMENTS.map((el, i) =>
      i != shared.value ? el.opacity(0.3, 1) : null
    ),
    pov_text.opacity(0.2, 1)
  );
  yield* waitUntil("lcm");
  yield* all(
    indicator.text("We need to find the\nlowest common multiple.", 1),
    indicator.position([300, 0], 1)
  ),
    yield* waitFor(1);
  yield all(bulbs_container.opacity(0, 1), pov_text.opacity(0, 1));
  const layout42 = (
    <Layout layout direction="row" y={-50} gap={40}>
      {...range(10).map((i) => (
        <Latex fontSize={0} tex={`${(i + 1) * 42}`} fill={"#ececec"} />
      ))}
      <Latex fontSize={0} tex={`\\cdots`} fill={"#ececec"} />
    </Layout>
  );
  const layout69 = (
    <Layout layout direction="row" y={50} gap={40}>
      {...range(10).map((i) => (
        <Latex fontSize={0} tex={`${(i + 1) * 69}`} fill={"#ececec"} />
      ))}
      <Latex fontSize={0} tex={`\\ldots`} fill={"#ececec"} />
    </Layout>
  );
  view.add(layout42);
  view.add(layout69);
  yield sequence(
    0.2,
    ...layout42.childrenAs<Latex>().map((child) => child.fontSize(36, 1))
  );
  yield* sequence(
    0.2,
    ...layout69.childrenAs<Latex>().map((child) => child.fontSize(36, 1))
  );

  const examples = new Layout({
    height: 1300,
    children: [
      <Latex
        tex={String.raw`\text{LCM}(A, B) = p_1^{\max(a_1, b_1)} \cdot p_2^{\max(a_2, b_2)} \cdot \dots`}
        fontSize={0}
        fill={"#eee"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(8, 12) = 2^3 \cdot 3^1 = 24`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(18, 30) = 2^1 \cdot 3^2 \cdot 5^1 = 90`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(7, 5) = 7^1 \cdot 5^1 = 35`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(9, 6) = 3^2 \cdot 2^1 = 18`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(10, 15) = 2^1 \cdot 3^1 \cdot 5^1 = 30`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(4, 14) = 2^2 \cdot 7^1 = 28`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(21, 6) = 3^1 \cdot 7^1 \cdot 2^1 = 42`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(11, 13) = 11^1 \cdot 13^1 = 143`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(16, 20) = 2^4 \cdot 5^1 = 80`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(24, 36) = 2^3 \cdot 3^2 = 72`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(27, 18) = 3^3 \cdot 2^1 = 54`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(25, 30) = 5^2 \cdot 2^1 \cdot 3^1 = 150`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(32, 40) = 2^5 \cdot 5^1 = 160`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(22, 55) = 2^1 \cdot 11^1 \cdot 5^1 = 110`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(48, 18) = 2^4 \cdot 3^2 = 144`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(35, 14) = 5^1 \cdot 7^1 \cdot 2^1 = 70`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(50, 75) = 2^1 \cdot 3^1 \cdot 5^2 = 150`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(45, 60) = 3^2 \cdot 5^1 \cdot 2^2 = 180`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(8, 9) = 2^3 \cdot 3^2 = 72`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(13, 26) = 13^1 \cdot 2^1 = 26`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(33, 44) = 3^1 \cdot 11^1 \cdot 2^2 = 132`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(5, 9) = 5^1 \cdot 3^2 = 45`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(6, 8) = 2^3 \cdot 3^1 = 24`}
        fontSize={0}
        fill={"#ddd"}
      />,
      <Latex
        tex={String.raw`\text{LCM}(40, 56) = 2^3 \cdot 5^1 \cdot 7^1 = 280`}
        fontSize={0}
        fill={"#ddd"}
      />,
    ],
    layout: true,
    direction: "column",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    gap: 24,
    y: 240,
  }) as Node;
  const lcmtex = examples.childAs<Latex>(0);

  view.add(examples);

  yield* waitUntil("replace");
  yield* all(
    ...[layout42, layout69].map((rect) =>
      all(
        rect.opacity(0, 0.33, easeInCubic),
        rect.scale([0.8, 0.5], 0.34, easeInCubic).do(() => rect.remove())
      )
    ),
    lcmtex.fontSize(48, 0.35, easeOutExpo)
  );
  yield* waitFor(1);
  yield* all(
    sequence(
      0.45,
      ...examples.children().map((child: Latex) => child.fontSize(32, 0.6))
    ),
    examples.y(-700, 15)
  );
  yield* examples.y(-1200, 0.5);
  const layout = <Node />;
  view.add(layout);
  const fortyTwo = (
    <PTxt
      text="42"
      fontSize={196}
      fill="#ff4d4d"
      fontWeight={200}
      shadowBlur={28}
      shadowColor={"#ff999990"}
      position={[-300, 0]}
    ></PTxt>
  );

  const sixtyNine = (
    <PTxt
      text="69"
      fontSize={196}
      fill="#4dd0ff"
      shadowBlur={28}
      shadowColor={"#99e6ff90"}
      fontWeight={200}
      position={[300, 0]}
    ></PTxt>
  );
  layout.add(
    <>
      <Icon
        icon={"map:male"}
        size={90}
        position={() => sixtyNine.position().addY(-140)}
        scale={sixtyNine.scale}
        opacity={() => sixtyNine.scale().x}
        shadowBlur={28}
        shadowColor={"#99e6ff90"}
        color={"4dd0ff"}
      />
      <Icon
        icon={"map:female"}
        size={90}
        position={() => fortyTwo.position().addY(-140)}
        opacity={() => fortyTwo.scale().x}
        scale={fortyTwo.scale}
        shadowBlur={28}
        shadowColor={"#ff999990"}
        color={"ff4d4d"}
      />
    </>
  );
  const factors42 = [
    <Latex
      tex={String.raw`2^1`}
      fontSize={60}
      fill="#ff6666"
      position={[-235, 130]}
      opacity={0}
    />,
    <Latex
      tex={String.raw`\cdot`}
      fontSize={48}
      fill="#ff9999"
      position={[-185, 132]}
      opacity={0}
    />,
    <Latex
      tex={String.raw`3^1`}
      fontSize={60}
      fill="#ff6666"
      position={[-135, 130]}
      opacity={0}
    />,
    <Latex
      tex={String.raw`\cdot`}
      fontSize={48}
      fill="#ff9999"
      position={[-85, 132]}
      opacity={0}
    />,
    <Latex
      tex={String.raw`7^1`}
      fontSize={60}
      fill="#ff6666"
      position={[-35, 130]}
      opacity={0}
    />,
  ];

  const factors69 = [
    <Latex
      tex={String.raw`3^1`}
      fontSize={60}
      fill="#66ccff"
      position={[215, 130]}
      opacity={0}
    />,
    <Latex
      tex={String.raw`\cdot`}
      fontSize={48}
      fill="#99e6ff"
      position={[270, 132]}
      opacity={0}
    />,
    <Latex
      tex={String.raw`23^1`}
      fontSize={60}
      fill="#66ccff"
      position={[350, 128]}
      opacity={0}
    />,
  ];

  const red = "#ffd8d8ff";
  const blue = "#ace3ffff";
  const line = (
    <Line
      points={[
        [0, 1000],
        [0, -1000],
      ]}
      lineWidth={3}
      end={0}
      shadowColor={"#fff4"}
      shadowBlur={2}
      stroke={
        new Gradient({
          fromY: -400,
          toY: 400,
          stops: [
            { color: "#fff", offset: 0.5 },
            { color: "#fff0", offset: 0 },
            { color: "#fff0", offset: 1 },
          ],
        })
      }
      zIndex={2}
    />
  ) as Line;
  layout.add(line);

  layout.add(
    <>
      <Node x={-150}>{...factors42}</Node>
      <Node x={20}>{...factors69}</Node>
    </>
  );

  layout.add(
    <>
      {fortyTwo} {sixtyNine}
    </>
  );
  fortyTwo.opacity(0);
  sixtyNine.opacity(0);

  yield line.end(1, 1);
  yield* all(
    fortyTwo.opacity(1, 0.6),
    fortyTwo.scale(1.2, 0.4).to(1, 0.5),
    delay(
      0.2,
      all(sixtyNine.opacity(1, 0.6), sixtyNine.scale(1.2, 0.4).to(1, 0.5))
    )
  );
  yield* all(
    sequence(
      0.06,
      ...(factors42 as Latex[]).map((node) => {
        node.opacity(0);
        node.position.y(node.position.y() - 40);
        node.fill(red);
        return all(
          node.opacity(1, 0.4),
          node.position.y(node.position.y() + 40, 0.5, easeOutCubic),
          node.scale(1.2, 0.3).to(1, 0.2)
        );
      })
    ),
    sequence(
      0.06,
      ...(factors69 as Latex[]).map((node) => {
        node.opacity(0);
        node.position.y(node.position.y() - 40);
        node.fill(blue);
        return all(
          node.opacity(1, 0.4),
          node.position.y(node.position.y() + 40, 0.5, easeOutCubic),
          node.scale(1.2, 0.3).to(1, 0.2)
        );
      })
    )
  );
  const lcmComponents = [
    <Latex
      tex={String.raw`\text{LCM}(42,69) =`}
      fontSize={52}
      fill="#fff"
      position={[-220, 900]}
      opacity={0}
    />,
    <Latex
      tex={String.raw`2^1`}
      fontSize={60}
      fill="#ff6666"
      position={[90, 900]}
      opacity={0}
    />,
    <Latex
      tex={String.raw`\cdot`}
      fontSize={48}
      fill="#bbb"
      position={[145, 902]}
      opacity={0}
    />,
    <Latex
      tex={String.raw`3^1`}
      fontSize={60}
      fill="#cccccc"
      position={[200, 900]}
      opacity={0}
    />,
    <Latex
      tex={String.raw`\cdot`}
      fontSize={48}
      fill="#bbb"
      position={[255, 902]}
      opacity={0}
    />,
    <Latex
      tex={String.raw`7^1`}
      fontSize={60}
      fill="#ff6666"
      position={[310, 900]}
      opacity={0}
    />,
    <Latex
      tex={String.raw`\cdot`}
      fontSize={48}
      fill="#bbb"
      position={[365, 902]}
      opacity={0}
    />,
    <Latex
      tex={String.raw`23^1`}
      fontSize={60}
      fill="#66ccff"
      position={[440, 900]}
      opacity={0}
    />,
  ];
  layout.add(<>{...lcmComponents}</>);

  // Copy references to the original "3^1" nodes (adjust index if needed)
  const source42_3 = factors42[2];
  const source69_3 = factors69[0];
  const target3 = lcmComponents[3]; // 3^1 in LCM

  // Make clones fly down & fade into place
  const clone42_3 = source42_3.reactiveClone({ x: -300 });
  const clone69_3 = source69_3.reactiveClone();
  layout.add(
    <Node>
      {clone42_3} {clone69_3}
    </Node>
  );

  yield all(layout.y(-900, 1), line.opacity(0, 1));
  // Animate clones
  yield all(
    clone42_3.position(target3.position(), 0.8, easeInOutCubic),
    clone42_3.opacity(0, 0.8),
    clone69_3.position(target3.position(), 0.8, easeInOutCubic),
    clone69_3.opacity(0, 0.8),
    target3.opacity(1, 0.6)
  );

  // Fade in full LCM line after common group
  yield* waitFor(0.5);
  yield* sequence(0.07, ...lcmComponents.map((node) => node.opacity(1, 0.4)));
  yield* waitFor(1);
  const answer = lcmComponents[1] as Latex;
  yield* all(
    ...lcmComponents
      .splice(1)
      .map((node) =>
        all(
          node.opacity(0, 0.4, easeOutCubic),
          node.scale(node.scale().mul([0.5, 0.9]), 0.4, easeOutCirc)
        )
      )
  );
  answer.tex("966");
  answer.fill("#eee");
  yield* all(layout.x(150, 1), answer.opacity(1, 1), answer.scale(1, 1));
  const info = <PTxt y={700} fill={'white'} fontWeight={200} fontSize={32}>
    The 966' light bulb with explode.
  </PTxt>;
  view.add(info);

  yield* info.y(60, 1);
  yield* waitUntil("hcf");

  yield* all(
    (lcmComponents[0] as Latex).tex("\\text{HCF}(42,69) =", 1),
    (answer as Latex).tex("3", 1),
    (answer as Latex).x(answer.x()-50, 1),
    info.opacity(0, 1),
  );
  yield* waitUntil("next");
});
