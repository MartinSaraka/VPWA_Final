import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { ChannelsStateInterface } from './state'
import { activityService, channelService, inviteService } from 'src/services'
import { RawMessage, SerializedChannel } from 'src/contracts'
import { resolveDirective } from 'vue'
import { RouteLocationRaw } from 'vue-router'
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

  async channelInvite ({ commit }, { channel, invitedUserId } : { channel: SerializedChannel, invitedUserId: number }) {
    if (invitedUserId === this.state.auth.user?.id) {
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
    }
  },

  async revoke ({ commit }, { channel, id }) {
    if (id === this.state.auth.user!.id) {
      alert('Bol si vyhodený z kanála ' + channel)
      commit('REVOKE_CHANNEL', { channel, id })
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

  async addTyping ({ commit }, { channel, message }: { channel: string, message: RawMessage }) {
    await channelService.in(channel)?.addTyping(channel, message)
  },

  async receivedTyping ({ commit }, { channel, message, userNickname }: { channel: string, message: string, userNickname: string }) {
    commit('RECEIVED_TYPING', { channel, message, userNickname })
  },

  async changeState ({ commit, dispatch }, currentState : string) {
    // if state changed to online/dnd update messages
    if ((currentState === 'online' || currentState === 'dnd') && this.state.auth.user !== null) {
      const channels = await channelService.getAll(this.state.auth.user.id)
      let channelName, messages
      for (let i = 0; i < channels.length; i++) {
        channelName = channels[i].name
        messages = await channelService.in(channelName)?.loadMessages()
        commit('SET_MESSAGES', { channel: channelName, messages })
      }
    }

    // notify users about status change
    activityService.changeState(currentState)
  },

  async handleInviteDecision ({ commit }, { channel, userId, accepted }: { channel: string, userId: number, accepted: boolean }) {
    channelService.leave(channel)
    commit('CLEAR_CHANNEL', channel)
    const result = await inviteService.handleInviteDecision(channel, userId, accepted)
  },

  async serveCommand ({ commit }, { channel, message, userId }: { channel: string, message: RawMessage, userId: number}) {
    let result
    if (message.startsWith('/invite')) {
      result = await inviteService.serveInvite(channel, message, userId)
    } else if (message === '/list') {
      const onlineUsers = await activityService.getOnlineUsers()
      result = await channelService.in(channel)?.getUsersList(channel, onlineUsers)
      commit('SET_USERS', result)
    } else {
      result = await channelService.in(channel)?.serveCommand(channel, message, userId)
    }

    if (message === '/cancel') {
      channelService.leave(channel)
    } else if (message.startsWith('/revoke')) {
      // channelService.leave(channel)
    }

    return null
  }
}

export default actions
function redirect (arg0: { path: string }) {
  throw new Error('Function not implemented.')
}
