<template>
  <q-infinite-scroll class="q-px-md" style="width: 100%;"
  @load="onLoad" reverse>

    <template v-slot:loading>
      <div class="row justify-center q-my-md">
        <q-spinner color="primary" name="dots" size="40px" />
      </div>
    </template>

    <q-chat-message v-for="message in temporaryMessages"
      class="q-mt-md"
      text-color="black"
      :bg-color = "[taggedMessage(message.content) ? red() : null]"
      :key="message.id"
      :avatar="getAvatar(message.author.nickName)"
      :name="message.author.nickName"
      :text="[message.content]"
      :stamp="message.createdAt"
      :sent="isMine(message)"
    />

    <q-chat-message v-for="typer in typers"
      class="q-mt-md"
      bg-color="amber"
      :key="typer.name"
      :name=typer.name
      :avatar="getAvatar(typer.name)"
    >
      <div>
        <q-btn outline class="q-mr-sm" @click="setOpenedTyper({channel: activeChannel, userNickname: typer.name, value: true})">{{typer.name}}</q-btn> is typing
        <q-spinner-dots class="q-ml-sm" size="2rem" />

        <q-dialog v-model="typer.isOpened" persistent>
          <q-card style="width: 700px; max-width: 80vw">
            <q-card-actions align="right" class="q-mb-none">
              <q-btn dense flat icon="close" @click="setOpenedTyper({channel: activeChannel, userNickname: typer.name, value: false})">
                <q-tooltip>Close</q-tooltip>
              </q-btn>
            </q-card-actions>

            <q-card-section align="center">
              <div class="q-mb-md q-mt-sm text-h6">
              {{typer.name}} is typing: {{typer.message}}
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>
    </q-chat-message>

  </q-infinite-scroll>
</template>

<script lang="ts">
import { QScrollArea } from 'quasar'
import { SerializedMessage, TyperWithMessage } from 'src/contracts'
import { defineComponent, PropType } from 'vue'
import { mapMutations } from 'vuex'

export default defineComponent({
  data () {
    return {
      temporaryMessages: this.messages.slice(-5),
      messageGeneratedNumber: 5
    }
  },
  name: 'ChannelMessagesComponent',
  props: {
    messages: {
      type: Array as PropType<SerializedMessage[]>,
      default: () => []
    },
    typers: {
      type: Array as PropType<TyperWithMessage[]>,
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
    },
    activeChannel () {
      return this.$store.state.channels.active
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
        if (this.temporaryMessages.length + 5 >= this.messages.length) { this.temporaryMessages = this.messages; isDone = true } else {
          this.temporaryMessages = this.messages.slice(-this.messageGeneratedNumber)
          this.messageGeneratedNumber = this.messageGeneratedNumber + 5
        }
        if (this.messages.length === this.temporaryMessages.length) { isDone = true }

        done(isDone)
      }, 2000)
    },
    ...mapMutations('channels', {
      setOpenedTyper: 'SET_OPENED_TYPER'
    })
  }
})
</script>
