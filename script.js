/**
 * Configuration and state management
 */
const CONFIG = {
    SERVER_URL: 'http://localhost:3000/session',
    MODEL: 'gpt-4o-realtime-preview-2024-12-17',
    API_BASE_URL: 'https://api.openai.com/v1/realtime',
    MAX_LOG_ENTRIES: 100
};

let state = {
    peerConnection: null,
    dataChannel: null,
    audioStream: null,
    logCount: 0
};

/**
 * Enhanced logging system
 */
const log = (() => {
    const statusEl = document.getElementById('status');

    function createLogEntry(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `status-entry ${type}`;

        const time = new Date().toLocaleTimeString(undefined, {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });

        entry.innerHTML = `
            <span class="status-time">[${time}]</span>
            <span class="status-message">${message}</span>
        `;

        return entry;
    }

    return (message, type = 'info') => {
        const consoleMethod = type === 'error' ? 'error' : 'log';
        console[consoleMethod](`[${type.toUpperCase()}] ${message}`);

        const entry = createLogEntry(message, type);
        statusEl.insertBefore(entry, statusEl.firstChild);

        state.logCount++;
        if (state.logCount > CONFIG.MAX_LOG_ENTRIES) {
            statusEl.lastChild?.remove();
            state.logCount--;
        }

        entry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
})();

/**
 * WebRTC and API Integration
 */
async function initializeSession() {
    try {
        log('Initializing session...', 'info');
        toggleControls(true);

        const { token } = await getEphemeralToken();
        await setupWebRTCConnection(token);

        log('Session initialized successfully', 'success');
    } catch (error) {
        log(`Session initialization failed: ${error.message}`, 'error');
        toggleControls(false);
    }
}

async function getEphemeralToken() {
    const response = await fetch(CONFIG.SERVER_URL);
    if (!response.ok) {
        throw new Error('Failed to obtain session token');
    }
    const data = await response.json();
    log('Obtained ephemeral token');
    return { token: data.client_secret.value };
}

async function setupWebRTCConnection(token) {
    state.peerConnection = new RTCPeerConnection();
    log('Created peer connection');

    state.peerConnection.onconnectionstatechange = () => {
        log(`Connection state changed to: ${state.peerConnection.connectionState}`);
    };

    state.peerConnection.oniceconnectionstatechange = () => {
        log(`ICE connection state changed to: ${state.peerConnection.iceConnectionState}`);
    };

    state.peerConnection.onicegatheringstatechange = () => {
        log(`ICE gathering state changed to: ${state.peerConnection.iceGatheringState}`);
    };

    await setupAudioStreams();
    setupDataChannel();
    await createAndSendOffer(token);
}

async function setupAudioStreams() {
    state.peerConnection.ontrack = ({ streams: [stream] }) => {
        log('Received remote audio stream');
        const audio = new Audio();
        audio.srcObject = stream;
        audio.play();
    };

    state.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.audioStream.getTracks().forEach(track => {
        state.peerConnection.addTrack(track, state.audioStream);
    });
    log('Added local audio stream');
}

function setupDataChannel() {
    state.dataChannel = state.peerConnection.createDataChannel('oai-events');

    state.dataChannel.onopen = () => {
        log('Data channel opened');
        sendInitialPrompt();
    };

    state.dataChannel.onmessage = handleDataChannelMessage;
}

async function createAndSendOffer(token) {
    const offer = await state.peerConnection.createOffer();
    await state.peerConnection.setLocalDescription(offer);
    log('Created and set local description');

    const response = await fetch(`${CONFIG.API_BASE_URL}?model=${CONFIG.MODEL}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/sdp'
        }
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${await response.text()}`);
    }

    const answer = { type: 'answer', sdp: await response.text() };
    await state.peerConnection.setRemoteDescription(answer);
    log('Set remote description');
}

function sendInitialPrompt() {
    const instruction = {
        type: 'response.create',
        response: {
            modalities: ['text', 'audio'],
            instructions: 'Hello! Please introduce yourself.'
        }
    };
    state.dataChannel.send(JSON.stringify(instruction));
    log('Sent initial prompt');
}

function handleDataChannelMessage(event) {
    try {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'text.created':
                log(`AI: ${data.text}`, 'success');
                break;
            case 'error':
                log(`Error: ${data.error?.message || 'Unknown error'}`, 'error');
                break;
            case 'audio.created':
                log('Received audio response', 'success');
                break;
            default:
                log(`Received event: ${data.type}`);
        }
    } catch (error) {
        log(`Error parsing message: ${error.message}`, 'error');
    }
}

/**
 * Cleanup and UI Management
 */
function cleanup() {
    log('Cleaning up session...');

    if (state.audioStream) {
        state.audioStream.getTracks().forEach(track => track.stop());
        state.audioStream = null;
    }

    if (state.dataChannel) {
        state.dataChannel.close();
        state.dataChannel = null;
    }

    if (state.peerConnection) {
        state.peerConnection.close();
        state.peerConnection = null;
    }

    toggleControls(false);
    log('Session ended');
}

function toggleControls(isSessionActive) {
    document.getElementById('startBtn').disabled = isSessionActive;
    document.getElementById('stopBtn').disabled = !isSessionActive;
}

// Event Listeners
document.getElementById('startBtn').addEventListener('click', initializeSession);
document.getElementById('stopBtn').addEventListener('click', cleanup);
