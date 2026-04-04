import { z } from 'zod';
import { ERROR_MESSAGES } from '../../../../core/constants/error_messages';

export const JoinRoomSchema = z.object({
  code: z.string().length(6, ERROR_MESSAGES.ROOM_CODE_LENGTH),
  peerName: z.string().min(1, ERROR_MESSAGES.PEER_NAME_REQUIRED),
});

export type JoinRoomDto = z.infer<typeof JoinRoomSchema>;
