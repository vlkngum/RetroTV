const style = document.createElement("style");
style.innerHTML = `
    .retro-tv-container {
        display: none; /* Varsaylan kapal */
    }
    .retro-tv-overlay {
        position: fixed; pointer-events: none; z-index: 9999998;
        background-size: 100% 3px, 3px 100%;
        opacity: 0.9;
        /* Video kalitesini bozan filtre JS üzerinden dinamik eklenecek */
    }
    .retro-tv-logo {
        position: fixed; z-index: 9999999; pointer-events: none; opacity: 0.85; filter: blur(0.5px);
        padding: 15px;
    }
    .retro-tv-ilkkez {
        position: fixed; color: #fff;
        font-family: 'Courier New', Arial, sans-serif; font-size: 28px; font-weight: bold;
        z-index: 9999999; pointer-events: none; 
        text-shadow: 2px 2px 0 #000, -1px -1px 3px rgba(255,255,255,0.7);
        filter: blur(1px); opacity: 0.9;
        padding: 15px;
    }
    .retro-tv-canvas {
        position: fixed; pointer-events: none; z-index: 9999997;
        image-rendering: pixelated; 
        image-rendering: crisp-edges;
        opacity: 0; transition: opacity 0.2s;
    }
    .retro-tv-bottom-text {
        position: fixed; color: #fff;
        font-family: 'Courier New', Courier, monospace; 
        font-size: 36px; font-weight: bold;
        z-index: 9999999; pointer-events: none;
        text-shadow: 3px 3px 5px rgba(0,0,0,0.95), -1px -1px 3px rgba(255,255,255,0.8);
        opacity: 0.85; filter: blur(0.8px); text-transform: uppercase;
        padding: 15px;
    }
    .retro-tv-ad {
        position: fixed; z-index: 9999999; pointer-events: none;
        background: rgba(240, 240, 245, 0.98); color: #111;
        font-family: 'Courier New', monospace; font-weight: bold;
        text-shadow: 1px 1px 0 rgba(255,255,255,0.8);
        box-sizing: border-box;
        opacity: 0; transition: opacity 0.5s;
        text-align: center;
        overflow: hidden;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.6);
    }
    .retro-tv-ad.horizontal {
        display: flex; align-items: center; justify-content: center;
        font-size: 32px;
        white-space: nowrap;
        background: rgba(20, 30, 80, 0.95);
        color: #fff;
        text-shadow: 2px 2px 0 #000;
        border-radius: 0;
    }
    .retro-tv-ad.vertical {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        font-size: 24px;
        white-space: normal;
        line-height: 1.25;
        padding: 20px 10px;
    }
    .retro-tv-ad.vertical img {
        margin: 20px 0 !important;
        border-width: 2px !important;
        border-style: solid;
        border-color: #333 !important;
        border-radius: 6px;
        max-width: 85%;
        box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
    }
    @keyframes retro-blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0.2; }
    }
    .retro-blink {
        animation: retro-blink 1s ease-in-out infinite;
        color: #d32f2f;
    }
    .horizontal .retro-blink {
        color: #ffeb3b;
    }
`;
document.head.appendChild(style);
const svgContainer = document.createElement("div");
svgContainer.innerHTML = `
<svg style="width:0;height:0;position:absolute;visibility:hidden;">
  <filter id="retro-rgb-shift" color-interpolation-filters="sRGB">
    <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"/>
    <feOffset id="retro-rgb-shift-red" dx="0" dy="0" in="red" result="red-shift"/>
    <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cyan"/>
    <feOffset id="retro-rgb-shift-cyan" dx="0" dy="0" in="cyan" result="cyan-shift"/>
    <feBlend mode="screen" in="red-shift" in2="cyan-shift"/>
  </filter>
</svg>
`;
document.body.appendChild(svgContainer);
const rgbFilterRed = document.getElementById("retro-rgb-shift-red");
const rgbFilterCyan = document.getElementById("retro-rgb-shift-cyan");
const tvContainer = document.createElement("div");
tvContainer.className = "retro-tv-container";
document.body.appendChild(tvContainer);
const tvPillarLeft = document.createElement("div");
tvPillarLeft.style.cssText =
  "position:fixed; background:#000; z-index:9999998; pointer-events:none; display:none;";
tvContainer.appendChild(tvPillarLeft);
const tvPillarRight = document.createElement("div");
tvPillarRight.style.cssText =
  "position:fixed; background:#000; z-index:9999998; pointer-events:none; display:none;";
