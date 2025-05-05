"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import QRCode from "qrcode.react";
import jsQR from "jsqr";

export default function FaceAndQrScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionInterval, setDetectionInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]);
      setModelsLoaded(true);
    };

    loadModels();

    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, []);

  // Start camera and detection
  const startDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Start face detection
      const interval = setInterval(async () => {
        if (videoRef.current && canvasRef.current && modelsLoaded) {
          const detections = await faceapi
            .detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceExpressions();

          // Resize canvas to match video
          const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          };
          faceapi.matchDimensions(canvasRef.current, displaySize);

          // Draw detections
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        }
      }, 100);

      setDetectionInterval(interval);
      setScanning(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // Scan for QR codes
  const scanQRCode = () => {
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setQrData(code.data);
          clearInterval(interval);
          setScanning(false);
        }
      }
    }, 500);
  };

  return (
    <div className="scanner-container">
      <h1>Face Detection & QR Code Scanner</h1>

      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ display: scanning ? "block" : "none" }}
        />
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      </div>

      {!scanning && !qrData && (
        <button onClick={startDetection}>Start Camera</button>
      )}

      {scanning && (
        <div>
          <button onClick={scanQRCode}>Scan QR Code</button>
          <button
            onClick={() => {
              if (detectionInterval) clearInterval(detectionInterval);
              if (videoRef.current && videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream)
                  ?.getTracks()
                  .forEach((track) => track.stop());
              }
              setScanning(false);
            }}
          >
            Stop
          </button>
        </div>
      )}

      {qrData && (
        <div className="qr-result">
          <h2>QR Code Detected:</h2>
          <p>{qrData}</p>
          <button onClick={() => setQrData(null)}>Scan Again</button>
        </div>
      )}

      <style jsx>{`
        .scanner-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
        }
        .video-container {
          position: relative;
          width: 640px;
          height: 480px;
          margin: 20px auto;
          border: 2px solid #333;
        }
        video,
        canvas {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        button {
          margin: 10px;
          padding: 10px 20px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .qr-result {
          margin-top: 20px;
          padding: 20px;
          background: #f0f0f0;
          border-radius: 5px;
        }
      `}</style>
    </div>
  );
}
