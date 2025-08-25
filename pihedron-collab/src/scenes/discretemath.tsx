import { makeScene2D, Rect } from "@motion-canvas/2d";
import { PTxt } from "../components/gen/Ptxt";
import { ShaderBackground } from "../components/gen/background";
import {
  all,
  chain,
  delay,
  easeInCubic,
  easeInOutExpo,
  easeOutBack,
  easeOutCirc,
  easeOutCubic,
  sequence,
  useRandom,
  waitFor,
  waitUntil,
} from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  view.fill("#000");
  view.add(<ShaderBackground preset="sunset" opacity={0.5} />);

  const title = (
    <PTxt text={"Discrete Math"} fontSize={160} scale={0.5} opacity={0} />
  );
  view.add(title);
  const title2 = (
    <PTxt text={"Natural numbers"} fontSize={160} scale={0} opacity={0} />
  );
  view.add(title2);

  const gen = useRandom(3);
  const numbers = gen.intArray(150, 1, 255);
  const positionsX = gen.intArray(150, -1200, 1200);
  const positionsY = gen.intArray(150, 100, 2000);
  const txts = numbers.map((number, i) => {
    return (
      <PTxt
        text={number.toFixed(0)}
        size={50}
        fill={"white"}
        x={positionsX[i]}
        y={positionsY[i]}
      />
    );
  });
  const container = <Rect scale={10}>{txts}</Rect>;
  view.add(container);

  yield* waitUntil("begin");
  yield all(
    ...txts.map((txt) => all(txt.y(txt.y() + gen.nextInt(-1050, -1500), 12)))
  );
  yield all(delay(2, container.scale(1, 5)));
  yield* waitUntil("text");
  yield* all(
    container.opacity(0.2, 1),
    view.childAs<Rect>(0).opacity(0.2, 1),
    title.opacity(1, 1, easeInCubic),
    title.scale(1, 1, easeOutBack)
  );

  yield* waitUntil("natural");

  yield* sequence(
    .7,
    title.y(1000, 2, easeInCubic),
    all(
      container.opacity(0.6, 1),
      view.childAs<Rect>(0).opacity(0.5, 1),
      ...txts.map((txt) =>
        all(txt.position(0, 2, easeInOutExpo), txt.opacity(0, 2))
      )
    ),
    all(title2.opacity(1, 1, easeInCubic), title2.scale(1, 2, easeOutBack))
  );

  yield* waitUntil("next");
});
