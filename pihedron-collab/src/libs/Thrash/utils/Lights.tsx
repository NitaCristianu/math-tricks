// Lights.tsx
import {
  DirectionalLight,
  HemisphereLight,
  AmbientLight,
  FogExp2,
  Color,
  Mesh as ThreeMesh,
  SphereGeometry,
  MeshBasicMaterial,
  WebGLRenderer,
  Camera,
  Scene,
  Vector2,
  Object3D,
  Vector3,
} from "three";
import { ObjectProps } from "./Object";
import Object from "./Object";
import Scene3D from "../Scene";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { SAOPass } from "three/examples/jsm/postprocessing/SAOPass";

export interface LightOptions {
  color?: number;
  intensity?: number;
  position?: Vector3;
  castShadow?: boolean;
}

export interface BloomOptions {
  strength?: number;
  radius?: number;
  threshold?: number;
}

export interface FogOptions {
  color?: number;
  density?: number;
}

export interface LightsProps extends ObjectProps {
  keyLight?: LightOptions;
  rimLight?: LightOptions;
  hemiLight?: LightOptions;
  ambientLight?: LightOptions;
  enableBloom?: boolean;
  bloom?: BloomOptions;
  enableSSAO?: boolean;
  enableFog?: boolean;
  fog?: FogOptions;
}

export default class Lights extends Object {
  public keyLight: DirectionalLight;
  public rimLight: DirectionalLight;
  public hemiLight: HemisphereLight;
  public ambientLight: AmbientLight;

  private sunMesh!: ThreeMesh;
  private composer!: EffectComposer;

  public constructor(private props: LightsProps = {}) {
    super(props);

    // Defaults
    const defaultColor = (hex: number, fallback: number) =>
      new Color(hex ?? fallback);

    this.keyLight = new DirectionalLight(
      defaultColor(props.keyLight?.color, 0xffe0dd),
      props.keyLight?.intensity ?? 2
    );

    this.rimLight = new DirectionalLight(
      defaultColor(props.rimLight?.color, 0x4466ff),
      props.rimLight?.intensity ?? 2.5
    );

    this.hemiLight = new HemisphereLight(
      defaultColor(props.hemiLight?.color, 0x406080),
      0x202020,
      props.hemiLight?.intensity ?? 0.3
    );

    this.ambientLight = new AmbientLight(
      defaultColor(props.ambientLight?.color, 0x404040),
      props.ambientLight?.intensity ?? 0.2
    );
  }

  public InitLight() {
    this.keyLight.position.copy(
      this.props.keyLight?.position.clone() ?? new Vector3(5, 10, 5)
    );
    this.keyLight.castShadow = this.props.keyLight?.castShadow ?? true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    this.keyLight.shadow.camera.near = 1;
    this.keyLight.shadow.camera.far = 50;
    this.keyLight.shadow.bias = -0.0001;

    this.rimLight.position.copy(
      this.props.rimLight?.position.clone() ?? new Vector3(-8, 6, -4)
    );
    this.rimLight.castShadow = this.props.rimLight?.castShadow ?? false;

    this.core.add(this.keyLight);
    this.core.add(this.rimLight);
    this.core.add(this.hemiLight);
    this.core.add(this.ambientLight);
  }

  private initFogAndEffects(
    scene: Scene,
    camera: Camera,
    renderer: WebGLRenderer
  ) {
    if (this.props.enableFog !== false) {
      const fogColor = this.props.fog?.color ?? 0x000010;
      const fogDensity = this.props.fog?.density ?? 0.2;
      scene.fog = new FogExp2(fogColor, fogDensity);
    }

    renderer.shadowMap.enabled = true;

    this.sunMesh = new ThreeMesh(
      new SphereGeometry(0.6, 32, 32),
      new MeshBasicMaterial({ color: 0xffffcc })
    );
    this.sunMesh.position.set(0, 10, -5);
    scene.add(this.sunMesh);

    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    if (this.props.enableBloom !== false) {
      const bloomOptions = this.props.bloom ?? {};
      const bloom = new UnrealBloomPass(
        new Vector2(renderer.domElement.width, renderer.domElement.height),
        bloomOptions.strength ?? 0.5,
        bloomOptions.radius ?? 0.4,
        bloomOptions.threshold ?? 0.85
      );
      this.composer.addPass(bloom);
    }

    if (this.props.enableSSAO !== false) {
      const sao = new SAOPass(scene, camera);
      sao.params.saoIntensity = 1.6;
      sao.params.saoBlurRadius = 8;
      sao.params.saoKernelRadius = 12;
      this.composer.addPass(sao);
    }

    // Optional: God Rays (disabled by default)
    /*
    const godrays = new GodRaysPass(scene, camera, this.sunMesh, {
      density: 0.9,
      decay: 0.95,
      weight: 0.6,
      samples: 60,
    });
    this.composer.addPass(godrays);
    */
  }

  public override init(master: Scene3D, parent: Object3D) {
    super.init(master, parent);
    this.InitLight();

    const scene: Scene = master.scene;
    const camera: Camera = master.camera();
    const renderer: WebGLRenderer = master.renderer;

    if (scene && camera && renderer) {
      this.initFogAndEffects(scene, camera, renderer);

      const originalRender = master.onRender;
      master.onRender = (r, s, c) => {
        originalRender(r, s, c);
        this.composer.render();
      };
    }
  }
}
