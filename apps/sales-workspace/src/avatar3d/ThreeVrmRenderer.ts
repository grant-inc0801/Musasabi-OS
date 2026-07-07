import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils, type VRM } from "@pixiv/three-vrm";
import type { IdleMotionFrame, VrmExpressionPreset, VrmRenderer } from "@musasabi/avatar-3d";

// three.js + @pixiv/three-vrm による VrmRenderer 実装(Issue #200 / ②-2)。
// - 既定はプロシージャル3Dムササビ(プリミティブ製プレースホルダー)を透過canvasに描画
// - VRoid Studio 製 VRM を読み込むとプレースホルダーと差し替える
// - 表情(VrmExpressionPreset)・待機モーション(呼吸/まばたき)は
//   @musasabi/avatar-3d の AvatarManager から適用される
// WebGL が使えない環境では初期化が throw するので、呼び出し側で絵文字にフォールバックする。

export class ThreeVrmRenderer implements VrmRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly clock = new THREE.Clock();
  private placeholder: THREE.Group | null = null;
  private placeholderBody: THREE.MeshStandardMaterial | null = null;
  private placeholderBelly: THREE.MeshStandardMaterial | null = null;
  private placeholderDark: THREE.MeshStandardMaterial | null = null;
  private vrm: VRM | null = null;
  private breathY = 0;
  /** アバター作成(設定)で選んだ体色。表情の tint 復帰にも使う。 */
  private baseBodyHex = 0x8d8d94;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setClearColor(0x000000, 0); // 透過(デスクトップが透ける)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
    this.camera.position.set(0, 0.85, 1.75);
    this.camera.lookAt(0, 0.78, 0);

    const hemi = new THREE.HemisphereLight(0xdde4ff, 0x30281f, 1.15);
    const key = new THREE.DirectionalLight(0xffffff, 1.35);
    key.position.set(1.5, 2.5, 2);
    this.scene.add(hemi, key);

    this.placeholder = buildMusasabiPlaceholder();
    this.placeholderBody = this.placeholder.userData.bodyMaterial as THREE.MeshStandardMaterial;
    this.placeholderBelly = this.placeholder.userData.bellyMaterial as THREE.MeshStandardMaterial;
    this.placeholderDark = this.placeholder.userData.darkMaterial as THREE.MeshStandardMaterial;
    this.scene.add(this.placeholder);
  }

  /**
   * アバター作成(設定画面)で選んだ外観カラーを適用する。
   * VRM 読込中はマテリアルを持たないため無効(VRM 側の見た目を尊重)。
   */
  setAppearance(appearance: { bodyColor: string; bellyColor: string; eyeColor: string }): void {
    this.baseBodyHex = new THREE.Color(appearance.bodyColor).getHex();
    this.placeholderBody?.color.set(appearance.bodyColor);
    this.placeholderBelly?.color.set(appearance.bellyColor);
    this.placeholderDark?.color.set(appearance.eyeColor);
  }

  /** VRM(VRoid Studio 製など)を読み込み、プレースホルダーと差し替える。 */
  async loadModel(url: string): Promise<void> {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    const gltf = await loader.loadAsync(url);
    const vrm = gltf.userData.vrm as VRM | undefined;
    if (!vrm) {
      throw new Error("VRMとして読み込めませんでした。");
    }
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.combineSkeletons(gltf.scene);
    if (this.vrm) {
      this.scene.remove(this.vrm.scene);
      VRMUtils.deepDispose(this.vrm.scene);
    }
    if (this.placeholder) {
      this.scene.remove(this.placeholder);
    }
    this.vrm = vrm;
    vrm.scene.rotation.y = Math.PI; // 正面(カメラ側)を向かせる
    this.scene.add(vrm.scene);
    // 全身が収まるよう頭部基準でカメラを調整する。
    this.camera.position.set(0, 1.05, 2.4);
    this.camera.lookAt(0, 0.95, 0);
  }

  setExpression(preset: VrmExpressionPreset, weight: number): void {
    if (this.vrm?.expressionManager) {
      // 感情プリセットは同時に1つだけ有効にする(他は0へ)。
      for (const name of ["neutral", "happy", "angry", "sad", "relaxed", "surprised"]) {
        this.vrm.expressionManager.setValue(name, name === preset ? weight : 0);
      }
      return;
    }
    // プレースホルダーでは体色をわずかに変えて状態を示す(視認性優先・控えめ)。
    // neutral/relaxed では設定で選んだ体色(baseBodyHex)へ戻す。
    if (this.placeholderBody) {
      const tint: Record<VrmExpressionPreset, number> = {
        neutral: this.baseBodyHex,
        happy: 0x9aa06e,
        angry: 0xa07a6e,
        sad: 0x6e7ea0,
        relaxed: this.baseBodyHex,
        surprised: 0xa0956e,
      };
      this.placeholderBody.color.setHex(tint[preset]);
    }
  }

  applyIdleMotion(frame: IdleMotionFrame): void {
    this.breathY = frame.breathPhase * 0.02;
    if (this.vrm) {
      this.vrm.scene.position.y = this.breathY;
      this.vrm.expressionManager?.setValue("blink", frame.blink);
    }
  }

  /**
   * レンダーループから毎フレーム呼ぶ。VRM 未ロード時はプレースホルダーの
   * 浮遊(sin波)を内蔵で適用する。
   */
  renderFrame(timeMs: number): void {
    const delta = this.clock.getDelta();
    if (this.vrm) {
      this.vrm.update(delta);
    } else if (this.placeholder) {
      this.placeholder.position.y = Math.sin(timeMs / 900) * 0.035;
      this.placeholder.rotation.y = Math.sin(timeMs / 2600) * 0.22;
    }
    this.renderer.render(this.scene, this.camera);
  }

  /** 表示サイズ(CSS px)を変更する。アバターサイズスライダーから呼ばれる。 */
  resize(sizePx: number): void {
    this.renderer.setSize(sizePx, sizePx, false);
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
  }

  get hasVrm(): boolean {
    return this.vrm !== null;
  }

  dispose(): void {
    if (this.vrm) {
      this.scene.remove(this.vrm.scene);
      VRMUtils.deepDispose(this.vrm.scene);
      this.vrm = null;
    }
    this.renderer.dispose();
  }
}

