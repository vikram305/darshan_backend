import { z } from 'zod';

// Sub-schemas for better validation
const DtlsFingerprintSchema = z.object({
  algorithm: z.enum(['sha-1', 'sha-224', 'sha-256', 'sha-384', 'sha-512']),
  value: z.string(),
});

const DtlsParametersSchema = z.object({
  role: z.enum(['auto', 'client', 'server']).optional(),
  fingerprints: z.array(DtlsFingerprintSchema),
});

const RtpCodecCapabilitySchema = z.object({
  kind: z.enum(['audio', 'video']),
  mimeType: z.string(),
  preferredPayloadType: z.number().nullable().optional(),
  clockRate: z.number(),
  channels: z.number().nullable().optional(),
  parameters: z.record(z.string(), z.unknown()).nullable().optional(),
  rtcpFeedback: z.array(z.object({
    type: z.string(),
    parameter: z.string().optional(),
  })).nullable().optional(),
});

const RtpHeaderExtensionSchema = z.object({
  kind: z.enum(['audio', 'video']),
  uri: z.string(),
  preferredId: z.number(),
  preferredEncrypt: z.boolean().optional(),
  direction: z.enum(['sendrecv', 'sendonly', 'recvonly', 'inactive']).optional(),
});

const RtpCapabilitiesSchema = z.object({
  codecs: z.array(RtpCodecCapabilitySchema).optional(),
  headerExtensions: z.array(RtpHeaderExtensionSchema).optional(),
});

const RtpCodecParametersSchema = z.object({
  mimeType: z.string(),
  payloadType: z.number(),
  clockRate: z.number(),
  channels: z.number().nullable().optional(),
  parameters: z.record(z.string(), z.unknown()).nullable().optional(),
  rtcpFeedback: z.array(z.object({
    type: z.string(),
    parameter: z.string().optional(),
  })).nullable().optional(),
});

const RtpEncodingParametersSchema = z.object({
  ssrc: z.number().optional(),
  rid: z.string().optional(),
  codecPayloadType: z.number().optional(),
  rtx: z.object({ ssrc: z.number() }).optional(),
  dtx: z.boolean().optional(),
  scalabilityMode: z.string().optional(),
  maxBitrate: z.number().optional(),
});

const RtpParametersSchema = z.object({
  mid: z.string().nullable().optional(),
  codecs: z.array(RtpCodecParametersSchema),
  headerExtensions: z.array(z.object({
    uri: z.string(),
    id: z.number(),
    encrypt: z.boolean().optional(),
    parameters: z.record(z.string(), z.unknown()).optional(),
  })).nullable().optional(),
  encodings: z.array(RtpEncodingParametersSchema).nullable().optional(),
  rtcp: z.object({
    cname: z.string().optional(),
    reducedSize: z.boolean().optional(),
  }).nullable().optional(),
  msid: z.string().nullable().optional(),
});

export const GetRouterCapabilitiesSchema = z.object({
  roomId: z.string().length(6, "Room code must be exactly 6 characters"),
});

export const CreateTransportSchema = z.object({
  roomId: z.string().length(6),
  peerId: z.string().uuid("Invalid Peer ID format").or(z.string()),
  direction: z.enum(['send', 'recv']),
});

export const ConnectTransportSchema = z.object({
  roomId: z.string().length(6),
  peerId: z.string(),
  transportId: z.string(),
  dtlsParameters: DtlsParametersSchema,
});

export const ProduceSchema = z.object({
  roomId: z.string().length(6),
  peerId: z.string(),
  transportId: z.string(),
  kind: z.enum(['audio', 'video']),
  rtpParameters: RtpParametersSchema,
});

export const ConsumeSchema = z.object({
  roomId: z.string().length(6),
  peerId: z.string(),
  producerId: z.string(),
  rtpCapabilities: RtpCapabilitiesSchema,
});

export const ResumeConsumerSchema = z.object({
  roomId: z.string().length(6),
  peerId: z.string(),
  consumerId: z.string(),
});
