import {
  ACESFilmicToneMapping,
  CanvasTexture,
  DirectionalLight,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  Vector3,
  WebGLRenderer,
  type Material,
  type Object3D,
  Texture,
  type WebGLRenderTarget,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export interface VehicleScene {
  rotate(radians: number): void;
  reset(): void;
  dispose(): void;
}

const home = new Vector3(-5.8, 3.4, 7.7);
const target = new Vector3(0, 0.79, 0);
const markers = [
  ['motor', -1.76, 1.19, 0.23],
  ['freios', -1.38, 0.37, 1.01],
  ['suspensao', 1.51, 0.63, 1.04],
] as const;

export async function createVehicleScene(
  stage: HTMLElement,
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
  onContextLost: () => void,
): Promise<VehicleScene> {
  signal.throwIfAborted();
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  const scene = new Scene();
  const camera = new OrthographicCamera(-3, 3, 2, -2, 0.1, 45);
  camera.position.copy(home);
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(target);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.rotateSpeed = 0.65;
  controls.minPolarAngle = Math.PI * 0.18;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.update();
  controls.saveState();
  // OrbitControls sets touch-action:none; vertical gestures here still scroll the page.
  canvas.style.touchAction = 'pan-y pinch-zoom';

  let model: Object3D | undefined;
  let environment: WebGLRenderTarget | undefined;
  let shadow: Mesh | undefined;
  let observer: ResizeObserver | undefined;
  let frame = 0;
  let disposed = false;
  const projected = new Vector3();
  const pins = markers.map(([id, x, y, z]) => ({
    el: stage.querySelector<HTMLButtonElement>('[data-pin="' + id + '"]'),
    x,
    y,
    z,
  }));

  function draw() {
    frame = 0;
    if (disposed) return;
    renderer.render(scene, camera);
    const side = camera.position.z >= 0 ? 1 : -1;
    for (const pin of pins) {
      if (!pin.el) continue;
      projected.set(pin.x, pin.y, pin.z * side).project(camera);
      pin.el.style.left = (projected.x + 1) * 50 + '%';
      pin.el.style.top = (1 - projected.y) * 50 + '%';
    }
  }

  function invalidate() {
    if (!disposed && !frame) frame = requestAnimationFrame(draw);
  }

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    const aspect = width / height;
    const halfHeight = Math.max(1.72, 2.85 / aspect);
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    invalidate();
  }

  function contextLost(event: Event) {
    event.preventDefault();
    dispose();
    onContextLost();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    signal.removeEventListener('abort', dispose);
    canvas.removeEventListener('webglcontextlost', contextLost);
    cancelAnimationFrame(frame);
    observer?.disconnect();
    controls.dispose();
    if (model) disposeMeshes(model);
    if (shadow) disposeMeshes(shadow);
    environment?.dispose();
    renderer.dispose();
  }

  signal.addEventListener('abort', dispose, { once: true });
  canvas.addEventListener('webglcontextlost', contextLost);
  try {
    const response = await fetch('/models/quote-crossover-v1.glb', { signal });
    if (!response.ok) throw new Error('Modelo indisponível');
    const asset = await new GLTFLoader().parseAsync(await response.arrayBuffer(), '');
    if (disposed || signal.aborted) {
      disposeMeshes(asset.scene);
      throw new Error('Visualizador encerrado');
    }
    model = asset.scene;
    scene.add(model);

    const studio = new RoomEnvironment();
    const pmrem = new PMREMGenerator(renderer);
    try {
      environment = pmrem.fromScene(studio, 0.06);
      scene.environment = environment.texture;
      scene.environmentIntensity = 1.25;
    } finally {
      pmrem.dispose();
      studio.dispose();
    }
    const key = new DirectionalLight(0xfff4e5, 2.4);
    key.position.set(-3, 6, 3);
    scene.add(key);
    const rim = new DirectionalLight(0xd4fff0, 1.25);
    rim.position.set(3, 3, -4);
    scene.add(rim);

    shadow = contactShadow();
    scene.add(shadow);
    observer = new ResizeObserver(resize);
    observer.observe(stage);
    controls.addEventListener('change', invalidate);
    resize();
    return {
      rotate(radians) {
        controls.rotateLeft(radians);
        controls.update();
      },
      reset: () => controls.reset(),
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

function contactShadow(): Mesh {
  const source = document.createElement('canvas');
  source.width = source.height = 128;
  const context = source.getContext('2d')!;
  const ink = context.createRadialGradient(64, 64, 3, 64, 64, 62);
  ink.addColorStop(0, 'rgba(12,27,24,.48)');
  ink.addColorStop(0.56, 'rgba(12,27,24,.32)');
  ink.addColorStop(1, 'rgba(12,27,24,0)');
  context.fillStyle = ink;
  context.fillRect(0, 0, 128, 128);
  const material = new MeshBasicMaterial({
    map: new CanvasTexture(source),
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const ground = new Mesh(new PlaneGeometry(5.9, 2.9), material);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.08;
  return ground;
}

function disposeMeshes(root: Object3D) {
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  root.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.geometry.dispose();
    for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
      materials.add(material);
      for (const property of Object.values(material)) {
        if (property instanceof Texture) textures.add(property);
      }
    }
  });
  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
}
