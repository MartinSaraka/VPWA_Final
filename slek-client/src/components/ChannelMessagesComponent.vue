<template>
  <q-infinite-scroll ref="area" style="width: 100%; height: calc(100vh - 150px)"
  @load="onLoad" reverse>

 <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner color="primary" name="dots" size="40px" />
        </div>
      </template>
    <!-- TO DO         avatar zmenit podla mena -->
      <q-chat-message v-for="message in temporaryMessages"
        class="q-mt-md"
        :text-color = "[taggedMessage(message.content) ? red() : black()]"
        :key="message.id"
        :avatar="getAvatar(message.author.nickName)"
        :name="message.author.nickName"
        :text="[message.content]"
        :stamp="message.createdAt"
        :sent="isMine(message)"
      />

      </q-infinite-scroll>
</template>

<script lang="ts">
import { QScrollArea } from 'quasar'
import { SerializedMessage } from 'src/contracts'
import { defineComponent, PropType } from 'vue'
export default defineComponent({
  data () {
    return {
      temporaryMessages: this.messages.slice(-5),
      messageGeneratedNumber: 5,
      messagesLenght: this.messages.length
    }
  },
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
        this.fixArrays()
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
    fixArrays () {
      this.temporaryMessages = this.messages.slice(-this.temporaryMessages)
    },
    taggedMessage (message: any) {
      const taggedUser = '@' + this.$store.state.auth.user?.nickName
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
    },
    onLoad (index: number, done: (arg0: boolean) => void) {
      setTimeout(() => {
        let isDone = false
        if (this.temporaryMessages.length + 5 >= this.messages.length) { isDone = true } else {
          this.temporaryMessages = this.messages.slice(-this.messageGeneratedNumber)
          this.messageGeneratedNumber = this.messageGeneratedNumber + 5
        }
        if (this.messages.length === this.temporaryMessages.length) { isDone = true }

        done(isDone)
      }, 2000)
    }
  }
})
</script>
