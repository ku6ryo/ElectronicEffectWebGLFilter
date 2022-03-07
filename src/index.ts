import Stats from "stats.js"
import { Effector } from "./Effector/Effector"
import { SupportedModels, createDetector } from "@tensorflow-models/hand-pose-detection"
const { MediaPipeHands } = SupportedModels

const stats = new Stats()
document.body.appendChild(stats.dom)

main()

async function main() {
  const detector = await createDetector(MediaPipeHands, {
    runtime: "mediapipe",
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1635986972/",
  })

  const effector = new Effector()
  await effector.prepare()

  const mainCanvas = document.createElement("canvas")
  const mainContext = mainCanvas.getContext("2d")!
  mainCanvas.style.height = "100vh"
  mainCanvas.style.width = "100vw"
  document.querySelector(".container")!.appendChild(mainCanvas)

  const cameraVideo = document.createElement("video");
  cameraVideo.addEventListener("playing", () => {
    const vw = cameraVideo.videoWidth
    const vh = cameraVideo.videoHeight
    mainCanvas.width = vw
    mainCanvas.height = vh
    mainCanvas.style.maxHeight = `calc(100vw * ${vh / vw})`
    mainCanvas.style.maxWidth = `calc(100vh * ${vw / vh})`
    cameraCanvas.width = vw
    cameraCanvas.height = vh
    maskCanvas.width = vw
    maskCanvas.height = vh
    prevMaskCanvas.width = vw
    prevMaskCanvas.height = vh
    effector.setSize(vw, vh)
    requestAnimationFrame(process)
  })
  const cameraCanvas = document.createElement("canvas")
  const cameraContext = cameraCanvas.getContext("2d")!

  const maskCanvas = document.createElement("canvas")
  const maskContext = maskCanvas.getContext("2d")!
  document.body.appendChild(maskCanvas)

  const prevMaskCanvas = document.createElement("canvas")
  const prevMaskContext = prevMaskCanvas.getContext("2d")!
  document.body.appendChild(prevMaskCanvas)

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: {
          ideal: 1280,
        },
        height: {
          ideal: 720,
        }
      },
    })
    .then(function (stream) {
      cameraVideo.srcObject = stream;
      cameraVideo.play();
      requestAnimationFrame(process)
    })
    .catch(function (e) {
      console.log(e)
      console.log("Something went wrong!");
    });
  } else {
    alert("getUserMedia not supported on your browser!");
  }

  let point: { x: number, y: number } | null = null
  let frames = 0
  async function process () {
    stats.begin()
    cameraContext.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height)
    cameraContext.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height)

    maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
    maskContext.globalAlpha = 0.90
    // maskContext.drawImage(prevMaskCanvas, 0, 0, maskCanvas.width, maskCanvas.height)
    maskContext.globalAlpha = 0.6

    let detected = false
    const hands = await detector.estimateHands(cameraCanvas)
    /*
    if (hands.length > 0) {
      const hand = hands[0]
      const keypoints = hand.keypoints
      const indexFinger = keypoints[8]
      const { x, y } = indexFinger
      if (point) {
        const dx = Math.abs(x - point?.x)
        const dy = Math.abs(x - point?.x)
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d > 10) {
          maskContext.filter = 'blur(1px)';
          maskContext.strokeStyle = 'blue';
          maskContext.lineWidth = 12;
          maskContext.beginPath();
          maskContext.moveTo(point.x, point.y);
          maskContext.lineTo(x, y);
          maskContext.closePath()
          maskContext.stroke()
          console.log(point)
          point = { x, y }
          detected = true
        } else {
          detected = false
        }
      } else {
        point = { x, y }
      }
    } else {
      detected = false
    }

    */
    if (hands.length > 1) {
      const hand1 = hands[0]
      const indexFinger1 = hand1.keypoints[8]
      const { x: x1, y: y1 } = indexFinger1
      const hand2 = hands[1]
      const indexFinger2 = hand2.keypoints[8]
      const { x: x2, y: y2 } = indexFinger2
      maskContext.filter = 'blur(1px)';
      maskContext.strokeStyle = 'blue';
      maskContext.lineWidth = 12;
      maskContext.beginPath();
      maskContext.moveTo(x1, y1);
      maskContext.lineTo(x2, y2);
      maskContext.closePath()
      maskContext.stroke()
      detected = true
    }

    prevMaskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
    prevMaskContext.globalAlpha = 1
    prevMaskContext.drawImage(maskCanvas, 0, 0, prevMaskCanvas.width, prevMaskCanvas.height)

    effector.process(cameraCanvas, maskCanvas, detected && (frames % 4 === 0))
    mainContext.drawImage(effector.getCanvas(), 0, 0, mainCanvas.width, mainCanvas.height)

    frames += 1

    stats.end()
    requestAnimationFrame(process)
  }
}