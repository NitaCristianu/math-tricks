import { makeScene2D, Rect, Txt, Icon } from "@motion-canvas/2d";
import {
  all,
  createRef,
  createSignal,
  easeInOutQuint,
  easeOutBack,
  tween,
  Vector2,
  waitFor,
  linear,
} from "@motion-canvas/core";
import { ShaderBackground } from "../components/gen/background"; // adjust path if needed

/**
 * Chapter Overview scene (cards now contain their own shader backgrounds)
 * - Timings unchanged
 * - Easing refined (Quint/Back)
 * - Cards slightly larger + self-contained shader BG
 */

const W = 1920;
const H = 500;
const CARD_W = 880; // bigger cards
const CARD_H = 240;

// --- Icon factories using <Icon icon=... /> ---
export function DiscreteIcon(size = 96) {
  return <Icon icon="ph:squares-four" color="#fff" size={size} />;
}

export function AlgebraIcon(size = 96) {
  return <Icon icon="ph:function" color="#fff" size={size} />;
}

export function GeometryIcon(size = 96) {
  return <Icon icon="ph:triangle" color="#fff" size={size} />;
}

export function ProbabilityIcon(size = 96) {
  return <Icon icon="ph:dice-five" color="#fff" size={size} />;
}

// --- Chapter card factory (self-contained BG + glass scrim) ---
function ChapterCard(
  title: string,
  subtitle: string,
  iconNode: any,
  preset: string
) {
  const titleSize = createSignal(0);
  const cardScale = createSignal(0.96);
  const cardOpacity = createSignal(0);

  const box = (
    <Rect
      width={CARD_W}
      height={CARD_H}
      radius={6000}
      clip
      scale={() => cardScale() * 0.8}
      opacity={() => cardOpacity()}
      shadowColor="#000000"
      shadowBlur={40}

    >
      {/* shader background inside the card */}
      {/* dark glass scrim for readability */}
      <Rect
        width={"100%"}
        height={CARD_H}
        radius={328}
        fill="#0B0E14B3"
        stroke="#FFFFFF22"
        lineWidth={1.5}
        clip
      >
        <ShaderBackground preset={preset as any} scale={2.2} size={'150%'} />
      </Rect>

      {/* content layer */}
      <Rect layout direction="row"  gap={26} alignItems="center" padding={10}>
        <Rect
          width={112}
          height={112}
          radius={30}
          alignItems="center"
          justifyContent="center"
          fill="#FFFFFF14"
          stroke="#FFFFFF2A"
          lineWidth={1}
          shadowColor="#00000066"
          shadowBlur={10}
        >
          {iconNode}
        </Rect>
        <Rect layout direction="column" gap={8} height={100}>
          <Txt
            text={title}
            fontFamily="Poppins, Inter, system-ui, sans-serif"
            fontWeight={900}
            fill="#FFFFFF"
            fontSize={() => titleSize()}
            letterSpacing={0.5}
          />
          <Txt
            text={subtitle}
            fontFamily="Poppins, Inter, system-ui, sans-serif"
            fontWeight={500}
            fill="#F2F4F8"
            fontSize={30}
            opacity={0.95}
            lineHeight={38}
          />
        </Rect>
      </Rect>
    </Rect>
  );
  return { box, titleSize, cardScale, cardOpacity } as const;
}

