import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { ChannelsStateInterface } from './state'
import { channelService } from 'src/services'
import { RawMessage, SerializedChannel } from 'src/contracts'

const actions: ActionTree<ChannelsStateInterface, StateInterface> = {
  async join ({ commit }, channel: SerializedChannel) {
    try {
      commit('LOADING_START')

      const channelName = channel.name
      const messages = await channelService.join(channel.name).loadMessages()

      commit('ADD_CHANNEL', channel)
      commit('LOADING_SUCCESS', { channel: channelName, messages })
    } catch (err) {
      commit('LOADING_ERROR', err)
      throw err
    }
  },
  async leave ({ getters, commit }, channel: string | null) {
    const leaving: string[] = channel !== null ? [channel] : getters.joinedChannels

    leaving.forEach((c) => {
      channelService.leave(c)
      commit('CLEAR_CHANNEL', c)
    })
  },
  async addMessage ({ commit }, { channel, message }: { channel: string, message: RawMessage }) {
    const newMessage = await channelService.in(channel)?.addMessage(message)
    commit('NEW_MESSAGE', { channel, message: newMessage })
  },
  async serveCommand ({ commit }, { channel, message, userId }: { channel: string, message: RawMessage, userId: number }) {
    const result = await channelService.in(channel)?.serveCommand(channel, message, userId)

    if (message === '/list') {
      commit('SET_USERS', result)
      console.log(result)
    } else if (message === '/cancel') {
      channelService.leave(channel)
    } else if (message.startsWith('/join')) {
      console.log('join')
    }

    return null
  }
}

export default actions
