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
  constructor(private messageRepository: MessageRepositoryContract) { }

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

  public async serveCommand({ params, socket, auth }: WsContextContract, channel: string, command: string, userId: number) {
    if (command === "/list") {
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
    else if (command === "/cancel") {
      const channel_db = await Channel.findByOrFail("name", channel)
      const emitedUserRole = await Database.from('channel_users')
        .select('channel_users.role')
        .where("channel_users.user_id", userId)
        .where("channel_users.channel_id", channel_db.id)
        .first()

      if (emitedUserRole.role === 'user') {
        socket.emit('leaveChannel', channel)
        const user = await User.findOrFail(userId)
        await user.related('channels').detach([channel_db.id])
      }
      else if (emitedUserRole.role === 'admin') {
        socket.nsp.emit("leaveChannel", channel)
        channel_db.delete()
      }
    }
    else if (command === "/quit") {
      console.log('hm')
      const channel_db = await Channel.findByOrFail("name", channel)
      const emitedUserRole = await Database.from('channel_users')
        .select('channel_users.role')
        .where("channel_users.user_id", userId)
        .where("channel_users.channel_id", channel_db.id)
        .first()
      if (emitedUserRole.role === 'admin') {
        socket.nsp.emit("leaveChannel", channel)
        channel_db.delete()
      }
    }
    else if (command.startsWith("/revoke")) {
      const channel_db = await Channel.findByOrFail("name", channel)
      const emitedUserRole = await Database.from('channel_users')
        .select('channel_users.role')
        .where("channel_users.user_id", userId)
        .where("channel_users.channel_id", channel_db.id)
        .first()
      const parsedCommand = command.trim().split(" ")
      //console.log(parsedCommand.length)
      console.log(parsedCommand.length)
      if (parsedCommand.length !== 2) {
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
      else {
        socket.nsp.emit('revokeChannel', channel, 0, userId)
      }
    }
    else if (command.startsWith("/kick")) {
      console.log('1')
      const channel_db = await Channel.findByOrFail("name", channel)
      const emitedUserRole = await Database.from('channel_users')
        .select('channel_users.role')
        .where("channel_users.user_id", userId)
        .where("channel_users.channel_id", channel_db.id)
        .first()

        console.log('2')
      const parsedCommand = command.trim().split(" ")

      if (parsedCommand.length !== 2) {
        return null
      }
      let kickedUserName = parsedCommand[1]
      const kickedUser = await User.findBy('nickName', kickedUserName)
      console.log('hm')
      if (kickedUser === null ){
        console.log('return null 1')
        return null}
        console.log('3')
      const emitedUserTable = await Database.from('channel_users')
        .select('*')
        .where("channel_users.user_id", kickedUser.id)
        .where("channel_users.channel_id", channel_db.id)
        .first()



      console.log(emitedUserTable)


      if(emitedUserTable ===null){
        console.log('2')
        return null}
      if(emitedUserRole.role === 'user') {
        console.log('5')

        const user_in_channel = await Database
          .from('channel_users_bans')
          .select('*')
          .where("channel_users_bans.user_id", kickedUser.id)
          .where("channel_users_bans.sender_id", userId)
          .where("channel_users_bans.channel_id", channel_db.id)
          .first()

        console.log('hm1')
        if (user_in_channel === null) {
          console.log('som pri vytvarani')
          console.log(kickedUser.name + ' ' + channel_db.id)
          //await kickedUser.related('channels').attach([channel_db.id])




          await kickedUser.related('bans').attach({
            [channel_db.id]: {
              sender_id:userId,
              role: UserChannelRole.USER

            },
          })



          const users_in_channel1 = await Database.rawQuery('Select * from channel_users_bans where channel_users_bans.user_id = ? AND channel_users_bans.channel_id = ?', [kickedUser.id,channel_db.id])
          //const users_in_channel2 = await Database.rawQuery('Select channel_users_bans.role from channel_users_bans where channel_users_bans.user_id = ? AND channel_users_bans.channel_id = ?', [kickedUser.id,channel_db.id])
          if(users_in_channel1.length >= 3){

          await kickedUser.related('bans').sync({
              [channel_db.id]: {
                banned_at: DateTime.now().toFormat('dd LLL yyyy HH:mm')
              },
            }, false)

            console.log('treti kick - je bannuty a kicknuty')
            socket.nsp.emit('revokeChannel', channel, kickedUser.id, userId)
        //socket.emit('leaveChannel', channel)
        await kickedUser.related('channels').detach([channel_db.id])
          }
          console.log('vytvoril som')


        }
        else{console.log('uz je')}

      }
      else if (kickedUser !== null && emitedUserRole.role === 'admin') {

        const user_in_channel = await Database
          .from('channel_users_bans')
          .select('*')
          .where("channel_users_bans.user_id", kickedUser.id)
          .where("channel_users_bans.sender_id", userId)
          .where("channel_users_bans.channel_id", channel_db.id)
          .first()

        console.log('hm1')

        if (user_in_channel === null) {
        await kickedUser.related('bans').attach({
          [channel_db.id]: {
            sender_id:userId,
            role: UserChannelRole.ADMIN

          },
        })
        await kickedUser.related('bans').sync({
          [channel_db.id]: {
            banned_at: DateTime.now().toFormat('dd LLL yyyy HH:mm')
          },
        }, false)
        socket.nsp.emit('revokeChannel', channel, kickedUser.id, userId)
        //socket.emit('leaveChannel', channel)
        await kickedUser.related('channels').detach([channel_db.id])}
      }
      console.log('hm2')
      }


    else if (command.startsWith("/join")) {
      let channel_type = ChannelType.PUBLIC

      const parsedCommand = command.trim().split(" ")
      if (parsedCommand.length < 2 || parsedCommand.length > 3) {
        return null
      }
      else if (parsedCommand.length === 3) {
        if (parsedCommand[2] !== 'private') {
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
      if (channel === null) {
        channel_db = await Channel.create({
          name: channel_name,
          type: channel_type,
        })

        await user.related('channels').attach({
          [channel_db.id]: {
            role: UserChannelRole.ADMIN
          },
        })

        // notify to join through socket
        socket.emit('joinChannel', channel_db)
      }
      else {
        // add user to channel if channel exists and isnt private and user isnt already in
        if (channel.type === ChannelType.PUBLIC && parsedCommand.length == 2) {
          const user_in_channel = await Database
            .from('channel_users')
            .select('*')
            .where("channel_users.user_id", userId)
            .where("channel_users.channel_id", channel.id)
            .first()

          if (user_in_channel === null) {
            await user.related('channels').attach({
              [channel.id]: {
                role: UserChannelRole.USER
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
