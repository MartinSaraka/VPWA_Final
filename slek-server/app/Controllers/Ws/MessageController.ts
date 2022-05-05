import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import type { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import { inject } from '@adonisjs/core/build/standalone'
import User from 'App/Models/User'
import Channel from 'App/Models/Channel'
import Database from '@ioc:Adonis/Lucid/Database'
import { ChannelType, UserChannelRole } from 'Contracts/enum'
import { DateTime } from 'luxon'

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

    // broadcast notification to other users
    socket.broadcast.emit('notification', message)

    // return message to sender
    return message
  }

  public async addTyping({ params, socket, auth }: WsContextContract, content: string) {
    const message = await this.messageRepository.create(params.name, auth.user!.id, content)

    // broadcast message to other users in channel
    socket.broadcast.emit('typing', message, auth.user!.id)

    return null
  }

  public async handleInviteDecision({ params, socket, auth }: WsContextContract, channel:string, userId: number,  accepted: boolean) {
    const invited_user_db = await User.find(userId)
    let channel_db = await Channel.findBy("name", channel)

    // if user or channel doesnt exist
    if(invited_user_db === null || channel_db == null) return null

    if(!accepted){
      await invited_user_db.related('channels').detach([channel_db.id])
      return null
    }

    await invited_user_db.related('channels').sync({
      [channel_db.id]: {
        joined_at: DateTime.now().toFormat('dd LLL yyyy HH:mm')
      },
    }, false)

    const updated_channel_db = await Database
    .from('channel_users')
    .select('*')
    .where("channel_users.user_id", userId)
    .where("channel_users.channel_id", channel_db.id)
    .join("channels", "channel_users.channel_id", "channels.id")
    .first()

    // notify to join through socket
    socket.emit('joinChannel', updated_channel_db)

    return null
  }

  public async serveInvite({ params, socket, auth }: WsContextContract, channel:string, command: string, userId: number) {
    if(command.startsWith("/invite")){
      const parsedCommand = command.trim().split(" ")
      if(parsedCommand.length > 2){
        return null
      }

      // find user in db
      const invitedUserName = parsedCommand[1]
      const invited_user_db = await User.findBy("nick_name", invitedUserName)
      const channel_db = await Channel.findBy("name", channel)

      // if user or channel doesnt exist
      if(invited_user_db === null || channel_db == null) return null

      const user_in_channel = await Database
      .from('channel_users')
      .select('*')
      .where("channel_users.user_id", invited_user_db.id)
      .where("channel_users.channel_id", channel_db.id)
      .first()

      if(user_in_channel === null){
        await invited_user_db.related('channels').attach({
          [channel_db.id]: {
            role: UserChannelRole.USER
          },
        })

      // notify user about invitation
      socket.broadcast.emit('channelInvite', channel_db, invited_user_db.id)
    }
  }
}

  public async serveCommand({ params, socket, auth }: WsContextContract, channel:string, command: string, userId: number) {
    if (command === "/list"){
      const channel_db = await Channel.findByOrFail("name", channel)
     // const users = await User.query().whereHas('channels', (query) => {query.where('channels.id', channel_db.id)})

      const users2 = await Database
      .from('users')
      .select('users.id', 'users.nick_name as nickName', 'users.name',
              'users.surname', 'users.email', 'channel_users.role',
              'channel_users.created_at as createdAt', 'channel_users.updated_at as updatedAt')
      .join("channel_users", "users.id", "channel_users.user_id")
      .where("channel_users.channel_id", channel_db.id)

      return users2;
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
    else if (command.startsWith("/revoke")){
      const channel_db = await Channel.findByOrFail("name", channel)
      const  emitedUserRole = await Database.from('channel_users')
      .select('channel_users.role')
      .where("channel_users.user_id", userId)
      .where("channel_users.channel_id", channel_db.id)
      .first()
      const parsedCommand = command.trim().split(" ")
      //console.log(parsedCommand.length)
      console.log(parsedCommand.length)
      if (parsedCommand.length !== 2){
        return null
      }
      let revokingUserName = parsedCommand[1]
      const revokingUser = await User.findBy('nickName', revokingUserName)
      if (revokingUser !== null && emitedUserRole.role === 'user') {
        return null
      } else if (revokingUser !== null && emitedUserRole.role === 'admin') {
        //socket.to(channel_db.name).emit('leaveChannel', channel)

        socket.nsp.emit('revokeChannel', channel, revokingUser.id, userId)
        //socket.emit('leaveChannel', channel)
        await revokingUser.related('channels').detach([channel_db.id])
      }
        else
        {
          socket.nsp.emit('revokeChannel', channel, 0, userId) }
    }
    else if(command.startsWith("/join")){
      let channel_type = ChannelType.PUBLIC

      const parsedCommand = command.trim().split(" ")
      if (parsedCommand.length < 2 || parsedCommand.length > 3){
        return null
      }
      else if (parsedCommand.length === 3){
        if( parsedCommand[2] !== 'private'){
          return null
        }
        channel_type = ChannelType.PRIVATE
      }

      // get user object from db
      const user = await User.findOrFail(userId)

      // find channel
      let channel_name = parsedCommand[1]
      const channel = await Channel.findBy("name", channel_name)

      // create channel and add user to it if channel doesnt exist
      let channel_db
      if(channel === null){
        channel_db = await Channel.create({
          name: channel_name,
          type: channel_type,
        })

        await user.related('channels').attach({
          [channel_db.id]: {
            role: UserChannelRole.ADMIN,
            joined_at: DateTime.now().toFormat('dd LLL yyyy HH:mm')
          },
        })

        channel_db = await Database
        .from('channel_users')
        .select('*')
        .where("channel_users.user_id", user.id)
        .where("channel_users.channel_id", channel_db.id)
        .join("channels", "channel_users.channel_id", "channels.id")
        .first()

        // notify to join through socket
        socket.emit('joinChannel', channel_db)
      }
      else{
        // add user to channel if channel exists and isnt private and user isnt already in
        if(channel.type === ChannelType.PUBLIC && parsedCommand.length == 2){
          const user_in_channel = await Database
          .from('channel_users')
          .select('*')
          .where("channel_users.user_id", userId)
          .where("channel_users.channel_id", channel.id)
          .first()

          if(user_in_channel === null){
            await user.related('channels').attach({
              [channel.id]: {
                role: UserChannelRole.USER,
                joined_at: DateTime.now().toFormat('dd LLL yyyy HH:mm')
              },
            })

            // notify to join through socket
            socket.emit('joinChannel', channel)
          }
        }
      }
    }

    return null
  }
}
