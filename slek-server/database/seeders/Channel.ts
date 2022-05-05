import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Channel from 'App/Models/Channel'
import { ChannelType } from 'Contracts/enum'

export default class ChannelSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'name'

    await Channel.updateOrCreateMany(uniqueKey, [
      {
        name: 'general',
        type: ChannelType.PUBLIC,
      },
      {
        name: 'test',
        type: ChannelType.PUBLIC,
      },
    ])
  }
}
