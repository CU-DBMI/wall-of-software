// header background visualization

import {
  BufferGeometry,
  CanvasTexture,
  Clock,
  Color,
  Float32BufferAttribute,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";

// helix props
const strandSize = 0.3;
const pairSize = 0.1;
const helixMinZ = -10;
const helixMaxZ = 10;
const helixRadius = 1.75;
const helixStep = 0.1;
const helixTwist = 1 / 15;
const helixTilt = 16;

// particle props
const particleSize = 0.75;
const particleChars = ["0", "1"];
const particleCount = 150;
const particleAcceleration = (position) => new Vector3(position.x * 0.5, 1, 0);
const particleDecay = 1;

// 360 degrees
const tau = 2 * Math.PI;

// rand between range
const rand = (min = 0, max = 1) => min + Math.random() * (max - min);

// round to multiple
const round = (value, multiple) => multiple * Math.floor(value / multiple);

// triangle
const ramp = (value, mid = 0.25) => {
  if (value < 0) return 0;
  if (value < mid) return value / mid;
  if (value < 1) return 1 - (value - mid) / (1 - mid);
  return 0;
};

// three js main objects
const canvas = document.querySelector("canvas");
const renderer = new WebGLRenderer({ canvas: canvas, alpha: true });
const scene = new Scene();
const camera = new PerspectiveCamera(45, 1, 0.01, 100);
const clock = new Clock();

// resize/reset scene/camera
const reset = () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.position.set(0, 0, -15);
  camera.lookAt(0, 0, 0);
  camera.translateX(-5);
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
};
reset();
window.addEventListener("resize", reset);

// get color palette
const style = window.getComputedStyle(document.documentElement);
const dark = new Color(style.getPropertyValue("--dark"));
const mid = new Color(style.getPropertyValue("--mid"));
const light = new Color(style.getPropertyValue("--light"));

// generate helix
const leftPoints = [];
const rightPoints = [];
const pairPoints = [];
const colors = [];
const pairColors = [];
for (let z = helixMinZ; z <= helixMaxZ; z += helixStep) {
  // percent through length
  const percent = (z - helixMinZ) / (helixMaxZ - helixMinZ);

  // position
  const x = Math.sin(-helixTwist * tau * z) * helixRadius;
  const y = Math.cos(-helixTwist * tau * z) * helixRadius;
  leftPoints.push(x, y, z);
  rightPoints.push(-x, -y, z);

  // color
  const color = mid.clone().lerpHSL(light, percent);
  colors.push(color.r, color.g, color.b);

  // connect strands with a pair at z integer intervals
  if (Math.abs(z - Math.round(z)) < 0.001) {
    pairPoints.push(x, y, z, -x, -y, z);
    const { r, g, b } = color;
    pairColors.push(r, g, b, r, g, b);
  }
}

// materials
const strandMaterial = new LineMaterial({
  color: 0xffffff,
  linewidth: strandSize,
  worldUnits: true,
  vertexColors: true,
});
const pairMaterial = new LineMaterial({
  color: 0xffffff,
  linewidth: pairSize,
  worldUnits: true,
  vertexColors: true,
});

// left strand object
const leftStrandGeometry = new LineGeometry();
leftStrandGeometry.setPositions(leftPoints);
leftStrandGeometry.setColors(colors);
const leftStrand = new Line2(leftStrandGeometry, strandMaterial);
leftStrand.name = "helix";
leftStrand.rotation.x = tau / 4;
scene.add(leftStrand);

// right strand object
const rightStrandGeometry = new LineGeometry();
rightStrandGeometry.setPositions(rightPoints);
rightStrandGeometry.setColors(colors);
const rightStrand = new Line2(rightStrandGeometry, strandMaterial);
rightStrand.name = "helix";
rightStrand.rotation.x = tau / 4;
scene.add(rightStrand);

// get random point on strands
const getStrandPoint = () => {
  const left = Math.random() > 0.5;
  const strand = left ? leftStrand : rightStrand;
  const points = left ? leftPoints : rightPoints;
  const pointIndex = round(Math.random() * points.length, 3);
  return strand.localToWorld(
    new Vector3(...points.slice(pointIndex, pointIndex + 3))
  );
};

// pairs object
const pairGeometry = new LineSegmentsGeometry();
pairGeometry.setPositions(pairPoints);
pairGeometry.setColors(pairColors);
const pairs = new LineSegments2(pairGeometry, pairMaterial);
pairs.name = "helix";
pairs.rotation.x = tau / 4;
scene.add(pairs);

// particles
for (const char of particleChars) {
  // draw char on canvas
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 100, 100);
  ctx.fillStyle = "white";
  ctx.font = "100px IBM Plex Sans";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char, 50, 50);

  // use canvas as texture
  const material = new PointsMaterial({
    size: particleSize,
    alphaMap: new CanvasTexture(canvas),
    alphaTest: 0.5,
    transparent: true,
    vertexColors: true,
  });

  // init buffer of points and colors
  const points = Array(particleCount * 3).fill(0);
  const colors = Array(particleCount * 3).fill(0);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));

  // particle object
  const particle = new Points(geometry, material);
  particle.name = "particle";
  particle.userData = Array(particleCount)
    .fill()
    .map(() => ({
      life: rand(),
      acceleration: new Vector3(),
      velocity: new Vector3(),
    }));
  scene.add(particle);
}

// render frame
const frame = () => {
  // time since last tick
  const delta = Math.min(0.1, clock.getDelta());

  // for each element in scene
  for (const child of scene.children) {
    if (child.name === "helix") {
      // spin
      child.rotation.z += delta;
    }

    if (child.name === "particle") {
      // get buffers
      const positionAttr = child.geometry.getAttribute("position");
      const colorAttr = child.geometry.getAttribute("color");

      // loop through other "buffers"
      for (let [index, particle] of Object.entries(child.userData)) {
        // cast to number
        index = +index;

        // get position
        let position = new Vector3(
          positionAttr.getX(index),
          positionAttr.getY(index),
          positionAttr.getZ(index)
        );

        // init position
        if (!position.length()) position = getStrandPoint();

        // increment life
        particle.life += delta / particleDecay;

        // accelerate
        particle.acceleration = particleAcceleration(
          position.clone().normalize()
        ).multiplyScalar(0.05);

        // increment velocity
        particle.velocity.add(particle.acceleration);

        // increment position
        position.add(particle.velocity.clone().multiplyScalar(delta));

        // interpolate color
        const [r, g, b] = light
          .clone()
          .lerpHSL(mid, ramp(particle.life) / 1.25);
        colorAttr.setXYZ(index, r, g, b);

        // respawn
        if (particle.life > 1) {
          position = getStrandPoint();
          particle.life = 0;
          particle.velocity = new Vector3();
        }

        // set position
        const { x, y, z } = position;
        positionAttr.setXYZ(index, x, y, z);
      }

      // signal buffers to update
      positionAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
    }
  }

  // update scene
  renderer.render(scene, camera);

  // run frame again
  window.setTimeout(() => window.requestAnimationFrame(frame), 10);
};

frame();

const mouseMove = (event) => {
  // get x/y from -1 to 1
  const x = event ? -1 + 2 * (event.clientX / window.innerWidth) : 0;
  const y = event ? -1 + 2 * (event.clientY / window.innerHeight) : 0;

  // tilt helix
  for (const child of scene.children)
    if (child.name === "helix") {
      child.rotation.y = helixTilt + (tau / 4) * (x / 4);
      child.rotation.x = tau / 4 + (tau / 4) * (y / 4);
    }
};
mouseMove();
window.addEventListener("mousemove", mouseMove);
