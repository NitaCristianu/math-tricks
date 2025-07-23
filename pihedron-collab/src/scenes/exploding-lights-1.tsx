import { Icon, Latex, makeScene2D, Node, Txt } from "@motion-canvas/2d";
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
} from "@motion-canvas/core";
import { PTxt } from "../components/gen/Ptxt";
import { ShaderBackground } from "../components/gen/background";

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
  const result: { value: number; owner: "alice" | "bob" }[] = [];

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
  const DOWNSCALE = 13; // move to 5
  const grid_COLUMNS = Math.floor(80 / DOWNSCALE);
  const grid_ROWS = Math.floor(150 / DOWNSCALE);
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
      tween(3, (t) => {
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
      text.y(text.y() + 1500, 1, easeInExpo),
      bulb.parent().y(bulb.parent().y() + 1500, 1, easeInExpo)
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
  const collection = getOwnedMultiples(0.12); // mvoe to .6

  const OWNERSIGNAL = createSignal(0); // when 1 represents ALICE, when 0 BOB, 2 is both
  const pov_tex_raw = () =>
      OWNERSIGNAL() <= 1
  ? textLerp("BOB", "ALICE", OWNERSIGNAL())
  : textLerp("ALICE", "BOTH", OWNERSIGNAL() - 1);
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
  
  yield delay(0.5, bulbs_container.y(-2000, 6));
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
  yield* OWNERSIGNAL(1,1);
  yield* waitFor(1.5);
  yield* OWNERSIGNAL(2,1);

  yield* waitUntil("next");
});
