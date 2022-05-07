import { SerializedMessage, User } from 'src/contracts'
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
  CHANGE_USER_STATE (state, { user, currentState } : { user: User, currentState: string}) {
    for (let i = 0; i < state.users.length; i++) {
      const tmpUser = state.users[i]
      if (tmpUser.nickName === user.nickName) {
        state.users[i].currentState = currentState
        break
      }
    }
  },

  SET_MESSAGES (state, { channel, messages }: { channel: string, messages: SerializedMessage[] }) {
    state.messages[channel] = messages
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
  RECEIVED_TYPING (state, { channel, message, userNickname }: {channel : string, message : string, userNickname : string }) {
    if (state.typers[channel] === undefined && message !== '') {
      state.typers[channel] = [{ name: userNickname, message, isOpened: false }]
    } else {
      let foundIndex = -1
      if (state.typers[channel] !== undefined) {
        for (let i = 0; i < state.typers[channel].length; i++) {
          if (state.typers[channel][i].name === userNickname) {
            state.typers[channel][i].message = message
            foundIndex = i
            break
          }
        }

        if (foundIndex === -1 && message !== '') {
          state.typers[channel].push({ name: userNickname, message, isOpened: false })
        } else if (message === '') {
          state.typers[channel].splice(foundIndex, 1)
        }
      }
    }
  },
  REMOVE_ALL_TYPERS (state, channel : string) {
    delete state.typers[channel]
  },
  SET_OPENED_TYPER (state, { channel, userNickname, value }: {channel : string, userNickname : string, value: boolean }) {
    for (let i = 0; i < state.typers[channel].length; i++) {
      if (state.typers[channel][i].name === userNickname) {
        state.typers[channel][i].isOpened = value
        break
      }
    }
  },
  ADD_CHANNEL (state, channel) {
    if (channel.joined_at === null) {
      state.channels.unshift(channel)
    } else {
      state.channels.push(channel)
    }
  }
}

export default mutation
