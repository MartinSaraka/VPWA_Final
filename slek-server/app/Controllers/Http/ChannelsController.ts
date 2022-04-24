import User from 'App/Models/User'


export default class ChannelsController {

  async getAll({request}) {
    const user_id = request.param('id')
    const user = await User.find(user_id)
    await user!.load('channels')

    const channels = user!.channels

    return channels
  }
}
