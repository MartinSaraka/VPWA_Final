<template>
  <div class="q-py-sm">
    <q-list v-if="activeChannel ==='generalInformation' || activeChannel ===null" separator class="shadow-5">
      <q-item class="q-mb-sm" v-for="(command, index) in commands" :key="index" >

        <q-item-section avatar>
            <q-avatar size="lg" color="primary" text-color="white" icon="terminal" />
        </q-item-section>

        <q-item-section >
            <q-item-label class="text-weight-bold text-primary">{{command.command}}</q-item-label>
            <q-item-label class="text-black" caption>{{command.description}}</q-item-label>
        </q-item-section>

        </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface Command {
  command: string;
  description: string;
}

const commands: Command[] = [
  { command: '/join channelName [private]', description: 'Create a private communication channel' },
  { command: '/join channelName', description: 'Create or join a public communication channel' },
  { command: '/invite nickName', description: 'Invite the user to the communication channel' },
  { command: '/revoke nickName', description: 'Expel a user from a private communication channel' },
  { command: '/kick nickName', description: 'Expel a user from a public communication channel' },
  { command: '/quit', description: 'Cancel the communication channel' },
  { command: '/cancel', description: 'Leave the communication channel' },
  { command: '/list', description: 'Display the list of channel members' },
  { command: '@nickName', description: 'Command to address a message to a specific user' }
]

export default defineComponent({
  name: 'CommandsPage',
  setup () {
    return {
      commands
    }
  },
  computed: {

    activeChannel () {
      alert('U can use only join in generalInformation channel')
      return this.$store.state.channels.active
    }
  }
}
)
</script>
