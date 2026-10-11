import * as webrtc from 'react-native-webrtc';
import { MediaAccessError, WebRTCSession } from '../../src/features/calls/webrtc/WebRTCSession';
import { mediaConstraintsFor, offerOptionsFor, startsOnSpeaker, usesCamera } from '../../src/features/calls/webrtc/mediaPolicy';
import type { CallType } from '../../src/features/calls/types/call.types';

const getUserMedia = webrtc.mediaDevices.getUserMedia as unknown as jest.Mock;
const peers = (webrtc as unknown as { __peers: unknown }).__peers as unknown as Array<{
  addedTracks: Array<{ kind: string }>;
  createOfferOptions: { offerToReceiveAudio: boolean; offerToReceiveVideo: boolean; iceRestart: boolean } | null;
  configuration: { iceServers: Array<{ urls: string[]; username?: string; credential?: string }>; bundlePolicy: string };
  closed: boolean;
}>;

function makeSession(callType: CallType, cameraAllowed = true) {
  return new WebRTCSession({
    callType,
    iceServers: [
      { urls: ['stun:turn.example.org:3478'] },
      { urls: ['turn:turn.example.org:3478?transport=udp'], username: '1:abc', credential: 'secret' },
    ],
    cameraAllowed,
    onEvent: jest.fn(),
  });
}

beforeEach(() => {
  getUserMedia.mockClear();
  peers.length = 0;
});

describe('media policy', () => {
  it('never asks for video on a voice call, whatever the camera permission is', () => {
    expect(mediaConstraintsFor('VOICE', true).video).toBe(false);
    expect(mediaConstraintsFor('VOICE', false).video).toBe(false);
    expect(usesCamera('VOICE', true)).toBe(false);
  });

  it('asks for audio and video on a video call when the camera is allowed', () => {
    const constraints = mediaConstraintsFor('VIDEO', true);

    expect(constraints.audio).toBe(true);
    expect(constraints.video).toMatchObject({ facingMode: 'user' });
  });

  it('falls back to audio only on a video call when the camera is not allowed', () => {
    expect(mediaConstraintsFor('VIDEO', false).video).toBe(false);
  });

  it('only offers to receive video on video calls', () => {
    expect(offerOptionsFor('VOICE').offerToReceiveVideo).toBe(false);
    expect(offerOptionsFor('VIDEO').offerToReceiveVideo).toBe(true);
  });

  it('starts voice calls on the earpiece and video calls on the speaker', () => {
    expect(startsOnSpeaker('VOICE')).toBe(false);
    expect(startsOnSpeaker('VIDEO')).toBe(true);
  });
});

describe('WebRTCSession on a voice call', () => {
  it('opens the microphone only and never touches the camera', async () => {
    const session = makeSession('VOICE');

    await session.openMedia();

    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true, video: false });
    expect(session.hasLocalVideo).toBe(false);
    expect(session.localStreamURL).toBeNull();
  });

  it('sends only an audio track and offers no video', async () => {
    const session = makeSession('VOICE');
    await session.openMedia();

    await session.createOffer();

    const peer = peers[0];
    expect(peer.addedTracks.map((track) => track.kind)).toEqual(['audio']);
    expect(peer.createOfferOptions).toMatchObject({ offerToReceiveAudio: true, offerToReceiveVideo: false });
  });

  it('ignores camera controls', async () => {
    const session = makeSession('VOICE');
    await session.openMedia();

    expect(() => {
      session.setCameraEnabled(true);
      session.switchCamera();
    }).not.toThrow();
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('reports a denied microphone as a permission problem', async () => {
    getUserMedia.mockRejectedValueOnce(Object.assign(new Error('denied'), { name: 'NotAllowedError' }));
    const session = makeSession('VOICE');

    await expect(session.openMedia()).rejects.toMatchObject({ issue: 'permission_denied' });
  });

  it('reports an unavailable microphone', async () => {
    getUserMedia.mockRejectedValueOnce(Object.assign(new Error('busy'), { name: 'NotReadableError' }));
    const session = makeSession('VOICE');

    const error = await session.openMedia().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(MediaAccessError);
    expect((error as MediaAccessError).issue).toBe('microphone_unavailable');
  });
});

describe('WebRTCSession on a video call', () => {
  it('opens microphone and camera together', async () => {
    const session = makeSession('VIDEO');

    const issue = await session.openMedia();

    expect(issue).toBeNull();
    expect(getUserMedia).toHaveBeenCalledWith(expect.objectContaining({ audio: true, video: expect.objectContaining({ facingMode: 'user' }) }));
    expect(session.hasLocalVideo).toBe(true);
    expect(session.localStreamURL).toBe('mock-stream-url');
  });

  it('sends audio and video tracks and offers to receive video', async () => {
    const session = makeSession('VIDEO');
    await session.openMedia();

    await session.createOffer();

    const peer = peers[0];
    expect(peer.addedTracks.map((track) => track.kind).sort()).toEqual(['audio', 'video']);
    expect(peer.createOfferOptions).toMatchObject({ offerToReceiveAudio: true, offerToReceiveVideo: true });
  });

  it('continues with audio only when the camera is unavailable', async () => {
    getUserMedia.mockRejectedValueOnce(Object.assign(new Error('no camera'), { name: 'NotFoundError' }));
    const session = makeSession('VIDEO');

    const issue = await session.openMedia();

    expect(issue).toBe('camera_unavailable');
    expect(session.hasLocalVideo).toBe(false);
    expect(getUserMedia).toHaveBeenLastCalledWith({ audio: true, video: false });
  });

  it('does not open the camera when camera permission was denied', async () => {
    const session = makeSession('VIDEO', false);

    await session.openMedia();

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true, video: false });
    expect(session.hasLocalVideo).toBe(false);
  });
});

describe('WebRTCSession signaling', () => {
  it('uses the issued ICE servers with a bundled unified plan configuration', async () => {
    const session = makeSession('VOICE');
    await session.openMedia();
    await session.createOffer();

    const configuration = peers[0].configuration;
    expect(configuration.bundlePolicy).toBe('max-bundle');
    expect(configuration.iceServers).toHaveLength(2);
    expect(configuration.iceServers[1]).toMatchObject({ username: '1:abc', credential: 'secret' });
  });

  it('answers an offer and applies the remote description first', async () => {
    const session = makeSession('VOICE');
    await session.openMedia();

    const answer = await session.acceptOffer('v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n');

    expect(answer).toContain('m=audio');
    expect(session.hasRemoteDescription()).toBe(true);
  });

  it('queues remote candidates until a remote description exists', async () => {
    const session = makeSession('VOICE');
    await session.openMedia();
    await session.createOffer();

    await session.addRemoteCandidate({ candidate: 'candidate:1 1 udp 1 10.0.0.1 1 typ host', sdpMid: '0', sdpMLineIndex: 0 });
    expect(session.hasRemoteDescription()).toBe(false);

    await session.acceptAnswer('v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n');
    expect(session.hasRemoteDescription()).toBe(true);
  });

  it('releases every track and closes the peer connection', async () => {
    const session = makeSession('VIDEO');
    await session.openMedia();
    await session.createOffer();

    session.close();

    expect(peers[0].closed).toBe(true);
    expect(session.hasLocalVideo).toBe(false);
  });
});
