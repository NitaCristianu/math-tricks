import {
  Circle,
  invert,
  makeScene2D,
  Node,
  Ray,
  Spline,
  Txt,
  Latex,
  Rect,
} from "@motion-canvas/2d";
import {
  Color,
  PossibleColor,
  PossibleVector2,
  Vector2,
  all,
  sequence,
  waitFor,
  easeOutBack,
  easeInBack,
  easeOutCubic,
  run,
  delay,
  waitUntil,
  createRefArray,
  easeInOutQuad,
  easeInExpo,
  easeInCubic,
} from "@motion-canvas/core";
import { ShaderBackground } from "../components/gen/background";
import { PTxt } from "../components/gen/Ptxt";
import { math } from "../components/gen/Pitex";
import { Glass } from "../components/gen/Glass";

const SCALE = 1;
const pts: [number, number][] = [
  [400, 0],
  [-52.09445330007909, 295.4423259036624],
  [-346.4101615137755, 199.99999999999997],
  [-192.83628290596184, -229.81333293569338],
  [0, 0],
]
  .map((pt) => new Vector2(pt as any))
  .map((pt) => pt.rotate(-140))
  .map((pt) => [pt.x, pt.y]);

const A = 0,
  B = 1,
  C = 2,
  D = 3,
  O = 4;

const pointColors = ["#E63946", "#32a028ff", "#2A9D8F", "#E9C46A", "#264653"];

function projectPointOnLine(A: Vector2, B: Vector2, C: Vector2) {
  const AB = { x: B.x - A.x, y: B.y - A.y };
  const AC = { x: C.x - A.x, y: C.y - A.y };

  const ab2 = AB.x * AB.x + AB.y * AB.y; // |AB|^2
  const t = (AC.x * AB.x + AC.y * AB.y) / ab2;

  return new Vector2(A.x + t * AB.x, A.y + t * AB.y);
}

function getAngleAtBAC(a: Vector2, b: Vector2, c: Vector2) {
  // Build vectors AB and AC
  const AB = {
    x: b.x - a.x,
    y: b.y - a.y,
  };

  const AC = {
    x: c.x - a.x,
    y: c.y - a.y,
  };

  // Dot product
  const dot = AB.x * AC.x + AB.y * AC.y;

  // Magnitudes
  const magAB = Math.sqrt(AB.x ** 2 + AB.y ** 2);
  const magAC = Math.sqrt(AC.x ** 2 + AC.y ** 2);

  // Avoid division by zero
  if (magAB === 0 || magAC === 0) return null;

  // Clamp to [-1, 1] to avoid NaN due to floating-point errors
  const cosTheta = Math.min(1, Math.max(-1, dot / (magAB * magAC)));

  return (Math.acos(cosTheta) * 180) / Math.PI;
}

// ---------- helpers
function createPoint(
  name: string,
  position: PossibleVector2,
  color: PossibleColor,
  hidden = true
) {
  return (
    <Circle
      size={60}
      fill={new Color(color).desaturate(2)}
      position={new Vector2(position).mul(SCALE)}
      shadowBlur={22}
      shadowColor={new Color(color).alpha(0.55)}
      stroke={"#efefef"}
      lineWidth={2}
      opacity={hidden ? 0 : 1}
      scale={hidden ? 0.6 : 1}
      zIndex={2}
    >
      <PTxt
        fontWeight={800}
        shadowColor={color}
        fontSize={40}
        fill={"#efefef"}
        text={name.toUpperCase()}
      />
    </Circle>
  ) as Circle;
}

function createEdge(a: PossibleVector2, b: PossibleVector2, hidden = true) {
  const A = new Vector2(a).mul(SCALE);
  const B = new Vector2(b).mul(SCALE);
  return (
    <Ray
      zIndex={-1}
      from={A}
      to={B}
      lineWidth={12}
      stroke={"#efefef"}
      shadowBlur={18}
      shadowColor={"#efefef40"}
      end={hidden ? 0 : 1}
      opacity={1}
    />
  ) as Ray;
}

