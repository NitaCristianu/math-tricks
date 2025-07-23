// Label3D.tsx
import { Rect, RectProps, Txt, initial, signal } from "@motion-canvas/2d";
import {
  SimpleSignal,
  PossibleVector2,
  all,
  easeOutBack,
  easeOutCubic,
  easeInQuad,
  easeInSine,
  Vector2,
  Color,
  SignalValue,
} from "@motion-canvas/core";
import { Vector3 } from "three";
import Scene3D from "../Scene";

/*───────────────────────────────────────────────*/
/** Background / foreground colour pairs */
const LABEL_COLORS = {
  sky: ["#D6ECFF", "#0077C8"],
  bus: ["#BEEFFF", "#0077AA"],
  alu: ["#FFD7B2", "#FF6A00"],
  fpu: ["#E5D0FF", "#4B0082"],
  vpu: ["#CFFFD0", "#228B22"],
  register: ["#C8FACC", "#006400"],
  memory: ["#F4D0F4", "#8B008B"],
  io: ["#FFEAB6", "#B8860B"],
  decoder: ["#D2DCDC", "#2F4F4F"],
  control: ["#CCCCCC", "#444444"],
  cache: ["#D6D6FF", "#191970"],
} as const;
export type LabelColorKey = keyof typeof LABEL_COLORS;

/*───────────────────────────────────────────────*/
export interface Label3DProps extends Omit<RectProps, "children"> {
  /** Text to display inside the label. */
  text: SignalValue<string>;
  /** 3-D world position that this label should track. */
  worldPosition: Vector3 | (() => Vector3);
  /** Scene that performs the world→screen projection. */
  scene: Scene3D;
  /** Colour key for tint / text. */
  color?: LabelColorKey;
  /** Extra 2-D pixel offset after projection. */
  offset2D?: PossibleVector2;
  /** font size */
  fontSize?: SignalValue<number>;
}

/*───────────────────────────────────────────────*/
export class Label3D extends Rect {
  /* ── Signals ─────────────────────────────── */
  @initial("sky")
  @signal()
  public declare readonly color: SimpleSignal<LabelColorKey, this>;

  @initial("")
  @signal()
  public declare readonly text: SimpleSignal<string, this>;

  @initial(60)
  @signal()
  public declare readonly fontSize: SimpleSignal<number, this>;

  @initial<PossibleVector2>([20, -50])
  @signal()
  public declare readonly offset2D: SimpleSignal<PossibleVector2, this>;

  private readonly sceneRef: Scene3D;
  private worldPos: Vector3 | (()=> Vector3);
  private readonly labelTxt: Txt;

  /* ── Constructor ─────────────────────────── */
  public constructor({
    text,
    color = "sky",
    worldPosition,
    scene,
    offset2D,
    ...rest
  }: Label3DProps) {
    /* pick colours */
    const [bg, fg] = LABEL_COLORS[color];

    /* Glass appearance */
    super({
      width: 170,
      height: 70,
      shadowColor: bg,
      fill: new Color(fg).alpha(1),
      radius : 32,
      zIndex: 2,
      ...rest,
    });
    if (rest.size) {
      this.size(rest.size);
    }

    /* keep references */
    this.sceneRef = scene;
    this.worldPos = worldPosition;
    if (offset2D) this.offset2D(offset2D);
    this.color(color);
    this.text(text);

    /* contents */
    this.labelTxt = new Txt({
      text,
      fill: bg,
      fontFamily: "Poppins",
      fontWeight: 400,
      fontSize: 60,
    });
    this.labelTxt.fontSize(this.fontSize);
    this.add(this.labelTxt);

    /* reactive position */
    this.position((): Vector2 => {
      const pos =
        typeof worldPosition === "function" ? worldPosition() : worldPosition;
      return this.sceneRef.projectToScreen(pos).add(this.offset2D());
    });

    /* start hidden for pop-in */
    this.scale(0);
  }

  /* ── Animations ──────────────────────────── */
  public *popIn(duration = 0.4, scaleEase = easeOutBack) {
    yield* all(this.scale(1, duration, scaleEase));
  }

  public *popOut(duration = 0.3, scaleEase = easeInQuad) {
    yield* all(this.scale(0, duration, scaleEase));
  }
}
