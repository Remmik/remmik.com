"use client";

import { useEffect, useRef } from "react";
import styles from "./distortion-line.module.css";

const VERTEX_SOURCE = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SOURCE = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

// Hash functions for pixel noise
float hash(float n) { return fract(sin(n) * 43758.5453123); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time;

  // Pixelate the UV — chunky grid
  float pixelSize = 12.0;
  vec2 pixelUV = floor(gl_FragCoord.xy / pixelSize) * pixelSize / u_resolution;

  // Screen colors
  vec3 blueColor = vec3(0.0, 0.0, 1.0);   // #0000FF
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);   // #FFFFFF

  // Base split at vertical center
  float center = 0.5;

  // Glitch: horizontal slice displacement — rows randomly shift left/right
  float sliceId = floor(pixelUV.y * 40.0);
  float glitchTrigger = step(0.92, hash(sliceId + floor(t * 3.0)));
  float sliceOffset = (hash(sliceId * 7.0 + floor(t * 4.0)) - 0.5) * 0.3 * glitchTrigger;

  // Another layer: bigger block glitches that happen less often
  float blockId = floor(pixelUV.y * 8.0);
  float blockTrigger = step(0.85, hash(blockId + floor(t * 1.5) * 13.0));
  float blockOffset = (hash(blockId * 3.0 + floor(t * 2.0)) - 0.5) * 0.15 * blockTrigger;

  float displacedX = pixelUV.x + sliceOffset + blockOffset;

  // Jagged boundary — the split line itself is noisy/stepped
  float boundaryNoise = (hash2(vec2(floor(displacedX * 30.0), floor(t * 2.0))) - 0.5) * 0.15;
  float boundary = center + boundaryNoise;

  // Pixel-snapped y for hard color boundary
  float isBottom = step(boundary, pixelUV.y);

  // Base color — WebGL Y is bottom-to-top, so high Y = top of canvas = hero (blue)
  vec3 color = mix(whiteColor, blueColor, isBottom);

  // Scattered glitch pixels — flip between blue and white only
  float pixelId = hash2(floor(gl_FragCoord.xy / pixelSize) + floor(t * 6.0) * 0.1);
  float nearBoundary = 1.0 - smoothstep(0.0, 0.25, abs(pixelUV.y - center));
  float scatterFlip = step(0.93, pixelId) * nearBoundary;
  // Flip: blue becomes white, white becomes blue
  vec3 flipped = mix(blueColor, whiteColor, 1.0 - isBottom);
  color = mix(color, flipped, scatterFlip);

  // Mid-tone glitch pixels — some pixels get a blue-white blend instead of pure flip
  float midPixel = step(0.88, hash2(floor(gl_FragCoord.xy / pixelSize) + floor(t * 3.0) * 0.3));
  float midBlend = hash(floor(gl_FragCoord.y / pixelSize) + floor(t * 2.0)) * 0.6 + 0.2;
  vec3 midColor = mix(blueColor, whiteColor, midBlend);
  color = mix(color, midColor, midPixel * nearBoundary);

  // Occasional full-width flash lines — white flashes on blue side, blue on white side
  float flashLine = step(0.997, hash(floor(pixelUV.y * 200.0) + floor(t * 8.0)));
  vec3 flashColor = mix(blueColor, whiteColor, isBottom);
  color = mix(color, flashColor, flashLine * nearBoundary * 0.6);

  gl_FragColor = vec4(color, 1.0);
}
`;

function initWebGL(canvas: HTMLCanvasElement): (() => void) | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
  });
  if (!gl) return null;

  function createShader(
    context: WebGLRenderingContext,
    type: number,
    source: string
  ): WebGLShader | null {
    const shader = context.createShader(type);
    if (!shader) return null;
    context.shaderSource(shader, source);
    context.compileShader(shader);
    if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
      console.error(context.getShaderInfoLog(shader));
      context.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
  if (!vertShader || !fragShader) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }

  gl.useProgram(program);

  const positions = new Float32Array([
    -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
  ]);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, "u_time");
  const uResolution = gl.getUniformLocation(program, "u_resolution");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let animId = 0;
  const startTime = performance.now();

  function render() {
    if (!gl) return;
    const dpr = window.devicePixelRatio || 1;
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;
    const drawW = Math.round(displayW * dpr);
    const drawH = Math.round(displayH * dpr);

    if (canvas.width !== drawW || canvas.height !== drawH) {
      canvas.width = drawW;
      canvas.height = drawH;
    }

    gl.viewport(0, 0, drawW, drawH);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const elapsed = (performance.now() - startTime) / 1000;
    gl.uniform1f(uTime, elapsed);
    gl.uniform2f(uResolution, drawW, drawH);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    animId = requestAnimationFrame(render);
  }

  animId = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(animId);
    gl.deleteProgram(program);
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    gl.deleteBuffer(buffer);
  };
}

export function DistortionLine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cleanup = initWebGL(canvas);
    return () => cleanup?.();
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden />;
}
