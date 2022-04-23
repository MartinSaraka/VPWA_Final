import Database from '@ioc:Adonis/Lucid/Database'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'


export default class ChannelsController {

  async getAll({request}) {
    const user_id = request.param('id')

    const channels = await Database
    .from('channel_users')
    .select('name')
    .where('channel_users.user_id', user_id)
    .innerJoin("channels", "channels.id", "channel_users.channel_id")

    return channels
  }
}
