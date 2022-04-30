<template>
  <q-layout view="lHh LpR lFr">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-center">
          {{ activeChannel }}
        </q-toolbar-title>

        <q-btn class="q-mr-xl" color="blue" @click="notificationsDialog = true">
          Notifications options
        </q-btn>
        <q-btn
          class="q-mr-sm"
          round
          color="white"
          text-color="primary"
          icon="group"
          @click="toggleRightDrawer"
        />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left">
      <q-img
        class="absolute-top bg-blue"
        src="https://cdn.quasar.dev/img/material.png"
        style="height: 200px"
      >
        <div class="absolute-top bg-transparent column items-center">
          <div class="column items-center">
            <q-avatar rounded color="primary" size="48px">
              {{this.$store.state.auth.user?.nickName[0]}}
              <q-badge
                v-if="statePick === 'online'"
                floating
                rounded
                color="green"
              />
              <q-badge
                v-if="statePick === 'dnd'"
                floating
                rounded
                color="yellow-10"
              />
              <q-badge
                v-if="statePick === 'offline'"
                floating
                rounded
                color="grey-6"
              />
            </q-avatar>
            <div class="text-h6 ellipsis">{{this.$store.state.auth.user?.nickName}}</div>
          </div>

          <q-list class="column items-center">
            <q-item>
              <q-btn-toggle
                v-model="statePick"
                push
                glossy
                color="white"
                text-color="primary"
                toggle-color="primary"
                toggle-text-color="white"
                :options="[
                  { label: 'Online', value: 'online' },
                  { label: 'DND', value: 'dnd' },
                  { label: 'Offline', value: 'offline' },
                ]"
              />
            </q-item>

            <q-item>
              <q-btn
                color="white"
                @click="logout"
                text-color="primary"
                label="Logout"
              />
            </q-item>
          </q-list>
        </div>
      </q-img>
      <q-scroll-area
        style="
          height: calc(100% - 200px);
          margin-top: 200px;
          border-right: 1px solid #ddd;
        "
      >
        <q-list>
          <q-item>
            <q-item-section
              ><q-btn
                color="blue "
                label="Create channel"
                icon="create"
                @click="createChannelDialog = true"
              />
            </q-item-section>
          </q-item>

          <q-separator inset />

          <q-item class="text-center">
            <q-item-section> Channels </q-item-section>
          </q-item>

          <q-separator inset />

          <template v-for="(channel, index) in channels" :key="index">
            <q-item
              v-if="channel.isTopped"
              clickable
              v-ripple
              @click="invitedDialog = true"
            >
              <q-item-section avatar>
                <q-icon :name="getChannelTypeIcon(channel.type)" />
              </q-item-section>

              <q-item-section>
                {{ channel.name }}
              </q-item-section>
              <q-badge class="q-mr-sm" align="middle" color="red">
                INVITED
              </q-badge>
            </q-item>

            <q-item
              v-else
              clickable
              v-ripple
              :to="{ name: 'Channel', params: { id: index } }"
              :active="channel.name === activeChannel"
              @click="setActiveChannel(channel.name)"
            >
              <q-item-section avatar>
                <q-icon :name="getChannelTypeIcon(channel.type)" />
              </q-item-section>
              <q-item-section>
                {{ channel.name }}
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-drawer width="250" v-model="rightDrawerOpen" side="right" bordered>
      <div class="column items-center">
        <q-btn
          class="q-my-md"
          style="width: 80%"
          color="primary"
          size="sm"
          icon="exit_to_app"
          label="Leave / Delete channel"
          @click="leaveChannel"
        />
      </div>

      <q-separator inset />

      <div align="center" class="text-h6 text-weight-bold q-py-sm">Members</div>

      <q-separator inset />

      <q-list class="q-pb-xl">
        <template v-for="(user, index) in users" :key="index">
          <q-item clickable v-ripple class="q-mt-sm q-pl-lg text-center">
            <q-item-section avatar>
              <q-avatar rounded color="primary" text-color="white">
                {{user.nickName[0]}}
                <q-badge floating rounded color="green" />
              </q-avatar>
            </q-item-section>
            <q-item-section class="text-center text-subtitle1">{{user.nickName}}</q-item-section>
            <q-item-section avatar>
              <q-icon
                :name="getPanelIcon(user.role)"
                class="text-primary vertical-middle text-center"
                size="md"
              />
            </q-item-section>
          </q-item>
        </template>
      </q-list>

      <div class="bg-white absolute-bottom">
        <q-separator inset />

        <div class="row justify-center">
          <q-chip
            size="lg"
            icon="admin_panel_settings"
            text-color="primary"
            color="white"
          >
            Admin
          </q-chip>

          <q-chip
            size="lg"
            icon="account_circle"
            text-color="primary"
            color="white"
          >
            User
          </q-chip>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer>
        <q-toolbar class="bg-grey-1 text-black row">
    <q-input
        v-model="message"
        :disable="loading"
        @keydown.enter.prevent="send"
        rounded
        outlined
        dense
        class="col-grow q-my-md q-my-sm"
        standout="bg-grey-3 text-white"
        placeholder="Type a message"
    >
      <template v-slot:append>
        <q-btn clas="q-ml-sm" dense flat icon="send" :disable="loading" @click="send" />
      </template>

      <template v-slot:prepend>
        <q-btn
          class="q-mr-sm"
          flat
          round
          size="md"
          color="primary"
          icon="info"
          to="/"
        />
      </template>
    </q-input>
        </q-toolbar>
    </q-footer>

    <q-dialog v-model="notificationsDialog">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-actions align="right" class="q-mb-none">
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-card-actions>

        <q-card-section align="center">
          <div class="text-h5 ellipsis">Notifications options</div>
        </q-card-section>

        <q-separator />
        <q-card-section align="center" class="q-my-md">
          <q-btn-toggle
            v-model="isReceivingAllNotifications"
            push
            toggle-color="primary"
            :options="[
              { value: true, slot: 'one' },
              { value: false, slot: 'two' },
            ]"
          >
            <template v-slot:one>
              <div class="row items-center no-wrap">
                <q-icon left name="circle" color="green" />
                <div class="text-center">All notifications</div>
              </div>
            </template>

            <template v-slot:two>
              <div class="row items-center no-wrap">
                <q-icon
                  left
                  name="do_not_disturb_on_total_silence"
                  color="yellow-10"
                />
                <div class="text-center">Only tagged messages notificatons</div>
              </div>
            </template>
          </q-btn-toggle>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="createChannelDialog">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-actions align="right" class="q-mb-none">
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-card-actions>

        <q-card-section align="center">
          <div class="text-h5 ellipsis">Create your own channel</div>
        </q-card-section>

        <q-card-section align="center">
          <q-btn-toggle
            v-model="createChannelTypeOptions"
            push
            toggle-color="primary"
            :options="[
              { value: 'public', slot: 'public' },
              { value: 'private', slot: 'private' },
            ]"
          >
            <template v-slot:public>
              <div class="row items-center no-wrap">
                <q-icon left name="public" />
                <div class="text-center">Public</div>
              </div>
            </template>

            <template v-slot:private>
              <div class="row items-center no-wrap">
                <q-icon left name="lock" />
                <div class="text-center">Private</div>
              </div>
            </template>
          </q-btn-toggle>
        </q-card-section>
        <div class="q-pa-md flex justify-center">
          <q-input rounded outlined v-model="createChannelText" label="Channel name" />
        </div>

        <q-separator />
        <div class="flex justify-center q-pa-md">
          <q-btn
            v-close-popup
            color="blue "
            label="Create channel"
            icon="create"
            rounded
            @click="createChannel()"
          />
        </div>
      </q-card>
    </q-dialog>

    <q-dialog v-model="invitedDialog">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-actions align="right" class="q-mb-none">
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-card-actions>

        <q-card-section align="center">
          <div class="q-mt-md text-h5 ellipsis">
            You were invited to VPWA channel
          </div>
        </q-card-section>

        <q-card-section>
          <div class="q-mt-md q-mb-md row justify-evenly">
            <q-btn
              v-close-popup
              color="primary"
              icon="check_circle"
              label="Accept"
            />
            <q-btn v-close-popup color="red" icon="cancel" label="Decline" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="usersList">
      <q-card style="width: 350px; max-width: 80vw">
        <q-card-actions align="right" class="q-mb-none">
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-card-actions>

        <q-card-section align="center">
          <div class="text-h5 text-weight-bold">Members</div>
        </q-card-section>

        <q-separator inset />

        <template v-for="(user, index) in users" :key="index">
          <q-item v-ripple>
            <q-item-section avatar>
              <q-avatar rounded color="primary" text-color="white">{{user.nickName[0]}}</q-avatar>
            </q-item-section>
            <q-item-section>{{user.nickName}}</q-item-section>
                        <q-item-section avatar>
              <q-icon
                :name="getPanelIcon(user.role)"
                class="text-primary vertical-middle text-center"
                size="md"
              />
            </q-item-section>
          </q-item>
        </template>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script lang="ts">
