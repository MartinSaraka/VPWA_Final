<template>
<img src="~assets/wave.png" class="wave" alt="login-wave" />
 <div class="row" style="height: 90vh">
    <div class="col-0 col-md-6 flex justify-center content-center">
      <img src="~assets/Chat_SVG.svg" class="responsive" alt="login-image" />
    </div>
    <div
      v-bind:class="{
        'justify-center': $q.screen.md || $q.screen.sm || $q.screen.xs,
      }"
      class="col-12 col-md-6 flex content-center"
    >
<q-card
        v-bind:style="$q.screen.lt.sm ? { width: '80%' } : { width: '50%' }"
      >
        <q-card-section>
          <q-avatar size="103px" class="absolute-center shadow-10">
            <img src="~assets/avatar.svg" alt="avatar" />
          </q-avatar>
        </q-card-section>
        <q-card-section>
          <div class="q-pt-lg">
            <div class="col text-h6 ellipsis flex justify-center">
              <h2 class="text-h2 text-uppercase q-my-none text-weight-regular">
                ICA
              </h2>
            </div>
            <h6
              class="text-h6 q-my-none text-weight-regular flex justify-center"
            >
              Innovative Communication App
            </h6>
          </div>
        </q-card-section>

    <q-form ref="form" class="q-gutter-md">
      <q-card-section>
        <q-input
          name="email"
          id="email"
          v-model.trim="credentials.email"
          type="email"
          label="Email"
          autofocus
        />
        <q-input
          id="password"
          name="password"
          v-model="credentials.password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          bottom-slots
        >
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility' : 'visibility_off'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
        <q-checkbox
          id="rememberMe"
          v-model="credentials.remember"
          label="Remember me"
        />
      </q-card-section>

      <q-card-actions >
        <q-btn label="" size="sm" flat :to="{ name: 'register' }"></q-btn>
        <q-btn
          class="full-width"
          label="Login"
          color="primary"
          rounded
          :loading="loading"
          @click="onSubmit"
        />
<q-btn label="Create account" size="sm" flat :to="{ name: 'register' }"></q-btn>
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
  name: 'LoginPage',
  data () {
    return {
      credentials: { email: '', password: '', remember: false },
      showPassword: false
    }
  },
  computed: {
    redirectTo (): RouteLocationRaw {
      return (this.$route.query.redirect as string) || { name: 'home' }
    },
    loading (): boolean {
      return this.$store.state.auth.status === 'pending'
    }
  },
  methods: {
    onSubmit () {
      this.$store.dispatch('auth/login', this.credentials).then(() => this.$router.push(this.redirectTo))
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
