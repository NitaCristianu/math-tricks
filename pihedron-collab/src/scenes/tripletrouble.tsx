import {
  contrast,
  Icon,
  Latex,
  Layout,
  makeScene2D,
  Rect,
} from "@motion-canvas/2d";
import {
  all,
  chain,
  easeInBack,
  easeInCubic,
  easeInExpo,
  easeOutBack,
  easeOutCubic,
  easeOutElastic,
  easeOutExpo,
  range,
  sequence,
  useRandom,
  waitFor,
  waitUntil,
} from "@motion-canvas/core";
import { ShaderBackground } from "../components/gen/background";
import { math } from "../components/gen/Pitex";
import { Glass } from "../components/gen/Glass";
import { PTxt } from "../components/gen/Ptxt";
import { Vector2 } from "three";

export default makeScene2D(function* (view) {
  view.fill("#000");
  const bgr = <ShaderBackground preset="sunset" opacity={0.5} />;
  view.add(bgr);

  yield* waitUntil("start");

  const aTerm = (
    <Latex tex={math("A(2x+1)(x-1)")} fill="#fff" fontSize={25} opacity={0} />
  ) as Latex;
  const sign_ab = (
    <Latex tex={math("+")} fill="#fff" fontSize={25} opacity={0} />
  ) as Latex;
  const bTerm = (
    <Latex tex={math("B(x-1)")} fill="#fff" fontSize={25} opacity={0} />
  ) as Latex;
  const sign_bc = (
    <Latex tex={math("+")} fill="#fff" fontSize={25} opacity={0} />
  ) as Latex;
  const cTerm = (
    <Latex tex={math("C")} fill="#fff" fontSize={25} opacity={0} />
  ) as Latex;
  const rhs = (
    <Latex
      tex={math("=(2x+1)(x-1)-(2x+1)")}
      fill="#fff"
      fontSize={25}
      opacity={0}
    />
  ) as Latex;

  const eqnLayout = (
    <Layout layout direction="row" gap={20} alignItems="center">
      {aTerm}
      {sign_ab}
      {bTerm}
      {sign_bc}
      {cTerm}
      {rhs}
    </Layout>
  );
  view.add(eqnLayout);

  yield* sequence(
    0.2,
    all(aTerm.opacity(1, 0.4), aTerm.fontSize(50, 0.4)),
    all(sign_ab.opacity(1, 0.3), sign_ab.fontSize(50, 0.3)),
    all(bTerm.opacity(1, 0.4), bTerm.fontSize(50, 0.4)),
    all(sign_bc.opacity(1, 0.3), sign_bc.fontSize(50, 0.3)),
    all(cTerm.opacity(1, 0.4), cTerm.fontSize(50, 0.4)),
    all(rhs.opacity(1, 0.5), rhs.fontSize(50, 0.5))
  );
  eqnLayout.children().forEach((child) => child.save());

  const scaryeqn_container = (
    <Glass
      x={1500}
      height="110%"
      width={0}
      clip
      lightness={-0.6}
      borderModifier={-1}
      // fill={"#fffa"}
      rotation={45}
    />
  ) as Rect;
  const generator = useRandom();
  const questions = range(80).map((i) => (
    <PTxt
      position={
        new Vector2(
          generator.nextInt(-1000, 1000),
          generator.nextInt(-1000, 1000)
        )
      }
      text={"?"}
      fill={"#fff4"}
      scale={0}
      fontSize={100}
    />
  )) as PTxt[];
  const scaryEqn = (
    <Latex
      tex={math("12A^2 + 7BC - AC + 4B = 3A + 5C^2 - 6")}
      fill="#fee"
      fontSize={64}
      shadowBlur={20}
      shadowColor="#fdd3"
      position={() => scaryeqn_container.position().mul(-1)}
    />
  ) as Latex;
  scaryeqn_container.add(scaryEqn);
  scaryeqn_container.add(<>{questions}</>);
  view.add(scaryeqn_container);
  yield* waitUntil("3 unknowns");
  yield sequence(
    0.02,
    ...questions.map((question) =>
      all(
        question.fontSize(220, generator.nextFloat(4, 7), easeInCubic),
        question.scale(1, 0.4, easeOutBack)
      )
    )
  );
  yield scaryEqn.scale(2, 10);
  yield* all(
    scaryeqn_container.width("100%", 1, easeOutCubic),
    scaryeqn_container.position(0, 1, easeOutCubic),
    scaryeqn_container.rotation(0, 1, easeOutCubic)
  );

  yield* waitFor(1.2);

  yield* all(
    scaryeqn_container.width("0%", 1, easeInBack),
    scaryeqn_container.position(-1500, 1, easeInBack),
    scaryeqn_container.rotation(-45, 1, easeInBack)
  );

  scaryeqn_container.remove();

  yield* waitUntil("bad instinct");

  const expand1 = (
    <Latex
      tex={math("A(2x^2 - x - 1) + B(x - 1) + C = 2x^2 - x - 1 - 2x - 1")}
      fill="#fdd"
      shadowBlur={40}
      shadowColor="#f005"
      fontSize={45}
      opacity={0}
      y={-80}
    />
  ) as Latex;
  const expand2 = (
    <Latex
      tex={math(
        "= 2Ax^2 - Ax - A + Bx - B + C = 2Ax^2 + (B - A)x + (-A - B + C)"
      )}
      fill="#faa"
      shadowBlur={40}
      shadowColor="#f005"
      fontSize={45}
      opacity={0}
      y={20}
    />
  ) as Latex;
  const expand3 = (
    <Latex
      tex={math("= 2Ax^2 + (B - A)x + (-A - B + C) = 2x^2 - 3x - 2")}
      fill="#f77"
      shadowBlur={40}
      shadowColor="#f005"
      fontSize={45}
      opacity={0}
      y={120}
    />
  ) as Latex;
  const wrongIcon = (
    <Icon
      icon="mdi:close-circle-outline"
      size={110}
      color="#e45a5a"
      opacity={0}
      y={230}
    />
  );

  view.add(expand1);
  view.add(expand2);
  view.add(expand3);
  view.add(wrongIcon);

  yield eqnLayout.y(-180, 1, easeOutCubic);
  yield* sequence(
    1.5,
    all(
      expand1.opacity(1, 0.6),
      expand1.y(-80, 0.6, easeOutBack),
      expand1.scale(1, 0.6, easeOutBack)
    ),
    all(
      expand2.opacity(1, 0.6),
      expand2.y(20, 0.6, easeOutBack),
      expand2.scale(1, 0.6, easeOutBack)
    ),
    all(
      expand3.opacity(1, 0.6),
      expand3.y(120, 0.6, easeOutBack),
      expand3.scale(1, 0.6, easeOutBack)
    )
  );

  yield* waitUntil("wrong");
  yield* all(
    wrongIcon.opacity(1, 0.6),
    wrongIcon.scale(1, 0.6, easeOutBack),
    wrongIcon.shadowBlur(80, 0.3, easeOutBack)
  );
  yield wrongIcon.shadowBlur(0, 2);
  yield* waitFor(2);

  yield* all(
    expand1.opacity(0, 0.4),
    expand1.scale(0.5, 0.4, easeInBack),
    expand2.opacity(0, 0.4),
    expand2.scale(0.5, 0.4, easeInBack),
    expand3.opacity(0, 0.4),
    expand3.scale(0.5, 0.4, easeInBack),
    wrongIcon.opacity(0, 0.4),
    wrongIcon.scale(0.5, 0.4, easeInBack),
    eqnLayout.y(0, 1)
  );

  expand1.remove();
  expand2.remove();
  expand3.remove();
  wrongIcon.remove();

  const vanishPanel = new Glass({
    y: -2000,
    size: 50,
    radius: 1000,
    borderModifier: -1,
    lightness: -0.7,
    clip: true,
    alignItems: "center",
    alignContent: "center",
  });
  view.add(vanishPanel);

  const vanishEqs = [
    "3x + 6 = 3(x + 2)",
    "4a^2 - 4a = 4a(a - 1)",
    "x^2 - 2x + 1 = (x - 1)^2",
  ];
  const texes = vanishEqs.map((val, i) => (
    <Layout
      position={new Vector2(0, -100 + i * 100)}
      layout
      opacity={0}
      scale={0.5}
    >
      <Latex tex={val} fill={"white"} fontSize={40} />
      <Latex
        tex={"\\phantom{a}\\cdot 0"}
        fill={"rgba(128, 182, 247, 1)"}
        shadowColor={"rgba(34, 126, 238, 1)"}
        shadowBlur={20}
        scale={0}
      />
    </Layout>
  ));

  vanishPanel.add(<>{texes}</>);

  yield* waitUntil("0");
  yield* chain(
    all(
      vanishPanel.size(20, 1, easeOutBack),
      vanishPanel.position(0, 1, easeOutExpo)
    ),
    all(
      vanishPanel.size(2200, 0.4, easeInExpo),
      sequence(
        0.4,
        ...texes.map((tex) =>
          all(
            tex.scale(1, 0.5, easeOutCubic),
            tex.opacity(1, 0.5, easeOutCubic)
          )
        ),
        sequence(
          0.5,
          ...texes.map((tex) =>
            all(
              tex
                .findLast((child) => child instanceof Latex)
                .scale(1, 0.5, easeOutBack)
            )
          )
        )
      )
    ),
    all(
      sequence(
        0.2,
        ...texes.map((tex) =>
          all(
            tex
              .findFirst((child) => child instanceof Latex)
              .fill("rgba(128, 182, 247, 1)", 0.5),
            tex.findLast((child) => child instanceof Latex).tex("0", 0.5),
            tex.findFirst((child) => child instanceof Latex).fontSize(0, 0.5),
            tex.findFirst((child) => child instanceof Latex).scale([0, 1], 0.5)
          )
        )
      )
    ),
    waitUntil("add 0"),
    all(
      sequence(
        0.2,
        ...texes.map((tex) =>
          all(
            tex
              .findFirst((child) => child instanceof Latex)
              .fill("rgba(255, 255, 255, 1)", 0.5),
            tex
              .findLast((child) => child instanceof Latex)
              .tex("\\phantom{}+ 0", 0.5),
            tex.findFirst((child) => child instanceof Latex).fontSize(40, 0.5),
            tex.findFirst((child) => child instanceof Latex).scale([1, 1], 0.5)
          )
        )
      )
    ),
    waitFor(2),
    all(
      sequence(
        0.2,
        ...texes.map((tex) =>
          all(tex.findLast((child) => child instanceof Latex).fontSize(0, 0.5))
        )
      )
    )
  );
  yield* waitUntil("back");
  yield* chain(
    all(vanishPanel.size(0, 1, easeInBack), vanishPanel.y(-1000, 1, easeInExpo))
  );
  yield* waitUntil("substitute");
  const infotext_C = (
    <PTxt stroke={"#fff5"} y={150} fontSize={50} opacity={0} fontWeight={200} />
  ) as PTxt;
  view.add(infotext_C);
  yield* all(
    infotext_C.opacity(1, 1),
    infotext_C.text("We will choose our own x.", 1)
  );
  yield* waitUntil("x = 1");
  yield* all(infotext_C.text("What if x is 1 ?", 1)),
    yield* sequence(
      0.7,
      all(aTerm.fontSize(0, 1), sign_ab.fontSize(0, 1)),
      all(bTerm.fontSize(0, 1), sign_bc.fontSize(0, 1)),
      all(rhs.tex("=(2+1)(1-1)-(2+1)", 2))
    );
  yield* waitUntil("solve x =  1");
  yield* sequence(
    1,
    all(rhs.tex("= -3", 2), eqnLayout.x(-50, 1)),
    infotext_C.text("We know C is -3", 2)
  );
  yield* waitUntil("revert");
  yield* all(
    infotext_C.bottomLeft([-1920 / 2 + 50, 1080 / 2 - 150], 1),
    infotext_C.text("C = -3", 1),
    rhs.tex("=(2x+1)(x-1)-(2x+1)", 2)
  );
  yield* all(
    ...eqnLayout.children().map((child: Latex) => all(child.fontSize(40, 1)))
  );

  const infotext_B = (
    <PTxt stroke={"#fff5"} y={150} fontSize={50} opacity={0} fontWeight={200} />
  ) as PTxt;
  view.add(infotext_B);
  yield* all(
    infotext_B.opacity(1, 1),
    infotext_B.text("Now let's try x = -1/2", 1)
  );
  yield* waitUntil("x = -1/2");
  yield* sequence(
    0.3,
    all(aTerm.fontSize(0, 1), sign_ab.fontSize(0, 1)),
    all(cTerm.tex("(- 3)", 1)),
    all(rhs.tex("=(-1+1)(-1-1)-(2(-1)+1)", 2))
  );
  yield* waitUntil("solve x = -1/2");
  yield* sequence(
    1,
    all(
      rhs.tex("= \\phantom{13}-2", 2),
      eqnLayout.x(-50, 1),
      cTerm.fontSize(0, 1),
      sign_bc.fontSize(0, 1)
    ),
  );
  yield* waitUntil("revert 2");
  yield* all(
    infotext_B.bottomLeft([-1920 / 2 + 50, 1080 / 2 - 220], 1),
    infotext_B.text("B = -2", 1),
    rhs.tex("=(2x+1)(x-1)-(2x+1)", 1),
    eqnLayout.x(0, 1),
    aTerm.fontSize(50, 1),
    sign_ab.fontSize(50, 1),
    cTerm.fontSize(50, 1),
    sign_bc.fontSize(50, 1),
    bTerm.tex("(-2)(x-1)", 1),
  );

  // === Substitute x = 0 ===
  yield* waitUntil("x = 0");
  const infotext_A = (
    <PTxt stroke={"#fff5"} y={150} fontSize={50} opacity={0} fontWeight={200} />
  ) as PTxt;
  view.add(infotext_A);
  yield all(
    infotext_A.opacity(1, 1),
    infotext_A.text("Choose x = 0 to solve for A", 1)
  );
  yield* all(
    all(bTerm.tex("2",1)),
    all(aTerm.tex("A(2·0+1)(0-1)", 2)),
    all(rhs.tex("=(2·0+1)(0-1)-(2·0+1)", 2)),
      
  );
  yield* waitUntil("solve x = 0");
  yield* sequence(
    1,
    all(
      all(rhs.tex("= \\phantom{12} 1", 1), eqnLayout.x(-50, 1)),
      aTerm.tex("A", 1),
      sign_ab.fontSize(0,1),
      sign_bc.fontSize(0,1),
      bTerm.fontSize(0,1),
      cTerm.fontSize(0,1),
    ),
    infotext_A.text("We know A is 1", 2),
  );
  yield* waitUntil("revert 3");
  yield* all(
    infotext_A.bottomLeft([-1920 / 2 + 50, 1080 / 2 - 290], 1),
    infotext_A.text("A = -2", 1),
    aTerm.tex("A(2x+1)(x-1)",1),
    bTerm.tex("B(x-1)",0),
    cTerm.tex("C",0),
    rhs.tex("=(2x+1)(x-1)-(2x+1)", 1),
    eqnLayout.x(0, 1),
  );
  yield* all(...eqnLayout.children().map((child: Latex) => all(child.fontSize(40, .5))))
  yield* all(
    ...[infotext_A, infotext_B,infotext_C].map((t, i)=>t.position([0,-100+i*100+250], 1)),
    ...[infotext_A, infotext_B,infotext_C].map((t, i)=>t.fontWeight(400, .3)),
  )

  yield* waitUntil("next");
});
