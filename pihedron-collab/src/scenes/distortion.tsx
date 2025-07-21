import { Circle, makeScene2D, Node, View2D } from '@motion-canvas/2d';
import { all, createRef, createSignal, delay, easeInBack, easeInCubic, easeInElastic, easeInExpo, easeOutBack, easeOutExpo, sequence, waitFor } from '@motion-canvas/core';
import palette, { algebraPalette } from '../config/palette';
import { Eqn } from '../components/distortion-scene/Eqn';
import { Lvl } from '../components/gen/Lvl';

// THIS IS ALL A DEMO!!!

function* startIntroScene(view: View2D) {
  const scale = createSignal(150);
  const container = <Node />;
  view.add(container);

  const fns = [
    (x: number) => Math.sin(x),
    (x: number) => Math.cos(x),
    (x: number) => Math.tan(x) / 3,
    (x: number) => x * x / 100 - 2,
    (x: number) => Math.atan(x) * 3,
    (x: number) => Math.exp(-x * x / 4) * 2, // Gaussian bump
  ];

  const strokes = [
    palette.secondary,
    palette.accent,
    palette.primary,
    palette.success,
    palette.highlight,
    palette.border,
  ];

  const eqns = fns.map((fn, i) =>
    <Eqn
      func={fn}
      unitSize={scale}
      stroke={strokes[i]}
      showGrid={i === 4}
    /> as Eqn
  );

  for (const e of eqns) container.add(e);

  const level = <Lvl
    levelName='Algebra'
    level={3}
    palette={algebraPalette}
    scale={0}
  /> as Lvl;
  const overlay = <Circle fill={algebraPalette.gradient} /> as Circle;
  view.add(overlay);
  view.add(level);

  yield* all(
    sequence(0.25, ...eqns.map(e => e.pop())),
    container.scale(2, 5, easeInCubic)
  );

  yield sequence(.4,
    level.scale(1, .5, easeOutBack),
    all(
      overlay.size(3000, .5, easeInExpo),
    ),
    level.extendBadge(),
    delay(0, () => eqns.forEach(eq => eq.remove())),
  )
  yield* waitFor(0.5);
}

// 🎬 Main Scene – show target function
function* startMainScene(view: View2D) {
  const scale = createSignal(150);
  const f = <Eqn func={(x) => Math.min(Math.cos(x), 0)} stroke={algebraPalette.primary} unitSize={scale} /> as Eqn;
  view.add(f);
  yield* f.pop();
}

export default makeScene2D(function* (view) {
  view.fill(palette.bg);

  yield* startIntroScene(view);
  yield* startMainScene(view);
});
