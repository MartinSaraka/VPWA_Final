import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import RegisterUserValidator from 'App/Validators/RegisterUserValidator'
import { UserChannelRole } from 'Contracts/enum'
import { DateTime } from 'luxon'
export default class AuthController {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  async register({ request }: HttpContextContract) {
    const data = await request.validate(RegisterUserValidator)
    const user = await User.create(data)
    // join user to general channel
    const generalInformation = await Channel.findByOrFail('name', 'generalInformation')
    await user.related('channels').attach({
      [generalInformation.id]: {
        role: UserChannelRole.USER,
        joined_at: DateTime.now().toFormat('dd LLL yyyy HH:mm'),
      },
    })
    const general = await Channel.findByOrFail('name', 'general')
    await user.related('channels').attach({
      [general.id]: {
        role: UserChannelRole.USER,
        joined_at: DateTime.now().toFormat('dd LLL yyyy HH:mm'),
      },
    })

    return user
  }

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  async login({ auth, request }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    return auth.use('api').attempt(email, password)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  async logout({ auth }: HttpContextContract) {
    return auth.use('api').logout()
  }

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  async me({ auth }: HttpContextContract) {
    await auth.user!.load('channels')
    return auth.user
  }
}
