// header background visualization

import {
  BufferGeometry,
  CanvasTexture,
  Clock,
  Color,
  Float32BufferAttribute,
  Group,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// helix props
const strandSize = 0.3;
const pairSize = 0.1;
const helixMinZ = -10;
const helixMaxZ = 10;
const helixStep = 0.1;
const helixRadius = 1.75;
const helixTwist = 1 / 15;

// particle props
const particleSize = 1;
const particleChars = {
  "⬢": 50,
  "•": 150,
  "0": 1,
  "1": 1,
  "A": 1,
  "C": 1,
  "G": 1,
  "T": 1,
};
const particleVelocity = (position) => new Vector3(position.x, 1, position.z);
const particleDecay = 1;

// 360 degrees
const tau = 2 * Math.PI;

// rand between range
const rand = (min = 0, max = 1) => min + Math.random() * (max - min);

// round to multiple
const round = (value, multiple) => multiple * Math.floor(value / multiple);

// get color palette
const style = window.getComputedStyle(document.documentElement);
const dark = new Color(style.getPropertyValue("--dark"));
const light = new Color(style.getPropertyValue("--light"));

// three js main objects
const canvas = document.querySelector("canvas");
const renderer = new WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});
renderer.autoClear = false;
const scene = new Scene();
scene.background = light;
const camera = new PerspectiveCamera();
const clock = new Clock();

// post-processing
const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new Vector2(canvas.clientWidth, canvas.clientHeight),
  0,
  1000,
  0
);
const outputPass = new OutputPass();
const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(outputPass);

// resize/reset scene/camera
const reset = async () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  composer.setPixelRatio(window.devicePixelRatio);
  composer.setSize(canvas.clientWidth, canvas.clientHeight, false);
};
reset();
window.addEventListener("resize", reset);

// generate helix
const leftPoints = [];
const rightPoints = [];
const pairPoints = [];
const helixColors = [];
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
  const color = light.clone().lerpHSL(dark, percent);
  helixColors.push(color.r, color.g, color.b);

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
leftStrandGeometry.setColors(helixColors);
const leftStrand = new Line2(leftStrandGeometry, strandMaterial);
leftStrand.rotation.x = tau / 4;

// right strand object
const rightStrandGeometry = new LineGeometry();
rightStrandGeometry.setPositions(rightPoints);
rightStrandGeometry.setColors(helixColors);
const rightStrand = new Line2(rightStrandGeometry, strandMaterial);
rightStrand.rotation.x = tau / 4;

// get random point on strands
const getStrandPoint = () => {
  const left = Math.random() > 0.5;
  const strand = left ? leftStrand : rightStrand;
  const points = left ? leftPoints : rightPoints;
  const index = round(Math.random() * points.length, 3);
  return {
    position: strand.localToWorld(
      new Vector3(...points.slice(index, index + 3))
    ),
    color: new Color(...helixColors.slice(index, index + 3)),
  };
};

// pairs object
const pairGeometry = new LineSegmentsGeometry();
pairGeometry.setPositions(pairPoints);
pairGeometry.setColors(pairColors);
const pairs = new LineSegments2(pairGeometry, pairMaterial);
pairs.rotation.x = tau / 4;

// helix group object
const helix = new Group();
helix.name = "helix";
helix.renderOrder = 1;
helix.add(pairs);
helix.add(rightStrand);
helix.add(leftStrand);
scene.add(helix);

// particles
const particles = new Group();
particles.name = "particles";
particles.renderOrder = -1;
for (const [char, count] of Object.entries(particleChars)) {
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
    vertexColors: true,
    depthTest: false,
  });

  // init buffer of points and colors
  const points = Array(count * 3).fill(0);
  const colors = Array(count * 3).fill(0);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));

  // particle object
  const particle = new Points(geometry, material);
  particle.userData = Array(count)
    .fill()
    .map(() => ({
      life: rand(),
      acceleration: new Vector3(),
      velocity: new Vector3(),
      startColor: new Color(),
    }));
  particles.add(particle);
}
scene.add(particles);

// render frame
const frame = () => {
  // time since last tick
  const delta = Math.min(0.1, clock.getDelta());

  // for each element in scene
  for (const group of scene.children)
    for (const child of group.children) {
      if (group.name === "helix") {
        // spin
        child.rotation.z -= delta;
      }

      if (group.name === "particles") {
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
          if (!position.length()) position = getStrandPoint().position;

          // increment life
          particle.life += delta / particleDecay;

          // increment position
          position.add(particle.velocity.clone().multiplyScalar(delta * boost));

          // interpolate color
          const [r, g, b] = particle.startColor
            .clone()
            .lerpHSL(light, particle.life);
          colorAttr.setXYZ(index, r, g, b);

          // respawn
          if (particle.life > 1) {
            const point = getStrandPoint();
            position = point.position;
            particle.startColor = point.color;
            particle.life = 0;
            particle.velocity = particleVelocity(position);
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
  composer.render();

  // decay radioactive effect
  if (bloomPass.strength > 0) bloomPass.strength -= delta * 0.05;
  if (boost > 1) boost -= delta * 5;

  // run frame again
  window.setTimeout(() => window.requestAnimationFrame(frame), 10);
};

// particle movement boost
let boost = 1;

// mouse positions, from -1 to 1
let mouse = new Vector2(0, 0);
let prevMouse = new Vector2(0, 0);

// on mouse move
const mouseMove = (event) => {
  if (event?.clientX) {
    mouse.x = -1 + 2 * (event.clientX / window.innerWidth);
    mouse.y = -1 + 2 * (event.clientY / window.innerHeight);
  } else {
    mouse.x = 0;
    mouse.y = 0;
  }

  // mouse speed
  const delta = mouse.clone().sub(prevMouse).length();

  // position camera
  camera.position
    .set(0, -tau / 32 + mouse.y / 3, -1)
    .normalize()
    .multiplyScalar(15);
  camera.lookAt(0, 0, 0);
  camera.rotateOnAxis(new Vector3(0, 0, 1), mouse.x * (tau / 16));

  // intensify radioactive effect on hard mouse shake
  if (bloomPass.strength < 0.05) bloomPass.strength += delta * 0.005;
  if (boost < 5) boost += delta * 0.5;

  prevMouse = mouse.clone();
};
mouseMove();
window.addEventListener("mousemove", mouseMove);
window.addEventListener("resize", mouseMove);

// start frame cycle
frame();
