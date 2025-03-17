import { Status } from "./api";

export interface SendMessageRequest {
  userDiscordId: string;
  message: string;
}

export interface SendMessageResponse {
  status: Status;
  data: {
    message: string;
  };
}
