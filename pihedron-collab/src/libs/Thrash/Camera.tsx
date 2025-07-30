import {
  Camera as ThreeCamera,
  PerspectiveCamera,
  OrthographicCamera,
  Vector3,
  Euler,
} from "three";
import Object, { ObjectProps } from "./utils/Object";
import { initial, signal, computed } from "@motion-canvas/2d";
import {
  SimpleSignal,
  tween,
  easeInOutCubic,
  easeOutSine,
  easeInSine,
  all,
} from "@motion-canvas/core";

/*───────────────────────────────────────────────*/
export interface CameraProps extends ObjectProps {
  camera?: ThreeCamera;
  zoom?: number;
  lookAt?: Vector3;
  anchor?: Vector3;
  anchorWeight?: number;
}
/*───────────────────────────────────────────────*/
export default class Camera extends Object {
  /* ── Signals ───────────────────────────────── */
  @initial(new PerspectiveCamera(20, 16 / 9, 0.001, 1000))
  @signal()
  public declare readonly camera: SimpleSignal<ThreeCamera | null, this>;

  @initial(1) // default framing
  @signal()
  public declare readonly zoom: SimpleSignal<number, this>;

  @initial(new Vector3(0, 0, 0)) // world-space focus
  @signal()
  public declare readonly lookAt: SimpleSignal<Vector3, this>;

  @initial(new Vector3(0, 1.2, 0.8)) // Example anchor above CPU
  @signal()
  public declare readonly anchor: SimpleSignal<Vector3, this>;

  @initial(0) // 0 = no influence, 1 = full anchor
  @signal()
  public declare readonly anchorWeight: SimpleSignal<number, this>;

  /* ── Helpers ───────────────────────────────── */
  private *lerpNumber(
    from: number,
    set: SimpleSignal<number, this>,
    to: number,
    d: number,
    ease = easeInOutCubic
  ) {
    yield* tween(d, (t) => set(from + (to - from) * ease(t)));
    this.updateProjection(); // ensure final matrix
  }

  private *lerpVec3(
    from: Vector3,
    set: SimpleSignal<Vector3, this>,
    to: Vector3,
    d: number,
    ease = easeInOutCubic
  ) {
    yield* tween(d, (t) => {
      set(
        new Vector3(
          from.x + (to.x - from.x) * ease(t),
          from.y + (to.y - from.y) * ease(t),
          from.z + (to.z - from.z) * ease(t)
        )
      );
    });
  }

  private weightedTarget(target: Vector3): Vector3 {
    return target.clone().lerp(this.anchor(), this.anchorWeight());
  }

  public *moveAtWeighted(
    target: Vector3,
    duration = 0.5,
    ease = easeInOutCubic
  ) {
    const blended = this.weightedTarget(target);
    yield* this.moveAt(blended, duration, ease);
  }

  public *lookToWeighted(
    target: Vector3,
    duration = 0.5,
    ease = easeInOutCubic
  ) {
    const blended = this.weightedTarget(target);
    yield* this.lookTo(blended, duration, ease);
  }

  public *moveLookWeighted(
    target: Vector3,
    duration = 0.5,
    ease = easeInOutCubic
  ) {
    const blended = this.weightedTarget(target);
    yield* all(
      this.moveAt(blended, duration, ease),
      this.lookTo(blended, duration, easeOutSine)
    );
  }

  /* ── Public tween API ──────────────────────── */
  public *moveAt(v: Vector3, d = 0.5, e = easeInOutCubic) {
    //
    yield* this.lerpVec3(this.localPosition(), this.localPosition, v, d, e);
  }
  public *zoomTo(z: number, d = 0.5, e = easeInOutCubic) {
    yield* this.lerpNumber(this.zoom(), this.zoom, z, d, e);
  }
  public *zoomIn(f = 0.8, d = 0.4, e = easeOutSine) {
    yield* this.zoomTo(this.zoom() * f, d, e);
  }
  public *zoomOut(f = 1.25, d = 0.4, e = easeInSine) {
    yield* this.zoomTo(this.zoom() * f, d, e);
  }
  public *lookTo(v: Vector3, d = 0.5, e = easeInOutCubic) {
    yield* this.lerpVec3(this.lookAt(), this.lookAt, v, d, e);
  }
  // ── Relative position helpers ───
  public *moveRight(amount = 1, d = 0.5, e = easeInOutCubic) {
    const p = this.localPosition().clone().add(new Vector3(amount, 0, 0));
    yield* this.moveAt(p, d, e);
  }
  public *moveLeft(amount = 1, d = 0.5, e = easeInOutCubic) {
    const p = this.localPosition().clone().add(new Vector3(-amount, 0, 0));
    yield* this.moveAt(p, d, e);
  }
  public *moveUP(amount = 1, d = 0.5, e = easeInOutCubic) {
    const p = this.localPosition().clone().add(new Vector3(0, amount, 0));
    yield* this.moveAt(p, d, e);
  }
  public *moveDOWN(amount = 1, d = 0.5, e = easeInOutCubic) {
    const p = this.localPosition().clone().add(new Vector3(0, -amount, 0));
    yield* this.moveAt(p, d, e);
  }
  public *moveForward(amount = 1, d = 0.5, e = easeInOutCubic) {
    const p = this.localPosition().clone().add(new Vector3(0, 0, -amount));
    yield* this.moveAt(p, d, e);
  }
  public *moveBack(amount = 1, d = 0.5, e = easeInOutCubic) {
    const p = this.localPosition().clone().add(new Vector3(0, 0, amount));
    yield* this.moveAt(p, d, e);
  }

