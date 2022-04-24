import { SerializedMessage, User } from 'src/contracts'

export interface ChannelsStateInterface {
  loading: boolean,
  error: Error | null,
  users: User[]
  messages: { [channel: string]: SerializedMessage[] }
  active: string | null
}

function state (): ChannelsStateInterface {
  return {
    loading: false,
    error: null,
    users: [],
    messages: {},
    active: null
  }
}

export default state