// clearer equality ticks: two parallel, thicker, glowing
function createTicksOn(
  a: PossibleVector2,
  b: PossibleVector2,
  len = 28,
  spacing = 24,
  width = 12
) {
  const A = new Vector2(a).mul(SCALE);
  const B = new Vector2(b).mul(SCALE);
  const mid = A.scale(0.5).add(B.scale(0.5));
  const dir = B.sub(A).normalized;
  const perp = new Vector2(-dir.y, dir.x).normalized.scale(len / 2);

  const mk = (center: Vector2) =>
    (
      <Ray
        from={center.sub(perp)}
        to={center.add(perp)}
        stroke={"#ffffff"}
        lineWidth={width}
        shadowBlur={22}
        shadowColor={"#ffffffaa"}
        opacity={0}
        zIndex={-1}
      />
    ) as Ray;

  const c1 = mid.add(dir.scale(+spacing / 2));
  const c2 = mid.add(dir.scale(-spacing / 2));
  return [mk(c1), mk(c2)];
}

// highlight edge (accent color), drawn with `end` animation
function createHighlightEdge(
  a: PossibleVector2,
  b: PossibleVector2,
  color: string = "#43AA8B",
  width: number = 18,
  hidden = true
) {
  const A = new Vector2(a).mul(SCALE);
  const B = new Vector2(b).mul(SCALE);
  return (
    <Ray
      zIndex={0}
      from={A}
      to={B}
      lineWidth={width}
      stroke={color}
      shadowBlur={28}
      shadowColor={`${color}80`}
      end={hidden ? 0 : 1}
      opacity={1}
    />
  ) as Ray;
}

// inset triangle (so highlight sits inside edges), behind ABCD
function createInsetTri(
  indices: number[],
  color: string,
  inset = 0.92,
  hidden = true
) {
  const raw = indices.map((i) => new Vector2(pts[i]).mul(SCALE));

  return (
    <Spline
      points={raw}
      fill={new Color(color).alpha(0.42)}
      stroke={new Color(color).alpha(0)}
      lineWidth={0}
      opacity={hidden ? 0 : 1}
      zIndex={-2} // under edges/points
      smoothness={0}
    />
  ) as Spline;
}

// bottom-right caption as LaTeX (lighter weight)
function createCaption(
  tex: string,
  weight: number = 300,
  scale = 0.9,
  pos: PossibleVector2 = [0, 1080 / 2 - 100]
) {
  return (
    <Latex
      tex={tex}
      fill={"#efefef"}
      opacity={0}
      position={pos}
      // emulate "lighter" weight via slight shadow + scale
      shadowColor={"#00000080"}
      shadowBlur={8}
      scale={scale}
    />
  ) as Latex;
}

// LaTeX note (for cinematic right-side stack)
function createNote(tex: string, scale = 0.9) {
  return (
    <Latex
      tex={tex}
      fill={"#efefef"}
      opacity={0}
      shadowColor={"#00000066"}
      shadowBlur={6}
      scale={scale}
    />
  ) as Latex;
}

// ---------- micro-anims (smoother pacing)
function* popInPoint(pt: Circle, t = 0.55) {
  yield* all(pt.opacity(1, t * 0.9), pt.scale(1.1, t, easeOutBack));
  yield* pt.scale(1, 0.22);
}
function* popOutPoint(pt: Circle, t = 0.55) {
  yield* all(pt.scale(0.7, t, easeInBack), pt.opacity(0, t));
}
function* drawLine(ln: Ray, t = 0.8) {
  yield* all(ln.end(1, t, easeOutCubic), ln.shadowBlur(24, t));
}
function* retractLine(ln: Ray, t = 0.45) {
  yield* all(ln.end(0, t), ln.shadowBlur(0, t));
}
function* flashTicks(tks: Ray[], tin = 0.24, hold = 0.45, tout = 0.28) {
  yield* all(...tks.map((t) => t.opacity(1, tin)));
  yield* waitFor(hold);
  yield* all(...tks.map((t) => t.opacity(0, tout)));
}
function* pulseTri(poly: Spline, tin = 0.45, hold = 0.7, tout = 0.45) {
  yield* poly.opacity(1, tin, easeOutCubic);
  yield* waitFor(hold);
  yield* poly.opacity(0, tout);
}
function* revealCaption(c: Latex, tin = 0.35, hold = 1.0, tout = 0.35) {
  yield* c.opacity(1, tin, easeOutCubic);
  yield* waitFor(hold);
  yield* c.opacity(0, tout);
}

