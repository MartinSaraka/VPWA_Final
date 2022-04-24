<template>
  <q-scroll-area ref="area" style="width: 100%; height: calc(100vh - 150px)">
        <q-chat-message
          name="Martin"
          :avatar="getAvatar('Martin')"
          bg-color="red"
          stamp="18.3.2022 at 12:00"
        >
          <div><strong>@Jakub</strong> tagnuta sprava je červená</div>
        </q-chat-message>

    <!-- TO DO         avatar zmenit podla mena -->
      <q-chat-message v-for="message in messages"
        class="q-mt-md"
        :text-color = "[taggedMessage(message.content) ? red() : black()]"
        :key="message.id"
        :avatar="getAvatar(message.author.email)"
        :name="message.author.email"
        :text="[message.content]"
        :stamp="message.createdAt"
        :sent="isMine(message)"
        :log ="log()"
      />

        <q-chat-message
          name="Martin"
          :avatar="getAvatar('Martin')"
          bg-color="amber"
        >
          <div>
            Martin is typing
            <q-spinner-dots class="q-ml-sm" size="2rem" />
          </div>
        </q-chat-message>
      </q-scroll-area>
</template>

<script lang="ts">
import { QScrollArea } from 'quasar'
import { SerializedMessage } from 'src/contracts'
import { defineComponent, PropType } from 'vue'
export default defineComponent({
  name: 'ChannelMessagesComponent',
  props: {
    messages: {
      type: Array as PropType<SerializedMessage[]>,
      default: () => []
    }
  },
  watch: {
    messages: {
      handler () {
        this.$nextTick(() => this.scrollMessages())
      },
      deep: true
    }
  },
  computed: {

    currentUser () {
      return this.$store.state.auth.user?.id
    }
  },
  methods: {
    taggedMessage (message: any) {
      console.log(message)
      const taggedUser = this.$store.state.auth.user?.nickName
      if (message.includes(taggedUser)) { return true } else { return false }
    },
    black () {
      console.log('pici')
      return 'black'
    },
    red () {
      console.log('kokot')
      return 'red'
    },
    log () {
      console.log(this.$store.state.auth.user)
      console.log(this.$store.state.auth.user)
      console.log(this.$store.state.auth.user)
      console.log(this.$store.state.auth.user?.nickName)
      console.log(this.$store.state.auth.user?.nickName)
      console.log(this.$store.state.auth.user?.nickName)
      console.log(this.$store.state.auth.user?.nickName)
    },
    scrollMessages () {
      const area = this.$refs.area as QScrollArea
      area && area.setScrollPercentage('vertical', 1.1)
    },
    isMine (message: SerializedMessage): boolean {
      return message.author.id === this.currentUser
    },
    getAvatar (email: string) {
      return 'https://ui-avatars.com/api//?background=0D8ABC&color=fff&name=' + email + '&length=1'
    }
  }
})
</script>
