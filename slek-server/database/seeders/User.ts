import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run () {
    const uniqueKey = 'nickName'

    await User.updateOrCreateMany(uniqueKey,[
      {
        nickName: "Jakub54",
        name: "Jakub",
        surname: "Šimko",
        email: 'simko@test.com',
        password: 'secret',
      }
    ])
  }
}
