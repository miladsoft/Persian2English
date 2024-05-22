import { translateText } from './translate.js';

const startButton = document.getElementById('startButton');
const persianText = document.getElementById('persianText');
const englishText = document.getElementById('englishText');
const speakButton = document.getElementById('speakButton');
const waveform = document.getElementById('waveform');
const ctx = waveform.getContext('2d');

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'fa-IR';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let isRecording = false;
let animationId;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let analyser;
let dataArray;
let source;

navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        source.connect(analyser);
    })
    .catch(err => {
        console.error('Error accessing media devices.', err);
    });

startButton.addEventListener('click', () => {
    if (!isRecording) {
        recognition.start();
        isRecording = true;
        startButton.querySelector('img').src = 'stop.png';
        startButton.style.backgroundColor = '#dc3545';
        waveform.style.visibility = 'visible';
        startWaveformAnimation();
    } else {
        recognition.stop();
        isRecording = false;
        startButton.querySelector('img').src = 'microphone.png';
        startButton.style.backgroundColor = '#28a745';
        waveform.style.visibility = 'hidden';
        stopWaveformAnimation();
    }
});

recognition.onresult = (event) => {
    const persianSpeech = event.results[0][0].transcript;
    persianText.value = persianSpeech;
    const translatedText = translateText(persianSpeech);
    englishText.value = translatedText;
};

recognition.onspeechend = () => {
    recognition.stop();
    isRecording = false;
    startButton.querySelector('img').src = 'microphone.png';
    startButton.style.backgroundColor = '#28a745';
    waveform.style.visibility = 'hidden';
    stopWaveformAnimation();
};

recognition.onerror = (event) => {
    console.error('Error occurred in recognition: ' + event.error);
    isRecording = false;
    startButton.querySelector('img').src = 'microphone.png';
    startButton.style.backgroundColor = '#28a745';
    waveform.style.visibility = 'hidden';
    stopWaveformAnimation();
};

speakButton.addEventListener('click', () => {
    const englishSpeech = englishText.value;
    if (englishSpeech) {
        const utterance = new SpeechSynthesisUtterance(englishSpeech);
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
    }
});

function startWaveformAnimation() {
    function draw() {
        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = '#e9eef5';
        ctx.fillRect(0, 0, waveform.width, waveform.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#28a745';

        ctx.beginPath();

        const sliceWidth = waveform.width * 1.0 / analyser.frequencyBinCount;
        let x = 0;

        for (let i = 0; i < analyser.frequencyBinCount; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * waveform.height / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.lineTo(waveform.width, waveform.height / 2);
        ctx.stroke();

        animationId = requestAnimationFrame(draw);
    }

    draw();
}

function stopWaveformAnimation() {
    cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, waveform.width, waveform.height);
}
