// InstancedModelGroup.tsx
import {
  InstancedMesh,
  Object3D,
  Color,
  Mesh,
  BufferGeometry,
  MeshStandardMaterial,
  Vector3,
  InstancedBufferAttribute,
  Matrix4,
  Group,
  Euler,
  Material,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Object, { ObjectProps } from "../utils/Object";
import { easeInOutCubic, SimpleSignal, tween } from "@motion-canvas/core";
import { signal } from "@motion-canvas/2d";

export interface InstancedModelGroupProps extends ObjectProps {
  src: string;
  amount?: number;
  color?: number;
  fixedRotation?: Euler;
  fixedScale?: Vector3;
  specialIndices?: number[];
  positionFn?: (i: number) => Vector3;
  applyModification?: (geometry: any, material: Material, i: number) => void;
}

export default class InstancedModelGroup extends Object {
  private readonly instancers: InstancedMesh[] = [];
  private group = new Group();

  private fixedRotation: Euler;
  private fixedScale: Vector3;
  private positionfn: any;
  public specialMeshes: Mesh[] = [];

  @signal()
  private declare readonly offsetPositions: SimpleSignal<Vector3, this>;

  public constructor({
    src,
    amount = 100,
    color = 0xffffff,
    fixedRotation = new Euler(0, 0, 0),
    fixedScale = new Vector3(1, 1, 1),
    specialIndices = [],
    positionFn = (i) => new Vector3(0, 0, i), // default same as axis: 'z'
    applyModification = (x, y, z) => {},
    ...props
  }: InstancedModelGroupProps) {
    super(props);
    this.fixedRotation = fixedRotation;
    this.fixedScale = fixedScale;
    this.positionfn = positionFn;
    const loader = new GLTFLoader();
    loader.load(
      src,
      (gltf) => {
        const meshes: Mesh[] = [];
        let i = 0;

        gltf.scene.traverse((child) => {
          if (child instanceof Mesh) {
            const geometry = child.geometry as BufferGeometry;
            const material = (child.material as MeshStandardMaterial).clone();

            applyModification(geometry, material, i);
            meshes.push(new Mesh(geometry, material));
          }
          i++;
        });
        const dummy = new Object3D();
        const baseColor = new Color(color);
        const instanceCount = amount - specialIndices.length;

        this.specialMeshes = []; // Store special Meshes

        for (const mesh of meshes) {
          const instancer = new InstancedMesh(
            mesh.geometry,
            mesh.material,
            instanceCount
          );
          const colorAttr = new Float32Array(instanceCount * 3);

          let instancerIndex = 0;
          for (let i = 0; i < amount; i++) {
            const pos = positionFn(i).add(this.localPosition());

            if (specialIndices.includes(i)) {
              // Individual Mesh for special index
              const special = new Mesh(
                mesh.geometry,
                (mesh.material as Material).clone()
              );
              special.userData.__tag = i;

              special.position.copy(pos);
              special.rotation.copy(fixedRotation);
              special.scale.copy(fixedScale);
              special.castShadow = true;
              special.receiveShadow = true;

              this.specialMeshes.push(special);
              this.group.add(special);
              continue;
            }

            // Instanced version for regular
            this.originalPositions.push(pos.clone());
            dummy.position.copy(pos);
            dummy.rotation.copy(fixedRotation);
            dummy.scale.copy(fixedScale);
            dummy.updateMatrix();
            instancer.setMatrixAt(instancerIndex, dummy.matrix);

            baseColor.toArray(colorAttr, instancerIndex * 3);
            instancerIndex++;
          }

          instancer.instanceMatrix.needsUpdate = true;
          instancer.instanceColor = new InstancedBufferAttribute(colorAttr, 3);
          instancer.instanceColor.needsUpdate = true;
          instancer.castShadow = true;
          instancer.receiveShadow = true;

          this.instancers.push(instancer);
          this.group.add(instancer);
        }
        this.core.add(this.group);
      },
      undefined,
      (err) => console.error(`[InstancedModelGroup] Failed to load ${src}`, err)
    );
  }
  private originalPositions: Vector3[] = [];
  private currentOffset: Vector3 = new Vector3();

  private rebuildInstanceMatrices(offset: Vector3) {
    const dummy = new Object3D();

    for (const instancer of this.instancers) {
      for (let i = 0; i < this.originalPositions.length; i++) {
        const pos = this.originalPositions[i].clone().add(offset);
        dummy.position.copy(pos);
        dummy.rotation.copy(this.fixedRotation);
        dummy.scale.copy(this.fixedScale);
        dummy.updateMatrix();
        instancer.setMatrixAt(i, dummy.matrix);
      }

      instancer.instanceMatrix.needsUpdate = true;
    }
  }

  private *tweenOffset(
    from: Vector3,
    to: Vector3,
    duration = 0.5,
    ease = easeInOutCubic
  ) {
    yield* tween(duration, (t) => {
      const v = new Vector3(
        from.x + (to.x - from.x) * ease(t),
        from.y + (to.y - from.y) * ease(t),
        from.z + (to.z - from.z) * ease(t)
      );
      this.offsetPositions(v);
      this.rebuildInstanceMatrices(v);
    });
  }

  public *moveAll(offsetDelta: Vector3, duration = 0.5, ease = easeInOutCubic) {
    const from = this.offsetPositions() ?? new Vector3();
    const to = from.clone().add(offsetDelta);
    yield* this.tweenOffset(from, to, duration, ease);
  }

  public *moveAllUp(amount = 1, d = 0.5, e = easeInOutCubic) {
    yield* this.moveAll(new Vector3(0, amount, 0), d, e);
  }
  public *moveAllDown(amount = 1, d = 0.5, e = easeInOutCubic) {
    yield* this.moveAll(new Vector3(0, -amount, 0), d, e);
  }
  public *moveAllLeft(amount = 1, d = 0.5, e = easeInOutCubic) {
    yield* this.moveAll(new Vector3(-amount, 0, 0), d, e);
  }
  public *moveAllRight(amount = 1, d = 0.5, e = easeInOutCubic) {
    yield* this.moveAll(new Vector3(amount, 0, 0), d, e);
  }
  public *moveAllForward(amount = 1, d = 0.5, e = easeInOutCubic) {
    yield* this.moveAll(new Vector3(0, 0, -amount), d, e);
  }
  public *moveAllBack(amount = 1, d = 0.5, e = easeInOutCubic) {
    yield* this.moveAll(new Vector3(0, 0, amount), d, e);
  }

  public *moveSelectedDown(
    indices: number[],
    amount = 1,
    duration = 0.5,
    ease = easeInOutCubic
  ) {
    yield* tween(duration, (t) => {
      const eased = ease(t);
      for (const index of indices) {
        const mesh = this.specialMeshes.find((m) => m.userData.__tag === index);
        if (mesh) {
          const originalY = this.positionfn(index).y + this.localPosition().y;
          mesh.position.y = originalY - amount * eased;
        }
      }
    });
  }

  public getPositionAt(i: number): Vector3 {
    return this.positionfn(i) as Vector3;
  }
}
