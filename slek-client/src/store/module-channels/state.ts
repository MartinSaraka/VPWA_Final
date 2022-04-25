import { SerializedChannel, SerializedMessage, User } from 'src/contracts'

export interface ChannelsStateInterface {
  loading: boolean,
  error: Error | null,
  users: User[]
  channels: SerializedChannel[]
  messages: { [channel: string]: SerializedMessage[] }
  active: string | null
}

function state (): ChannelsStateInterface {
  return {
    loading: false,
    error: null,
    users: [],
    channels: [],
    messages: {},
    active: null
  }
}

export default state
