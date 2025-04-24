"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function CamScreen() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const enableVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setMediaStream(stream);
      } catch (error) {
        console.error("Error accessing webcam", error);
      }
    };

    enableVideoStream();
  }, []);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [videoRef, mediaStream]);

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [mediaStream]);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay={true}
        muted
        playsInline
        style={{ width: "100%", border: "2px solid red" }}
      />
    </div>
  );
}
function CameraComponent() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      video.addEventListener("loadeddata", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        setImageSrc(canvas.toDataURL("image/png"));
        stream.getTracks().forEach((track) => track.stop());
      });
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleCapture}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Capture Image
      </button>
      {imageSrc && (
        <div>
          <Image
            src={imageSrc}
            alt="Captured"
            width={300}
            height={300}
            className="rounded"
          />
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <CamScreen />
        <CameraComponent />
      </main>
    </div>
  );
}