export default makeScene2D(function* (view) {
  // Container references
  const discrete = createRef<Rect>();
  const algebra = createRef<Rect>();
  const geometry = createRef<Rect>();
  const probability = createRef<Rect>();

  // Signals for size & position (center-based)
  const sizeD = createSignal<Vector2>(() => new Vector2(W, H));
  const posD = createSignal<Vector2>(() => new Vector2(0, 0));

  const sizeA = createSignal<Vector2>(() => new Vector2(0, 0));
  const posA = createSignal<Vector2>(() => new Vector2(0, H * 0.25));

  const sizeG = createSignal<Vector2>(() => new Vector2(0, 0));
  const posG = createSignal<Vector2>(() => new Vector2(W * 0.25, -H * 0.25));

  const sizeP = createSignal<Vector2>(() => new Vector2(0, 0));
  const posP = createSignal<Vector2>(() => new Vector2(W * 0.25, H * 0.25));

  // Chapter cards (with per-card presets)
  const discCard = ChapterCard(
    "Discrete",
    "Exploding Lights • The 3 Exams",
    DiscreteIcon(96),
    "sunset"
  );
  const algCard = ChapterCard(
    "Algebra",
    "Distortion • Triple Trouble",
    AlgebraIcon(96),
    "vivid"
  );
  const geoCard = ChapterCard(
    "Geometry",
    "Pihedron’s Quad",
    GeometryIcon(96),
    "ocean"
  );
  const probCard = ChapterCard(
    "Probability",
    "Captured",
    ProbabilityIcon(96),
    "mindmaze"
  );

  // --- DISCRETE (full screen container) ---
  view.add(
    <Rect
      radius={50}
      ref={discrete}
      size={() => sizeD().div(1.4)}
      position={() => posD()}
    >
      {/* keep your large BGs for macro color; cards now have their own too */}
      <Rect
        width={W}
        height={H}
        alignItems="center"
        justifyContent="center"
      >
        {discCard.box}
      </Rect>
    </Rect>
  );

  // intro pop-in (0.6s) – same duration
  yield* tween(
    0.6,
    (t) => {
      const e = easeOutBack(t);
      discCard.titleSize(28 + 60 * e); // slightly larger title
      discCard.cardScale(0.96 + 0.09 * e);
      discCard.cardOpacity(e);
    },
    linear
  );
  yield* waitFor(0.3);

  // --- SPLIT to 2 rows: Discrete (top), Algebra (bottom) ---
  yield* all(
    tween(
      0.8,
      (t) => {
        const e = easeInOutQuint(t);
        sizeD(Vector2.lerp(new Vector2(W, H), new Vector2(W, H / 2), e));
        posD(Vector2.lerp(new Vector2(0, 0), new Vector2(0, -H / 4), e));
      },
      linear
    )
  );

  // Bring in Algebra bottom row (0.8s)
  view.add(
    <Rect
      radius={50}
      ref={algebra}
      size={() => sizeA().div(1.4)}
      position={() => posA()}
    >
      <Rect
        width={W}
        height={H / 2}
        alignItems="center"
        justifyContent="center"
      >
        {algCard.box}
      </Rect>
    </Rect>
  );
  yield* all(
    tween(
      0.8,
      (t) => {
        const e = easeInOutQuint(t);
        sizeA(Vector2.lerp(new Vector2(0, 0), new Vector2(W, H / 2), e));
        posA(Vector2.lerp(new Vector2(0, H / 4), new Vector2(0, H / 4), e));
        algCard.titleSize(14 + 56 * e);
        algCard.cardScale(0.96 + 0.09 * e);
        algCard.cardOpacity(e);
      },
      linear
    )
  );

  yield* waitFor(0.2);

  // --- SPLIT top row horizontally: add Geometry (top-right) ---
  view.add(
    <Rect
      radius={50}
      ref={geometry}
      size={() => sizeG().div(1.4)}
      position={() => posG()}
    >
      <Rect
        width={W / 2}
        height={H / 2}
        alignItems="center"
        justifyContent="center"
      >
        {geoCard.box}
      </Rect>
    </Rect>
  );

  yield* all(
    tween(
      0.8,
      (t) => {
        const e = easeInOutQuint(t);
        // Discrete shrinks to top-left
        sizeD(
          Vector2.lerp(new Vector2(W, H / 2), new Vector2(W / 2, H / 2), e)
        );
        posD(
          Vector2.lerp(new Vector2(0, -H / 4), new Vector2(-W / 4, -H / 4), e)
        );

        // Geometry grows in top-right
        sizeG(Vector2.lerp(new Vector2(0, 0), new Vector2(W / 2, H / 2), e));
        posG(
          Vector2.lerp(
            new Vector2(W / 4, -H / 4),
            new Vector2(W / 4, -H / 4),
            e
          )
        );
        geoCard.titleSize(14 + 56 * e);
        geoCard.cardScale(0.96 + 0.09 * e);
        geoCard.cardOpacity(e);
      },
      linear
    )
  );

  yield* waitFor(0.2);

  // --- SPLIT bottom row horizontally: add Probability (bottom-right) ---
  view.add(
    <Rect
      radius={50}
      ref={probability}
      size={() => sizeP().div(1.4)}
      position={() => posP()}
    >
      <Rect
        width={W / 2}
        height={H / 2}
        alignItems="center"
        justifyContent="center"
      >
        {probCard.box}
      </Rect>
    </Rect>
  );

  yield* all(
    tween(
      0.8,
      (t) => {
        const e = easeInOutQuint(t);
        // Algebra -> bottom-left
        sizeA(
          Vector2.lerp(new Vector2(W, H / 2), new Vector2(W / 2, H / 2), e)
        );
        posA(
          Vector2.lerp(new Vector2(0, H / 4), new Vector2(-W / 4, H / 4), e)
        );

        // Probability grows bottom-right
        sizeP(Vector2.lerp(new Vector2(0, 0), new Vector2(W / 2, H / 2), e));
        posP(
          Vector2.lerp(new Vector2(W / 4, H / 4), new Vector2(W / 4, H / 4), e)
        );
        probCard.titleSize(14 + 56 * e);
        probCard.cardScale(0.96 + 0.09 * e);
        probCard.cardOpacity(e);
      },
      linear
    )
  );

  // small settle
  yield* waitFor(0.6);
});
