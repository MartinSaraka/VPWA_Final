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

 public checkTooOld(date_string : string){
    const date_message = Date.parse(date_string)
    const date_now = Date.now()

    const difference_in_days = (date_now - date_message) / (1000 * 3600 * 24)

    if(difference_in_days >= 30){
      return true
    }

    return false
  }

  public async loadMessages({ socket, auth, params }: WsContextContract) {
    const user_id = auth.user!.id
    let channels = await Database.from('channel_users')
      .select('*')
      .where('channel_users.user_id', user_id)
      .join('channels', 'channel_users.channel_id', 'channels.id')

    for(let i=0; i < channels.length; i++){
      const channel_id = channels[i].id
      const messages = await Database.from('messages')
      .select('messages.created_at')
      .where('messages.channel_id', channel_id)

      // channel has no messages and is older than 30 days OR last message is older than 30 days
      if( (messages.length === 0 && this.checkTooOld(channels[i].created_at) ) ||
          (messages.length > 0 && this.checkTooOld(messages[messages.length-1].created_at))
        ){
          const channel = await Channel.findOrFail(channel_id)
          socket.nsp.emit("leaveChannel", channel.name)
          await channel.delete()
      }
    }

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

  public async addTyping({ params, socket, auth }: WsContextContract, channel: string, content: string) {
    // broadcast message to other users in channel
    socket.broadcast.emit('typing', channel, content, auth.user?.nickName)

    return null
  }

  public async handleInviteDecision({ params, socket, auth }: WsContextContract, channel: string, userId: number, accepted: boolean) {
    const invited_user_db = await User.find(userId)
    let channel_db = await Channel.findBy("name", channel)

    // if user or channel doesnt exist
    if (invited_user_db === null || channel_db == null) return null

    if (!accepted) {
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

  public async serveInvite({ params, socket, auth }: WsContextContract, channel: string, command: string, userId: number) {
    const parsedCommand = command.trim().split(" ")
    if (parsedCommand.length !== 2 ) {
      return null
    }

    // find user in db
    const invitedUserName = parsedCommand[1]
    const invited_user_db = await User.findBy("nick_name", invitedUserName)
    const channel_db = await Channel.findBy("name", channel)

    // if user or channel doesnt exist
    if (invited_user_db === null || channel_db == null) return null

    const sender_in_channel = await Database
      .from('channel_users')
      .select('*')
      .where("channel_users.user_id", userId)
      .where("channel_users.channel_id", channel_db.id)
      .first()
if(sender_in_channel === null){
  return null
}
    // if channel is private only admin can make invites
    if (sender_in_channel.role == UserChannelRole.USER && channel_db.type == ChannelType.PRIVATE) {
      return null
    }

    if (sender_in_channel.role == UserChannelRole.USER){

      const user_in_channel1 = await Database
      .from('channel_users_bans')
      .select('*')
      .where("channel_users_bans.user_id", invited_user_db.id)
      .where("channel_users_bans.channel_id", channel_db.id)
      .first()

    console.log(user_in_channel1)
    if (user_in_channel1 !== null && user_in_channel1.banned_at !== null) {
      console.log('nemozem invetnut lebo som user a on ma ban')
      return null
    }


    }
    else{
      const user_in_channel1 = await Database
      .from('channel_users_bans')
      .select('*')
      .where("channel_users_bans.user_id", invited_user_db.id)
      .where("channel_users_bans.channel_id", channel_db.id)
      .first()

    console.log(user_in_channel1)
    if (user_in_channel1 !== null && user_in_channel1.banned_at !== null) {
      console.log('Bol zabanovany no odbanoval som - admin')
      await invited_user_db.related('bans').detach([channel_db.id])

    }
    }
    const user_in_channel = await Database
      .from('channel_users')
      .select('*')
      .where("channel_users.user_id", invited_user_db.id)
      .where("channel_users.channel_id", channel_db.id)
      .first()

    if (user_in_channel === null) {
      await invited_user_db.related('channels').attach({
        [channel_db.id]: {
          role: UserChannelRole.USER
        },
      })

      const updated_channel_db = await Database
        .from('channel_users')
        .select('*')
        .where("channel_users.user_id", invited_user_db.id)
        .where("channel_users.channel_id", channel_db.id)
        .join("channels", "channel_users.channel_id", "channels.id")
        .first()

      // notify user about invitation
      socket.broadcast.emit('channelInvite', updated_channel_db, invited_user_db.id)
    }
  }

  public async getUsersList({socket}: WsContextContract, channel:string, onlineUsers : User[]) {
    const channel_db = await Channel.findByOrFail("name", channel)

    const users_db = await Database
    .from('users')
    .select('users.id', 'users.nick_name as nickName', 'users.state as currentState', 'users.name',
            'users.surname', 'users.email', 'channel_users.role',
            'channel_users.created_at as createdAt', 'channel_users.updated_at as updatedAt')
    .join("channel_users", "users.id", "channel_users.user_id")
    .where("channel_users.channel_id", channel_db.id)

    // prejdi online so vsetkymi v DB a ak neni state null tak je typek DND
    let final_users : User[] = []

    for (let i=0; i < users_db.length; i++){
      // user is dnd
      if(users_db[i].currentState != null){
        users_db[i].currentState = 'dnd'
        final_users.push(users_db[i])
        continue
      }

      // check if is online & set online
      for (let j = 0; j < onlineUsers.length; j++) {
        if (users_db[i].nickName === onlineUsers[j].nickName) {
            users_db[i].currentState = 'online'
        }
      }

      // user is offline
      if(users_db[i].currentState === null){
        users_db[i].currentState = 'offline'
      }

      final_users.push(users_db[i])
    }

    return final_users;
  }

  public async serveCommand({ params, socket, auth }: WsContextContract, channel:string, command: string, userId: number) {
    if (command === "/cancel"){
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
      const channel_db = await Channel.findByOrFail("name", channel)
      if(channel_db.type == ChannelType.PRIVATE){
        return null
      }
      const emitedUserRole = await Database.from('channel_users')
        .select('channel_users.role')
        .where("channel_users.user_id", userId)
        .where("channel_users.channel_id", channel_db.id)
        .first()

      const parsedCommand = command.trim().split(" ")

      if (parsedCommand.length !== 2) {
        return null
      }
      let kickedUserName = parsedCommand[1]
      const kickedUser = await User.findBy('nickName', kickedUserName)
      console.log('hm')
      if (kickedUser === null) {
        return null
      }
      const emitedUserTable = await Database.from('channel_users')
        .select('*')
        .where("channel_users.user_id", kickedUser.id)
        .where("channel_users.channel_id", channel_db.id)
        .first()



      console.log(emitedUserTable)


      if (emitedUserTable === null) {
        return null
      }
      if (emitedUserRole.role === 'user') {

        const user_in_channel = await Database
          .from('channel_users_bans')
          .select('*')
          .where("channel_users_bans.user_id", kickedUser.id)
          .where("channel_users_bans.sender_id", userId)
          .where("channel_users_bans.channel_id", channel_db.id)
          .first()

        if (user_in_channel === null) {
          console.log('som pri vytvarani')
          console.log(kickedUser.name + ' ' + channel_db.id)
          //await kickedUser.related('channels').attach([channel_db.id])

          await kickedUser.related('bans').attach({
            [channel_db.id]: {
              sender_id: userId,
              role: UserChannelRole.USER

            },
          })



          const users_in_channel1 = await Database.rawQuery('Select * from channel_users_bans where channel_users_bans.user_id = ? AND channel_users_bans.channel_id = ?', [kickedUser.id, channel_db.id])
          //const users_in_channel2 = await Database.rawQuery('Select channel_users_bans.role from channel_users_bans where channel_users_bans.user_id = ? AND channel_users_bans.channel_id = ?', [kickedUser.id,channel_db.id])
          if (users_in_channel1.length >= 3) {

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
        else { console.log('uz je') }

      }
      else if (kickedUser !== null && emitedUserRole.role === 'admin') {

        const user_in_channel = await Database
          .from('channel_users_bans')
          .select('*')
          .where("channel_users_bans.user_id", kickedUser.id)
          .where("channel_users_bans.sender_id", userId)
          .where("channel_users_bans.channel_id", channel_db.id)
          .first()


        if (user_in_channel === null) {
          await kickedUser.related('bans').attach({
            [channel_db.id]: {
              sender_id: userId,
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
          await kickedUser.related('channels').detach([channel_db.id])
        }
      }
      console.log('koniec kicku')
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
      else {
        // add user to channel if isnt private and user isnt already in
        if (parsedCommand.length == 2 && channel.type === ChannelType.PUBLIC) {
          const user_in_channel1 = await Database
            .from('channel_users_bans')
            .select('*')
            .where("channel_users_bans.user_id", user.id)
            .where("channel_users_bans.channel_id", channel.id)
            .first()

          if (user_in_channel1 !== null && user_in_channel1.banned_at !== null) {
            return null
          }
        }

        const user_in_channel = await Database
          .from('channel_users')
          .select('*')
          .where("channel_users.user_id", userId)
          .where("channel_users.channel_id", channel.id)
          .first()

        if (user_in_channel === null) {
          await user.related('channels').attach({
            [channel.id]: {
              role: UserChannelRole.USER,
              joined_at: DateTime.now().toFormat('dd LLL yyyy HH:mm')
            },
          })

          channel_db = await Database
            .from('channel_users')
            .select('*')
            .where("channel_users.user_id", user.id)
            .where("channel_users.channel_id", channel.id)
            .join("channels", "channel_users.channel_id", "channels.id")
            .first()

          // notify to join through socket
          socket.emit('joinChannel', channel_db)
        }
      }
    }

    return null
  }
}
