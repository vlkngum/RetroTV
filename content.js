// CSS Stillerini Ekleme
const style = document.createElement('style');
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
`;
document.head.appendChild(style);

// --- SVG RGB Kayması Filtresi (DOM'a ekleniyor) ---
const svgContainer = document.createElement('div');
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
const rgbFilterRed = document.getElementById('retro-rgb-shift-red');
const rgbFilterCyan = document.getElementById('retro-rgb-shift-cyan');

// Ana Tayc
const tvContainer = document.createElement('div');
tvContainer.className = 'retro-tv-container';
document.body.appendChild(tvContainer);

// 4:3 Ekran Pillarbox (Siyah Barlar)
const tvPillarLeft = document.createElement('div');
tvPillarLeft.style.cssText = "position:fixed; background:#000; z-index:9999998; pointer-events:none; display:none;";
tvContainer.appendChild(tvPillarLeft);

const tvPillarRight = document.createElement('div');
tvPillarRight.style.cssText = "position:fixed; background:#000; z-index:9999998; pointer-events:none; display:none;";
tvContainer.appendChild(tvPillarRight);

// 240p / 15FPS Simülasyonu için Canvas (Videonun hemen üstünde, efektlerin altnda)
const retroCanvas = document.createElement('canvas');
retroCanvas.className = 'retro-tv-canvas';
tvContainer.appendChild(retroCanvas);
const retroCtx = retroCanvas.getContext('2d');

// Efekt Katman
const tvOverlay = document.createElement('div');
tvOverlay.className = 'retro-tv-overlay';
tvContainer.appendChild(tvOverlay);

// Sa Üst 'TV'DE LK KEZ' Logosu
const ilkKezLogo = document.createElement('div');
ilkKezLogo.className = 'retro-tv-ilkkez';
ilkKezLogo.innerHTML = "TV'DE İLK KEZ";
tvContainer.appendChild(ilkKezLogo);

// Sol Üst Kanal Logosu
const channelLogoElement = document.createElement('div');
channelLogoElement.className = 'retro-tv-logo';
tvContainer.appendChild(channelLogoElement);

// Sa Alt Dinamik sim/Yaz
const bottomTextElement = document.createElement('div');
bottomTextElement.className = 'retro-tv-bottom-text';
tvContainer.appendChild(bottomTextElement);

// nternetten Google API ile sitelerin yüksek çözünürlüklü logolarn (faviconlarn) çeken yap
const channelHTML = {
    'none': '',
    'kanald': '<img src="https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.kanald.com.tr&size=48" style="width:120px; height:auto; opacity:0.9; filter: grayscale(30%) sepia(30%) contrast(110%); border-radius: 4px; image-rendering: pixelated;" alt="Kanal D">',
    'showtv': '<img src="https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.showtv.com.tr&size=48" style="width:120px; height:auto; opacity:0.9; filter: grayscale(30%) sepia(30%) contrast(110%); border-radius: 4px; image-rendering: pixelated;" alt="Show TV">',
    'star': '<img src="https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.startv.com.tr&size=48" style="width:120px; height:auto; opacity:0.9; filter: grayscale(30%) sepia(30%) contrast(110%); border-radius: 4px; image-rendering: pixelated;" alt="Star TV">',
    'atv': '<img src="https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.atv.com.tr&size=48" style="width:120px; height:auto; opacity:0.9; filter: grayscale(30%) sepia(30%) contrast(110%); border-radius: 4px; image-rendering: pixelated;" alt="ATV">'
};

// Varsaylan Filtre Ayarlar
let currentFilters = {
    hue: 0, grayscale: 0, blur: 2.5, sepia: 60,
    contrast: 180, brightness: 75, saturate: 110,
    scanline: 35, vignette: 120, resolution: 240,
    rgbShift: 0, vhsAudio: false, aspect43: false
};
let isLowResOn = false;

// Durumu Güncelleme Fonksiyonu
function applySettings(state) {
    if (!state) return;

    tvContainer.style.display = state.tvOn ? 'block' : 'none';
    channelLogoElement.innerHTML = channelHTML[state.channelLogo] || '';
    ilkKezLogo.style.display = state.ilkKezOn ? 'block' : 'none';
    bottomTextElement.innerText = state.bottomText || '';
    isLowResOn = state.lowResOn;

    // Görüntü ayarlarn güncelle
    if (state.fHue !== undefined) currentFilters.hue = state.fHue;
    if (state.fGrayscale !== undefined) currentFilters.grayscale = state.fGrayscale;
    if (state.fBlur !== undefined) currentFilters.blur = state.fBlur;
    if (state.fSepia !== undefined) currentFilters.sepia = state.fSepia;
    if (state.fContrast !== undefined) currentFilters.contrast = state.fContrast;
    if (state.fBrightness !== undefined) currentFilters.brightness = state.fBrightness;
    if (state.fSaturate !== undefined) currentFilters.saturate = state.fSaturate;
    if (state.fScanline !== undefined) currentFilters.scanline = state.fScanline;
    if (state.fVignette !== undefined) currentFilters.vignette = state.fVignette;
    if (state.fResolution !== undefined) currentFilters.resolution = state.fResolution;
    if (state.fRgbShift !== undefined) currentFilters.rgbShift = state.fRgbShift;
    if (state.vhsAudioOn !== undefined) currentFilters.vhsAudio = state.vhsAudioOn;
    if (state.aspect43On !== undefined) currentFilters.aspect43 = state.aspect43On;

    // Filtreleri CSS'e dinamik olarak yedir
    let backdropStr = "hue-rotate(" + currentFilters.hue + "deg) grayscale(" + currentFilters.grayscale + "%) blur(" + currentFilters.blur + "px) sepia(" + currentFilters.sepia + "%) contrast(" + currentFilters.contrast + "%) brightness(" + currentFilters.brightness + "%) saturate(" + currentFilters.saturate + "%)";

    if (currentFilters.rgbShift > 0 && rgbFilterRed && rgbFilterCyan) {
        backdropStr += ' url(#retro-rgb-shift)';
        rgbFilterRed.setAttribute('dx', currentFilters.rgbShift);
        rgbFilterCyan.setAttribute('dx', -currentFilters.rgbShift);
    }
    tvOverlay.style.backdropFilter = backdropStr;

    // Scanline & Vignette
    const scanlineOpacity = currentFilters.scanline / 100;
    tvOverlay.style.backgroundImage = "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, " + scanlineOpacity + ") 50%), linear-gradient(90deg, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0.08), rgba(255, 255, 255, 0.04))";

    tvOverlay.style.borderRadius = "0";
    retroCanvas.style.borderRadius = "0";
    tvOverlay.style.boxShadow = "inset 0 0 " + currentFilters.vignette + "px rgba(0,0,0,0.95)";

    updateTVLayout();
    if (typeof updateAudioState === 'function') updateAudioState(state);

    // Orijinal video sesini de boz/düzenle
    const videoElem = document.querySelector('video');
    if (videoElem && typeof applyVideoAudioDegradation === 'function') {
        applyVideoAudioDegradation(videoElem, state);
    }
}

// Mesaj Dinleyici (Popup'tan gelen emirler)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateTV') {
        applySettings(request.state);
    }
});

// Sayfa ilk açldnda kaytl ayarlar çek
chrome.storage.local.get([
    'tvOn', 'channelLogo', 'ilkKezOn', 'lowResOn', 'vhsAudioOn', 'aspect43On', 'bottomText',
    'fHue', 'fGrayscale', 'fBlur', 'fSepia', 'fContrast', 'fBrightness', 'fSaturate', 'fScanline', 'fVignette', 'fResolution', 'fRgbShift'
], (data) => {
    applySettings({
        tvOn: data.tvOn || false,
        channelLogo: data.channelLogo || 'none',
        ilkKezOn: (data.ilkKezOn !== undefined) ? data.ilkKezOn : true,
        lowResOn: (data.lowResOn !== undefined) ? data.lowResOn : true,
        vhsAudioOn: data.vhsAudioOn || false,
        aspect43On: data.aspect43On || false,
        bottomText: data.bottomText || '',
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
        fRgbShift: data.fRgbShift || 0
    });
});

// Tüm TV efektlerini videonun boyutlarna göre ayarla
function updateTVLayout() {
    if (tvContainer.style.display === 'none') return;

    const video = document.querySelector('video');
    if (video) {
        const rect = video.getBoundingClientRect();

        // 4:3 Aspect Ratio Hesaplama
        let targetWidth = rect.width;
        let targetLeft = rect.left;
        let targetRight = rect.right;

        // Eğer 4:3 seçili ve video geniş ekran formatındaysa (16:9 vs.)
        const isWide = (rect.width / rect.height) > 1.35;
        if (currentFilters.aspect43 && isWide) {
            targetWidth = rect.height * (4 / 3);
            targetLeft = rect.left + (rect.width - targetWidth) / 2;
            targetRight = targetLeft + targetWidth;

            tvPillarLeft.style.display = 'block';
            tvPillarLeft.style.top = rect.top + 'px';
            tvPillarLeft.style.left = rect.left + 'px';
            tvPillarLeft.style.width = (rect.width - targetWidth) / 2 + 'px';
            tvPillarLeft.style.height = rect.height + 'px';

            tvPillarRight.style.display = 'block';
            tvPillarRight.style.top = rect.top + 'px';
            tvPillarRight.style.left = targetRight + 'px';
            tvPillarRight.style.width = (rect.width - targetWidth) / 2 + 'px';
            tvPillarRight.style.height = rect.height + 'px';
        } else {
            tvPillarLeft.style.display = 'none';
            tvPillarRight.style.display = 'none';
        }

        // Overlay (Efektleri sadece videonun (veya sınırlandırılmış 4:3 alanın) üstüne sabitle)
        tvOverlay.style.position = 'fixed';
        tvOverlay.style.top = rect.top + 'px';
        tvOverlay.style.left = targetLeft + 'px';
        tvOverlay.style.width = targetWidth + 'px';
        tvOverlay.style.height = rect.height + 'px';

        // Canvas Boyutlandırma (Efektlerle tam aynı pozisyon)
        retroCanvas.style.top = rect.top + 'px';
        retroCanvas.style.left = targetLeft + 'px';
        retroCanvas.style.width = targetWidth + 'px';
        retroCanvas.style.height = rect.height + 'px';

        // Kanal Logosu (Görünen alanın sol üstü)
        channelLogoElement.style.top = (rect.top + 30) + 'px';
        channelLogoElement.style.left = (targetLeft + 35) + 'px';

        // İLK KEZ Logosu (Görünen alanın sağ üstü)
        ilkKezLogo.style.top = (rect.top + 30) + 'px';
        ilkKezLogo.style.left = 'auto';
        ilkKezLogo.style.right = (window.innerWidth - targetRight + 35) + 'px';

        // Video varsa tüm efektleri görünür yap
        tvContainer.style.visibility = 'visible';

        // Sağ Alt Özel Yazı
        bottomTextElement.style.bottom = (window.innerHeight - rect.bottom + 35) + 'px';
        bottomTextElement.style.left = 'auto';
        bottomTextElement.style.right = (window.innerWidth - targetRight + 35) + 'px';
    } else {
        // Sayfada video yoksa tüm efekti tamamen gizle (tüm ekran kaplamasn)
        tvContainer.style.visibility = 'hidden';
    }
}

window.addEventListener('resize', updateTVLayout);
window.addEventListener('scroll', updateTVLayout, true);
setInterval(updateTVLayout, 100);

// --- DÜÜK ÇÖZÜNÜRLÜK (240p) / DÜÜK FPS (15Hz) RENDERER ---
let lastDrawTime = 0;
function renderCanvasFrame(now) {
    if (tvContainer.style.display !== 'none' && isLowResOn) {
        if (now - lastDrawTime >= (1000 / 15)) { // Saniyede ortalama 15 kare
            lastDrawTime = now;
            const video = document.querySelector('video');
            if (video && video.readyState >= 2 && !video.paused && !video.ended) {
                // Özel pikselleme seviyesi ayar
                const aspect = video.videoWidth / video.videoHeight || 16 / 9;
                const simHeight = parseInt(currentFilters.resolution);
                const simWidth = Math.floor(simHeight * aspect);

                if (retroCanvas.width !== simWidth || retroCanvas.height !== simHeight) {
                    retroCanvas.width = simWidth;
                    retroCanvas.height = simHeight;
                }

                try {
                    retroCtx.drawImage(video, 0, 0, retroCanvas.width, retroCanvas.height);
                    retroCanvas.style.opacity = '1'; // Üst katmanda çizilmi hali göster
                } catch (e) {
                    retroCanvas.style.opacity = '0'; // DRM veya hata olursa effaflatr orijinal yanssn
                }
            } else {
                retroCanvas.style.opacity = '0'; // Video oynamyorsa mask kaldr
            }
        }
    } else {
        retroCanvas.style.opacity = '0';
    }
    requestAnimationFrame(renderCanvasFrame);
}
requestAnimationFrame(renderCanvasFrame);

// --- VHS Sesi (Web Audio API) ---
let audioCtx = null;
let noiseNode = null;
let noiseGain = null;
let staticFilter = null;

function initAudioContext() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        const bufferSize = audioCtx.sampleRate * 2;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1; // White noise
        }

        noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        staticFilter = audioCtx.createBiquadFilter();
        staticFilter.type = 'lowpass';
        staticFilter.frequency.value = 3500; // Muffled hiss

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
    // Tarayıcı otomatik ses çalmayı engelleyebilir, kullanıcı tvOn tuşuna bastığında initAudioContext tetiklenecek.
    if (!state.tvOn || !state.vhsAudioOn) {
        if (noiseGain && audioCtx) noiseGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    } else {
        if (!audioCtx) initAudioContext();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        if (noiseGain && audioCtx) noiseGain.gain.setTargetAtTime(0.001, audioCtx.currentTime, 0.5);
    }
}

// --- Orijinal Videonun Ses Kalitesini Düşürme (Video Audio API Hook) ---
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

        if (videoAudioCtx.state === 'suspended') {
            videoAudioCtx.resume();
        }

        // Medya elementinden bir kere source alınabilir, yoksa InvalidStateError atar
        if (!isVideoHooked) {
            // Video elemanının sesini Web Audio ortamına çekiyoruz
            videoSourceNode = videoAudioCtx.createMediaElementSource(video);

            // Tizleri (yüksek frekansları) kesecek filtre (kalitesiz duyulmasını sağlar)
            videoLowpassFilter = videoAudioCtx.createBiquadFilter();
            videoLowpassFilter.type = 'lowpass';
            videoLowpassFilter.frequency.value = 20000;

            // Basları kesecek filtre (sesi tenekemsi yapar)
            videoHighpassFilter = videoAudioCtx.createBiquadFilter();
            videoHighpassFilter.type = 'highpass';
            videoHighpassFilter.frequency.value = 0;

            videoSourceNode.connect(videoLowpassFilter);
            videoLowpassFilter.connect(videoHighpassFilter);
            videoHighpassFilter.connect(videoAudioCtx.destination);

            isVideoHooked = true;
        }

        if (state.tvOn && state.vhsAudioOn) {
            // Nostalji açık: Videonun kendi sesini eski tüplü tv / kaset seviyesine çekiyoruz.
            videoLowpassFilter.frequency.setTargetAtTime(1000, videoAudioCtx.currentTime, 0.5); // Boğuk
            videoHighpassFilter.frequency.setTargetAtTime(300, videoAudioCtx.currentTime, 0.5); // Tenekemsi
        } else {
            // Normal kalite (efekti kapat)
            videoLowpassFilter.frequency.setTargetAtTime(20000, videoAudioCtx.currentTime, 0.5);
            videoHighpassFilter.frequency.setTargetAtTime(0, videoAudioCtx.currentTime, 0.5);
        }

    } catch (e) {
        // Cross-Origin (CORS) veya hook sırasında oluşan güvenlik hataları.
        // Eklenti sayfada çalıştığı için YouTube'da vs normalde izin verir.
        console.warn("Tüplü TV: Orijinal video sesine müdahale başarısız oldu:", e);
    }
}