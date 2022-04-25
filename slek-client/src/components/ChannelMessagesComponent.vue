<template>
  <q-scroll-area ref="area" style="width: 100%; height: calc(100vh - 150px)">

      <q-chat-message v-for="message in messages"
        class="q-mt-md"
        :text-color = "[taggedMessage(message.content) ? red() : black()]"
        :key="message.id"
        :avatar="getAvatar(message.author.nickName)"
        :name="message.author.nickName"
        :text="[message.content]"
        :stamp="message.createdAt"
        :sent="isMine(message)"
      />

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
      const taggedUser = this.$store.state.auth.user?.nickName
      if (message.includes(taggedUser)) { return true } else { return false }
    },
    black () {
      return 'black'
    },
    red () {
      return 'red'
    },
    scrollMessages () {
      const area = this.$refs.area as QScrollArea
      area && area.setScrollPercentage('vertical', 1.1)
    },
    isMine (message: SerializedMessage): boolean {
      return message.author.id === this.currentUser
    },
    getAvatar (nickName: string) {
      return 'https://ui-avatars.com/api//?background=0D8ABC&color=fff&name=' + nickName + '&length=1'
    }
  }
})
</script>
