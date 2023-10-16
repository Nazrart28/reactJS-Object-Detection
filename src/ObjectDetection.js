import React, { useRef, useEffect } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

function ObjectDetection() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    async function setupCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({ 'video': true });
      videoRef.current.srcObject = stream;
      return new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          resolve(videoRef.current);
        };
      });
    }

    async function detectFrame(model) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      const predictions = await model.detect(videoRef.current);
      renderPredictions(predictions);
      requestAnimationFrame(() => detectFrame(model));
    }

    function renderPredictions(predictions) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const font = "16px sans-serif";
      ctx.font = font;
      ctx.textBaseline = "top";
      predictions.forEach(prediction => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        const width = prediction.bbox[2];
        const height = prediction.bbox[3];
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = "#00FFFF";
        const textWidth = ctx.measureText(prediction.class).width;
        const textHeight = parseInt(font, 10);
        ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
        ctx.fillStyle = "#000000";
        ctx.fillText(prediction.class, x, y);
      });
    }

    async function bindCameraAndDetection() {
      const model = await cocoSsd.load();
      await setupCamera();
      videoRef.current.play();
      detectFrame(model);
    }

    bindCameraAndDetection();
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay></video>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default ObjectDetection;
