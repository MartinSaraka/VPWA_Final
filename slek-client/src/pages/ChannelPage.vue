<template>
  <q-page class="row items-center justify-evenly">
    <CommandsPage v-if="activeChannel === 'generalInformation' || activeChannel === null"> </CommandsPage>
    <channel-messages-component :messages="messages" :typers="typers" />
  </q-page>
</template>

<script lang="ts">
import ChannelMessagesComponent from 'src/components/ChannelMessagesComponent.vue'
import { SerializedMessage, TyperWithMessage } from 'src/contracts'
import { defineComponent } from 'vue'
import CommandsPage from 'src/pages/CommandsPage.vue'
export default defineComponent({
  components: { ChannelMessagesComponent, CommandsPage },
  name: 'ChannelPage',
  computed: {
    messages (): SerializedMessage[] {
      return this.$store.getters['channels/currentMessages']
    },
    typers (): TyperWithMessage[] {
      return this.$store.getters['channels/currentTypers']
    },
    activeChannel () {
      return this.$store.state.channels.active
    }
  }
})

</script>
