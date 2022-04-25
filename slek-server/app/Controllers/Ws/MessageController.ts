import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import type { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import { inject } from '@adonisjs/core/build/standalone'
import User from 'App/Models/User'
import Channel from 'App/Models/Channel'
import Database from '@ioc:Adonis/Lucid/Database'

// inject repository from container to controller constructor
// we do so because we can extract database specific storage to another class
// and also to prevent big controller methods doing everything
// controler method just gets data (validates it) and calls repository
// also we can then test standalone repository without controller
// implementation is bind into container inside providers/AppProvider.ts
@inject(['Repositories/MessageRepository'])
export default class MessageController {
  constructor (private messageRepository: MessageRepositoryContract) {}

  private getUserRoom(user: User): string {
    return `user:${user.id}`
  }

  public async loadMessages({ params }: WsContextContract) {
    return this.messageRepository.getAll(params.name)
  }

  public async addMessage({ params, socket, auth }: WsContextContract, content: string) {
    const message = await this.messageRepository.create(params.name, auth.user!.id, content)
    // broadcast message to other users in channel
    socket.broadcast.emit('message', message)
    // return message to sender
    return message
  }

  public async serveCommand({ params, socket, auth }: WsContextContract, channel:string, command: string, userId: number) {
    let result;
    if (command === "/list"){
      const channel_db = await Channel.findByOrFail("name", channel)
      result = await User.query().whereHas('channels', (query) => {query.where('channels.id', channel_db.id)})
      return result;
    }
    else if (command === "/cancel"){
      const channel_db = await Channel.findByOrFail("name", channel)
      const {role} = await Database
      .from('channel_users')
      .select('role')
      .where("channel_users.user_id", userId).first()

      if (role === 'user'){
        socket.emit('leaveChannel', channel)
        const user = await User.findOrFail(userId)
        await user.related('channels').detach([channel_db.id])
      }
      else if(role === 'admin'){
        socket.nsp.emit("leaveChannel", channel)
        channel_db.delete()
      }
    }

    // TO DO other commands...

    return null
  }
}
