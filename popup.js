document.addEventListener('DOMContentLoaded', () => {
    const powerBtn = document.getElementById('powerBtn');
    const channelSelect = document.getElementById('channelSelect');
    const ilkKezBtn = document.getElementById('ilkKezBtn');
    const lowResBtn = document.getElementById('lowResBtn');
    const vhsAudioBtn = document.getElementById('vhsAudioBtn');
    const crtCurveBtn = document.getElementById('crtCurveBtn');
    const bottomText = document.getElementById('bottomText');

    // Sliders
    const filterHue = document.getElementById('filterHue');
    const filterGrayscale = document.getElementById('filterGrayscale');
    const filterBlur = document.getElementById('filterBlur');
    const filterSepia = document.getElementById('filterSepia');
    const filterContrast = document.getElementById('filterContrast');
    const filterBrightness = document.getElementById('filterBrightness');
    const filterSaturate = document.getElementById('filterSaturate');
    const filterScanline = document.getElementById('filterScanline');
    const filterVignette = document.getElementById('filterVignette');
    const filterResolution = document.getElementById('filterResolution');
    const filterRgbShift = document.getElementById('filterRgbShift');

    // Load State
    chrome.storage.local.get([
        'tvOn', 'channelLogo', 'ilkKezOn', 'lowResOn', 'vhsAudioOn', 'crtCurveOn', 'bottomText',
        'fHue', 'fGrayscale', 'fBlur', 'fSepia', 'fContrast', 'fBrightness', 'fSaturate', 'fScanline', 'fVignette', 'fResolution', 'fRgbShift'
    ], (data) => {
        powerBtn.checked = data.tvOn || false;
        channelSelect.value = data.channelLogo || 'none';
        ilkKezBtn.checked = data.ilkKezOn !== undefined ? data.ilkKezOn : true;
        lowResBtn.checked = data.lowResOn !== undefined ? data.lowResOn : true;
        vhsAudioBtn.checked = data.vhsAudioOn || false;
        crtCurveBtn.checked = data.crtCurveOn || false;
        bottomText.value = data.bottomText || '';

        // UI Updates with defaults
        if (data.fHue !== undefined) filterHue.value = data.fHue;
        if (data.fGrayscale !== undefined) filterGrayscale.value = data.fGrayscale;
        if (data.fBlur !== undefined) filterBlur.value = data.fBlur;
        if (data.fSepia !== undefined) filterSepia.value = data.fSepia;
        if (data.fContrast !== undefined) filterContrast.value = data.fContrast;
        if (data.fBrightness !== undefined) filterBrightness.value = data.fBrightness;
        if (data.fSaturate !== undefined) filterSaturate.value = data.fSaturate;
        if (data.fScanline !== undefined) filterScanline.value = data.fScanline;
        if (data.fVignette !== undefined) filterVignette.value = data.fVignette;
        if (data.fResolution !== undefined) filterResolution.value = data.fResolution;
        if (data.fRgbShift !== undefined) filterRgbShift.value = data.fRgbShift;

        updateSliderTexts();
    });

    function updateSliderTexts() {
        document.getElementById('hueVal').innerText = filterHue.value + '°';
        document.getElementById('grayscaleVal').innerText = filterGrayscale.value + '%';
        document.getElementById('blurVal').innerText = filterBlur.value + 'px';
        document.getElementById('sepiaVal').innerText = filterSepia.value + '%';
        document.getElementById('contrastVal').innerText = filterContrast.value + '%';
        document.getElementById('brightnessVal').innerText = filterBrightness.value + '%';
        document.getElementById('saturateVal').innerText = filterSaturate.value + '%';
        document.getElementById('scanlineVal').innerText = filterScanline.value + '%';
        document.getElementById('vignetteVal').innerText = filterVignette.value + 'px';
        document.getElementById('resolutionVal').innerText = filterResolution.value + 'p';
        document.getElementById('rgbShiftVal').innerText = filterRgbShift.value + 'px';
    }

    function broadcastState() {
        updateSliderTexts();
        const stateObj = {
            tvOn: powerBtn.checked,
            channelLogo: channelSelect.value,
            ilkKezOn: ilkKezBtn.checked,
            lowResOn: lowResBtn.checked,
            vhsAudioOn: vhsAudioBtn.checked,
            crtCurveOn: crtCurveBtn.checked,
            bottomText: bottomText.value,

            fHue: filterHue.value,
            fGrayscale: filterGrayscale.value,
            fBlur: filterBlur.value,
            fSepia: filterSepia.value,
            fContrast: filterContrast.value,
            fBrightness: filterBrightness.value,
            fSaturate: filterSaturate.value,
            fScanline: filterScanline.value,
            fVignette: filterVignette.value,
            fResolution: filterResolution.value,
            fRgbShift: filterRgbShift.value
        };

        chrome.storage.local.set(stateObj);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'updateTV', state: stateObj }).catch(() => {
                    // Content script'in çalışmadığı sekmelerdeki (yeni sekme, ayarlar vs.) hataları yoksay
                });
            }
        });
    }

    // Attach listeners
    powerBtn.addEventListener('change', broadcastState);
    channelSelect.addEventListener('change', broadcastState);
    ilkKezBtn.addEventListener('change', broadcastState);
    lowResBtn.addEventListener('change', broadcastState);
    vhsAudioBtn.addEventListener('change', broadcastState);
    crtCurveBtn.addEventListener('change', broadcastState);
    bottomText.addEventListener('input', broadcastState);

    // Sliders
    [
        filterHue, filterGrayscale, filterBlur, filterSepia,
        filterContrast, filterBrightness, filterSaturate, filterScanline, filterVignette, filterResolution, filterRgbShift
    ].forEach(el => el.addEventListener('input', broadcastState));
});