tvContainer.appendChild(tvPillarRight);
const retroCanvas = document.createElement("canvas");
retroCanvas.className = "retro-tv-canvas";
tvContainer.appendChild(retroCanvas);
const retroCtx = retroCanvas.getContext("2d");
const tvOverlay = document.createElement("div");
tvOverlay.className = "retro-tv-overlay";
tvContainer.appendChild(tvOverlay);
const ilkKezLogo = document.createElement("div");
ilkKezLogo.className = "retro-tv-ilkkez";
ilkKezLogo.innerHTML = "TV'DE İLK KEZ";
tvContainer.appendChild(ilkKezLogo);
const channelLogoElement = document.createElement("div");
channelLogoElement.className = "retro-tv-logo";
tvContainer.appendChild(channelLogoElement);
const bottomTextElement = document.createElement("div");
bottomTextElement.className = "retro-tv-bottom-text";
tvContainer.appendChild(bottomTextElement);
const retroAds = [
  {
    text: ">> POLİFONİK ZİL SESİ << <span class='retro-blink'>'DELİ' yaz 3333'e gönder!</span>",
    type: "horizontal",
    bg: "rgba(20, 30, 80, 0.95)",
    color: "#FFF",
  },
  {
    text: "*** AŞK ÖLÇER *** Sevgilinin ismini ve kendi ismini aralarında boşluk bırakarak <span class='retro-blink'>5555'e GÖNDER!</span>",
    type: "horizontal",
    bg: "rgba(100, 10, 10, 0.95)",
    color: "#FFF",
  },
  {
    text: "🌟 GÜNLÜK BURCUN CEBİNDE 🌟 'KOC' yaz 1999'a yolla, <span class='retro-blink'>YILDIZLARIN SANA NE SÖYLEDİĞİNİ ÖĞREN!</span>",
    type: "horizontal",
    bg: "rgba(60, 10, 90, 0.95)",
    color: "#FFD700",
  },
  {
    text: "🎮 JAVA OYUNLARI 🎮 Efsanevi 'YILAN 3D' artık cebinde! 'YILAN' yaz 2222'ye gönder, <span class='retro-blink'>ANINDA TELEFONUNA GELSİN!</span>",
    type: "horizontal",
    bg: "rgba(0, 100, 0, 0.95)",
    color: "#00FF00",
  },
  {
    text: "🌙 RÜYA TABİRLERİ 🌙 Gördüğün rüyayı kısaca yaz 8888'e yolla, medyumlarımız <span class='retro-blink'>ANINDA YORUMLASIN!</span>",
    type: "horizontal",
    bg: "rgba(0, 40, 100, 0.95)",
    color: "#FFF",
  },
  {
    text: ">>> BEDAVA KONTÖR <<< 'KAZAN' yazıp 7777'ye SMS gönderen her 100. kişiye <span class='retro-blink'>TAM 250 KONTÖR HEDİYE!</span>",
    type: "horizontal",
    bg: "rgba(255, 140, 0, 0.95)",
    color: "#111",
  },
  {
    text: "<span class='retro-blink'>YAKINDA...</span><img src='https://commons.wikimedia.org/wiki/Special:FilePath/CRT_television.jpg?width=400'>YENİ<br>DİZİ<br><br>'ACI<br>HAYAT'",
    type: "vertical",
    bg: "rgba(240, 240, 245, 0.95)",
    color: "#111",
  },
  {
    text: ">>> SOHBET <<< Yalnızlıktan<br>sıkıldın mı?<img src='https://commons.wikimedia.org/wiki/Special:FilePath/Nokia_1110_DG_01.jpg?width=400'>Yaz 4444'e<br>yolla,<br><span class='retro-blink'>arkadaş bul!</span>",
    type: "vertical",
    bg: "rgba(10, 80, 20, 0.95)",
    color: "#FFF",
  },
  {
    text: "<span class='retro-blink'>RENKLİ<br>LOGO!</span><img src='https://commons.wikimedia.org/wiki/Special:FilePath/Nokia_5310_front.jpg?width=400'>Takımının<br>logosu<br>ekranında!<br><br>'CIMBOM'<br>yaz 1905'e yolla!",
    type: "vertical",
    bg: "rgba(250, 210, 0, 0.95)",
    color: "#800000",
  },
  {
    text: "<span class='retro-blink'>31 KUPON<br>BİRİKTİR!</span><img src='https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/C._1990_Renault_5_Campus_Prima_%2811932402805%29.jpg/960px-C._1990_Renault_5_Campus_Prima_%2811932402805%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20150314055454'>HAYALİNDEKİ<br>ARABAYI<br>KAZAN!",
    type: "vertical",
    bg: "rgba(240, 245, 250, 0.95)",
    color: "#112",
  },
  {
    text: "<span class='retro-blink'>3 KAPAK<br>GETİRENE!</span><img src='https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Toshiba_washing_machine_2024-12-22.jpg/960px-Toshiba_washing_machine_2024-12-22.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail'>MAKİNE<br>ANINDA<br>SENİN<br>OLSUN!",
    type: "vertical",
    bg: "rgba(245, 240, 230, 0.95)",
    color: "#211",
  },
  {
    text: "ŞOK<br>FIRSAT<img src='https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Nokia_3310_phone.jpg/960px-Nokia_3310_phone.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail'><span class='retro-blink'>0900 900<br>HEMEN<br>ARAYIN</span>",
    type: "vertical",
    bg: "rgba(230, 245, 230, 0.95)",
    color: "#121",
  },
];
const adContainer = document.createElement("div");
adContainer.className = "retro-tv-ad";
adContainer.style.display = "none";
tvContainer.appendChild(adContainer);
const channelHTML = {
  none: "",
  kanald:
    '<img src="https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.kanald.com.tr&size=48" style="width:120px; height:auto; opacity:0.9; filter: grayscale(30%) sepia(30%) contrast(110%); border-radius: 4px; image-rendering: pixelated;" alt="Kanal D">',
  showtv:
    '<img src="https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.showtv.com.tr&size=48" style="width:120px; height:auto; opacity:0.9; filter: grayscale(30%) sepia(30%) contrast(110%); border-radius: 4px; image-rendering: pixelated;" alt="Show TV">',
  star: '<img src="https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.startv.com.tr&size=48" style="width:120px; height:auto; opacity:0.9; filter: grayscale(30%) sepia(30%) contrast(110%); border-radius: 4px; image-rendering: pixelated;" alt="Star TV">',
  atv: '<img src="https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.atv.com.tr&size=48" style="width:120px; height:auto; opacity:0.9; filter: grayscale(30%) sepia(30%) contrast(110%); border-radius: 4px; image-rendering: pixelated;" alt="ATV">',
};
let currentFilters = {
  hue: 0,
  grayscale: 0,
  blur: 2.5,
  sepia: 60,
  contrast: 180,
  brightness: 75,
  saturate: 110,
  scanline: 35,
  vignette: 120,
  resolution: 240,
  rgbShift: 0,
  vhsAudio: false,
  aspect43: false,
  retroAds: true,
};
let isLowResOn = false;
function applySettings(state) {
  if (!state) return;
  tvContainer.style.display = state.tvOn ? "block" : "none";
  channelLogoElement.innerHTML = channelHTML[state.channelLogo] || "";
  ilkKezLogo.style.display = state.ilkKezOn ? "block" : "none";
  bottomTextElement.innerText = state.bottomText || "";
  isLowResOn = state.lowResOn;
  // Görüntü ayarlarn güncelle
  if (state.fHue !== undefined) currentFilters.hue = state.fHue;
  if (state.fGrayscale !== undefined)
    currentFilters.grayscale = state.fGrayscale;
  if (state.fBlur !== undefined) currentFilters.blur = state.fBlur;
  if (state.fSepia !== undefined) currentFilters.sepia = state.fSepia;
  if (state.fContrast !== undefined) currentFilters.contrast = state.fContrast;
  if (state.fBrightness !== undefined)
    currentFilters.brightness = state.fBrightness;
  if (state.fSaturate !== undefined) currentFilters.saturate = state.fSaturate;
  if (state.fScanline !== undefined) currentFilters.scanline = state.fScanline;
  if (state.fVignette !== undefined) currentFilters.vignette = state.fVignette;
  if (state.fResolution !== undefined)
    currentFilters.resolution = state.fResolution;
  if (state.fRgbShift !== undefined) currentFilters.rgbShift = state.fRgbShift;
  if (state.vhsAudioOn !== undefined)
    currentFilters.vhsAudio = state.vhsAudioOn;
  if (state.aspect43On !== undefined)
    currentFilters.aspect43 = state.aspect43On;
  if (state.retroAdsOn !== undefined)
    currentFilters.retroAds = state.retroAdsOn;
  // Filtreleri CSS'e dinamik olarak yedir
  let backdropStr =
    "hue-rotate(" +
    currentFilters.hue +
    "deg) grayscale(" +
    currentFilters.grayscale +
    "%) blur(" +
    currentFilters.blur +
    "px) sepia(" +
    currentFilters.sepia +
    "%) contrast(" +
    currentFilters.contrast +
    "%) brightness(" +
    currentFilters.brightness +
    "%) saturate(" +
    currentFilters.saturate +
    "%)";
  if (currentFilters.rgbShift > 0 && rgbFilterRed && rgbFilterCyan) {
    backdropStr += " url(#retro-rgb-shift)";
    rgbFilterRed.setAttribute("dx", currentFilters.rgbShift);
    rgbFilterCyan.setAttribute("dx", -currentFilters.rgbShift);
  }
  tvOverlay.style.backdropFilter = backdropStr;
  const scanlineOpacity = currentFilters.scanline / 100;
  tvOverlay.style.backgroundImage =
    "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, " +
    scanlineOpacity +
    ") 50%), linear-gradient(90deg, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0.08), rgba(255, 255, 255, 0.04))";
  tvOverlay.style.borderRadius = "0";
  retroCanvas.style.borderRadius = "0";
  tvOverlay.style.boxShadow =
    "inset 0 0 " + currentFilters.vignette + "px rgba(0,0,0,0.95)";
  updateTVLayout();
  if (typeof updateAudioState === "function") updateAudioState(state);
  if (typeof handleAdEngine === "function") handleAdEngine(state);
  const videoElem = document.querySelector("video");
  if (videoElem && typeof applyVideoAudioDegradation === "function") {
    applyVideoAudioDegradation(videoElem, state);
  }
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateTV") {
    applySettings(request.state);
  } else if (request.action === "triggerRandomAd") {
    if (
      tvContainer.style.visibility !== "hidden" &&
      typeof showRandomAd === "function"
    ) {
      showRandomAd(true);
    }
  }
});
chrome.storage.local.get(
  [
    "tvOn",
    "channelLogo",
    "ilkKezOn",
    "lowResOn",
    "vhsAudioOn",
    "aspect43On",
    "bottomText",
    "fHue",
    "fGrayscale",
    "fBlur",
    "fSepia",
    "fContrast",
    "fBrightness",
    "fSaturate",
    "fScanline",
    "fVignette",
    "fResolution",
    "fRgbShift",
  ],
  (data) => {
    applySettings({
      tvOn: data.tvOn || false,
      channelLogo: data.channelLogo || "none",
      ilkKezOn: data.ilkKezOn !== undefined ? data.ilkKezOn : true,
      lowResOn: data.lowResOn !== undefined ? data.lowResOn : true,
      vhsAudioOn: data.vhsAudioOn || false,
      aspect43On: data.aspect43On || false,
      retroAdsOn: data.retroAdsOn !== undefined ? data.retroAdsOn : true,
      bottomText: data.bottomText || "",
      fHue: data.fHue || 0,
      fGrayscale: data.fGrayscale || 0,
      fBlur: data.fBlur !== undefined ? data.fBlur : 2.5,
      fSepia: data.fSepia !== undefined ? data.fSepia : 60,
      fContrast: data.fContrast || 180,
      fBrightness: data.fBrightness || 75,
      fSaturate: data.fSaturate || 110,
      fScanline: data.fScanline !== undefined ? data.fScanline : 35,
      fVignette: data.fVignette !== undefined ? data.fVignette : 120,
      fResolution: data.fResolution !== undefined ? data.fResolution : 240,
      fRgbShift: data.fRgbShift || 0,
    });
  },
);
// Tüm TV efektlerini videonun boyutlarna göre ayarla
function updateTVLayout() {
  if (tvContainer.style.display === "none") return;
  const video = document.querySelector("video");
  if (video) {
    const rect = video.getBoundingClientRect();
    let targetWidth = rect.width;
    let targetLeft = rect.left;
    let targetRight = rect.right;
    const isWide = rect.width / rect.height > 1.35;
    if (currentFilters.aspect43 && isWide) {
      targetWidth = rect.height * (4 / 3);
      targetLeft = rect.left + (rect.width - targetWidth) / 2;
      targetRight = targetLeft + targetWidth;
      tvPillarLeft.style.display = "block";
      tvPillarLeft.style.top = rect.top + "px";
      tvPillarLeft.style.left = rect.left + "px";
      tvPillarLeft.style.width = (rect.width - targetWidth) / 2 + "px";
      tvPillarLeft.style.height = rect.height + "px";
      tvPillarRight.style.display = "block";
      tvPillarRight.style.top = rect.top + "px";
      tvPillarRight.style.left = targetRight + "px";
      tvPillarRight.style.width = (rect.width - targetWidth) / 2 + "px";
      tvPillarRight.style.height = rect.height + "px";
    } else {
      tvPillarLeft.style.display = "none";
      tvPillarRight.style.display = "none";
    }
    tvOverlay.style.position = "fixed";
    tvOverlay.style.top = rect.top + "px";
    tvOverlay.style.left = targetLeft + "px";
    tvOverlay.style.width = targetWidth + "px";
    tvOverlay.style.height = rect.height + "px";
    retroCanvas.style.top = rect.top + "px";
    retroCanvas.style.left = targetLeft + "px";
    retroCanvas.style.width = targetWidth + "px";
    retroCanvas.style.height = rect.height + "px";
    channelLogoElement.style.top = rect.top + 30 + "px";
    channelLogoElement.style.left = targetLeft + 35 + "px";
    ilkKezLogo.style.top = rect.top + 30 + "px";
    ilkKezLogo.style.left = "auto";
    ilkKezLogo.style.right = window.innerWidth - targetRight + 35 + "px";
    tvContainer.style.visibility = "visible";
    bottomTextElement.style.bottom =
      window.innerHeight - rect.bottom + 35 + "px";
    bottomTextElement.style.left = "auto";
    bottomTextElement.style.right = window.innerWidth - targetRight + 35 + "px";
    if (adContainer.style.display === "block") {
      if (adContainer.dataset.type === "horizontal") {
        adContainer.style.width = targetWidth + "px";
        adContainer.style.height = "62px";
        adContainer.style.left = targetLeft + "px";
        adContainer.style.bottom = window.innerHeight - rect.bottom + 50 + "px";
        adContainer.style.top = "auto";
        adContainer.style.transform = "none";
        adContainer.style.borderTop = "4px solid " + adContainer.style.color;
        adContainer.style.borderBottom = "4px solid " + adContainer.style.color;
        adContainer.style.borderLeft = "none";
        adContainer.style.borderRight = "none";
      } else if (adContainer.dataset.type === "vertical") {
        adContainer.style.width = "180px";
        adContainer.style.height = "auto";
        adContainer.style.left = targetLeft + "px";
        adContainer.style.top = rect.top + rect.height / 2 + "px";
        adContainer.style.transform = "translateY(-50%)";
        adContainer.style.bottom = "auto";
        adContainer.style.borderRight = "4px solid " + adContainer.style.color;
        adContainer.style.borderTop = "none";
        adContainer.style.borderBottom = "none";
        adContainer.style.borderLeft = "none";
      }
    }
  } else {
    tvContainer.style.visibility = "hidden";
  }
}
window.addEventListener("resize", updateTVLayout);
window.addEventListener("scroll", updateTVLayout, true);
setInterval(updateTVLayout, 100);
let lastDrawTime = 0;
function renderCanvasFrame(now) {
  if (tvContainer.style.display !== "none" && isLowResOn) {
    if (now - lastDrawTime >= 1000 / 15) {
      lastDrawTime = now;
      const video = document.querySelector("video");
      if (video && video.readyState >= 2 && !video.paused && !video.ended) {
        const aspect = video.videoWidth / video.videoHeight || 16 / 9;
        const simHeight = parseInt(currentFilters.resolution);
        const simWidth = Math.floor(simHeight * aspect);
        if (
          retroCanvas.width !== simWidth ||
          retroCanvas.height !== simHeight
        ) {
          retroCanvas.width = simWidth;
          retroCanvas.height = simHeight;
        }
        try {
          retroCtx.drawImage(
            video,
            0,
            0,
            retroCanvas.width,
            retroCanvas.height,
          );
          retroCanvas.style.opacity = "1";
        } catch (e) {
          retroCanvas.style.opacity = "0";
        }
      } else {
        retroCanvas.style.opacity = "0";
      }
    }
  } else {
    retroCanvas.style.opacity = "0";
  }
  requestAnimationFrame(renderCanvasFrame);
}
requestAnimationFrame(renderCanvasFrame);
let audioCtx = null;
let noiseNode = null;
let noiseGain = null;
let staticFilter = null;
function initAudioContext() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(
      1,
      bufferSize,
      audioCtx.sampleRate,
    );
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    staticFilter = audioCtx.createBiquadFilter();
    staticFilter.type = "lowpass";
    staticFilter.frequency.value = 3500;
    noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0;
    noiseNode.connect(staticFilter);
    staticFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noiseNode.start();
  } catch (e) {
    console.error("Audio Context başlatılamadı:", e);
  }
}
function updateAudioState(state) {
  if (!state.tvOn || !state.vhsAudioOn) {
    if (noiseGain && audioCtx)
      noiseGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
  } else {
    if (!audioCtx) initAudioContext();
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    if (noiseGain && audioCtx)
      noiseGain.gain.setTargetAtTime(0.001, audioCtx.currentTime, 0.5);
  }
}
let videoAudioCtx = null;
let videoSourceNode = null;
let videoLowpassFilter = null;
let videoHighpassFilter = null;
let isVideoHooked = false;
function applyVideoAudioDegradation(video, state) {
  if (!video) return;
  try {
    if (!videoAudioCtx) {
      videoAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (videoAudioCtx.state === "suspended") {
      videoAudioCtx.resume();
    }
    if (!isVideoHooked) {
      videoSourceNode = videoAudioCtx.createMediaElementSource(video);
      videoLowpassFilter = videoAudioCtx.createBiquadFilter();
      videoLowpassFilter.type = "lowpass";
      videoLowpassFilter.frequency.value = 20000;
      videoHighpassFilter = videoAudioCtx.createBiquadFilter();
      videoHighpassFilter.type = "highpass";
      videoHighpassFilter.frequency.value = 0;
      videoSourceNode.connect(videoLowpassFilter);
      videoLowpassFilter.connect(videoHighpassFilter);
      videoHighpassFilter.connect(videoAudioCtx.destination);
      isVideoHooked = true;
    }
    if (state.tvOn && state.vhsAudioOn) {
      videoLowpassFilter.frequency.setTargetAtTime(
        1000,
        videoAudioCtx.currentTime,
        0.5,
      );
      videoHighpassFilter.frequency.setTargetAtTime(
        300,
        videoAudioCtx.currentTime,
        0.5,
      );
    } else {
      videoLowpassFilter.frequency.setTargetAtTime(
        20000,
        videoAudioCtx.currentTime,
        0.5,
      );
      videoHighpassFilter.frequency.setTargetAtTime(
        0,
        videoAudioCtx.currentTime,
        0.5,
      );
    }
  } catch (e) {
    console.warn("Retro TV: Orijinal video sesine müdahale başarısız oldu:", e);
  }
}
let adInterval = null;
let currentAdTimeout = null;
let lastAdBlockId = -1;
function showRandomAd(isManual = false) {
  if (adContainer.style.display === "block") return;
  let adIndex;
  if (isManual) {
    adIndex = Math.floor(Math.random() * retroAds.length);
  } else {
    const now = new Date();
    const minuteSlot = Math.floor(now.getMinutes() / 5);
    adIndex = minuteSlot % retroAds.length;
  }
  const ad = retroAds[adIndex];
  adContainer.style.backgroundColor = ad.bg;
  adContainer.style.color = ad.color;
  if (ad.type === "horizontal") {
    adContainer.innerHTML =
      '<marquee scrollamount="15" style="width:100%; letter-spacing: 2px;">' +
      ad.text +
      "</marquee>";
    adContainer.className = "retro-tv-ad horizontal";
  } else {
    adContainer.innerHTML = ad.text;
    adContainer.className = "retro-tv-ad vertical";
  }
  adContainer.dataset.type = ad.type;
  adContainer.style.display = "block";
  setTimeout(() => {
    adContainer.style.opacity = "1";
  }, 50);
  currentAdTimeout = setTimeout(() => {
    adContainer.style.opacity = "0";
    setTimeout(() => {
      adContainer.style.display = "none";
    }, 500);
  }, 12000);
}
function handleAdEngine(state) {
  if (state.tvOn && state.retroAdsOn) {
    if (!adInterval) {
      adInterval = setInterval(() => {
        const now = new Date();
        const currentBlockId =
          now.getHours() * 12 + Math.floor(now.getMinutes() / 5);
        if (currentBlockId !== lastAdBlockId) {
          lastAdBlockId = currentBlockId;
          if (tvContainer.style.visibility !== "hidden") {
            showRandomAd();
          }
        }
      }, 1000);
    }
  } else {
    if (adInterval) {
      clearInterval(adInterval);
      adInterval = null;
    }
    adContainer.style.opacity = "0";
    adContainer.style.display = "none";
    if (currentAdTimeout) clearTimeout(currentAdTimeout);
    lastAdBlockId = -1;
  }
}
