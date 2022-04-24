<template>
  <img src="~assets/wave.png" class="wave" alt="register-wave" />
    <div class="row" style="height: 90vh">
      <div class="col-0 col-md-6 flex justify-center content-center">
        <img src="~assets/Chat_SVG.svg" class="responsive" alt="register-image" />
      </div>
      <div v-bind:class="{
        'justify-center': $q.screen.md || $q.screen.sm || $q.screen.xs,
      }" class="col-12 col-md-6 flex content-center">

<q-card
        v-bind:style="$q.screen.lt.sm ? { width: '80%' } : { width: '50%' }"
      >
        <q-form ref="form" class="q-gutter-md">
          <q-card-section>
            <q-input name="nick_name" label="Nickname" id="nick_name" type="name" v-model.trim="form.nick_name"
              autofocus>
            </q-input>
            <q-input name="name" label="Username" id="name" type="name" v-model.trim="form.name">
            </q-input>
            <q-input name="surname" label="Surname" id="surname" type="name" v-model.trim="form.surname">
            </q-input>
            <q-input name="email" id="email" v-model.trim="form.email" type="email" label="Email" />
            <q-input id="password" name="password" v-model="form.password" label="Password"
              :type="showPassword ? 'text' : 'password'" bottom-slots>
              <template v-slot:append>
                <q-icon :name="showPassword ? 'visibility' : 'visibility_off'" class="cursor-pointer"
                  @click="showPassword = !showPassword" />
              </template>
            </q-input>
            <q-input id="password_confirmation" name="password_confirmation" v-model="form.passwordConfirmation"
              label="Confirm Password" :type="showPassword ? 'text' : 'password'" bottom-slots>
              <template v-slot:append>
                <q-icon :name="showPassword ? 'visibility' : 'visibility_off'" class="cursor-pointer"
                  @click="showPassword = !showPassword" />
              </template>
            </q-input>
          </q-card-section>
          <q-card-actions >
        <q-btn label="" size="sm" flat :to="{ name: 'login' }"></q-btn>
        <q-btn
          class="full-width"
          label="Register"
          color="primary"
          rounded
          :loading="loading"
          @click="onSubmit"
        />
<q-btn label="Login" size="sm" flat :to="{ name: 'login' }"></q-btn>
</q-card-actions>
        </q-form>
        </q-card>
      </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouteLocationRaw } from 'vue-router'

export default defineComponent({
  name: 'RegisterPage',
  data () {
    return {
      form: { nick_name: '', name: '', surname: '', email: '', password: '', passwordConfirmation: '' },
      showPassword: false
    }
  },
  computed: {
    redirectTo (): RouteLocationRaw {
      return { name: 'login' }
    },
    loading (): boolean {
      return this.$store.state.auth.status === 'pending'
    }
  },
  methods: {
    onSubmit () {
      this.$store.dispatch('auth/register', this.form).then(() => this.$router.push(this.redirectTo))
    }
  }
})
</script>

<style scoped>
.wave {
  position: fixed;
  height: 100%;
  left: 0;
  bottom: 0;
  z-index: -1;
}
</style>
