import { Layout, LayoutProps } from "@motion-canvas/2d/lib/components";
import { computed, initial, signal } from "@motion-canvas/2d/lib/decorators";
import {
  ACESFilmicToneMapping,
  Fog,
  FogExp2,
  PerspectiveCamera,
  OrthographicCamera,
  Color,
  PCFSoftShadowMap,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import CameraThrash from "./Camera";
import Object from "./utils/Object";
import {
  ColorSignal,
  PossibleColor,
  SignalValue,
  SimpleSignal,
  Vector2,
} from "@motion-canvas/core";

export interface SceneProps extends LayoutProps {
  scene?: Scene;
  camera?: PerspectiveCamera | OrthographicCamera;
  background?: string;
  // Optionally, allow passing fog parameters
  fogColor?: SignalValue<string>;
  fogNear?: SignalValue<number>;
  fogFar?: SignalValue<number>;
  fogDensity?: number;
  onRender?: (
    renderer: WebGLRenderer,
    scene: Scene,
    camera: CameraThrash
  ) => void;
}

export default class Scene3D extends Layout {
  @initial(null)
  @signal()
  public declare readonly camera: any; // Simplified type

  @initial("#ffffff")
  @signal()
  public declare readonly fogColor: SimpleSignal<string, this>;

  @initial(1000)
  @signal()
  public declare readonly fogFar: SimpleSignal<number, this>;

  @initial(1)
  @signal()
  public declare readonly fogNear: SimpleSignal<number, this>;

  public scene = new Scene();

  @initial("#000000")
  @signal()
  public declare readonly background: SimpleSignal<string, this>;

  public readonly renderer: WebGLRenderer;

  public onRender: (renderer: WebGLRenderer, scene: Scene, camera: any) => void;

  public projectToScreen(point3D: Vector3): Vector2 {
    const cameraNode: CameraThrash = this.findFirst(
      (child) => child instanceof CameraThrash
    ) as any;
    if (!cameraNode) return new Vector2();

    const camera = cameraNode.configuredCamera();
    const projected = point3D.clone().project(camera); // NDC [-1,1]

    const { width, height } = this.computedSize();

    return new Vector2(
      projected.x * 0.5 * width, // range: [-width/2, width/2]
      -projected.y * 0.5 * height + 475 // flip Y to match screen space
    );
  }

  public constructor(props: SceneProps) {
    super({ size: "100%", ...props });

    // Initialize renderer with optional log depth if scene is huge
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      stencil: true,
      logarithmicDepthBuffer: false, // set true if needed for very far views
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = SRGBColorSpace;

    this.onRender =
      props.onRender ??
      ((renderer, scene, camera) => {
        renderer.render(scene, camera);
      });

    // Set initial background color
    this.scene.background = new Color(this.background());
    // If fog parameters provided, configure fog
    if (props.fogColor !== undefined) {
      // If density is given, use exponential fog; otherwise linear fog
      if (props.fogDensity !== undefined) {
        this.scene.fog = new FogExp2(
          new Color(this.fogColor()).getHex(),
          props.fogDensity
        );
      } else {
        this.scene.fog = new Fog(
          new Color(this.fogColor()).getHex(),
          this.fogNear(),
          this.fogFar()
        );
      }
    }
  }

  public init() {
    this.children().forEach((child) => {
      if (child instanceof Object) {
        child.init(this, this.scene);
      }
    });
  }

  protected override draw(context: CanvasRenderingContext2D) {
    const { width, height } = this.computedSize();
    const scene = this.scene;
    const renderer = this.renderer;
    const cameraNode = this.findFirst(
      (child) => child instanceof CameraThrash
    ) as CameraThrash;
    const camera = cameraNode
      ? cameraNode.configuredCamera()
      : new PerspectiveCamera();

    this.scene.fog = new Fog(
      new Color(this.fogColor()).getHex(),
      this.fogNear(),
      this.fogFar()
    );

    if (width > 0 && height > 0) {
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);

      // Render the scene using the configured camera
      this.onRender(renderer, scene, camera);

      // Draw the WebGL canvas to our 2D context
      context.drawImage(
        renderer.domElement,
        0,
        0,
        width,
        height,
        width / -2,
        height / -2,
        width,
        height
      );
    }
    super.draw(context);
  }
}
