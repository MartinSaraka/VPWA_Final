import { SerializedChannel, SerializedMessage, TyperWithMessage, User } from 'src/contracts'

export interface ChannelsStateInterface {
  loading: boolean,
  isReceivingNotifications: boolean,
  error: Error | null,
  users: User[]
  channels: SerializedChannel[]
  currentNotification: SerializedMessage | null
  messages: { [channel: string]: SerializedMessage[] }
  typers: { [channel: string]: TyperWithMessage[]}
  active: string | null
}

function state (): ChannelsStateInterface {
  return {
    loading: false,
    isReceivingNotifications: false,
    error: null,
    users: [],
    channels: [],
    currentNotification: null,
    messages: {},
    typers: {},
    active: null
  }
}

export default state
