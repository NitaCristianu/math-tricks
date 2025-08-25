import { Circle, makeScene2D, Node, View2D } from "@motion-canvas/2d";
import { ShaderBackground } from "../components/gen/background";
import { PTxt } from "../components/gen/Ptxt";
import {
  all,
  createSignal,
  delay,
  easeInCubic,
  easeInExpo,
  easeOutBack,
  sequence,
  waitFor,
  waitUntil,
} from "@motion-canvas/core";
import { Lvl } from "../components/gen/Lvl";
import palette, { algebraPalette } from "../config/palette";
import { Eqn } from "../components/distortion-scene/Eqn";

function* drawEquations(view: View2D) {
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
          opacity={0}
        />
      ) as Eqn
  );

  for (const e of eqns) container.add(e);

//   const level = (
//     <Lvl levelName="Problem" level={3} palette={algebraPalette} scale={0} />
//   ) as Lvl;
//   const overlay = (<Circle fill={algebraPalette.gradient} />) as Circle;
//   view.add(overlay);
//   view.add(level);

  yield* all(
    sequence(0.02, ...eqns.map((e) => e.opacity(1,1))),
    sequence(0.25, ...eqns.map((e) => e.pop())),
    container.scale(2, 5, easeInCubic)
  );

//   yield sequence(
//     0.4,
//     level.scale(1, 0.5, easeOutBack),
//     all(overlay.size(3000, 0.5, easeInExpo)),
//     level.extendBadge(),
//     delay(0, () => eqns.forEach((eq) => eq.remove()))
//   );
//   yield* waitFor(0.5);
}

export default makeScene2D(function* (view) {
  view.fill("#020422ff");
  view.add(<ShaderBackground preset="ocean" opacity={0.5} />);

  const title = (
    <PTxt text={"Algebra"} fontSize={160} scale={0.5} opacity={0} />
  );
  view.add(title);

  yield* waitUntil("begin");

  yield* waitUntil("equations");

  yield* all(title.opacity(1, 1, easeInCubic), title.scale(1, 1, easeOutBack));

  yield* waitUntil("draw equations");
  yield title.opacity(0,4)
  yield* drawEquations(view);

  yield* waitUntil("next");
});
