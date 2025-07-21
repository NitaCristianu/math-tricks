import { GridHelper, Color, Material } from "three";
import { initial, signal } from "@motion-canvas/2d";
import { SimpleSignal } from "@motion-canvas/core";
import Mesh, { MeshProps } from "./Mesh";

export interface GridProps
  extends Omit<MeshProps, "geometry" | "material"> {
  size?: number;
  divisions?: number;
  color1?: number | Color;
  color2?: number | Color;
}

export default class Grid extends Mesh {
  /* ── Signals ─────────────────────────────── */
  @initial(10)        @signal() public declare readonly size:       SimpleSignal<number, this>;
  @initial(10)        @signal() public declare readonly divisions:  SimpleSignal<number, this>;
  @initial(0xffffff)  @signal() public declare readonly color1:     SimpleSignal<number | Color, this>;
  @initial(0x444444)  @signal() public declare readonly color2:     SimpleSignal<number | Color, this>;

  /* ── Ctor ────────────────────────────────── */
  public constructor(props: GridProps = {}) {
    super({ ...props, renderable: true });

    if (props.size)      this.size(props.size);
    if (props.divisions) this.divisions(props.divisions);
    if (props.color1)    this.color1(props.color1);
    if (props.color2)    this.color2(props.color2);

    this.InitMesh();               // ← crucial!
  }

  /* ── Build helper & wire into core ───────── */
  public override InitMesh(): void {
    const grid = new GridHelper(
      this.size(),
      this.divisions(),
      this.color1(),
      this.color2()
    );

    // GridHelper has two LineBasicMaterials in an array
    const mats = Array.isArray(grid.material)
      ? (grid.material as Material[])
      : [grid.material as Material];

    mats.forEach((m) => {
      m.transparent = true;
      m.opacity = this.alpha();
    });

    grid.position.y += 0.0001;           // avoid z-fighting
    // sync initial transforms
    grid.position.copy(this.localPosition());
    grid.rotation.set(
      this.localRotation().x,
      this.localRotation().y,
      this.localRotation().z
    );
    grid.scale.copy(this.localScale());

    this.core = grid;                    // replace placeholder core
  }
}
