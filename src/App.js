import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [devices,setdevices] = useState('')

  useEffect(()=>{
    navigator.mediaDevices.enumerateDevices().then((xx)=>{
      setdevices(xx)
      gotDevices(xx)
      console.log(xx);
    }).catch((error) =>{

      console.error(error)
    }
    );

  },[])

  function getSupportedMimeTypes() {
  const possibleTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/mp4;codecs=h264,aac',
  ];
  return possibleTypes.filter(mimeType => {
    return MediaRecorder.isTypeSupported(mimeType);
  });
}

  function handleSuccess(stream) {
    console.log('getUserMedia() got stream:', stream);
    window.stream = stream;

    const gumVideo = document.querySelector('video#gum');
    gumVideo.srcObject = stream;

    getSupportedMimeTypes().forEach(mimeType => {
      const option = document.createElement('option');
      option.value = mimeType;
      option.innerText = option.value;
    });
  }

  async function init(constraints) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
  }
}
let mediaRecorder;
let recordedBlobs;

function handleDataAvailable(event) {
  console.log('handleDataAvailable', event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function startRecording() {
  recordedBlobs = [];

  try {
    mediaRecorder = new MediaRecorder(window.stream);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    return;
  }

  console.log('Created MediaRecorder', mediaRecorder);
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  console.log('MediaRecorder started', mediaRecorder);
}

async function startRecord(){
    startRecording();
 
}

async function play(){
  let recordedVideo = document.querySelector('video#recorded');
  const superBuffer = new Blob(recordedBlobs);
  console.log('recordedVideo',recordedVideo)
  recordedVideo.src = null;
  recordedVideo.srcObject = null;
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.controls = true;
  recordedVideo.play();
 
}

  async function  startCamera(){
 const constraints = {
    audio: {
      echoCancellation: true
    },
    video: {
      width: 640, height: 420
    }
  };
  await init(constraints);
  }

  function stopRecording() {
  mediaRecorder.stop();
}

function gotDevices(deviceInfos) {
  const videoSelect = document.querySelector('select#videoSource');
  const selectors = [ videoSelect];
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    
    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      console.log('videoSelect',videoSelect);
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}
  return (
    <>
     <video id="gum" playsInline autoPlay muted></video>
    <video id="recorded" playsInline loop></video>

    <div>
        <button onClick={startCamera} id="start">Start camera</button>
        <button id="record" onClick={startRecord} >Start Recording</button>
        <button id="record" onClick={stopRecording} >stop Recording</button>
        <button id="play" onClick={play} >Play</button>
        <button id="download" disabled>Download</button>
         <div className="select">
        <label htmlFor="videoSource">Video source: </label><select id="videoSource"></select>
    </div>
    </div>
    </>

  );
}

export default App;
