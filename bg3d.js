(function () {
  const canvas = document.getElementById("bg3d");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 640px)").matches;

  const MIDNIGHT = "rgba(27, 35, 66, 0.48)";
  const WINE = "rgba(106, 31, 46, 0.5)";

  let W = 0, H = 0, DPR = 1;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  function edgesFromVertices(v) {
    const pairs = [];
    let minD = Infinity;
    for (let i = 0; i < v.length; i++) {
      for (let j = i + 1; j < v.length; j++) {
        const d = Math.hypot(v[i][0] - v[j][0], v[i][1] - v[j][1], v[i][2] - v[j][2]);
        pairs.push([i, j, d]);
        if (d < minD) minD = d;
      }
    }
    return pairs.filter(([, , d]) => d - minD < 0.001).map(([i, j]) => [i, j]);
  }

  function makeSolid(verts, r) {
    const v = verts.map((p) => {
      const l = Math.hypot(p[0], p[1], p[2]) || 1;
      return [p[0] / l * r, p[1] / l * r, p[2] / l * r];
    });
    return { v, e: edgesFromVertices(v) };
  }

  function makeIcosahedron(r) {
    const t = (1 + Math.sqrt(5)) / 2;
    return makeSolid([
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
    ], r);
  }

  function makeOctahedron(r) {
    return makeSolid([
      [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
    ], r);
  }

  function makeTorus(R, r, segR, segr) {
    const v = [];
    const e = [];
    for (let i = 0; i < segR; i++) {
      for (let j = 0; j < segr; j++) {
        const u = (i / segR) * Math.PI * 2;
        const w = (j / segr) * Math.PI * 2;
        v.push([
          (R + r * Math.cos(w)) * Math.cos(u),
          r * Math.sin(w),
          (R + r * Math.cos(w)) * Math.sin(u),
        ]);
      }
    }
    const idx = (i, j) => ((i % segR) * segr) + (j % segr);
    for (let i = 0; i < segR; i++) {
      for (let j = 0; j < segr; j++) {
        e.push([idx(i, j), idx(i + 1, j)]);
        e.push([idx(i, j), idx(i, j + 1)]);
      }
    }
    return { v, e };
  }

  function makeShape(verts, color, line, speed, dots) {
    return {
      verts, e: verts.e, color, line, speed, dots,
      rx: Math.random() * 6.28, ry: Math.random() * 6.28,
      sx: Math.random() * 0.004 + 0.001,
      sy: Math.random() * 0.004 + 0.001,
      fx: 0, fy: 0, scale: 1, cam: 460,
      float: Math.random() * 6.28,
    };
  }

  const ico = makeIcosahedron(165);
  const octa = makeOctahedron(64);
  const torus = makeTorus(105, 30, 20, 8);

  const shapes = [
    makeShape(ico, MIDNIGHT, 1.5, 1, true),
    makeShape(torus, WINE, 1.4, 0.8, false),
  ];
  if (!small) {
    shapes.push(makeShape(octa, WINE, 1.3, 1.4, true));
  }
  const shapePos = [
    { fx: 0.8, fy: 0.38, scale: 1 },
    { fx: 0.5, fy: 0.88, scale: 0.8 },
    { fx: 0.14, fy: 0.28, scale: 0.85 },
  ];

  const PARTICLE_COUNT = small ? 18 : 46;
  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * 1000, y: Math.random() * 1000,
      r: Math.random() * 1.6 + 0.6,
      a: Math.random() * 0.3 + 0.08,
      s: Math.random() * 0.25 + 0.08,
      wine: Math.random() > 0.55,
    });
  }

  const mouse = { tx: 0, ty: 0, x: 0, y: 0 };
  if (!reduced && !small) {
    window.addEventListener("mousemove", (e) => {
      mouse.tx = (e.clientX / W - 0.5);
      mouse.ty = (e.clientY / H - 0.5);
    }, { passive: true });
  }

  function project(p, rot, cx, cy, scale, cam) {
    let x = p[0], y = p[1], z = p[2];
    const cyY = Math.cos(rot.ry), syY = Math.sin(rot.ry);
    const x1 = x * cyY + z * syY;
    const z1 = -x * syY + z * cyY;
    const cxX = Math.cos(rot.rx), sxX = Math.sin(rot.rx);
    const y1 = y * cxX - z1 * sxX;
    const z2 = y * sxX + z1 * cxX;
    const k = cam / (cam - z2);
    return [cx + x1 * scale * k, cy + y1 * scale * k, k];
  }

  function drawShape(s, t, i) {
    const pos = shapePos[i];
    s.rx += s.sx * s.speed;
    s.ry += s.sy * s.speed;
    const fx = pos.fx * W + Math.cos(t * 0.0004 + s.float) * 18 + mouse.x * 14;
    const fy = pos.fy * H + Math.sin(t * 0.0005 + s.float) * 14 + mouse.y * 10;
    const cam = s.cam;
    const cx = fx, cy = fy;

    ctx.beginPath();
    for (const [a, b] of s.e) {
      const pa = project(s.verts.v[a], s, cx, cy, s.scale * pos.scale, cam);
      const pb = project(s.verts.v[b], s, cx, cy, s.scale * pos.scale, cam);
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
    }
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.line;
    ctx.stroke();

    if (s.dots) {
      ctx.fillStyle = s.color;
      for (const p of s.verts.v) {
        const pp = project(p, s, cx, cy, s.scale * pos.scale, cam);
        ctx.beginPath();
        ctx.arc(pp[0], pp[1], 2.4, 0, 6.283);
        ctx.fill();
      }
    }
  }

  function drawParticles(t) {
    ctx.fillStyle = WINE;
    for (const p of particles) {
      p.x += p.s * 0.4;
      p.y -= p.s;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x > W + 10) p.x = -10;
      ctx.globalAlpha = p.a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  let running = true;
  function loop(t) {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    mouse.x += (mouse.tx - mouse.x) * 0.03;
    mouse.y += (mouse.ty - mouse.y) * 0.03;
    drawParticles(t);
    for (let i = 0; i < shapes.length; i++) drawShape(shapes[i], t, i);
    requestAnimationFrame(loop);
  }

  if (reduced) {
    loop(0);
  } else {
    requestAnimationFrame(loop);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { running = false; }
    else { running = true; requestAnimationFrame(loop); }
  });
})();
