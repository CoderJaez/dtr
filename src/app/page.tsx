"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import jsQR from "jsqr";
import Header from "@/components/Header";
import Swal from "sweetalert2";

export default function FaceAndQrScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionInterval, setDetectionInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  //For GPS Coordinates
  const [coordinates, setCoordinates] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  });

  // User Image
  // const [caputuredImage, setCapturedImage] = useState<FormData | null>(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Geolocation is not supported by this browser.",
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `Error getting location: ${error.message}`,
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  };

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

  useEffect(() => {
    getLocation();
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
            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            if (detections.length == 1) {
              const code = jsQR(
                imageData.data,
                imageData.width,
                imageData.height
              );

              if (code) {
                setQrData(code.data);
                clearInterval(interval);

                // const imageUrl = canvasRef.current.toDataURL("image/png");
                // const blob = await (await fetch(imageUrl)).blob();
                // const formData = new FormData();
                // formData.append("image", blob, "captured-image.png");
                // setCapturedImage(formData);

                // console.log(blob);

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

  // const onSubmit = async () => {
  //   if (qrData) {
  //   }
  //   const data = {
  //     qrData,
  //     coordinates,
  //   };
  // };

  return (
    <>
      <Header />
      <div className="scanner-container">
        <h1>Face Detection & QR Code Scanner</h1>

        <div className="relative w-full max-w-md mx-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-30 ${scanning ? "block" : "hidden"}`}
          />
          <canvas
            ref={canvasRef}
            className={`absolute top-0 left-0 w-full h-30 ${
              scanning ? "block" : "hidden"
            }`}
          />
        </div>

        {scanning && (
          <div>
            <button
              className="m-2 px-8 py-2 rounded bg-blue-500 text-white cursor-pointer"
              onClick={() => {
                if (detectionInterval) clearInterval(detectionInterval);
                if (videoRef.current && videoRef.current.srcObject) {
                  (videoRef.current.srcObject as MediaStream)
                    ?.getTracks()
                    .forEach((track) => track.stop());
                }
                setScanning(false);
                setQrData(null);
                startDetection();
              }}
            >
              Restart Camera
            </button>
          </div>
        )}

        {qrData && (
          <div className="">
            {/* <button
              onClick={() => {
                setQrData(null);
                startDetection();
              }}
            >
              Scan Again
            </button> */}
            <button className="m-8 px-8 py-2 rounded bg-blue-500 text-white cursor-pointer">
              Time In
            </button>
            <button className="m-8 px-8 py-2 rounded bg-red-500 text-white cursor-pointer">
              Time Out
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
        `}</style>
      </div>
    </>
  );
}
