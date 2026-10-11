import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { CALL_HUB_URL } from '../config/env';
import type { Call } from '../features/calls/types/call.types';

export interface OfferSignal {
  callId: string;
  sdp: string;
}

export interface IceCandidateSignal {
  callId: string;
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
}

export interface CallSignalRef {
  callId: string;
}

type Handler<T> = (payload: T) => void;

class CallSocket {
  private connection: HubConnection | null = null;
  private connecting: Promise<void> | null = null;
  private getToken: () => string | null = () => null;

  private incomingHandlers = new Set<Handler<Call>>();
  private stateHandlers = new Set<Handler<Call>>();
  private offerHandlers = new Set<Handler<OfferSignal>>();
  private answerHandlers = new Set<Handler<OfferSignal>>();
  private candidateHandlers = new Set<Handler<IceCandidateSignal>>();
  private restartHandlers = new Set<Handler<CallSignalRef>>();
  private joinedHandlers = new Set<Handler<CallSignalRef>>();
  private disconnectedHandlers = new Set<Handler<CallSignalRef>>();
  private reconnectedHandlers = new Set<() => void>();
  private reconnectingHandlers = new Set<() => void>();

  configure(getToken: () => string | null): void {
    this.getToken = getToken;
  }

  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  async connect(): Promise<void> {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      return this.connecting ?? undefined;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(CALL_HUB_URL, { accessTokenFactory: () => this.getToken() ?? '' })
      .withAutomaticReconnect([0, 1000, 2000, 4000, 8000, 15000])
      .configureLogging(LogLevel.None)
      .build();

    connection.on('CallIncoming', (call: Call) => this.incomingHandlers.forEach((h) => h(call)));
    connection.on('CallStateChanged', (call: Call) => this.stateHandlers.forEach((h) => h(call)));
    connection.on('CallOffer', (signal: OfferSignal) => this.offerHandlers.forEach((h) => h(signal)));
    connection.on('CallAnswer', (signal: OfferSignal) => this.answerHandlers.forEach((h) => h(signal)));
    connection.on('IceCandidate', (signal: IceCandidateSignal) => this.candidateHandlers.forEach((h) => h(signal)));
    connection.on('IceRestartRequested', (signal: CallSignalRef) => this.restartHandlers.forEach((h) => h(signal)));
    connection.on('ParticipantJoined', (signal: CallSignalRef) => this.joinedHandlers.forEach((h) => h(signal)));
    connection.on('ParticipantDisconnected', (signal: CallSignalRef) => this.disconnectedHandlers.forEach((h) => h(signal)));
    connection.onreconnecting(() => this.reconnectingHandlers.forEach((h) => h()));
    connection.onreconnected(() => this.reconnectedHandlers.forEach((h) => h()));

    this.connection = connection;
    this.connecting = connection
      .start()
      .catch(() => undefined)
      .finally(() => {
        this.connecting = null;
      });

    return this.connecting;
  }

  async disconnect(): Promise<void> {
    const connection = this.connection;
    this.connection = null;
    this.connecting = null;
    try {
      await connection?.stop();
    } catch {}
  }

  joinCall(callId: string): Promise<void> {
    return this.invoke('JoinCall', callId);
  }

  leaveCall(callId: string): Promise<void> {
    return this.invoke('LeaveCall', callId);
  }

  sendOffer(callId: string, sdp: string): Promise<void> {
    return this.invoke('SendOffer', callId, sdp);
  }

  sendAnswer(callId: string, sdp: string): Promise<void> {
    return this.invoke('SendAnswer', callId, sdp);
  }

  sendIceCandidate(callId: string, candidate: string, sdpMid: string | null, sdpMLineIndex: number | null): Promise<void> {
    return this.invoke('SendIceCandidate', callId, candidate, sdpMid, sdpMLineIndex);
  }

  requestIceRestart(callId: string): Promise<void> {
    return this.invoke('RequestIceRestart', callId);
  }

  reportConnected(callId: string): Promise<void> {
    return this.invoke('ReportConnected', callId);
  }

  private async invoke(method: string, ...args: unknown[]): Promise<void> {
    await this.connect();
    const connection = this.connection;
    if (!connection || connection.state !== HubConnectionState.Connected) {
      throw new Error('Signaling is not connected.');
    }
    await connection.invoke(method, ...args);
  }

  onIncoming(handler: Handler<Call>): () => void {
    this.incomingHandlers.add(handler);
    return () => this.incomingHandlers.delete(handler);
  }

  onStateChanged(handler: Handler<Call>): () => void {
    this.stateHandlers.add(handler);
    return () => this.stateHandlers.delete(handler);
  }

  onOffer(handler: Handler<OfferSignal>): () => void {
    this.offerHandlers.add(handler);
    return () => this.offerHandlers.delete(handler);
  }

  onAnswer(handler: Handler<OfferSignal>): () => void {
    this.answerHandlers.add(handler);
    return () => this.answerHandlers.delete(handler);
  }

  onIceCandidate(handler: Handler<IceCandidateSignal>): () => void {
    this.candidateHandlers.add(handler);
    return () => this.candidateHandlers.delete(handler);
  }

  onIceRestartRequested(handler: Handler<CallSignalRef>): () => void {
    this.restartHandlers.add(handler);
    return () => this.restartHandlers.delete(handler);
  }

  onParticipantJoined(handler: Handler<CallSignalRef>): () => void {
    this.joinedHandlers.add(handler);
    return () => this.joinedHandlers.delete(handler);
  }

  onParticipantDisconnected(handler: Handler<CallSignalRef>): () => void {
    this.disconnectedHandlers.add(handler);
    return () => this.disconnectedHandlers.delete(handler);
  }

  onReconnecting(handler: () => void): () => void {
    this.reconnectingHandlers.add(handler);
    return () => this.reconnectingHandlers.delete(handler);
  }

  onReconnected(handler: () => void): () => void {
    this.reconnectedHandlers.add(handler);
    return () => this.reconnectedHandlers.delete(handler);
  }
}

export const callSocket = new CallSocket();