import { SerializedMessage } from 'src/contracts'
import { defineComponent } from 'vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default defineComponent({
  name: 'ChatLayout',
  data () {
    return {
      message: '',
      loading: false,
      usersList: false,
      leftDrawerOpen: false,
      rightDrawerOpen: false,
      statePick: 'online',
      notificationsDialog: false,
      isReceivingAllNotifications: true,
      createChannelDialog: false,
      createChannelTypeOptions: 'public',
      createChannelText: '',
      invitedDialog: false,
      notificationsQue: [] as SerializedMessage[]
    }
  },
  computed: {
    ...mapGetters('channels', {
      channels: 'joinedChannels',
      users: 'currentUsers',
      currentNotification: 'currentNotification'
    }),
    activeChannel () {
      return this.$store.state.channels.active
    },
    appVisible () {
      return this.$q.appVisible
    }
  },
  watch: {
    isReceivingAllNotifications: {
      handler () {
        this.setReceiveNotifications(this.isReceivingAllNotifications)
      }
    },
    appVisible () {
      if (this.appVisible) {
        // print notifications from que
        for (let i = 0; i < this.notificationsQue.length; i++) {
          this.showNotification(this.notificationsQue[i])
        }
        this.notificationsQue = []
      }
    },
    currentNotification: {
      handler () {
        if (!this.appVisible && (this.isReceivingAllNotifications || this.taggedMessage(this.currentNotification.content))) {
          this.notificationsQue.push(this.currentNotification)
        }
      },
      deep: true
    }
  },
  methods: {
    toggleLeftDrawer () {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },
    toggleRightDrawer () {
      this.rightDrawerOpen = !this.rightDrawerOpen
      if (this.rightDrawerOpen) {
        this.serveCommand({
          channel: this.activeChannel,
          message: '/list',
          userId: this.$store.state.auth.user?.id
        })
      }
    },

    showNotification (message: SerializedMessage) {
      let formattedMessageContent = message.content.slice(0, 14)
      if (message.content.length > 14) {
        formattedMessageContent += '...'
      }
      const authorNickname = message.author.nickName
      const notification = authorNickname + ' sent a message : ' + formattedMessageContent

      this.$q.notify({
        message: notification,
        position: 'top',
        color: 'red',
        avatar: this.getAvatar(authorNickname)
      })
    },

    taggedMessage (message: string) {
      const taggedUser = this.$store.state.auth.user?.nickName
      if (typeof (taggedUser) === 'string' && message.includes(taggedUser)) {
        return true
      }
      return false
    },

    getPanelIcon (role: string) {
      if (role === 'admin') {
        return 'admin_panel_settings'
      } else {
        return 'account_circle'
      }
    },
    getAvatar (nickName: string) {
      return 'https://ui-avatars.com/api//?background=0D8ABC&color=fff&name=' + nickName + '&length=1'
    },
    getChannelTypeIcon (channelType : string) {
      if (channelType === 'public') { return channelType } else if (channelType === 'private') { return 'lock' }
    },

    async send () {
      if (this.message.length > 0) {
        this.loading = true

        if (this.message.startsWith('/')) {
          if (this.message === '/list') { this.usersList = true }
          await this.serveCommand({
            channel: this.activeChannel,
            message: this.message,
            userId: this.$store.state.auth.user?.id
          })
        } else {
          await this.addMessage({
            channel: this.activeChannel,
            message: this.message,
            userId: this.$store.state.auth.user?.id
          })
        }
        this.message = ''
        this.loading = false
      }
    },
    async createChannel () {
      let privateChannel = ''
      if (this.createChannelTypeOptions === 'private') {
        privateChannel = 'private'
      }

      await this.serveCommand({
        channel: this.activeChannel,
        message: '/join' + ' ' + this.createChannelText + ' ' + privateChannel,
        userId: this.$store.state.auth.user?.id
      })

      this.createChannelText = ''
      this.createChannelTypeOptions = 'public'
    },
    async leaveChannel () {
      await this.serveCommand({
        channel: this.activeChannel,
        message: '/cancel',
        userId: this.$store.state.auth.user?.id
      })
    },

    ...mapMutations('channels', {
      setActiveChannel: 'SET_ACTIVE',
      setReceiveNotifications: 'SET_RECEIVE_ALL_NOTIFICATIONS'
    }),
    ...mapActions('auth', ['logout']),
    ...mapActions('channels', ['addMessage']),
    ...mapActions('channels', ['serveCommand'])
  }
})
</script>
