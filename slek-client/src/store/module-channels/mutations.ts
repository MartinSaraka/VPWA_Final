import { SerializedChannel, SerializedMessage, User } from 'src/contracts'
import { MutationTree } from 'vuex'
import { ChannelsStateInterface } from './state'

const mutation: MutationTree<ChannelsStateInterface> = {
  LOADING_START (state) {
    state.loading = true
    state.error = null
  },
  LOADING_SUCCESS (state, { channel, messages }: { channel: string, messages: SerializedMessage[] }) {
    state.loading = false
    state.messages[channel] = messages
  },
  LOADING_ERROR (state, error) {
    state.loading = false
    state.error = error
  },
  CLEAR_CHANNEL (state, channel) {
    state.active = null
    delete state.messages[channel]
    const index = state.channels.findIndex(item => item.name === channel)
    if (index > -1) {
      state.channels.splice(index, 1)
    }
  },
  REVOKE_CHANNEL (state, { channel, id }) {
    state.active = null
    delete state.messages[channel]
    const index = state.channels.findIndex(item => item.name === channel)
    if (index > -1) {
      state.channels.splice(index, 1)
    }
  },
  SET_ACTIVE (state, channel: string) {
    state.active = channel
  },
  SET_USERS (state, users: User[]) {
    state.users = users
  },
  NEW_MESSAGE (state, { channel, message }: { channel: string, message: SerializedMessage }) {
    state.messages[channel].push(message)
  },
  NEW_NOTIFICATION (state, message : SerializedMessage) {
    state.currentNotification = message
  },
  SET_RECEIVE_ALL_NOTIFICATIONS (state, value) {
    state.isReceivingNotifications = value
  },
  ADD_CHANNEL (state, channel) {
    state.channels.push(channel)

    const tmp = [] as SerializedChannel[]
    for (let i = 0; i < state.channels.length; i++) {
      const stateChannel = state.channels[i]
      if (stateChannel.joined_at === null) {
        tmp.unshift(stateChannel)
      } else {
        tmp.push(stateChannel)
      }
    }

    state.channels = tmp
  }
}

export default mutation
