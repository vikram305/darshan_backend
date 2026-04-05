export type MediaKind = 'audio' | 'video';

export interface IceParameters {
  usernameFragment: string;
  password: string;
  iceLite?: boolean;
}

export interface IceCandidate {
  foundation: string;
  priority: number;
  ip: string;
  address: string;
  protocol: 'udp' | 'tcp';
  port: number;
  type: 'host';
  tcpType?: 'passive';
}

export interface DtlsFingerprint {
  algorithm: 'sha-1' | 'sha-224' | 'sha-256' | 'sha-384' | 'sha-512';
  value: string;
}

export interface DtlsParameters {
  role?: 'auto' | 'client' | 'server';
  fingerprints: DtlsFingerprint[];
}

export interface RtpCodecCapability {
  kind: MediaKind;
  mimeType: string;
  preferredPayloadType?: number;
  clockRate: number;
  channels?: number;
  parameters?: Record<string, unknown>;
  rtcpFeedback?: Array<{ type: string; parameter?: string }>;
}

export interface RtpHeaderExtension {
  kind: MediaKind;
  uri: string;
  preferredId: number;
  preferredEncrypt?: boolean;
  direction?: 'sendrecv' | 'sendonly' | 'recvonly' | 'inactive';
}

export interface RtpCapabilities {
  codecs?: RtpCodecCapability[];
  headerExtensions?: RtpHeaderExtension[];
}

export interface RtpCodecParameters {
  mimeType: string;
  payloadType: number;
  clockRate: number;
  channels?: number;
  parameters?: Record<string, unknown>;
  rtcpFeedback?: Array<{ type: string; parameter?: string }>;
}

export interface RtpEncodingParameters {
  ssrc?: number;
  rid?: string;
  codecPayloadType?: number;
  rtx?: { ssrc: number };
  dtx?: boolean;
  scalabilityMode?: string;
  maxBitrate?: number;
}

export interface RtpParameters {
  mid?: string;
  codecs: RtpCodecParameters[];
  headerExtensions?: Array<{ uri: string; id: number; encrypt?: boolean; parameters?: Record<string, unknown> }>;
  encodings?: RtpEncodingParameters[];
  rtcp?: { cname?: string; reducedSize?: boolean };
  msid?: string;
}
