<template>
  <q-layout view="lHh LpR lFr">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-center">
          {{ activeChannel }}
        </q-toolbar-title>

        <q-btn class="q-mr-xl" color="blue" @click="notificationsDialog = true">
          Notifications
          <q-badge class="q-ml-sm" color="red" right>7</q-badge>
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
            <q-avatar rounded size="48px">
              <!-- AKTUALNY USER JEHO AVATAR  getAvatar(currentUser.nickName) -->
              <img src="https://cdn.quasar.dev/img/avatar1.jpg" />
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
            <div class="text-h6 ellipsis">Jakub</div>
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
                @click="notificationsDialog1 = true"
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
          class="q-mt-md"
          style="width: 80%"
          color="primary"
          icon="exit_to_app"
          label="Leave channel"
        />
        <q-btn
          class="q-my-md"
          style="width: 80%"
          color="primary"
          icon="delete_forever"
          label="Delete channel"
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
                name="admin_panel_settings"
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
          <div class="text-h5 ellipsis">Notifications</div>
        </q-card-section>

        <q-separator class="q-mb-sm" />

        <q-scroll-area style="height: 250px; border-right: 1px solid #ddd">
          <q-list>
            <q-item clickable>
              <q-item-section>
                <q-item-label
                  >Majka sent u message (aaaa....) 3 mins ago</q-item-label
                >
              </q-item-section>
            </q-item>

            <q-item clickable>
              <q-item-section>
                <q-item-label
                  >Majka sent u message (yyyyyy....) 2 mins ago</q-item-label
                >
              </q-item-section>
            </q-item>

            <q-item clickable>
              <q-item-section>
                <q-item-label
                  >Majka sent u message (xxxxx....) 1 mins ago</q-item-label
                >
              </q-item-section>
            </q-item>

            <q-item clickable>
              <q-item-section>
                <q-item-label
                  >Majka sent u message (xxxxx....) 1 mins ago</q-item-label
                >
              </q-item-section>
            </q-item>

            <q-item clickable>
              <q-item-section>
                <q-item-label
                  >Majka sent u message (xxxxx....) 1 mins ago</q-item-label
                >
              </q-item-section>
            </q-item>

            <q-item clickable>
              <q-item-section>
                <q-item-label
                  >Majka sent u message (xxxxx....) 1 mins ago</q-item-label
                >
              </q-item-section>
            </q-item>

            <q-item clickable>
              <q-item-section>
                <q-item-label
                  >Majka sent u message (xxxxx....) 1 mins ago</q-item-label
                >
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>

        <q-separator />
        <q-card-section align="center">
          <q-btn-toggle
            v-model="notificationOptions"
            push
            toggle-color="primary"
            :options="[
              { value: 'one', slot: 'one' },
              { value: 'two', slot: 'two' },
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

    <q-dialog v-model="notificationsDialog1">
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
            v-model="notificationOptions1"
            push
            toggle-color="primary"
            :options="[
              { value: 'one', slot: 'one' },
              { value: 'two', slot: 'two' },
            ]"
          >
            <template v-slot:one>
              <div class="row items-center no-wrap">
                <q-icon left name="public" />
                <div class="text-center">Public</div>
              </div>
            </template>

            <template v-slot:two>
              <div class="row items-center no-wrap">
                <q-icon left name="lock" />
                <div class="text-center">Private</div>
              </div>
            </template>
          </q-btn-toggle>
        </q-card-section>
        <div class="q-pa-md flex justify-center">
          <q-input rounded outlined v-model="text" label="Channel name" />
        </div>

        <q-separator />
        <div class="flex justify-center q-pa-md">
          <q-btn
            v-close-popup
            color="blue "
            label="Create channel"
            icon="create"
            rounded
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
          </q-item>
        </template>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script lang="ts">
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
      notificationOptions: 'one',
      notificationsDialog1: false,
      notificationOptions1: 'one',
      invitedDialog: false
    }
  },
  computed: {
    ...mapGetters('channels', {
      channels: 'joinedChannels',
      lastMessageOf: 'lastMessageOf',
      users: 'currentUsers'
    }),
    activeChannel () {
      return this.$store.state.channels.active
    },
    currentUser () {
      return this.$store.state.auth.user
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
          console.log(this.users)
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
    ...mapMutations('channels', {
      setActiveChannel: 'SET_ACTIVE'
    }),
    ...mapActions('auth', ['logout']),
    ...mapActions('channels', ['addMessage']),
    ...mapActions('channels', ['serveCommand'])
  }
})
</script>
