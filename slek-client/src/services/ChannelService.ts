import { RawMessage, SerializedChannel, SerializedMessage, User } from 'src/contracts'
import { BootParams, SocketManager } from './SocketManager'
import { api } from 'src/boot/axios'

// creating instance of this class automatically connects to given socket.io namespace
// subscribe is called with boot params, so you can use it to dispatch actions for socket events
// you have access to socket.io socket using this.socket
class ChannelSocketManager extends SocketManager {
  public subscribe ({ store }: BootParams): void {
    const channel = this.namespace.split('/').pop() as string

    this.socket.on('message', (message: SerializedMessage) => {
      if (store.state.auth.user?.currentState !== 'offline') {
        store.commit('channels/NEW_MESSAGE', { channel, message })
      }
    })

    this.socket.on('notification', (message: SerializedMessage) => {
      if (store.state.auth.user?.currentState !== 'dnd') {
        store.commit('channels/NEW_NOTIFICATION', message)
      }
    })

    this.socket.on('leaveChannel', (channel: string) => {
      store.commit('channels/CLEAR_CHANNEL', channel)
    })

    this.socket.on('revokeChannel', (channel: string, id : any, userId :any) => {
      if (id !== 0) { store.dispatch('channels/revoke', { channel, id }) }

      // store.commit('channels/REVOKE_CHANNEL', { channel, id, userId })
    })
    this.socket.on('kickUserFromChannel', (channel: string, id : any, userId :any) => {
      if (id !== 0) { store.dispatch('channels/revoke', { channel, id }) }

      // store.commit('channels/REVOKE_CHANNEL', { channel, id, userId })
    })
    this.socket.on('joinChannel', (channel: SerializedChannel) => {
      store.dispatch('channels/join', channel)
    })

    this.socket.on('typing', (channel: string, message: string, userNickname: string) => {
      store.dispatch('channels/receivedTyping', { channel, message, userNickname })
    })
  }

  public addMessage (message: RawMessage): Promise<SerializedMessage> {
    return this.emitAsync('addMessage', message)
  }

  public addTyping (channel: string, message: RawMessage): Promise<SerializedMessage> {
    return this.emitAsync('addTyping', channel, message)
  }

  public serveCommand (channel:string, message: RawMessage, userId: number): Promise<SerializedMessage> {
    return this.emitAsync('serveCommand', channel, message, userId)
  }

  public getUsersList (channel : string, onlineUsers : User[]): Promise<User[]> {
    return this.emitAsync('getUsersList', channel, onlineUsers)
  }

  public loadMessages (): Promise<SerializedMessage[]> {
    return this.emitAsync('loadMessages')
  }
}

class ChannelService {
  private channels: Map<string, ChannelSocketManager> = new Map()

  public join (name: string): ChannelSocketManager {
    if (this.channels.has(name)) {
      throw new Error(`User is already joined in channel "${name}"`)
    }

    // connect to given channel namespace
    const channel = new ChannelSocketManager(`/channels/${name}`)
    this.channels.set(name, channel)
    return channel
  }

  public async getAll (userId: number) {
    const channels = await api.get('channel/all/' + userId)
    return channels.data
  }

  public leave (name: string): boolean {
    const channel = this.channels.get(name)

    if (!channel) {
      return false
    }

    // disconnect namespace and remove references to socket
    channel.destroy()
    return this.channels.delete(name)
  }

  public in (name: string): ChannelSocketManager | undefined {
    return this.channels.get(name)
  }
}

export default new ChannelService()
