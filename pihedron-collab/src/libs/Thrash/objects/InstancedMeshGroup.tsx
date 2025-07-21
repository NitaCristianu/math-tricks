import {
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Color,
  BufferGeometry,
  InstancedBufferAttribute,
  Mesh as ThreeMesh,
  Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Object, { ObjectProps } from "../utils/Object";
import Model from "./Model";
import Mesh from "./Mesh"; // 👈 your custom Mesh wrapper

export interface InstancedModelGroupProps extends ObjectProps {
  amount?: number;
  distance?: number;
  color?: number;
  specialIndices?: number[];
  src: string;
  axis?: "x" | "y" | "z";
}

export default class InstancedModelGroup extends Object {
  public specialModels: Map<number, Model> = new Map();

  public constructor({
    amount = 50,
    distance = 0.5,
    color = 0xffffff,
    specialIndices = [],
    src,
    axis = "z",
    ...props
  }: InstancedModelGroupProps) {
    super(props);

    const loader = new GLTFLoader();
    loader.load(
      src,
      (gltf) => {
        const base = gltf.scene;

        let geometry: BufferGeometry | null = null;
        let material: MeshStandardMaterial | null = null;

        base.traverse((child) => {
          if (child instanceof ThreeMesh) {
            const g = child.geometry;
            if (!geometry && g.attributes.position.count > 50) {
              geometry = g;
              material = (child.material as MeshStandardMaterial).clone();
            }
          }
        });

        if (!geometry || !material) {
          console.warn(`[InstancedModelGroup] No usable mesh in model: ${src}`);
          return;
        }

        // Optional tweaks
        material.vertexColors = true;
        material.metalness = 0.2;
        material.roughness = 0.6;
        material.emissive.set(0x000000);

        const baseColor = new Color(color);
        const dummy = new Object3D();
        const instancedCount = amount - specialIndices.length;

        const instancedMesh = new InstancedMesh(geometry, material, instancedCount);
        instancedMesh.castShadow = true;
        instancedMesh.receiveShadow = true;
        instancedMesh.visible = true;

        // Apply instance transforms
        let instancedIndex = 0;
        for (let i = 0; i < amount; i++) {
          const offset = i * distance;
          const pos = this.getAxisPosition(axis, offset).add(this.localPosition());

          if (specialIndices.includes(i)) {
            const model = new Model({ src, localPosition: pos });
            this.add(model);
            this.specialModels.set(i, model);
          } else {
            dummy.position.copy(pos);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(instancedIndex, dummy.matrix);
            instancedMesh.setColorAt(instancedIndex, baseColor);
            instancedIndex++;
          }
        }

        instancedMesh.instanceMatrix.needsUpdate = true;
        instancedMesh.instanceColor = new InstancedBufferAttribute(
          new Float32Array(instancedCount * 3),
          3
        );
        instancedMesh.instanceColor.needsUpdate = true;

        // ✅ Wrap it in your Mesh class so Three renders it properly
        const meshWrapper = new Mesh({ geometry, material });
        meshWrapper.core = instancedMesh;
        this.add(meshWrapper);
      },
      undefined,
      (error) => {
        console.error(`[InstancedModelGroup] Failed to load model: ${src}`, error);
      }
    );
  }

  private getAxisPosition(axis: "x" | "y" | "z", value: number): Vector3 {
    const v = new Vector3();
    v[axis] = value;
    return v;
  }

  public setSpecialColor(index: number, hex: number) {
    const model = this.specialModels.get(index);
    if (!model) return;

    const mesh = model.core.children[0] as ThreeMesh;
    if (mesh && mesh.material) {
      (mesh.material as MeshStandardMaterial).color.set(hex);
    }
  }

  public getSpecialModel(index: number): Model | undefined {
    return this.specialModels.get(index);
  }
}
