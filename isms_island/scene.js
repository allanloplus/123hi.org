/* Allan's 資安島：Three.js 低多邊形六角島場景
   島嶼排成盾牌形（4-3-2-1），靜態物件依材質合併以減少 draw call；動態物件（雷達、摩天輪、燈塔光束…）標記 keep 不合併。 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/OrbitControls.js";
import { mergeGeometries } from "three/addons/BufferGeometryUtils.js";

const R = 3, GAP = 1.13, TOP = 0.3;
const W = Math.sqrt(3) * R * GAP, DZ = 1.5 * R * GAP;
const IN = R * 0.93 * Math.sqrt(3) / 2;        /* 島頂內切半徑（橋頭位置） */
const PLAZA = 1.22;                            /* 島民散步的環狀廣場半徑 */
const IMG = "../assets/img/";
const DEG = Math.PI / 180;
const C = {
  white: "#fbf7ef", cream: "#f3ead8", sand: "#ead9ae", cliff: "#d6bd88", wood: "#b98a5a", dark: "#3b4252",
  stone: "#ddd6c6", gold: "#e0b44a", red: "#e03131", skin: "#f2c9a0", glass: "#bfe3ee"
};
const LEAF = ["#6fb35a", "#5aa04a", "#86c06a", "#4f9446", "#98c96b"];
const GROUND = {
  hq: "#e6dfcf", harbor: "#d9d3c4", lighthouse: "#bcdc98", cinema: "#e9dfcf", trail: "#b6da8c",
  detective: "#dcc8a8", park: "#a9d77f", school: "#c4e09c", library: "#e7dccb", arcade: "#3a2f63"
};
const TIMES = {
  dawn: { bg: "#f6d7c3", sky: "#fff0e6", gnd: "#8a9a7a", hemi: 1.15, sun: "#ffd0ab", sunI: 1.8, pos: [-20, 15, 14], water: "#469fd2", night: 0.1 },
  day: { bg: "#bfe4f1", sky: "#e3f4ff", gnd: "#88a874", hemi: 1.15, sun: "#fff6e8", sunI: 2.2, pos: [14, 26, 16], water: "#3f9dc2", night: 0 },
  dusk: { bg: "#f1b48c", sky: "#ffe2cf", gnd: "#7d76a0", hemi: 1.1, sun: "#ffad6e", sunI: 1.9, pos: [22, 14, 6], water: "#3d88c8", night: 0.45 },
  night: { bg: "#13213f", sky: "#4d639c", gnd: "#1a2238", hemi: 0.95, sun: "#b4c8ff", sunI: 0.85, pos: [-12, 22, -8], water: "#224577", night: 1 }
};

export function islandCenter(s) {
  const n = 4 - s.row;
  return new THREE.Vector3((s.col - (n - 1) / 2) * W, 0, (s.row - 1) * DZ);
}

