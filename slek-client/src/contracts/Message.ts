import { User } from './Auth'

export type RawMessage = string

export interface SerializedMessage {
  createdBy: number
  content: string
  channelId: number,
  createdAt: string,
  updatedAt: string,
  id: number,
  author: User
}
export interface TyperWithMessage{
  name: string
  message: string
  isOpened: boolean
}
