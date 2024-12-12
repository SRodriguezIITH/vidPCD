import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import './WebcamCapture.css';

const WebcamCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start capturing frames when the component mounts
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'environment', // Try using rear camera on mobile devices
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing the webcam:', error);
        alert('Please allow camera access');
      }
    };

    startWebcam();
  }, []);

  const captureFrame = async () => {
    if (!canvasRef.current) return;

    // Draw the current frame from the video onto the canvas
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a base64-encoded image
    const frameData = canvas.toDataURL('image/jpeg');

    // Send the base64 image to the Flask backend for processing
    try {
      await axios.post('http://127.0.0.1:5000/process_frame', { image: frameData });
      console.log('Frame sent to server');
    } catch (error) {
      console.error('Error sending frame to server:', error);
    }
  };

  // Start capturing frames every 200ms (real-time capturing, 5 fps)
  useEffect(() => {
    let frameInterval;
    if (isCapturing) {
      frameInterval = setInterval(() => {
        captureFrame();
      }, 200); // Adjust the interval to capture at 5 fps
    } else {
      clearInterval(frameInterval);
    }

    return () => clearInterval(frameInterval);  // Clean up interval on unmount
  }, [isCapturing]);

  return (
    <div className="webcam-container">
      <h1>VidPCD</h1>
      <div className="video-container">
        <video ref={videoRef} width="100%" height="auto" autoPlay className="video-feed" />
      </div>
      <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
      <div className="controls">
        <button
          onClick={() => setIsCapturing(!isCapturing)}
          className="capture-button"
        >
          {isCapturing ? 'Stop Capturing' : 'Start Capturing'}
        </button>
      </div>
    </div>
  );
};

export default WebcamCapture;