export async function createWorld({ container, labels, islands, flows, roles, reduce, onPick, onItem, onEvent }) {
  /* ---------- renderer / camera ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  const small = Math.min(innerWidth, innerHeight) < 700;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.75 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(TIMES.day.bg);
  scene.fog = new THREE.Fog(TIMES.day.bg, 110, 240);
  const FOV = 32;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.5, 420);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 6;
  controls.maxDistance = 92;
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = 1.28;
  controls.screenSpacePanning = false;
  controls.zoomToCursor = true;

  const hemi = new THREE.HemisphereLight(TIMES.day.sky, TIMES.day.gnd, TIMES.day.hemi);
  const sun = new THREE.DirectionalLight(TIMES.day.sun, TIMES.day.sunI);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -19, right: 19, top: 19, bottom: -19, near: 1, far: 90 });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  scene.add(hemi, sun, sun.target);

  /* ---------- 材質與工具 ---------- */
  const mats = new Map();
  const M = (color, o = {}) => {
    const k = color + JSON.stringify(o);
    if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, flatShading: true, ...o }));
    return mats.get(k);
  };
  const glows = [];   /* 夜間發光的材質：[mat, 白天強度, 夜晚強度] */
  const glow = (color, emissive, d, n) => {
    const m = new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: d, roughness: 0.6, flatShading: true });
    glows.push([m, d, n]);
    return m;
  };
  const winMat = glow("#4a5568", "#ffd27a", 0, 1.7);
  const lampMat = glow("#fff3c4", "#ffd27a", 0.15, 2.4);
  const mesh = (geo, mat, x = 0, y = 0, z = 0, parent) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (parent) parent.add(m);
    return m;
  };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt, rb, h, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const cone = (r, h, s = 8) => new THREE.ConeGeometry(r, h, s);
  const keep = (g) => { g.userData.keep = true; return g; };
  const anim = [];    /* 每幀更新的動畫：(t, dt) => void */
  const rand = (() => { let s = 20261024; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const canvasTex = (w, h, draw) => {
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    draw(cv.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  const emojiTex = new Map();
  const emoji = (e) => {
    if (!emojiTex.has(e)) emojiTex.set(e, canvasTex(96, 96, (g, w, h) => {
      g.fillStyle = "#fffdf7"; g.beginPath(); g.arc(48, 48, 44, 0, Math.PI * 2); g.fill();
      g.lineWidth = 4; g.strokeStyle = "#14213d"; g.stroke();
      g.font = "52px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
      g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(e, 48, 52);
    }));
    return emojiTex.get(e);
  };

  /* 靜態物件依材質合併 */
  function bake(root) {
    root.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
    const buckets = new Map(), dead = [];
    root.traverse(o => {
      if (!o.isMesh || o === root) return;
      for (let p = o; p && p !== root; p = p.parent) if (p.userData.keep) return;
      const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
      for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(k)) g.deleteAttribute(k);
      if (!g.attributes.uv) g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      if (!buckets.has(o.material)) buckets.set(o.material, []);
      buckets.get(o.material).push(g);
      dead.push(o);
    });
    dead.forEach(o => o.parent.remove(o));
    for (const [mat, list] of buckets) {
      const m = new THREE.Mesh(mergeGeometries(list, false), mat);
      m.castShadow = !mat.transparent; m.receiveShadow = true;
      root.add(m);
      list.forEach(g => g.dispose());
    }
  }
  const shadowAll = (root) => root.traverse(o => { if (o.isMesh && !o.material.transparent) { o.castShadow = true; o.receiveShadow = true; } });

  /* ---------- 海、遠山、星空、雲 ---------- */
  const seaGeo = new THREE.PlaneGeometry(300, 300, 90, 90);
  seaGeo.rotateX(-Math.PI / 2);
  const seaBase = Float32Array.from(seaGeo.attributes.position.array);
  const seaMat = new THREE.MeshStandardMaterial({ color: TIMES.day.water, roughness: 0.45, metalness: 0.05, flatShading: true });
  const sea = mesh(seaGeo, seaMat, 0, 0, 0, scene);
  sea.receiveShadow = true;
  anim.push((t) => {
    const p = seaGeo.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) {
      const x = seaBase[i], z = seaBase[i + 2];
      p[i + 1] = Math.sin(x * 0.32 + t * 0.9) * 0.07 + Math.cos(z * 0.41 + t * 1.2) * 0.06;
    }
    seaGeo.attributes.position.needsUpdate = true;
  });

  const far = new THREE.Group();
  for (let a = -172; a <= -8; a += 7.5) {
    const r = 82 + rand() * 22, h = 7 + rand() * 13, rr = 9 + rand() * 9;
    const m = mesh(cone(rr, h, 6 + Math.floor(rand() * 3)), M(["#8fb37a", "#7ea56b", "#a3bf86", "#93a98a"][Math.floor(rand() * 4)]),
      Math.cos(a * DEG) * r, h / 2 - 1.2, Math.sin(a * DEG) * r, far);
    m.rotation.y = rand() * 3;
  }
  for (let a = -168; a <= -12; a += 13) {   /* 第二層較近的丘陵 */
    const r = 64 + rand() * 8, h = 3 + rand() * 4;
    mesh(cone(6 + rand() * 4, h, 7), M("#a9c98c"), Math.cos(a * DEG) * r, h / 2 - 0.8, Math.sin(a * DEG) * r, far);
  }
  bake(far);
  scene.add(far);

  const starGeo = new THREE.BufferGeometry();
  const sp = [];
  for (let i = 0; i < 500; i++) {
    const th = rand() * Math.PI * 2, ph = rand() * 1.2;
    sp.push(Math.cos(th) * Math.sin(ph) * 190, Math.cos(ph) * 190 + 10, Math.sin(th) * Math.sin(ph) * 190);
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: "#fff8e0", size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  scene.add(new THREE.Points(starGeo, starMat));

  const cloudMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, flatShading: true, transparent: true, opacity: 0.95 });
  const clouds = [];
  for (let i = 0; i < 9; i++) {
    const g = new THREE.Group();
    const n = 3 + Math.floor(rand() * 3);
    for (let k = 0; k < n; k++) {
      const s = 1.1 + rand() * 1.3;
      const m = mesh(new THREE.IcosahedronGeometry(s, 0), cloudMat, k * 1.3 - n * 0.6, rand() * 0.6, rand() * 1.2, g);
      m.scale.y = 0.7;
    }
    g.position.set(-55 + rand() * 110, 9 + rand() * 4, -26 - rand() * 22);
    g.userData.v = 0.6 + rand() * 0.7;
    scene.add(g);
    clouds.push(g);
  }
  anim.push((t, dt) => clouds.forEach(c => { c.position.x += c.userData.v * dt; if (c.position.x > 60) c.position.x = -60; }));

  /* ---------- 島嶼 ---------- */
  const byId = Object.fromEntries(islands.map(s => [s.id, s]));
  const centers = Object.fromEntries(islands.map(s => [s.id, islandCenter(s)]));
  const adj = Object.fromEntries(islands.map(s => [s.id, []]));
  for (const a of islands) for (const b of islands) {
    if (a.id < b.id && centers[a.id].distanceTo(centers[b.id]) < W * 1.05) { adj[a.id].push(b.id); adj[b.id].push(a.id); }
  }
  const angleTo = (a, b) => Math.atan2(centers[b].z - centers[a].z, centers[b].x - centers[a].x);
  const near = (a, b, tol) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))) < tol;

  const treeSpots = [];   /* [x, y, z, scale, colorIndex] */
  const isl = {};         /* id → { group, spots[], pick, ring, lift } */

  const ringGeo = (r0, r1) => new THREE.RingGeometry(r0, r1, 6, 1, Math.PI / 2).rotateX(-Math.PI / 2);
  const foamMat = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.5, depthWrite: false });

  function itemSlots(s) {
    const n = s.items.length;
    if (s.kind === "trail") {   /* 15 站螺旋步道 */
      return s.items.map((_, i) => {
        const t = i / (n - 1), r = R * (0.76 - 0.44 * t), a = (-160 + t * 420) * DEG;
        return [Math.cos(a) * r, Math.sin(a) * r];
      });
    }
    const vtx = [-150, -90, -30, 30, 90, 150].map(a => a * DEG);
    if (n <= 6) return Array.from({ length: n }, (_, i) => vtx[Math.floor(i * 6 / n)]).map(a => [Math.cos(a) * 1.74, Math.sin(a) * 1.74]);
    const bridges = adj[s.id].map(o => angleTo(s.id, o));
    const extra = [-120, -60, 0, 60, 120, 180].map(a => a * DEG).filter(a => !bridges.some(b => near(a, b, 0.2)) && !(s.kind === "harbor" && near(a, -Math.PI / 2, 0.6)));
    /* 依螢幕上「左上 → 順時針」排序，再平均挑出 n 個 */
    const key = a => ((a + 155 * DEG) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const all = [...vtx.map(a => [a, 1.74]), ...extra.map(a => [a, 1.95])].sort((p, q) => key(p[0]) - key(q[0]));
    const pick = Array.from({ length: Math.min(n, all.length) }, (_, i) => all[Math.floor(i * all.length / n)]);
    return pick.map(([a, r]) => [Math.cos(a) * r, Math.sin(a) * r]);
  }

  /* 資源小屋 */
  function kiosk(g, s, x, z, i) {
    const k = new THREE.Group();
    k.position.set(x, TOP, z);
    g.add(k);
    const col = s.c;
    if (s.kind === "cinema") {         /* 電影海報看板 */
      mesh(box(0.05, 0.36, 0.05), M(C.dark), -0.16, 0.18, 0, k);
      mesh(box(0.05, 0.36, 0.05), M(C.dark), 0.16, 0.18, 0, k);
      mesh(box(0.46, 0.58, 0.06), M(i % 2 ? "#0c8599" : "#1d2f57"), 0, 0.62, 0, k);
      mesh(box(0.36, 0.44, 0.02), glow(["#ffd23f", "#ff8787", "#74c0fc", "#b2f2bb"][i % 4], "#fff3b0", 0.05, 0.6), 0, 0.62, 0.04, k);
      return k;
    }
    if (s.kind === "arcade") {         /* 迷你街機 */
      mesh(box(0.34, 0.62, 0.3), M(["#5f3dc4", "#be4bdb", "#1971c2"][i % 3]), 0, 0.31, 0, k);
      const sc = mesh(box(0.26, 0.2, 0.04), glow("#111", ["#66d9e8", "#f783ac", "#ffe066"][i % 3], 1.1, 2), 0, 0.45, 0.15, k);
      sc.rotation.x = -0.25;
      mesh(box(0.3, 0.04, 0.16), M("#212529"), 0, 0.28, 0.19, k);
      return k;
    }
    if (s.kind === "trail") {          /* 步道踏石 */
      const t = i / (s.items.length - 1);
      const c = new THREE.Color("#7950f2").lerp(new THREE.Color("#ffc029"), t);
      mesh(cyl(0.24, 0.28, 0.14, 8), M("#" + c.getHexString()), 0, 0.07, 0, k);
      mesh(cyl(0.035, 0.035, 0.42, 5), M(C.dark), 0.2, 0.25, -0.06, k);
      mesh(box(0.2, 0.12, 0.03), M(C.white), 0.29, 0.42, -0.06, k);
      return k;
    }
    const h = 0.36 + ((i * 37) % 5) * 0.04;
    mesh(box(0.46, h, 0.46), M(C.white), 0, h / 2, 0, k);
    const roof = mesh(cone(0.4, 0.3, 4), M(col), 0, h + 0.15, 0, k);
    roof.rotation.y = Math.PI / 4;
    mesh(box(0.16, 0.13, 0.02), winMat, -0.09, h * 0.58, 0.235, k);
    mesh(box(0.12, 0.2, 0.02), M(C.wood), 0.12, 0.1, 0.235, k);
    return k;
  }

  /* 每座島的地標 */
  const shieldShape = (s) => {
    const p = new THREE.Shape();
    p.moveTo(0, 0.32 * s); p.lineTo(0.27 * s, 0.24 * s); p.lineTo(0.25 * s, -0.04 * s);
    p.quadraticCurveTo(0.18 * s, -0.26 * s, 0, -0.36 * s); p.quadraticCurveTo(-0.18 * s, -0.26 * s, -0.25 * s, -0.04 * s);
    p.lineTo(-0.27 * s, 0.24 * s); p.closePath();
    return p;
  };
  const flag = (g, x, z, h, color) => {
    mesh(cyl(0.022, 0.022, h, 5), M(C.dark), x, TOP + h / 2, z, g);
    const f = keep(new THREE.Group());
    f.position.set(x, TOP + h - 0.12, z);
    mesh(box(0.34, 0.2, 0.015), M(color, { side: THREE.DoubleSide }), 0.17, 0, 0, f);
    g.add(f);
    anim.push(t => { f.rotation.y = Math.sin(t * 2.2 + x) * 0.35; });
  };
  const gable = (g, w, d, h, color, x, y, z) => {   /* 斜屋頂：轉 45° 的方塊半埋入牆內，外層群組壓扁高度 */
    const p = new THREE.Group();
    p.position.set(x, y, z);
    p.scale.y = h / (d / 2);
    mesh(box(w, d / Math.SQRT2, d / Math.SQRT2), M(color), 0, 0, 0, p).rotation.x = Math.PI / 4;
    g.add(p);
    return p;
  };

  const LANDMARK = {
    hq(g, s) {
      mesh(cyl(0.98, 1.05, 0.14, 6), M(C.stone), 0, TOP + 0.07, 0, g).rotation.y = Math.PI / 6;
      const tw = mesh(cyl(0.55, 0.62, 1.5, 6), M(C.white), 0, TOP + 0.89, 0, g); tw.rotation.y = Math.PI / 6;
      mesh(cyl(0.6, 0.6, 0.14, 6), M(s.c), 0, TOP + 1.25, 0, g).rotation.y = Math.PI / 6;
      mesh(cyl(0.5, 0.55, 0.32, 6), winMat, 0, TOP + 1.48, 0, g).rotation.y = Math.PI / 6;
      mesh(cone(0.74, 0.75, 6), M(C.gold), 0, TOP + 2.0, 0, g).rotation.y = Math.PI / 6;
      const sh = new THREE.ExtrudeGeometry(shieldShape(1.25), { depth: 0.05, bevelEnabled: false });
      mesh(sh, M(s.c), 0, TOP + 0.78, 0.5, g);
      mesh(new THREE.ExtrudeGeometry(shieldShape(0.95), { depth: 0.05, bevelEnabled: false }), M(C.gold), 0, TOP + 0.78, 0.53, g);
      mesh(box(0.06, 0.2, 0.04), M(C.white), 0, TOP + 0.78, 0.6, g);
      mesh(box(0.2, 0.06, 0.04), M(C.white), 0, TOP + 0.82, 0.6, g);
      for (const x of [-0.85, 0.85]) {
        mesh(box(0.5, 0.5, 0.5), M(C.cream), x, TOP + 0.39, -0.25, g);
        mesh(box(0.54, 0.06, 0.54), M(s.c), x, TOP + 0.66, -0.25, g);
      }
      flag(g, 0, 0, 3.0, "#18a6b5");
    },
    harbor(g, s) {
      mesh(box(1.25, 0.6, 0.8), M(C.white), -0.2, TOP + 0.3, 0.05, g);
      gable(g, 1.32, 0.86, 0.28, s.c, -0.2, TOP + 0.6, 0.05);
      mesh(box(0.42, 0.36, 0.02), M("#868e96"), -0.2, TOP + 0.18, 0.46, g);
      mesh(box(0.16, 0.12, 0.02), winMat, -0.62, TOP + 0.4, 0.46, g);
      mesh(box(0.16, 0.12, 0.02), winMat, 0.22, TOP + 0.4, 0.46, g);
      [["#2f9e44", 0.62, 0.55], ["#e03131", 0.92, 0.55], ["#1c7ed6", 0.77, 0.25], ["#2f9e44", 0.77, 0.55]].forEach(([c, x, z], i) =>
        mesh(box(0.28, 0.28, 0.28), M(c), x, TOP + 0.14 + (i === 3 ? 0.28 : 0), z, g));
      mesh(cyl(0.045, 0.06, 0.9, 6), M(C.dark), 0.62, TOP + 0.45, -0.5, g);
      const dish = keep(new THREE.Group());
      dish.position.set(0.62, TOP + 0.95, -0.5);
      const d = mesh(new THREE.ConeGeometry(0.36, 0.2, 14, 1, true), M("#f8f9fa", { side: THREE.DoubleSide }), 0, 0, 0.05, dish);
      d.rotation.x = -Math.PI / 2.5;
      mesh(cyl(0.02, 0.02, 0.3, 4), M(C.dark), 0, 0.05, 0.12, dish).rotation.x = -0.9;
      g.add(dish);
      anim.push((t, dt) => { dish.rotation.y += dt * 0.8; });
      /* 碼頭與小船（面向外海） */
      mesh(box(0.5, 0.08, 1.5), M(C.wood), 0.55, TOP - 0.12, -R * 0.93 - 0.55, g);
      for (const z of [-3.1, -3.6, -4.1]) mesh(cyl(0.05, 0.05, 0.6, 5), M("#8a6a46"), 0.32, TOP - 0.4, z, g);
      const boat = keep(new THREE.Group());
      boat.position.set(1.2, 0.05, -R * 0.93 - 0.8);
      mesh(box(0.34, 0.2, 0.9), M(C.white), 0, 0.1, 0, boat);
      mesh(box(0.36, 0.06, 0.92), M(s.c), 0, 0.2, 0, boat);
      mesh(box(0.24, 0.2, 0.3), M(C.glass), 0, 0.33, -0.1, boat);
      g.add(boat);
      anim.push(t => { boat.position.y = 0.05 + Math.sin(t * 1.6) * 0.04; boat.rotation.z = Math.sin(t * 1.3) * 0.05; });
    },
    lighthouse(g, s) {
      let y = TOP;
      for (let i = 0; i < 5; i++) {
        const h = 0.42, r0 = 0.44 - i * 0.03;
        mesh(cyl(r0 - 0.03, r0, h, 10), M(i % 2 ? C.white : C.red), 0, y + h / 2, 0, g);
        y += h;
      }
      mesh(cyl(0.42, 0.42, 0.07, 10), M(C.dark), 0, y + 0.03, 0, g);
      mesh(cyl(0.22, 0.22, 0.32, 10), lampMat, 0, y + 0.22, 0, g);
      mesh(cone(0.3, 0.3, 10), M(C.red), 0, y + 0.53, 0, g);
      const beamMat = new THREE.MeshBasicMaterial({ color: "#fff3b0", transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
      const beam = keep(new THREE.Group());
      beam.position.set(0, y + 0.22, 0);
      for (const dir of [1, -1]) {
        const bg = new THREE.ConeGeometry(0.55, 5.5, 16, 1, true).translate(0, -2.75, 0);
        const b = mesh(bg, beamMat, 0, 0, 0, beam);
        b.rotation.z = dir * Math.PI / 2;
      }
      g.add(beam);
      anim.push((t, dt) => { beam.rotation.y += dt * 0.7; });
      lighthouseBeam = beamMat;
      for (let i = 0; i < 5; i++) {
        const a = (200 + i * 28) * DEG;
        const m = mesh(new THREE.IcosahedronGeometry(0.16 + rand() * 0.14, 0), M("#9aa1a8"), Math.cos(a) * 0.85, TOP + 0.08, Math.sin(a) * 0.85, g);
        m.rotation.set(rand(), rand(), rand());
      }
      mesh(box(0.55, 0.4, 0.45), M(C.white), 0.75, TOP + 0.2, 0.3, g);
      gable(g, 0.6, 0.5, 0.2, C.red, 0.75, TOP + 0.4, 0.3);
      mesh(box(0.12, 0.1, 0.02), winMat, 0.75, TOP + 0.24, 0.53, g);
    },
    cinema(g, s) {
      mesh(box(1.7, 0.95, 1.0), M("#22304f"), 0, TOP + 0.475, -0.12, g);
      mesh(box(1.8, 0.1, 1.1), M(C.gold), 0, TOP + 1.0, -0.12, g);
      const scr = canvasTex(512, 230, (c, w, h) => {
        const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#18a6b5"); gr.addColorStop(1, "#14213d");
        c.fillStyle = gr; c.fillRect(0, 0, w, h);
        c.fillStyle = "#ffd23f"; c.font = "900 54px system-ui,sans-serif"; c.textAlign = "center"; c.fillText("NOW SHOWING", w / 2, 82);
        c.fillStyle = "#fff"; c.font = "700 30px system-ui,sans-serif"; c.fillText("ISO 27001 · 27701 · 42001", w / 2, 136); c.fillText("TISAX · 資通安全法", w / 2, 178);
      });
      mesh(new THREE.PlaneGeometry(1.42, 0.64), new THREE.MeshBasicMaterial({ map: scr, toneMapped: false }), 0, TOP + 0.52, 0.385, g);
      const bulbs = glow("#fff3bf", "#ffd43b", 0.6, 2.2);
      for (let i = 0; i < 11; i++) mesh(new THREE.SphereGeometry(0.035, 6, 4), bulbs, -0.75 + i * 0.15, TOP + 0.9, 0.4, g);
      mesh(box(0.22, 0.75, 0.08), M(C.red), 0.95, TOP + 1.1, 0.2, g);
      const pop = keep(new THREE.Group());   /* 旋轉的爆米花桶 */
      pop.position.set(-0.98, TOP + 1.25, 0.25);
      mesh(cyl(0.14, 0.1, 0.26, 8), M(C.red), 0, 0, 0, pop);
      mesh(new THREE.IcosahedronGeometry(0.15, 0), M("#fff3bf"), 0, 0.16, 0, pop);
      g.add(pop);
      anim.push(t => { pop.rotation.y = t * 1.2; pop.position.y = TOP + 1.25 + Math.sin(t * 2) * 0.05; });
    },
    trail(g, s, slots) {
      const sandM = M("#efe2c0");
      for (let i = 0; i < slots.length - 1; i++) {
        const [x0, z0] = slots[i], [x1, z1] = slots[i + 1];
        const len = Math.hypot(x1 - x0, z1 - z0);
        const p = mesh(box(0.2, 0.03, len), sandM, (x0 + x1) / 2, TOP + 0.015, (z0 + z1) / 2, g);
        p.rotation.y = Math.atan2(x1 - x0, z1 - z0);
      }
      for (const x of [-0.32, 0.32]) mesh(cyl(0.07, 0.08, 0.8, 6), M(s.c), x, TOP + 0.4, 0, g);
      mesh(box(0.86, 0.14, 0.14), M(s.c), 0, TOP + 0.84, 0, g);
      mesh(box(0.6, 0.18, 0.04), M(C.white), 0, TOP + 0.62, 0.05, g);
      flag(g, 0.06, -0.3, 1.25, "#ffc029");
    },
    detective(g, s) {
      mesh(box(1.1, 0.9, 0.85), M("#b5653a"), 0.05, TOP + 0.45, -0.15, g);
      const r = mesh(cone(0.84, 0.55, 4), M("#3b2a14"), 0.05, TOP + 1.17, -0.15, g); r.rotation.y = Math.PI / 4;
      mesh(box(0.16, 0.4, 0.16), M("#8a4b2a"), 0.35, TOP + 1.25, -0.35, g);
      mesh(box(0.22, 0.36, 0.02), M("#3b2a14"), 0.05, TOP + 0.18, 0.28, g);
      for (const x of [-0.3, 0.4]) mesh(box(0.2, 0.18, 0.02), winMat, x, TOP + 0.58, 0.28, g);
      mesh(box(0.72, 0.18, 0.05), M("#fff4d6"), 0.05, TOP + 0.85, 0.3, g);
      const mg = keep(new THREE.Group());   /* 放大鏡 */
      mg.position.set(-0.78, TOP + 0.72, 0.42);
      mesh(new THREE.TorusGeometry(0.3, 0.05, 8, 24), M(C.gold, { metalness: 0.3, roughness: 0.4 }), 0, 0, 0, mg);
      mesh(new THREE.CircleGeometry(0.29, 24), new THREE.MeshStandardMaterial({ color: "#d0ebff", transparent: true, opacity: 0.45, side: THREE.DoubleSide }), 0, 0, 0, mg);
      const hd = mesh(cyl(0.05, 0.06, 0.5, 6), M("#5c3b1e"), 0, -0.53, 0, mg);
      hd.position.y = -0.55;
      mg.rotation.z = 0.5;
      g.add(mg);
      anim.push(t => { mg.rotation.z = 0.5 + Math.sin(t * 0.9) * 0.12; mg.rotation.y = Math.sin(t * 0.6) * 0.5; });
      [["#c9a46a", 0.75, 0.45], ["#a0612b", 0.9, 0.2]].forEach(([c, x, z]) => mesh(box(0.3, 0.22, 0.24), M(c), x, TOP + 0.11, z, g));
    },
    park(g, s) {
      const hub = new THREE.Vector3(0, TOP + 1.32, -0.42);
      for (const z of [-0.18, 0.18]) for (const dx of [-0.55, 0.55]) {
        const leg = mesh(box(0.06, 1.45, 0.06), M(C.white), dx / 2, TOP + 0.66, hub.z + z, g);
        leg.rotation.z = Math.atan2(dx, 1.32);
      }
      const wheel = keep(new THREE.Group());
      wheel.position.copy(hub);
      mesh(new THREE.TorusGeometry(0.98, 0.045, 6, 36), M(C.red), 0, 0, 0, wheel);
      mesh(new THREE.TorusGeometry(0.5, 0.03, 6, 24), M(C.white), 0, 0, 0, wheel);
      mesh(cyl(0.09, 0.09, 0.38, 8), M(C.gold), 0, 0, 0, wheel).rotation.x = Math.PI / 2;
      const gondolas = [];
      const gc = ["#ffd23f", "#4dabf7", "#ff8787", "#69db7c", "#b197fc", "#ffa94d", "#66d9e8", "#f783ac"];
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        const sp = mesh(box(0.03, 0.98, 0.03), M(C.white), Math.cos(a) * 0.49, Math.sin(a) * 0.49, 0, wheel);
        sp.rotation.z = a - Math.PI / 2;
        const go = new THREE.Group();
        go.position.set(Math.cos(a) * 0.98, Math.sin(a) * 0.98, 0);
        mesh(box(0.2, 0.18, 0.2), M(gc[i]), 0, -0.1, 0, go);
        wheel.add(go);
        gondolas.push(go);
      }
      g.add(wheel);
      anim.push((t, dt) => { wheel.rotation.z += dt * 0.28; gondolas.forEach(go => { go.rotation.z = -wheel.rotation.z; }); });
      const car = keep(new THREE.Group());   /* 旋轉木馬 */
      car.position.set(0, TOP, 0.6);
      mesh(cyl(0.38, 0.4, 0.08, 12), M(C.white), 0, 0.04, 0, car);
      mesh(cyl(0.03, 0.03, 0.5, 5), M(C.gold), 0, 0.3, 0, car);
      mesh(cone(0.45, 0.28, 12), M("#f783ac"), 0, 0.68, 0, car);
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2;
        mesh(cyl(0.012, 0.012, 0.48, 4), M(C.gold), Math.cos(a) * 0.28, 0.32, Math.sin(a) * 0.28, car);
        mesh(box(0.08, 0.1, 0.16), M(gc[i]), Math.cos(a) * 0.28, 0.22, Math.sin(a) * 0.28, car).rotation.y = -a;
      }
      g.add(car);
      anim.push((t, dt) => { car.rotation.y += dt * 0.9; });
    },
    school(g, s) {
      mesh(box(1.6, 0.6, 0.7), M("#fff4e0"), 0, TOP + 0.3, -0.25, g);
      gable(g, 1.68, 0.76, 0.24, s.c, 0, TOP + 0.6, -0.25);
      for (let i = 0; i < 4; i++) if (i !== 1 && i !== 2) mesh(box(0.2, 0.16, 0.02), winMat, -0.6 + i * 0.4, TOP + 0.36, 0.11, g);
      mesh(box(0.44, 1.3, 0.44), M("#fff4e0"), 0, TOP + 0.65, -0.12, g);
      const r = mesh(cone(0.38, 0.4, 4), M(s.c), 0, TOP + 1.5, -0.12, g); r.rotation.y = Math.PI / 4;
      mesh(new THREE.CircleGeometry(0.15, 18), M(C.white), 0, TOP + 1.05, 0.105, g);
      const hands = keep(new THREE.Group()), hh = new THREE.Group(), mh = new THREE.Group();
      hands.position.set(0, TOP + 1.05, 0.115);
      mesh(box(0.022, 0.09, 0.01), M(C.dark), 0, 0.04, 0, hh);
      mesh(box(0.016, 0.13, 0.01), M(C.red), 0, 0.055, 0.004, mh);
      hands.add(hh, mh);
      g.add(hands);
      anim.push(t => { mh.rotation.z = -t * 0.8; hh.rotation.z = -t * 0.067; });
      mesh(box(0.24, 0.34, 0.02), M(C.wood), 0, TOP + 0.17, 0.105, g);
      flag(g, 0.95, 0.42, 1.2, "#ffd23f");
    },
    library(g, s) {
      mesh(box(1.7, 0.12, 1.15), M(C.stone), 0, TOP + 0.06, -0.1, g);
      mesh(box(1.55, 0.1, 1.0), M(C.stone), 0, TOP + 0.17, -0.1, g);
      mesh(box(1.4, 0.72, 0.62), M(C.cream), 0, TOP + 0.58, -0.28, g);
      for (let i = 0; i < 5; i++) mesh(cyl(0.065, 0.075, 0.72, 8), M(C.white), -0.6 + i * 0.3, TOP + 0.58, 0.28, g);
      mesh(box(1.62, 0.1, 1.08), M(C.white), 0, TOP + 0.99, -0.1, g);
      const ped = new THREE.Group();
      ped.position.set(0, TOP + 1.04, 0.36);
      ped.scale.y = 0.38;
      const pb = mesh(box(1.1, 1.1, 0.12), M(C.white), 0, 0, 0, ped);
      pb.rotation.z = Math.PI / 4;
      g.add(ped);
      gable(g, 1.6, 1.0, 0.3, s.c, 0, TOP + 1.04, -0.15);
      for (const x of [-0.35, 0.35]) mesh(box(0.2, 0.26, 0.02), winMat, x, TOP + 0.6, 0.03, g);
      [["#d6336c", 0], ["#1d2f57", 0.13], ["#e0b44a", 0.26], ["#0c8599", 0.39]].forEach(([c, y], i) => {
        const b = mesh(box(0.55, 0.12, 0.38), M(c), 0.15, TOP + 0.06 + y, 1.0, g);
        b.rotation.y = (i % 2 ? 0.25 : -0.15);
      });
    },
    arcade(g, s) {
      const neon1 = glow("#f783ac", "#f06595", 1.4, 2.6), neon2 = glow("#66d9e8", "#22b8cf", 1.4, 2.6);
      mesh(new THREE.TorusGeometry(1.16, 0.05, 6, 30, Math.PI), neon1, 0, TOP, -0.35, g);
      mesh(new THREE.TorusGeometry(1.03, 0.04, 6, 30, Math.PI), neon2, 0, TOP, -0.35, g);
      for (let i = 0; i < 3; i++) {
        mesh(box(0.38, 0.74, 0.34), M(["#5f3dc4", "#be4bdb", "#1971c2"][i]), -0.48 + i * 0.48, TOP + 0.37, -0.4, g);
        const sc = mesh(box(0.3, 0.24, 0.04), glow("#111", ["#66d9e8", "#f783ac", "#ffe066"][i], 1.2, 2.2), -0.48 + i * 0.48, TOP + 0.56, -0.22, g);
        sc.rotation.x = -0.25;
      }
      const bot = keep(new THREE.Group());   /* AI 機器人 */
      bot.position.set(0, TOP, 0.5);
      mesh(box(0.34, 0.34, 0.26), M("#dee2e6"), 0, 0.27, 0, bot);
      mesh(box(0.3, 0.24, 0.24), M("#f8f9fa"), 0, 0.58, 0, bot);
      const eye = glow("#111", "#66d9e8", 2, 3);
      for (const x of [-0.07, 0.07]) mesh(box(0.06, 0.06, 0.02), eye, x, 0.6, 0.125, bot);
      mesh(cyl(0.012, 0.012, 0.16, 4), M(C.dark), 0, 0.78, 0, bot);
      mesh(new THREE.SphereGeometry(0.035, 6, 4), neon1, 0, 0.87, 0, bot);
      for (const x of [-0.08, 0.08]) mesh(box(0.08, 0.1, 0.1), M("#adb5bd"), x, 0.05, 0, bot);
      g.add(bot);
      anim.push(t => { bot.position.y = TOP + Math.abs(Math.sin(t * 3)) * 0.08; bot.rotation.y = Math.sin(t * 0.8) * 0.6; });
    }
  };
  let lighthouseBeam = null;

  const pickMeshes = [];
  for (const s of islands) {
    const c = centers[s.id];
    const g = new THREE.Group();
    g.position.copy(c);
    g.userData.island = s.id;
    scene.add(g);
    const body = new THREE.Group();
    g.add(body);
    mesh(cyl(R * 0.99, R * 1.06, 0.95, 6), M(C.cliff), 0, -0.33, 0, body);
    mesh(cyl(R * 1.0, R * 1.0, 0.1, 6), M(C.sand), 0, 0.1, 0, body);
    mesh(cyl(R * 0.975, R * 0.975, 0.12, 6), M(s.c), 0, 0.19, 0, body);
    mesh(cyl(R * 0.93, R * 0.93, 0.1, 6), M(GROUND[s.kind]), 0, 0.25, 0, body);
    const slots = itemSlots(s);
    LANDMARK[s.kind](body, s, slots);
    const spots = slots.map(([x, z], i) => { kiosk(body, s, x, z, i); return new THREE.Vector3(c.x + x, TOP + (s.kind === "trail" ? 0.6 : s.kind === "cinema" ? 1.05 : 0.85), c.z + z); });
    /* 路燈（夜間點亮） */
    for (const a of [78, -42, -162]) {
      const x = Math.cos(a * DEG) * 2.42, z = Math.sin(a * DEG) * 2.42;
      if (slots.some(([sx, sz]) => Math.hypot(sx - x, sz - z) < 0.45)) continue;
      mesh(cyl(0.025, 0.03, 0.6, 5), M(C.dark), x, TOP + 0.3, z, body);
      mesh(new THREE.SphereGeometry(0.07, 8, 6), lampMat, x, TOP + 0.63, z, body);
    }
    /* 樹：避開橋頭、資源小屋、碼頭 */
    const bridges = adj[s.id].map(o => angleTo(s.id, o));
    for (let a = -180; a < 180; a += 17) {
      const ar = (a + rand() * 8) * DEG;
      if (bridges.some(b => near(ar, b, 0.32))) continue;
      if (s.kind === "harbor" && near(ar, -Math.PI / 2, 0.55)) continue;
      const r = 2.08 + rand() * 0.24, x = Math.cos(ar) * r, z = Math.sin(ar) * r;
      if (slots.some(([sx, sz]) => Math.hypot(sx - x, sz - z) < 0.5)) continue;
      if (rand() < 0.3) continue;
      treeSpots.push([c.x + x, TOP, c.z + z, 0.75 + rand() * 0.5, Math.floor(rand() * LEAF.length)]);
    }
    bake(body);
    shadowAll(body);
    /* 浪花與高亮光圈 */
    mesh(ringGeo(R * 1.04, R * 1.2), foamMat, 0, 0.1, 0, g);
    const ringMat = new THREE.MeshBasicMaterial({ color: s.c, transparent: true, opacity: 0, depthWrite: false });
    mesh(ringGeo(R * 1.08, R * 1.36), ringMat, 0, 0.12, 0, g);
    const pick = mesh(cyl(R, R, 3.4, 6), new THREE.MeshBasicMaterial(), 0, 1.2, 0, g);
    pick.visible = false;
    pick.userData.island = s.id;
    pickMeshes.push(pick);
    isl[s.id] = { g, spots, ringMat, lift: 0, liftTo: 0 };
  }
  anim.push(t => { foamMat.opacity = 0.38 + Math.sin(t * 1.4) * 0.12; });

  /* ---------- 橋 ---------- */
  const bridgeGroup = new THREE.Group();
  const bridgeEnds = {};   /* "a>b" → [start, end] 世界座標 */
  for (const a of islands) for (const b of adj[a.id]) {
    if (a.id > b) continue;
    const pa = centers[a.id], pb = centers[b];
    const dir = new THREE.Vector3().subVectors(pb, pa).setY(0).normalize();
    const s0 = pa.clone().addScaledVector(dir, IN - 0.15), s1 = pb.clone().addScaledVector(dir, -(IN - 0.15));
    const mid = s0.clone().add(s1).multiplyScalar(0.5);
    const len = s0.distanceTo(s1) + 0.1, rot = Math.atan2(dir.x, dir.z);
    const bg = new THREE.Group();
    bg.position.set(mid.x, 0, mid.z);
    bg.rotation.y = rot;
    mesh(box(0.62, 0.1, len), M(C.wood), 0, TOP - 0.05, 0, bg);
    for (const x of [-0.29, 0.29]) {
      mesh(box(0.04, 0.04, len), M(C.white), x, TOP + 0.16, 0, bg);
      for (const z of [-len / 2 + 0.1, 0, len / 2 - 0.1]) mesh(box(0.04, 0.18, 0.04), M(C.white), x, TOP + 0.07, z, bg);
    }
    for (const z of [-len / 4, len / 4]) mesh(cyl(0.06, 0.06, 0.7, 5), M("#8a6a46"), 0, TOP - 0.4, z, bg);
    bridgeGroup.add(bg);
    bridgeEnds[`${a.id}>${b}`] = [s0.clone().setY(TOP), s1.clone().setY(TOP)];
    bridgeEnds[`${b}>${a.id}`] = [s1.clone().setY(TOP), s0.clone().setY(TOP)];
  }
  scene.add(bridgeGroup);
  bake(bridgeGroup);

  /* ---------- 外圍小島與帆船 ---------- */
  const islets = new THREE.Group();
  const ISLETS = [[-21, -4, 1.6, "windmill"], [-18, 7, 1.2, "palm"], [21, -5, 1.5, "windmill"], [19, 6.5, 1.3, "rock"], [-11, -15, 1.4, "palm"], [11, -15.5, 1.2, "rock"], [0, -18, 1.6, "house"], [-25, 13, 1.1, "rock"], [25, 14, 1.2, "palm"]];
  const blades = [];
  for (const [x, z, r, k] of ISLETS) {
    mesh(cyl(r, r * 1.15, 0.6, 10), M(C.cliff), x, -0.15, z, islets);
    mesh(cyl(r * 0.92, r * 0.95, 0.12, 10), M(k === "rock" ? C.sand : "#b6da8c"), x, 0.2, z, islets);
    if (k === "windmill") {
      for (const dx of [-0.45, 0.45]) {
        mesh(cyl(0.05, 0.08, 1.8, 6), M(C.white), x + dx, 1.15, z, islets);
        const bl = keep(new THREE.Group());
        bl.position.set(x + dx, 2.05, z + 0.1);
        for (let i = 0; i < 3; i++) { const b = mesh(box(0.06, 0.7, 0.02), M(C.white), 0, 0.33, 0, new THREE.Group()); b.parent.rotation.z = i * 2.094; bl.add(b.parent); }
        islets.add(bl);
        blades.push(bl);
      }
    } else if (k === "palm") {
      treeSpots.push([x - 0.3, 0.26, z, 1.1, 1], [x + 0.4, 0.26, z + 0.2, 0.8, 3]);
      const um = mesh(cone(0.45, 0.25, 8), M("#f76707"), x + 0.2, 0.85, z - 0.3, islets);
      mesh(cyl(0.02, 0.02, 0.6, 4), M(C.white), x + 0.2, 0.55, z - 0.3, islets);
      um.rotation.z = 0.1;
    } else if (k === "rock") {
      for (let i = 0; i < 3; i++) mesh(new THREE.IcosahedronGeometry(0.3 + rand() * 0.3, 0), M("#9aa1a8"), x + (rand() - 0.5) * r, 0.4, z + (rand() - 0.5) * r, islets);
    } else {
      mesh(box(0.7, 0.5, 0.6), M(C.white), x, 0.5, z, islets);
      gable(islets, 0.76, 0.66, 0.22, "#1c7ed6", x, 0.75, z);
      treeSpots.push([x + 0.9, 0.26, z + 0.3, 0.9, 2]);
    }
  }
  scene.add(islets);
  bake(islets);
  anim.push((t, dt) => blades.forEach((b, i) => { b.rotation.z += dt * (1.6 + i * 0.2); }));

  const boats = [];
  const sailShape = new THREE.Shape(); sailShape.moveTo(0, 0); sailShape.lineTo(0, 0.9); sailShape.lineTo(0.55, 0.05); sailShape.closePath();
  for (let i = 0; i < 4; i++) {
    const b = new THREE.Group();
    mesh(box(0.42, 0.2, 1.0), M(C.white), 0, 0.1, 0, b);
    mesh(box(0.44, 0.06, 1.02), M(["#e03131", "#1c7ed6", "#f08c00", "#2f9e44"][i]), 0, 0.03, 0, b);
    mesh(cyl(0.02, 0.02, 1.0, 4), M(C.dark), 0, 0.65, 0, b);
    const s = mesh(new THREE.ShapeGeometry(sailShape), M(C.white, { side: THREE.DoubleSide }), 0, 0.2, -0.05, b);
    s.rotation.y = Math.PI / 2;
    shadowAll(b);
    b.userData = { r: 18 + i * 3.2, a: i * 1.7, v: (0.05 + i * 0.012) * (i % 2 ? -1 : 1) };
    scene.add(b);
    boats.push(b);
  }
  anim.push((t, dt) => boats.forEach(b => {
    const u = b.userData;
    u.a += u.v * dt;
    b.position.set(Math.cos(u.a) * u.r, 0.02 + Math.sin(t * 1.5 + u.r) * 0.05, Math.sin(u.a) * u.r * 0.8 - 2);
    b.rotation.y = -u.a + (u.v > 0 ? 0 : Math.PI);
  }));

  /* ---------- 樹（InstancedMesh） ---------- */
  {
    const trunkG = cyl(0.05, 0.07, 0.34, 5).translate(0, 0.17, 0);
    const crownG = new THREE.IcosahedronGeometry(0.27, 0).translate(0, 0.52, 0);
    const trunks = new THREE.InstancedMesh(trunkG, M("#8a6a46"), treeSpots.length);
    const crowns = new THREE.InstancedMesh(crownG, new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true }), treeSpots.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    treeSpots.forEach(([x, y, z, s, ci], i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * 6);
      m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s, s));
      trunks.setMatrixAt(i, m4); crowns.setMatrixAt(i, m4);
      crowns.setColorAt(i, col.set(LEAF[ci]));
    });
    for (const im of [trunks, crowns]) { im.castShadow = true; im.receiveShadow = true; scene.add(im); }
  }

  /* ---------- 角色：Allan 與阿拉蕾（看板人物） ---------- */
  const texLoader = new THREE.TextureLoader();
  const sprites = [];
  function person(img, h, aspect) {
    const t = texLoader.load(IMG + img);
    t.colorSpace = THREE.SRGBColorSpace;
    const sm = new THREE.SpriteMaterial({ map: t, alphaTest: 0.5, fog: true });
    const s = new THREE.Sprite(sm);
    s.center.set(0.5, 0);
    s.scale.set(h * aspect, h, 1);
    const sh = mesh(new THREE.CircleGeometry(h * aspect * 0.42, 16).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.22, depthWrite: false }));
    sh.position.y = 0.012;
    const g = new THREE.Group();
    g.add(s, sh);
    scene.add(g);
    sprites.push(sm);
    return { g, s };
  }
  const hqC = centers.hq;
  const allan = person("allan-main.webp", 1.55, 560 / 1128);
  allan.g.position.set(hqC.x + Math.cos(52 * DEG) * 1.25, TOP, hqC.z + Math.sin(52 * DEG) * 1.25);
  anim.push(t => { allan.s.material.rotation = Math.sin(t * 1.2) * 0.03; });
  const arale = person("arale-mini.webp", 1.0, 324 / 664);

  /* ---------- 路徑規劃 ---------- */
  function route(a, b) {
    const prev = { [a]: null }, q = [a];
    while (q.length) { const x = q.shift(); if (x === b) break; for (const y of adj[x]) if (!(y in prev)) { prev[y] = x; q.push(y); } }
    const out = [];
    for (let x = b; x; x = prev[x]) out.unshift(x);
    return out;
  }
  const plaza = (id, a) => new THREE.Vector3(centers[id].x + Math.cos(a) * PLAZA, TOP, centers[id].z + Math.sin(a) * PLAZA);
  function arc(id, a0, a1, pts) {
    const d = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0)), n = Math.max(1, Math.ceil(Math.abs(d) / 0.4));
    for (let k = 1; k <= n; k++) pts.push(plaza(id, a0 + d * k / n));
  }
  /* 從 a 島廣場（角度 a0）走到 b 島，回傳路點與最後角度 */
  function walkPath(ids, a0, aEnd) {
    const pts = [plaza(ids[0], a0)];
    let cur = a0;
    for (let i = 0; i < ids.length - 1; i++) {
      const I = ids[i], J = ids[i + 1], ex = angleTo(I, J);
      arc(I, cur, ex, pts);
      const [s0, s1] = bridgeEnds[`${I}>${J}`];
      pts.push(s0.clone(), s1.clone());
      cur = angleTo(J, I);
      pts.push(plaza(J, cur));
    }
    arc(ids[ids.length - 1], cur, aEnd, pts);
    return pts;
  }
  const polyLen = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += pts[i].distanceTo(pts[i - 1]); return L; };
  function along(pts, d, out) {
    for (let i = 1; i < pts.length; i++) {
      const l = pts[i].distanceTo(pts[i - 1]);
      if (d <= l) { out.lerpVectors(pts[i - 1], pts[i], l ? d / l : 0); return; }
      d -= l;
    }
    out.copy(pts[pts.length - 1]);
  }

  /* ---------- 島民 ---------- */
  /* 島民＝身體＋頭＋頭髮合併成單一網格（頂點色），一人一個 draw call */
  const personMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, flatShading: true });
  const personGeo = new Map();
  const tint = (g, hex) => {
    g = g.toNonIndexed();
    const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
    g.setAttribute("color", new THREE.BufferAttribute(a, 3));
    return g;
  };
  const personOf = (hex) => {
    if (!personGeo.has(hex)) personGeo.set(hex, mergeGeometries([
      tint(cyl(0.065, 0.095, 0.26, 7).translate(0, 0.13, 0), hex),
      tint(new THREE.SphereGeometry(0.075, 8, 6).translate(0, 0.34, 0), C.skin),
      tint(new THREE.SphereGeometry(0.08, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 0.36, -0.005), "#2b2b2b")
    ]));
    return personGeo.get(hex);
  };
  const walkers = [];
  let showCarry = true;
  function newWalker(i) {
    const role = roles[i % roles.length];
    const g = new THREE.Group();
    mesh(personOf(role.c), personMat, 0, 0, 0, g).castShadow = true;
    const cs = new THREE.Sprite(new THREE.SpriteMaterial({ map: emoji("📄"), depthWrite: false }));
    cs.scale.set(0.3, 0.3, 1);
    cs.position.y = 0.66;
    g.add(cs);
    scene.add(g);
    const w = { g, cs, role, at: islands[(i * 3) % islands.length].id, pts: null, d: 0, L: 0, flow: null, wait: 0, speed: 0.7 + rand() * 0.35, ang: rand() * 6.28 };
    walkers.push(w);
    planNext(w, true);
    w.d = rand() * w.L * 0.9;
    return w;
  }
  function planNext(w, silent) {
    const from = flows.filter(f => f.from === w.at);
    let f = null, target;
    if (from.length && rand() < 0.75) { f = from[Math.floor(rand() * from.length)]; target = f.to; }
    else { const all = flows[Math.floor(rand() * flows.length)]; target = all.from === w.at ? all.to : all.from; if (all.from === w.at) f = all; }
    const aEnd = rand() * Math.PI * 2;
    w.pts = walkPath(route(w.at, target), w.ang, aEnd);
    w.L = polyLen(w.pts); w.d = 0; w.flow = f; w.to = target; w.ang = aEnd;
    w.cs.material.map = emoji(f ? f.ci : "💬");
    w.cs.visible = showCarry && !!f;
    if (f && !silent) onEvent?.({ kind: "depart", flow: f, role: w.role.t, island: byId[target] });
  }
  const tmpV = new THREE.Vector3();
  const nWalkers = small ? 16 : 24;
  for (let i = 0; i < nWalkers; i++) newWalker(i);
  anim.push((t, dt) => walkers.forEach((w, i) => {
    if (w.wait > 0) { w.wait -= dt; if (w.wait <= 0) planNext(w); return; }
    w.d += w.speed * dt;
    along(w.pts, w.d, tmpV);
    const prev = w.g.position.clone();
    w.g.position.copy(tmpV);
    w.g.position.y += Math.abs(Math.sin(t * 9 + i)) * 0.035 + (isl[nearestIsland(tmpV)]?.lift || 0);
    const dx = tmpV.x - prev.x, dz = tmpV.z - prev.z;
    if (dx * dx + dz * dz > 1e-6) w.g.rotation.y = Math.atan2(dx, dz);
    if (w.d >= w.L) {
      w.at = w.to;
      if (w.flow) onEvent?.({ kind: "arrive", flow: w.flow, role: w.role.t, island: byId[w.at] });
      w.wait = 1 + rand() * 2.5;
      w.cs.visible = false;
    }
  }));
  function nearestIsland(p) {
    let best = null, bd = 1e9;
    for (const id in centers) { const d = (centers[id].x - p.x) ** 2 + (centers[id].z - p.z) ** 2; if (d < bd) { bd = d; best = id; } }
    return bd < R * R ? best : null;
  }

  /* 阿拉蕾依序走訪各島 */
  const tour = islands.map(s => s.id);
  const ar = { i: 0, pts: null, d: 0, L: 0, wait: 2, ang: 100 * DEG };
  arale.g.position.copy(plaza("hq", ar.ang));
  const araleSay = (txt) => { araleTag.innerHTML = txt; };
  anim.push((t, dt) => {
    if (ar.wait > 0) {
      ar.wait -= dt;
      if (ar.wait <= 0) {
        const a = tour[ar.i % tour.length], b = tour[(ar.i + 1) % tour.length];
        const aEnd = (60 + rand() * 60) * DEG;
        ar.pts = walkPath(route(a, b), ar.ang, aEnd); ar.L = polyLen(ar.pts); ar.d = 0; ar.ang = aEnd;
        ar.i++;
        araleSay(`<b>阿拉蕾</b> 前往 ${byId[b].no} ${byId[b].t}`);
      }
    } else if (ar.pts) {
      ar.d += 0.95 * dt;
      along(ar.pts, ar.d, tmpV);
      arale.g.position.copy(tmpV);
      arale.g.position.y += Math.abs(Math.sin(t * 7)) * 0.06 + (isl[nearestIsland(tmpV)]?.lift || 0);
      if (ar.d >= ar.L) {
        const s = byId[tour[ar.i % tour.length]];
        ar.wait = 4;
        araleSay(`<b>阿拉蕾</b> 走訪 ${s.no} ${s.t}`);
      }
    }
  });

  /* ---------- 知識流弧線 ---------- */
  const dashTex = canvasTex(64, 8, (c) => { c.fillStyle = "#fff"; c.fillRect(0, 0, 34, 8); });
  dashTex.wrapS = THREE.RepeatWrapping;
  const flowGroup = new THREE.Group();
  scene.add(flowGroup);
  function makeArc(a, b, color, radius = 0.06, lift = 0) {
    const pa = centers[a].clone().setY(TOP + 2.0), pb = centers[b].clone().setY(TOP + 2.0);
    const mid = pa.clone().add(pb).multiplyScalar(0.5);
    mid.y += 2.2 + pa.distanceTo(pb) * 0.18 + lift;
    const curve = new THREE.QuadraticBezierCurve3(pa, mid, pb);
    const tex = dashTex.clone(); tex.needsUpdate = true;
    tex.repeat.x = curve.getLength() / 0.75;
    const grp = new THREE.Group();
    const tm = new THREE.MeshBasicMaterial({ color, map: tex, transparent: true, depthWrite: false, fog: false });
    mesh(new THREE.TubeGeometry(curve, 48, radius, 6), tm, 0, 0, 0, grp);
    const end = curve.getPoint(1), tan = curve.getTangent(0.97);
    const arw = mesh(cone(radius * 3, radius * 7, 8), new THREE.MeshBasicMaterial({ color, fog: false }), end.x, end.y, end.z, grp);
    arw.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
    const dot = mesh(new THREE.SphereGeometry(radius * 2.2, 8, 6), new THREE.MeshBasicMaterial({ color: "#fff", fog: false }), 0, 0, 0, grp);
    grp.userData = { tex, curve, dot, ph: rand() };
    return grp;
  }
  const flowArcs = {};
  for (const f of flows) {
    const a = makeArc(f.from, f.to, byId[f.from].c);
    a.visible = false;
    flowGroup.add(a);
    flowArcs[f.id] = a;
  }
  let pathGroup = null;
  anim.push((t, dt) => {
    const step = (grp) => {
      if (!grp.visible) return;
      const u = grp.userData;
      u.tex.offset.x -= dt * 0.9;
      grp.userData.dot.position.copy(u.curve.getPoint((t * 0.25 + u.ph) % 1));
    };
    Object.values(flowArcs).forEach(step);
    pathGroup?.children.forEach(step);
  });

  /* ---------- HTML 名牌 ---------- */
  const labelEls = {};
  for (const s of islands) {
    const b = document.createElement("button");
    b.className = "ilabel";
    b._sfx = "translate(-50%,-50%)";
    b.style.setProperty("--c", s.c);
    b.innerHTML = `<b>${s.no}</b><span>${s.t}</span>`;
    b.setAttribute("aria-label", `${s.no} ${s.t}`);
    b.addEventListener("click", () => onPick?.(s.id));
    b.addEventListener("pointerenter", () => setHover(s.id));
    b.addEventListener("pointerleave", () => setHover(null));
    labels.appendChild(b);
    labelEls[s.id] = b;
  }
  const araleTag = document.createElement("div");
  araleTag.className = "atag";
  araleTag._sfx = "translate(-50%,-100%)";
  labels.appendChild(araleTag);
  araleSay(`<b>阿拉蕾</b> 走訪 01 ${byId.hq.t}`);
  let markers = [];

  function showMarkers(id) {
    markers.forEach(m => m.el.remove());
    markers = [];
    if (!id) return;
    const s = byId[id];
    isl[id].spots.forEach((p, i) => {
      const it = s.items[i];
      const el = document.createElement("button");
      el.className = s.items.length > 10 ? "imark mini" : "imark";   /* 站點多的島只顯示編號，滑過才展開 */
      el._sfx = "translate(-50%,-100%)";
      el.style.setProperty("--c", s.c);
      const txt = it.m || (it.t.length > 11 ? it.t.slice(0, 10) + "…" : it.t);
      el.innerHTML = `<i>${i + 1}</i><span>${txt}</span>`;
      el.title = it.t;
      el.addEventListener("click", () => onItem?.(id, i));
      labels.appendChild(el);
      markers.push({ el, p, i });
    });
  }

  /* ---------- 狀態：選取、高亮、懸停 ---------- */
  let focused = null, hovered = null, hiSet = null, showAllFlows = false;
  function setHover(id) {
    if (hovered === id) return;
    hovered = id;
    for (const s of islands) labelEls[s.id].classList.toggle("hover", s.id === id);
    renderer.domElement.style.cursor = id ? "pointer" : "";
    updateLift();
  }
  function updateLift() {
    for (const s of islands) {
      const o = isl[s.id];
      o.liftTo = s.id === focused ? 0.22 : (hiSet?.has(s.id) ? 0.16 : (s.id === hovered ? 0.1 : 0));
    }
  }
  function refreshFlows() {
    for (const f of flows) flowArcs[f.id].visible = showAllFlows || (focused && (f.from === focused || f.to === focused)) || selFlow === f.id;
  }
  let selFlow = null;

  /* ---------- 時段 ---------- */
  const cur = { bg: new THREE.Color(TIMES.day.bg), sky: new THREE.Color(TIMES.day.sky), gnd: new THREE.Color(TIMES.day.gnd), sun: new THREE.Color(TIMES.day.sun), water: new THREE.Color(TIMES.day.water), hemi: TIMES.day.hemi, sunI: TIMES.day.sunI, pos: new THREE.Vector3(...TIMES.day.pos), night: 0 };
  let timeTo = TIMES.day, timeK = 1, timeFrom = null;
  function applyTime() {
    scene.background.copy(cur.bg);
    scene.fog.color.copy(cur.bg);
    hemi.color.copy(cur.sky); hemi.groundColor.copy(cur.gnd); hemi.intensity = cur.hemi;
    sun.color.copy(cur.sun); sun.intensity = cur.sunI;
    sun.position.copy(cur.pos).normalize().multiplyScalar(45);
    seaMat.color.copy(cur.water);
    const n = cur.night;
    for (const [m, d, nn] of glows) m.emissiveIntensity = d + (nn - d) * n;
    starMat.opacity = Math.max(0, n - 0.3) * 1.3;
    cloudMat.color.setRGB(1 - n * 0.55, 1 - n * 0.5, 1 - n * 0.35);
    if (lighthouseBeam) { lighthouseBeam.opacity = n * 0.14; lighthouseBeam.visible = n > 0.6; }
    const tint = new THREE.Color().setRGB(1 - n * 0.42, 1 - n * 0.36, 1 - n * 0.2);
    sprites.forEach(sm => sm.color.copy(tint));
    container.dataset.night = n > 0.5 ? "1" : "0";
  }
  applyTime();

  /* ---------- 相機 ---------- */
  let W0 = 1, H0 = 1, shift = { x: 0, y: 0 }, shiftTo = { x: 0, y: 0 }, tween = null, bird = false;
  const ease = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const orbit = (target, dist, polar, az) => new THREE.Vector3(
    target.x + dist * Math.sin(polar) * Math.sin(az), target.y + dist * Math.cos(polar), target.z + dist * Math.sin(polar) * Math.cos(az));
  const curAz = () => Math.atan2(camera.position.x - controls.target.x, camera.position.z - controls.target.z);
  function fly(target, dist, polar, az = curAz(), dur = 1.2) {
    const pos = orbit(target, dist, polar, az);
    if (reduce || dur === 0) { camera.position.copy(pos); controls.target.copy(target); controls.update(); return; }
    tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: target.clone(), start: performance.now(), dur: dur * 1000 };
  }
  /* 依「沒被卡片遮住」的可見範圍，算出能框住 halfW × halfH 的相機距離 */
  function fitDist(halfW, halfH) {
    const px = Math.tan(FOV / 2 * DEG) / (H0 / 2);   /* 每像素對應的視角正切 */
    const vw = Math.max(200, W0 - Math.abs(shiftTo.x) * 2), vh = Math.max(200, H0 - Math.abs(shiftTo.y) * 2);
    return Math.max(halfW / (px * vw / 2), halfH / (px * vh / 2));
  }
  const POLAR = 0.93;
  function overviewPose() {
    /* 直式手機：兩側略裁切、盾牌置中；桌機：盾牌往上推，避開右下控制面板 */
    const portrait = W0 / H0 < 0.85;
    const d = THREE.MathUtils.clamp(fitDist(portrait ? 10.8 : 13, 9.2) * 1.06, 24, 84);
    return [new THREE.Vector3(0, 0, bird ? 2.4 : portrait ? 1.6 : 3.4), d, bird ? 0.02 : POLAR, 0];
  }
  controls.addEventListener("start", () => { tween = null; });
  controls.addEventListener("change", () => {
    const t = controls.target;
    const r = Math.hypot(t.x, t.z);
    if (r > 18) { t.x *= 18 / r; t.z *= 18 / r; }
    t.y = THREE.MathUtils.clamp(t.y, 0, 3);
  });

  function resize() {
    W0 = container.clientWidth || innerWidth; H0 = container.clientHeight || innerHeight;
    renderer.setSize(W0, H0, false);
    applyShift();
  }
  /* 卡片遮住一側時，用 view offset 把畫面中心推到可見區域；放大虛擬畫面時同步放大 fov，保持比例不變形 */
  function applyShift() {
    const sx = shift.x, sy = shift.y, fw = W0 + Math.abs(sx) * 2, fh = H0 + Math.abs(sy) * 2;
    camera.aspect = fw / fh;
    camera.fov = 2 * Math.atan(Math.tan(FOV / 2 * DEG) * fh / H0) / DEG;
    if (Math.abs(sx) < 0.5 && Math.abs(sy) < 0.5) camera.clearViewOffset();
    else camera.setViewOffset(fw, fh, sx < 0 ? -sx * 2 : 0, sy > 0 ? sy * 2 : 0, W0, H0);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);
  resize();
  {
    const [t, d, p, a] = overviewPose();
    camera.position.copy(orbit(t, d * 1.25, p - 0.12, a + 0.35));
    controls.target.copy(t);
    controls.update();
    fly(t, d, p, a, 2.4);
  }

  /* ---------- 點選 ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pickAt(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickMeshes, false)[0];
    return hit ? hit.object.userData.island : null;
  }
  let down = null;
  renderer.domElement.addEventListener("pointerdown", e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  renderer.domElement.addEventListener("pointerup", e => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    if (moved < 7 && performance.now() - down.t < 600) { const id = pickAt(e); if (id) onPick?.(id); }
    down = null;
  });
  let hoverQ = null;
  renderer.domElement.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse" || e.buttons) return;
    hoverQ = e;
  });
  renderer.domElement.addEventListener("pointerleave", () => setHover(null));

  /* ---------- 主迴圈 ---------- */
  const clock = new THREE.Clock();
  let t = 0, frozen = !!reduce;
  const v = new THREE.Vector3();
  function project(el, p, yOff = 0) {
    v.copy(p); v.y += yOff;
    v.project(camera);
    if (v.z > 1 || v.x < -1.3 || v.x > 1.3 || v.y < -1.3 || v.y > 1.3) { el.style.visibility = "hidden"; return; }
    el.style.visibility = "";
    el.style.transform = `translate3d(${((v.x + 1) / 2 * W0).toFixed(1)}px,${((1 - v.y) / 2 * H0).toFixed(1)}px,0) ${el._sfx}`;
  }
  function loop() {
    const raw = Math.min(clock.getDelta(), 0.5), dt = Math.min(raw, 0.05);   /* 動畫用夾住的 dt，鏡頭與介面用實際時間 */
    if (!frozen) { t += dt; anim.forEach(f => f(t, dt)); }
    if (hoverQ) { setHover(pickAt(hoverQ)); hoverQ = null; }
    if (tween) {
      const k = Math.min(1, (performance.now() - tween.start) / tween.dur);
      const e = ease(k);
      camera.position.lerpVectors(tween.p0, tween.p1, e);
      controls.target.lerpVectors(tween.t0, tween.t1, e);
      if (k >= 1) tween = null;
    }
    if (shift.x !== shiftTo.x || shift.y !== shiftTo.y) {
      const k = reduce || (Math.abs(shift.x - shiftTo.x) < 0.5 && Math.abs(shift.y - shiftTo.y) < 0.5) ? 1 : Math.min(1, raw * 7);
      shift.x += (shiftTo.x - shift.x) * k; shift.y += (shiftTo.y - shift.y) * k;
      applyShift();
    }
    if (timeFrom) {
      timeK = Math.min(1, timeK + raw / (reduce ? 0.01 : 1.4));
      const e = ease(timeK);
      for (const k of ["bg", "sky", "gnd", "sun", "water"]) cur[k].lerpColors(timeFrom[k], new THREE.Color(timeTo[k]), e);
      cur.hemi = timeFrom.hemi + (timeTo.hemi - timeFrom.hemi) * e;
      cur.sunI = timeFrom.sunI + (timeTo.sunI - timeFrom.sunI) * e;
      cur.night = timeFrom.night + (timeTo.night - timeFrom.night) * e;
      cur.pos.lerpVectors(timeFrom.pos, new THREE.Vector3(...timeTo.pos), e);
      applyTime();
      if (timeK >= 1) timeFrom = null;
    }
    for (const s of islands) {
      const o = isl[s.id];
      o.lift += (o.liftTo - o.lift) * Math.min(1, raw * 8);
      o.g.position.y = o.lift;
      const on = s.id === focused || hiSet?.has(s.id);
      o.ringMat.opacity += ((on ? 0.45 + Math.sin(t * 3) * 0.15 : 0) - o.ringMat.opacity) * Math.min(1, raw * 6);
    }
    controls.update();
    for (const s of islands) project(labelEls[s.id], new THREE.Vector3(centers[s.id].x, TOP + isl[s.id].lift + 0.3, centers[s.id].z + R * 0.66));
    project(araleTag, arale.g.position, 1.12);
    for (const m of markers) project(m.el, m.p, isl[focused]?.lift || 0);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();

  /* ---------- 對外 API ---------- */
  const api = {
    focus(id) {
      focused = id;
      showMarkers(id);
      updateLift(); refreshFlows();
      for (const s of islands) labelEls[s.id].classList.toggle("sel", s.id === id);
      const c = centers[id];
      const d = THREE.MathUtils.clamp(fitDist(5.0, 4.2), 12, 32);
      fly(new THREE.Vector3(c.x, TOP + 0.6, c.z), d, bird ? 0.02 : 0.88);
    },
    unfocus() {
      focused = null; showMarkers(null); updateLift(); refreshFlows();
      for (const s of islands) labelEls[s.id].classList.remove("sel");
    },
    overview() {
      api.unfocus();
      const [t, d, p, a] = overviewPose();
      fly(t, d, p, a);
    },
    focusFlow(fid) {
      selFlow = fid; refreshFlows();
      if (!fid) return;
      const f = flows.find(x => x.id === fid);
      const m = centers[f.from].clone().add(centers[f.to]).multiplyScalar(0.5);
      const half = centers[f.from].distanceTo(centers[f.to]) / 2 + 4;
      fly(m.setY(TOP + 1.2), THREE.MathUtils.clamp(fitDist(half, half * 0.7), 14, 50), bird ? 0.02 : 0.9);
    },
    setHighlight(ids) {
      hiSet = ids && ids.length ? new Set(ids) : null;
      for (const s of islands) {
        labelEls[s.id].classList.toggle("hi", !!hiSet?.has(s.id));
        labelEls[s.id].classList.toggle("dim", !!hiSet && !hiSet.has(s.id));
      }
      updateLift();
    },
    setPath(steps) {
      if (pathGroup) { scene.remove(pathGroup); pathGroup.traverse(o => { o.geometry?.dispose(); o.material?.dispose?.(); }); pathGroup = null; }
      for (const s of islands) delete labelEls[s.id].dataset.step;
      if (!steps) return;
      pathGroup = new THREE.Group();
      for (let i = 0; i < steps.length - 1; i++) pathGroup.add(makeArc(steps[i], steps[i + 1], "#f59f00", 0.08, 0.6));
      steps.forEach((id, i) => { labelEls[id].dataset.step = i + 1; });
      scene.add(pathGroup);
    },
    setTime(key) {
      timeFrom = { bg: cur.bg.clone(), sky: cur.sky.clone(), gnd: cur.gnd.clone(), sun: cur.sun.clone(), water: cur.water.clone(), hemi: cur.hemi, sunI: cur.sunI, pos: cur.pos.clone(), night: cur.night };
      timeTo = TIMES[key]; timeK = 0;
    },
    setToggle(name, on) {
      if (name === "names") labels.classList.toggle("nonames", !on);
      if (name === "carry") { showCarry = on; walkers.forEach(w => { w.cs.visible = on && !!w.flow && w.wait <= 0; }); }
      if (name === "flows") { showAllFlows = on; refreshFlows(); }
      if (name === "freeze") frozen = on;
      if (name === "bird") {
        bird = on;
        controls.maxPolarAngle = on ? 0.05 : 1.28;
        controls.minPolarAngle = on ? 0 : 0.12;
        controls.enableRotate = !on;
        if (focused) api.focus(focused);
        else { const [tt, d, p, a] = overviewPose(); fly(tt, d, p, a); }
      }
    },
    setShift(x, y) { shiftTo = { x, y }; },
    flashItem(id, i) {
      const m = markers.find(k => k.i === i);
      if (!m) return;
      m.el.classList.remove("flash"); void m.el.offsetWidth; m.el.classList.add("flash");
    },
    hoverItem(i) { markers.forEach(m => m.el.classList.toggle("hover", m.i === i)); },
    is3d: true
  };
  return api;
}
