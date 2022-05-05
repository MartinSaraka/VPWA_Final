import { RawMessage, SerializedChannel, SerializedMessage, User } from 'src/contracts'
import { BootParams, SocketManager } from './SocketManager'

class InviteSocketManager extends SocketManager {
  public subscribe ({ store }: BootParams): void {
    this.socket.on('channelInvite', (channel: SerializedChannel, invitedUserId: number) => {
      store.dispatch('channels/channelInvite', { channel, invitedUserId })
    })

    this.socket.on('joinChannel', (channel: SerializedChannel) => {
      store.dispatch('channels/join', channel)
    })
  }

  public serveInvite (channel: string, message: RawMessage, userId: number): Promise<SerializedMessage> {
    return this.emitAsync('serveInvite', channel, message, userId)
  }

  public handleInviteDecision (channel: string, userId: number, accepted: boolean): Promise<SerializedMessage> {
    return this.emitAsync('handleInviteDecision', channel, userId, accepted)
  }
}

export default new InviteSocketManager('/invite')
