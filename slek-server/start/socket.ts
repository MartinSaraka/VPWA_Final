/*
|--------------------------------------------------------------------------
| Websocket events
|--------------------------------------------------------------------------
|
| This file is dedicated for defining websocket namespaces and event handlers.
|
*/

import Ws from '@ioc:Ruby184/Socket.IO/Ws'

Ws.namespace('/')
  .connected('ActivityController.onConnected')
  .disconnected('ActivityController.onDisconnected')
  .on('changeState','ActivityController.changeState')
  .on('getOnlineUsers','ActivityController.getOnlineUsers')

// this is dynamic namespace, in controller methods we can use params.name
Ws.namespace('channels/:name')
  // .middleware('channel') // check if user can join given channel
  .on('loadMessages', 'MessageController.loadMessages')
  .on('addMessage', 'MessageController.addMessage')
  .on('serveCommand', 'MessageController.serveCommand')
  .on('addTyping', 'MessageController.addTyping')
  .on('getUsersList','MessageController.getUsersList')

Ws.namespace('/invite')
  .on('serveInvite', 'MessageController.serveInvite')
  .on('handleInviteDecision', 'MessageController.handleInviteDecision')
