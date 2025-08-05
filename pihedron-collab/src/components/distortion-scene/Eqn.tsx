import {
  Node,
  NodeProps,
  Line,
  Grid,
  Layout,
  initial,
  signal,
} from "@motion-canvas/2d";
import {
  Color,
  ColorSignal,
  PossibleColor,
  SignalValue,
  SimpleSignal,
  Vector2,
  createSignal,
  createRef,
  useLogger,
  easeOutQuint,
  tween,
  easeInQuint,
  easeInOutQuint,
  PossibleVector2,
  easeInOutCubic,
  all,
} from "@motion-canvas/core";
import palette from "../../config/palette";
import vignette from "../../shaders/vignette.glsl";

export interface EqnProps extends NodeProps {
  func?: (x: number) => number;
  resolution?: SignalValue<number>;
  unitSize?: SignalValue<number>;
  xRange?: SignalValue<[number, number]>;
  stroke?: SignalValue<PossibleColor>;
  showGrid?: SignalValue<boolean>;
  graphOffset?: SignalValue<PossibleVector2>;
  xStrech?: SignalValue<number>;
}

export class Eqn extends Node {
  private func: (x: number) => number = (x) => Math.sin(x);

  @initial([0, 0])
  @signal()
  public declare readonly graphOffset: SimpleSignal<PossibleVector2, this>;

  @initial(1)
  @signal()
  public declare readonly xStretch: SimpleSignal<number, this>;

  @initial(200)
  @signal()
  public declare readonly resolution: SimpleSignal<number, this>;

  @initial(palette.primary)
  @signal()
  public declare readonly stroke: ColorSignal<this>;

  @initial(50)
  @signal()
  public declare readonly unitSize: SimpleSignal<number, this>;

  @initial([-Math.PI, Math.PI])
  @signal()
  public declare readonly xRange: SimpleSignal<[number, number], this>;

  @initial(true)
  @signal()
  public declare readonly showGrid: SimpleSignal<boolean, this>;

  private readonly points = createSignal<Vector2[]>([]);
  private readonly lineRef = createRef<Line>();

  public constructor(props?: EqnProps) {
    super({ ...props });

    if (props.func) this.func = props.func;

    this.add(
      <Grid
        spacing={() => this.unitSize()}
        lineWidth={3}
        stroke={() =>
          new Color("#adadadff").alpha(this.showGrid() ? 0.3 : 0)
        }
        size={"100%"}
        shaders={{
          fragment: vignette,
          uniforms: {
            falloff: 1.33,
            radius: 1.44,
          },
        }}
      />
    );

    this.add(
      <Line
        ref={this.lineRef}
        points={this.points}
        stroke={this.stroke}
        lineWidth={5}
        shadowBlur={10}
        radius={100}
        shadowColor={new Color(this.stroke() as any).alpha(0.4)}
        end={0}
      />
    );

    this.regeneratePoints();
  }

  public regeneratePoints() {
    const logger = useLogger();
    const fn = this.func;
    const res = this.resolution();
    const scale = this.unitSize();
    const parent = this.findAncestor((node) => node instanceof Layout);
    const width = parent ? parent.size().x : 1920;

    const xMin = -width / 2 / scale;
    const xMax = +width / 2 / scale;
    const step = (xMax - xMin) / (res - 1);

    const computed: Vector2[] = [];
    for (let i = 0; i < res; i++) {
      const offset = new Vector2(this.graphOffset());
      const dx = offset.x;
      const dy = offset.y;
      const k = this.xStretch();
      const x = xMin + i * step;
      const y = fn(k * x);

      computed.push(new Vector2((x + dx) * scale, -(y + dy) * scale));
    }

    this.points(computed);
    logger.debug(`Equation curve regenerated with ${res} points.`);
  }

  public *pop(show: boolean = true, duration: number = 2) {
    const line = this.lineRef();
    yield* line.end(show ? 1 : 0, duration, easeInOutQuint);
  }

  public *offset(
    value: PossibleVector2,
    duration: number = 0.5,
    ease = easeInOutCubic
  ) {
    const initial = this.graphOffset();
    yield* tween(duration, (t) => {
      const v = new Vector2(initial).lerp(new Vector2(value), t);
      this.graphOffset(v);
      t = ease(t);
      this.regeneratePoints();
    });
  }
}
