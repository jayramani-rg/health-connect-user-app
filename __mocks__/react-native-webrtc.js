const createTrack = (kind) => ({
  kind,
  enabled: true,
  stop: jest.fn(),
  _switchCamera: jest.fn(),
});

class MockMediaStream {
  constructor(tracks) {
    this.tracks = tracks;
  }
  getTracks() {
    return this.tracks;
  }
  getAudioTracks() {
    return this.tracks.filter((track) => track.kind === 'audio');
  }
  getVideoTracks() {
    return this.tracks.filter((track) => track.kind === 'video');
  }
  toURL() {
    return 'mock-stream-url';
  }
  release() {}
}

const peers = [];

class MockRTCPeerConnection {
  constructor(configuration) {
    this.configuration = configuration;
    this.addedTracks = [];
    this.createOfferOptions = null;
    this.listeners = {};
    this.signalingState = 'stable';
    this.connectionState = 'new';
    this.iceConnectionState = 'new';
    this.localDescription = null;
    this.remoteDescription = null;
    this.closed = false;
    peers.push(this);
  }
  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }
  addTrack(track) {
    this.addedTracks.push(track);
  }
  async createOffer(options) {
    this.createOfferOptions = options;
    return { type: 'offer', sdp: 'v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n' };
  }
  async createAnswer() {
    return { type: 'answer', sdp: 'v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n' };
  }
  async setLocalDescription(description) {
    this.localDescription = description;
    this.signalingState = description.type === 'offer' ? 'have-local-offer' : 'stable';
  }
  async setRemoteDescription(description) {
    this.remoteDescription = description;
    this.signalingState = description.type === 'offer' ? 'have-remote-offer' : 'stable';
  }
  async addIceCandidate() {}
  async getStats() {
    return { forEach: () => undefined };
  }
  restartIce() {}
  close() {
    this.closed = true;
  }
}

class MockRTCSessionDescription {
  constructor(info) {
    this.type = info.type;
    this.sdp = info.sdp;
  }
}

class MockRTCIceCandidate {
  constructor(info) {
    this.candidate = info.candidate;
    this.sdpMid = info.sdpMid;
    this.sdpMLineIndex = info.sdpMLineIndex;
  }
}

const mediaDevices = {
  getUserMedia: jest.fn(async (constraints) => {
    const tracks = [];
    if (constraints.audio) {
      tracks.push(createTrack('audio'));
    }
    if (constraints.video) {
      tracks.push(createTrack('video'));
    }
    return new MockMediaStream(tracks);
  }),
};

module.exports = {
  MediaStream: MockMediaStream,
  RTCPeerConnection: MockRTCPeerConnection,
  RTCSessionDescription: MockRTCSessionDescription,
  RTCIceCandidate: MockRTCIceCandidate,
  RTCView: 'RTCView',
  mediaDevices,
  __peers: peers,
};
