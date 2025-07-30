import { HemisphereLight, Color, Vector3 } from "three";
import Object, { ObjectProps } from "../Object";
import { initial, signal } from "@motion-canvas/2d";
import {
  tween,
  easeInOutCubic,
  easeOutSine,
  easeInSine,
  SimpleSignal,
  all,
} from "@motion-canvas/core";

export interface HemisphereLightProps extends ObjectProps {
  skyColor?: number | Color | string;
  groundColor?: number | Color | string;
  intensity?: number;
}

export default class HemisphereLightObject extends Object {
  public light: HemisphereLight;

  @initial(0.6)
  @signal()
  public declare readonly intensity: SimpleSignal<number, this>;

  public constructor(props: HemisphereLightProps = {}) {
    super(props);

    this.light = new HemisphereLight(
      new Color(props.skyColor ?? 0xaaaaaa),
      new Color(props.groundColor ?? 0x444444),
      props.intensity ?? 0.6
    );

    this.intensity(props.intensity ?? 0.6);
    this.core.add(this.light);
  }

  private *lerpNumber(
    from: number,
    set: SimpleSignal<number, this>,
    to: number,
    duration: number,
    easing = easeInOutCubic
  ) {
    yield* tween(duration, (t) => {
      const v = from + (to - from) * easing(t);
      set(v);
      this.light.intensity = v;
    });
  }

  private *lerpVec3(
    from: Vector3,
    set: SimpleSignal<Vector3, this>,
    to: Vector3,
    duration: number,
    easing = easeInOutCubic
  ) {
    yield* tween(duration, (t) => {
      const v = new Vector3(
        from.x + (to.x - from.x) * easing(t),
        from.y + (to.y - from.y) * easing(t),
        from.z + (to.z - from.z) * easing(t)
      );
      set(v);
      if (set === this.localPosition) this.light.position.copy(v);
    });
  }

  public *intensityTo(value: number, duration = 0.4, ease = easeInOutCubic) {
    yield* this.lerpNumber(this.intensity(), this.intensity, value, duration, ease);
  }

  public *reposition(target: Vector3, duration = 0.5, ease = easeInOutCubic) {
    yield* this.lerpVec3(this.localPosition(), this.localPosition, target, duration, ease);
  }

  public *rotateTo(target: Vector3, duration = 0.5, ease = easeInOutCubic) {
    yield* this.lerpVec3(this.localRotation(), this.localRotation, target, duration, ease);
  }

  public *scaleTo(target: Vector3, duration = 0.5, ease = easeInOutCubic) {
    yield* this.lerpVec3(this.localScale(), this.localScale, target, duration, ease);
  }

  public *popIn(
    duration = 0.4,
    endScale = new Vector3(1, 1, 1),
    easing = easeOutSine
  ) {
    const finalRot = this.localRotation();
    const startRot = new Vector3(finalRot.x, finalRot.y + 1, finalRot.z);
    const i = this.intensity();
    this.localRotation(startRot);
    this.core.rotation.set(startRot.x, startRot.y, startRot.z);
    yield* this.intensityTo(0, 0);
    yield* all(
      this.scaleTo(endScale, duration, easing),
      this.rotateTo(finalRot, duration, easing),
      this.intensityTo(i, duration, easing)
    );
  }

  public *popOut(duration = 0.4, ease = easeInSine) {
    const startRot = this.localRotation();
    const endRot = new Vector3(startRot.x, startRot.y + 1, startRot.z);

    yield* all(
      this.scaleTo(new Vector3(0, 0, 0), duration, ease),
      this.rotateTo(endRot, duration, ease),
      this.intensityTo(0, duration, ease)
    );
  }
}
