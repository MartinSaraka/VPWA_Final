<template>
  <q-page class="row items-center justify-evenly">
    <channel-messages-component :messages="messages" :typers="typers" />
  </q-page>
</template>

<script lang="ts">
import ChannelMessagesComponent from 'src/components/ChannelMessagesComponent.vue'
import { SerializedMessage, TyperWithMessage } from 'src/contracts'
import { defineComponent } from 'vue'

export default defineComponent({
  components: { ChannelMessagesComponent },
  name: 'ChannelPage',
  computed: {
    messages (): SerializedMessage[] {
      return this.$store.getters['channels/currentMessages']
    },
    typers (): TyperWithMessage[] {
      return this.$store.getters['channels/currentTypers']
    }
  }
})
</script>