// adapters
const seqIn = (pt: Circle, t = 0.55) =>
  function* () {
    yield* popInPoint(pt, t);
  };
const seqLn = (ln: Ray, t = 0.8) =>
  function* () {
    yield* drawLine(ln, t);
  };
const seqLnR = (ln: Ray, t = 0.45) =>
  function* () {
    yield* retractLine(ln, t);
  };

export default makeScene2D(function* (view) {
  view.fill("rgba(93, 96, 240, 1)");
  const bgr = (
    <ShaderBackground
      preset="pihedronQuad"
      filters={[invert(1)]}
      opacity={0.6}
    />
  );

  const container = <Node />;
  const cam = <Node />;
  const group = <Node />;
  const notes = <Node />;
  const INITIAL_POS = new Vector2(0, 0);

  // points
  const pA = createPoint("A", pts[A], pointColors[A], true);
  const pB = createPoint("B", pts[B], pointColors[B], true);
  const pC = createPoint("C", pts[C], pointColors[C], true);
  const pD = createPoint("D", pts[D], pointColors[D], true);
  const pO = createPoint("O", pts[O], pointColors[O], true);

  // edges
  const eAB = createEdge(pts[A], pts[B], true);
  const eBC = createEdge(pts[B], pts[C], true);
  const eCD = createEdge(pts[C], pts[D], true);
  const eDA = createEdge(pts[D], pts[A], true);

  // BC highlight overlay
  const hBC = createHighlightEdge(pts[B], pts[C], "#f57723", 18, true);
  const hAB = createHighlightEdge(pts[A], pts[B], "#237ef5", 18, true);

  // radials
  const rAO = createEdge(pts[A], pts[O], true);
  const rBO = createEdge(pts[B], pts[O], true);
  const rCO = createEdge(pts[C], pts[O], true);
  const rDO = createEdge(pts[D], pts[O], true);

  // equality ticks (double & visible)
  const tAO = createTicksOn(pts[A], pts[O]);
  const tBO = createTicksOn(pts[B], pts[O]);
  const tCO = createTicksOn(pts[C], pts[O]);
  const tDO = createTicksOn(pts[D], pts[O]);

  // area highlights (INSET + behind ABCD) — Polygon to fix types
  const triABO = createInsetTri([A, B, O], "#4CC9F0", 0.92);
  const triCDO = createInsetTri([C, D, O], "#F72585", 0.92);

  // captions (bottom-right, lighter weight)
  const capDist = createCaption(
    "\\text{AO} = \\text{BO} = \\text{CO} = \\text{DO}",
    500,
    0.9
  );
  const capArea = createCaption(
    "\\text{Area}(\\triangle ABO) = \\text{Area}(\\triangle CDO)",
    500,
    0.9
  );
  const capFind = createCaption(
    "\\textbf{Find }BC",
    600,
    1.0,
    new Vector2([200, 0])
  );

  // layout / stacking
  group.position(INITIAL_POS);

  // notes layout to the right of the figure
  const notesOrigin = new Vector2(INITIAL_POS.x + 550, INITIAL_POS.y - 320);
  const NOTE_GAP = 156;
  notes.position(notesOrigin);

  container.add(bgr);
  group.add(triABO);
  group.add(triCDO);
  group.add(eAB);
  group.add(eBC);
  group.add(eCD);
  group.add(eDA);
  group.add(hBC);
  group.add(hAB);
  group.add(rAO);
  group.add(rBO);
  group.add(rCO);
  group.add(rDO);
  tAO.forEach((t) => group.add(t));
  tBO.forEach((t) => group.add(t));
  tCO.forEach((t) => group.add(t));
  tDO.forEach((t) => group.add(t));
  group.add(pA);
  group.add(pB);
  group.add(pC);
  group.add(pD);
  group.add(pO);
  cam.add(group);
  cam.add(notes);
  container.add(cam);
  container.add(capDist);
  container.add(capArea);
  container.add(capFind);
  view.add(container);

  // build cinematic LaTeX notes (right stack)
  const noteTexes = [
    "S_{\\triangle ABO} \\propto AO\\,BO\\,\\sin(\\angle AOB)",
    "S_{\\triangle CDO} \\propto CO\\,DO\\,\\sin(\\angle COD)",
    "AO=CO,\\quad BO=DO",
    "\\angle AOB + \\angle COD = \\pi",
    "\\sin(\\angle AOB) = \\sin(\\angle COD)",
    "\\textit{Introduce auxiliary lines}",
    "\\textit{Assume random angles}",
    "\\textbf{Try Law of Sines}",
    "\\frac{AO}{\\sin\\angle ABO}=\\frac{BO}{\\sin\\angle BAO}",
    "\\textbf{Then Law of Cosines}",
    "AO^2+BO^2-2\\,AO\\,BO\\cos\\angle AOB",
    "\\textit{Vector dot products?}",
    "(\\vec{AO}\\cdot\\vec{BO}) = \\|AO|\\,\\|BO|\\cos\\angle AOB",
    "\\textit{Area via cross product}",
    "\\tfrac12\\,AO\\,BO\\,\\sin\\angle AOB",
    "\\textit{This is getting long...}",
    "\\textit{Look for symmetry instead.}",
  ];

  const noteNodes = noteTexes.map((tex, i) => {
    const n = createNote(tex, 0.9);
    n.position(notesOrigin.addY(i * NOTE_GAP));
    notes.add(n);
    return n;
  });

  // --- TIMELINE (smoother pacing) ---

  yield* waitUntil("start");
  // 1) Draw ABCD (points then edges)
  yield* sequence(
    0.08,
    run(seqIn(pA)),
    run(seqIn(pB)),
    run(seqIn(pC)),
    run(seqIn(pD))
  );
  yield* all(
    run(seqLn(eAB)),
    run(seqLn(eBC)),
    run(seqLn(eCD)),
    run(seqLn(eDA))
  );

  // --- Corrected ORDER ---
  // (1) O appears → draw radials → equidistance ticks → area equality pulse
  yield* waitUntil("o");
  yield* popInPoint(pO, 0.55);
  yield* all(
    run(seqLn(rAO, 0.7)),
    run(seqLn(rBO, 0.7)),
    run(seqLn(rCO, 0.7)),
    run(seqLn(rDO, 0.7))
  );
  yield* all(
    flashTicks(tAO, 0.24, 0.5, 0.28),
    flashTicks(tBO, 0.24, 0.5, 0.28),
    flashTicks(tCO, 0.24, 0.5, 0.28),
    flashTicks(tDO, 0.24, 0.5, 0.28),
    revealCaption(capDist, 0.35, 1.0, 0.3)
  );
  yield* waitUntil("area");
  yield* all(
    pulseTri(triABO, 0.45, 0.6, 0.45),
    pulseTri(triCDO, 0.45, 0.6, 0.45),
    revealCaption(capArea, 0.35, 1.0, 0.3)
  );
  yield* waitUntil("values");
  const values: [[number, number], number][] = [
    [[A, B], 63],
    [[C, D], 16],
    [[A, D], 56],
  ];
  const helpers = values.map((data) =>
    createHighlightEdge(pts[data[0][0]], pts[data[0][1]], "#47a3ee")
  );
  const texts = values.map((data) => (
    <Latex
      position={function () {
        const raw = data[0].map((i) => new Vector2(pts[i]).mul(SCALE));
        return raw[0].lerp(raw[1], 0.5);
      }}
      fill={"white"}
      tex={data[1].toFixed(0)}
      opacity={0}
      scale={0}
    />
  ));
  helpers.forEach((helper) => group.add(helper));
  texts.forEach((text) => group.add(text));
  yield* all(
    sequence(
      1.2,
      ...texts.map((text, i) =>
        all(text.scale(1, 1), text.opacity(1, 1), run(seqLn(helpers[i], 1)))
      )
    )
  );
  yield* waitUntil("find bc");

  // (2) Ask to find BC → focus/zoom on BC → reveal BC
  yield delay(
    0.5,
    all(
      revealCaption(capFind, 1, 0.5, 0.25),
      sequence(
        0.1,
        ...texts.map((text, i) =>
          all(text.scale(0, 1), text.opacity(0, 1), run(seqLnR(helpers[i], 1)))
        )
      )
    )
  );
  const bcMidLocal = new Vector2(pts[B]).add(pts[C]).scale(0.5).mul(SCALE);
  const bcMidWorld = bcMidLocal.add(INITIAL_POS);
  yield* all(
    run(seqLn(hBC, 0.8)),
    cam.scale(1.9, 0.9, easeOutCubic),
    cam.position(
      new Vector2(-bcMidWorld.x * 1.9, -bcMidWorld.y * 1.9),
      0.9,
      easeOutCubic
    ),
    pB.scale(1.15, 0.45, easeOutBack),
    pC.scale(1.15, 0.45, easeOutBack)
  );
  yield* all(pB.scale(1, 0.3), pC.scale(1, 0.3));
  yield* waitUntil("notes");

  // reset cam before notes
  yield all(
    cam.scale(1, 1.8, easeOutCubic),
    cam.position(new Vector2(0, 0), 1.8, easeOutCubic)
  );

  // (3) NOTES LAST — appear slowly; per-note zoom to each (no drift)
  yield* sequence(
    0.52,
    ...noteNodes.map((n, i) =>
      run(function* () {
        const targetScale = Math.min(1.15 + i * 0.1, 1.3);
        const local = notesOrigin.addY(i * NOTE_GAP);
        const pos = new Vector2(-local.x * targetScale, -local.y * targetScale)
          .addX(-700)
          .addY(150);
        n.scale(0.85);
        yield* all(
          n.opacity(1, 0.45),
          n.scale(1.06, 0.45, easeOutBack),
          cam.scale(targetScale, 1, easeOutCubic),
          cam.position(pos, 1, easeOutCubic)
        );
        yield* n.scale(1, 0.18);
      })
    )
  );
  yield* waitUntil("dream");
  const glass = (<Glass borderModifier={-3} radius={1000} />) as Glass;
  view.add(glass);
  yield* all(glass.size(2200, 1));

  {
    const camera = <Node scale={1.5} zIndex={2} position={[100, 150]} />;
    glass.add(camera);
    const POINTS = [
      [-30, -7],
      [20, 10],
      [0, -20],
    ].map((pt) => [pt[0] * 15, pt[1] * 15]) as PossibleVector2[];
    // points
    const pA = createPoint("A", POINTS[A], "rgba(85, 85, 85, 1)", true);
    const pB = createPoint("B", POINTS[B], "rgba(85, 85, 85, 1)", true);
    const pC = createPoint("C", POINTS[C], "rgba(85, 85, 85, 1)", true);

    // edges
    const eAB = createEdge(POINTS[A], POINTS[B], true);
    const eBC = createEdge(POINTS[B], POINTS[C], true);
    const eAC = createEdge(POINTS[C], POINTS[A], true);

    camera.add(pA);
    camera.add(pB);
    camera.add(pC);
    camera.add(eAB);
    camera.add(eBC);
    camera.add(eAC);

    const valueA_offset = pB
      .position()
      .sub(pA.position())
      .normalized.rotate(90)
      .mul(40);
    const valueA = (
      <Latex
        tex={"a"}
        fill={"#fff"}
        position={pA.position().lerp(pB.position(), 0.5)}
        opacity={0}
        scale={0.5}
      />
    );
    const valueB_offset = pA
      .position()
      .sub(pC.position())
      .normalized.rotate(90)
      .mul(40);
    const valueB = (
      <Latex
        tex={"b"}
        fill={"#fff"}
        position={pA.position().lerp(pC.position(), 0.5)}
        opacity={0}
        scale={0.5}
      />
    );

    const angle_bac =
      getAngleAtBAC(pA.position(), pB.position(), pC.position()) + 20;
    const angle_mark = (
      <Spline
        position={pA.position()}
        fill={"rgba(241, 112, 42, 0.37)"}
        stroke={"red"}
        zIndex={-2}
        smoothness={0}
        points={[
          new Vector2(Math.cos(angle_bac), Math.sin(angle_bac)).mul([150, 100]),
          [0, 0],
          new Vector2(-Math.cos(angle_bac), Math.sin(angle_bac)).mul([
            -150, -80,
          ]),
        ]}
        end={0}
      />
    ) as Spline;
    const angle_tex = (
      <Latex
        tex={"\\theta"}
        fill={"white"}
        fontSize={45}
        position={pA.position()}
        scale={0.5}
        opacity={0}
        zIndex={3}
      />
    );
    const angle_tex_offset = new Vector2(
      Math.cos(angle_bac),
      Math.sin(angle_bac)
    ).mul([120, 0]);

    camera.add(valueA);
    camera.add(valueB);
    camera.add(angle_tex);
    camera.add(angle_mark);

    const C_projection_AB = projectPointOnLine(
      new Vector2(POINTS[A]),
      new Vector2(POINTS[B]),
      new Vector2(POINTS[C])
    );
    const CD = createEdge(POINTS[A], POINTS[C]);
    const Dpoint = createPoint("D", C_projection_AB, "rgba(83, 196, 49, 1)");

    camera.add(CD);
    camera.add(Dpoint);

    // TIMELINE

    yield sequence(0.1, run(seqIn(pA)), run(seqIn(pB)), run(seqIn(pC)));
    yield* sequence(0.1, run(seqLn(eAB)), run(seqLn(eBC)), run(seqLn(eAC)));
    yield* sequence(
      0.4,
      all(
        valueA.opacity(1, 0.5, easeOutCubic),
        valueA.scale(1, 0.5, easeOutCubic),
        valueA.position(valueA.position().add(valueA_offset), 0.5, easeOutCubic)
      ),
      all(
        valueB.opacity(1, 0.5, easeOutCubic),
        valueB.scale(1, 0.5, easeOutCubic),
        valueB.position(valueB.position().add(valueB_offset), 0.5, easeOutCubic)
      )
    );
    yield* waitFor(0.4);
    // angle
    yield* all(
      angle_mark.end(1, 1),
      angle_tex.opacity(1, 0.5, easeOutCubic),
      angle_tex.scale(1, 0.5, easeOutCubic),
      angle_tex.position(
        angle_tex.position().add(angle_tex_offset),
        0.5,
        easeOutCubic
      )
    );

    yield* waitUntil("project");

    yield* all(
      run(seqLn(CD)),
      CD.from(Dpoint.position(), 2),
      delay(1, run(seqIn(Dpoint)))
    );

    const highlight_cd = createHighlightEdge(
      POINTS[C],
      C_projection_AB,
      "#92f18f"
    );
    camera.add(highlight_cd);
    const NOTES = [
      "h = b\\cdot\\sin\\left(\\theta\\right)",
      "\\text{Area}(\\triangle ABC) = \\frac{h \\cdot base}{2}",
      "\\text{Area}(\\triangle ABC) = \\frac{CD \\cdot AB}{2}",
      "\\text{Area}(\\triangle ABC) = \\frac{a\\cdot b\\cdot\\sin\\left(\\theta\\right)}{2}",
    ];
    const texes = createRefArray<Latex>();
    const info = (
      <Rect
        direction={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        gap={30}
        layout
        x={750}
        y={-100}
      >
        {...NOTES.map((note) => (
          <Latex
            ref={texes}
            tex={note}
            fill={"#f0f0f0ff"}
            shadowBlur={40}
            shadowColor={"#4e4e4ea0"}
            opacity={0}
            fontSize={0}
          />
        ))}
      </Rect>
    );
    camera.add(info);
    yield* waitUntil("calc perp");

    yield* all(run(seqLn(highlight_cd)));

    yield* all(
      camera.x(-300, 2),
      camera.scale(1, 2, easeInOutQuad),
      delay(1, all(texes[0].fontSize(50, 1), texes[0].opacity(1, 1)))
    );
    yield* sequence(
      1,
      ...texes.map((tex) =>
        all(tex.fontSize(40, 0.6, easeInOutQuad), tex.opacity(1, 1))
      )
    );
    yield* waitUntil("final");
    yield* all(
      ...texes.map((tex, i) => (i != 3 ? all(tex.fontSize(0, 1)) : null)),
      info.y(-100, 1),
      camera.y(50, 1)
    );
  }
  yield* waitUntil("back");
  yield* all(
    glass.scale(0, 1, easeInCubic),
    glass.position(2000, 1, easeInCubic),
    cam.position([0, 1], 1),
    notes.opacity(0, 1),
    run(function* () {
      hBC.remove();
    })
  );
  yield* waitUntil("area2");
  const angle_DOC_size =
    getAngleAtBAC(pD.position(), pO.position(), pC.position()) - 20;
  const angle_BOA = (
    <Circle
      size={100}
      stroke={"rgba(241, 157, 112, 1)"}
      shadowBlur={10}
      shadowColor={"rgba(252, 121, 51, 0.9)"}
      lineWidth={3}
      position={pO.position}
      startAngle={180 - angle_DOC_size}
      endAngle={180 + angle_DOC_size}
      rotation={90}
      end={0}
    />
  ) as Circle;
  const angle_COD = (
    <Circle
      size={100}
      stroke={"rgba(241, 157, 112, 1)"}
      shadowBlur={10}
      shadowColor={"rgba(252, 121, 51, 0.9)"}
      lineWidth={3}
      position={pO.position}
      startAngle={180 - angle_DOC_size + 10}
      endAngle={180 + angle_DOC_size - 10}
      rotation={-130}
      end={0}
    />
  ) as Circle;

  const NOTES = ["\\sin\\left(\\widehat{AOB}\\right) = \\sin\\left(\\widehat{COD}\\right)"];
  const texes = createRefArray<Latex>();
  const info = (
    <Rect
      direction={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      gap={30}
      layout
      x={750}
      y={0}
    >
      {...NOTES.map((note) => (
        <Latex
          ref={texes}
          tex={note}
          fill={"#f0f0f0ff"}
          shadowBlur={40}
          shadowColor={"#4e4e4ea0"}
          opacity={0}
          fontSize={0}
        />
      ))}
    </Rect>
  );
  cam.add(info);

  cam.add(angle_BOA);
  cam.add(angle_COD);
  yield* all(
    cam.x(-450, 1),
    angle_COD.end(1, 2),
    angle_BOA.end(1, 2),
    // pulseTri(triABO, 0.45, 0.6, 0.45),
    // pulseTri(triCDO, 0.45, 0.6, 0.45),
    delay(1, all(texes[0].fontSize(40, 1), texes[0].opacity(1, 1)))
  );

  yield* waitUntil("next");
});