/**
 * プリミティブ製の3Dムササビ(VRM読込までのプレースホルダー)。
 * ブランドアイコンと同じ「滑空するムササビ」を意識した、灰色の丸い体+飛膜+尻尾。
 */
function buildMusasabiPlaceholder(): THREE.Group {
  const group = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0x8d8d94, roughness: 0.8 });
  const belly = new THREE.MeshStandardMaterial({ color: 0xe8e6df, roughness: 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.6 });

  // 胴体(丸い体)
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 18), body);
  torso.scale.set(1, 0.85, 0.8);
  torso.position.y = 0.62;
  group.add(torso);

  // お腹
  const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), belly);
  bellyMesh.scale.set(1, 0.8, 0.6);
  bellyMesh.position.set(0, 0.58, 0.14);
  group.add(bellyMesh);

  // 頭
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 18), body);
  head.position.y = 1.0;
  group.add(head);

  // 耳(左右)
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.14, 12), body);
    ear.position.set(0.13 * sx, 1.2, 0);
    group.add(ear);
  }

  // 目(左右)・鼻
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), dark);
    eye.position.set(0.09 * sx, 1.03, 0.2);
    group.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), dark);
  nose.position.set(0, 0.96, 0.23);
  group.add(nose);

  // 飛膜(左右に広がる薄い膜)
  for (const sx of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.42), body);
    wing.position.set(0.4 * sx, 0.62, 0);
    wing.rotation.z = -0.35 * sx;
    group.add(wing);
  }

  // 尻尾(ふさふさの円柱)
  const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.36, 6, 12), body);
  tail.position.set(0, 0.4, -0.32);
  tail.rotation.x = 1.1;
  group.add(tail);

  group.userData.bodyMaterial = body;
  group.userData.bellyMaterial = belly;
  group.userData.darkMaterial = dark;
  return group;
}
