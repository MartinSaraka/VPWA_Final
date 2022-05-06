import { User } from 'src/contracts'
import { MutationTree } from 'vuex'
import state, { AuthStateInterface } from './state'

const mutation: MutationTree<AuthStateInterface> = {
  AUTH_START (state) {
    state.status = 'pending'
    state.errors = []
  },
  AUTH_SUCCESS (state, user: User | null) {
    state.status = 'success'
    state.user = user
  },
  AUTH_ERROR (state, errors) {
    state.status = 'error'
    state.errors = errors
  },
  CHANGE_USER_STATE (state, currentState: string) {
    if (state.user !== null) {
      state.user.currentState = currentState
    }
  }
}

export default mutation
