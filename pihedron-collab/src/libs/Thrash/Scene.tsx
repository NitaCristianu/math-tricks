import { Layout, LayoutProps } from "@motion-canvas/2d/lib/components";
import { computed, initial, signal } from "@motion-canvas/2d/lib/decorators";
import {
  ACESFilmicToneMapping,
  Camera,
  Color,
  OrthographicCamera,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import CameraThrash from "./Camera";
import { SimpleSignal } from "@motion-canvas/core/lib/signals";
import Object from "./utils/Object";
import { Vector2 } from "@motion-canvas/core";

interface RenderCallback {
  (renderer: WebGLRenderer, scene: Scene, camera: Camera): void;
}

export interface SceneProps extends LayoutProps {
  scene?: Scene;
  camera?: Camera;
  background?: string;
  onRender?: RenderCallback;
}

export default class Scene3D extends Layout {
  @initial(null)
  @signal()
  public declare readonly camera: SimpleSignal<Camera | null, this>;

  public scene = new Scene();

  @initial(0x000)
  @signal()
  public declare readonly background: SimpleSignal<Color, this>;

  public readonly renderer: WebGLRenderer;
  private readonly context: WebGLRenderingContext;
  public onRender: RenderCallback;

  public projectToScreen(point3D: Vector3): Vector2 {
    const cameraNode: CameraThrash = this.findFirst(
      (child) => child instanceof CameraThrash
    ) as any;
    if (!cameraNode) return Vector2.zero;

    const camera = cameraNode.configuredCamera();
    const projected = point3D.clone().project(camera); // NDC [-1,1]

    const { width, height } = this.computedSize();

    return new Vector2(
      projected.x * 0.5 * width, // range: [-width/2, width/2]
      -projected.y * 0.5 * height + 475 // flip Y to match screen space
    );
  }

  public constructor({ onRender, ...props }: SceneProps) {
    super({ size: "100%", ...props });
    this.renderer = new WebGLRenderer({
      canvas: document.createElement("canvas"),
      antialias: true,
      alpha: true,
      stencil: true,
    });
    this.context = this.renderer.getContext();
    this.onRender =
      onRender ?? ((renderer, scene, camera) => renderer.render(scene, camera));
    this.scene.background = new Color(this.background());
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
    const renderer = this.configuredRenderer();

    if (width > 0 && height > 0) {
      this.onRender(renderer, scene, this.configuredCameraInstance());
      // context.imageSmoothingEnabled = false;
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

  private configuredCameraInstance(): Camera {
    const camNode = this.findFirst((child) => child instanceof CameraThrash);
    if (camNode instanceof CameraThrash) {
      return camNode["configuredCamera"](); // force computed access
    }
    return new PerspectiveCamera(); // fallback
  }

  @computed()
  private configuredRenderer(): WebGLRenderer {
    const size = this.computedSize();
    const renderer = this.renderer;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = SRGBColorSpace;

    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(window.devicePixelRatio);

    return renderer;
  }
}
