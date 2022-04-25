import Database from '@ioc:Adonis/Lucid/Database'

export default class ChannelsController {

  async getAll({request}) {
    const user_id = request.param('id')
    const channels = await Database
      .from('channel_users')
      .select('*')
      .where("channel_users.user_id", user_id)
      .join("channels", "channel_users.channel_id", "channels.id")

    return channels
  }
}
