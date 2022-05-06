import { SerializedMessage, User } from 'src/contracts'
import { authManager } from '.'
import { BootParams, SocketManager } from './SocketManager'

class ActivitySocketManager extends SocketManager {
  public subscribe ({ store }: BootParams): void {
    this.socket.on('user:list', (onlineUsers: User[], channel: string) => {
      console.log('Online users list ' + onlineUsers + ' ' + channel)
    })

    this.socket.on('user:stateChange', (user: User, currentState: string) => {
      store.commit('channels/CHANGE_USER_STATE', { user, currentState })
    })

    authManager.onChange((token) => {
      if (token) {
        this.socket.connect()
      } else {
        this.socket.disconnect()
      }
    })
  }

  public changeState (state: string) : Promise<SerializedMessage> {
    return this.emitAsync('changeState', state)
  }

  public getOnlineUsers () : Promise<[User]> {
    return this.emitAsync('getOnlineUsers')
  }
}

export default new ActivitySocketManager('/')