  // ── Look helpers ────────────────
  public *lookRight(amount = 1, d = 0.5, e = easeInOutCubic) {
    const p = this.lookAt().clone().add(new Vector3(amount, 0, 0));
    yield* this.lookTo(p, d, e);
  }
  public *lookLeft(amount = 1, d = 0.5, e = easeInOutCubic) {
    const p = this.lookAt().clone().add(new Vector3(-amount, 0, 0));
    yield* this.lookTo(p, d, e);
  }
  public *lookUp(amount = 1, d = 0.5, e = easeInOutCubic) {
    const p = this.lookAt().clone().add(new Vector3(0, amount, 0));
    yield* this.lookTo(p, d, e);
  }
  public *lookDown(amount = 1, d = 0.5, e = easeInOutCubic) {
    const p = this.lookAt().clone().add(new Vector3(0, -amount, 0));
    yield* this.lookTo(p, d, e);
  }
  public *lookForward(amount = 1, d = 0.5, e = easeInOutCubic) {
    const p = this.lookAt().clone().add(new Vector3(0, 0, -amount));
    yield* this.lookTo(p, d, e);
  }
  public *lookBack(amount = 1, d = 0.5, e = easeInOutCubic) {
    const p = this.lookAt().clone().add(new Vector3(0, 0, amount));
    yield* this.lookTo(p, d, e);
  }
  /* ── Internal helpers ──────────────────────── */
  private updateProjection() {
    const cam = this.camera();
    if (!cam) return;

    // update aspect on every frame
    if (cam instanceof PerspectiveCamera && this.master) {
      cam.aspect = this.master.size().x / this.master.size().y;
      cam.zoom = this.zoom();
      cam.updateProjectionMatrix();
    } else if (cam instanceof OrthographicCamera) {
      const ratio = this.master.size().x / this.master.size().y;
      const s = this.zoom() / 2;
      cam.left = -ratio * s;
      cam.right = ratio * s;
      cam.top = s;
      cam.bottom = -s;
      cam.updateProjectionMatrix();
    }
  }

  /* ── Reactive sync each frame ──────────────── */
  @computed()
  public configuredCamera(): ThreeCamera {
    const cam = this.camera()!;
    cam.position.copy(this.localPosition());
    cam.rotation.set(
      this.localRotation().x,
      this.localRotation().y,
      this.localRotation().z
    );
    cam.scale.copy(this.localScale());
    cam.lookAt(this.lookAt());
    this.updateProjection();
    return cam;
  }

  /* ── Attach to core once ───────────────────── */
  public InitCamera() {
    // safe default so user always sees something
    if (this.localPosition().lengthSq() < 1e-4)
      this.localPosition(new Vector3(0, 1.5, 3));

    this.core.add(this.configuredCamera());
  }

  public constructor(props: CameraProps = {}) {
    super(props);

    // Set signals via provided props
    if (props.camera) this.camera(props.camera);
    if (props.zoom !== undefined) this.zoom(props.zoom);
    if (props.lookAt) this.lookAt(props.lookAt);
    if (props.anchor) this.anchor(props.anchor);
    if (props.anchorWeight !== undefined) this.anchorWeight(props.anchorWeight);
  }

  public *rotateTo(r: Euler, d = 0.5, e = easeInOutCubic) {
    const cam = this.camera();
    if (!cam) return;

    const from = cam.rotation.clone();

    yield* tween(d, (t) => {
      cam.rotation.set(
        from.x + (r.x - from.x) * e(t),
        from.y + (r.y - from.y) * e(t),
        from.z + (r.z - from.z) * e(t)
      );
    });

    cam.rotation.set(r.x, r.y, r.z); // ensure exact final value
  }
}
