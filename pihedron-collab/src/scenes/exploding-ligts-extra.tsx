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
import { ShaderBackground } from "../components/gen/background";
import { Pitex } from "../libs/ptex/Pitex";

export default makeScene2D(function* (view) {
  view.fill("#080808ff");
  const bgr = <ShaderBackground preset="sunset" opacity={0.2} />;
  view.add(bgr);

  const tex = (
    <Pitex
      tex={String.raw`\text{LCM}(A, B) = p_1^{\max(a_1, b_1)} \cdot p_2^{\max(a_2, b_2)} \cdot \dots \text{....}`}
      fontSize={60}
      fill={"white"}
    />
  ) as Pitex;
  const equation = (
    <Pitex
      tex={String.raw`\text{LCM}(14,27) = 2^{\max(1, 2)} \cdot 3^{\max(0, 1)} \cdot 7^{max(0,1)}`}
      fontSize={30}
      fill={"white"}
    />
  ) as Pitex;
 

  yield* waitUntil("start");

  view.add(tex);
  yield* tex.write(1);
  yield* waitFor(1);
  yield* tex.morph(equation, 1);
  yield* waitFor(1);
  yield* tex.edit(String.raw`\text{LCM}(14,27) = 2^2 \cdot 3^1 \cdot 5^0 \cdot 7^1 \cdot 11^0 \cdot ...`, 1);
  yield* waitFor(0.2);
  yield* tex.edit(String.raw`\text{LCM}(14,27) = 2^2 \cdot 3^1 \cdot 7^1 \cdot ...`, 1);

  yield* waitUntil("next");
});
