"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
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
        // faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      setModelsLoaded(true);
    };

    loadModels();

    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, []);

  useEffect(() => {
    startDetection();
  }, [modelsLoaded]);

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
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          );

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
          console.log("detections", detections);
          if (detections.length == 1) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx && videoRef.current) {
              ctx.drawImage(
                videoRef.current,
                0,
                0,
                displaySize.width,
                displaySize.height
              );
              const imageData = ctx.getImageData(
                0,
                0,
                displaySize.width,
                displaySize.height
              );
              const code = jsQR(
                imageData.data,
                imageData.width,
                imageData.height
              );

              if (code) {
                setQrData(code.data);
                clearInterval(interval);
                if (videoRef.current && videoRef.current.srcObject) {
                  (videoRef.current.srcObject as MediaStream)
                    ?.getTracks()
                    .forEach((track) => track.stop());
                }
              }
            }
          }
        }
      }, 100);

      setDetectionInterval(interval);
      setScanning(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  return (
    <div className="scanner-container">
      <h1>Face Detection & QR Code Scanner</h1>

      <div className="relative w-full max-w-md mx-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-auto ${scanning ? "block" : "hidden"}`}
        />
        <canvas
          ref={canvasRef}
          className={`absolute top-0 left-0 w-full h-auto ${
            scanning ? "block" : "hidden"
          }`}
        />
      </div>

      {!scanning && !qrData && (
        <button onClick={startDetection}>Start Camera</button>
      )}

      {scanning && (
        <div>
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
          <p className="text-2xl text-red-500">{qrData}</p>
          <button
            onClick={() => {
              setQrData(null);
              startDetection();
            }}
          >
            Scan Again
          </button>
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
