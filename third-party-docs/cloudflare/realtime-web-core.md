# Compiled Documentation

Generated on 2025-11-24T10:20:24.159Z

### web-core

#### _web-core.md

> Source: https://docs.realtime.cloudflare.com/web-core
> Scraped: 11/24/2025, 5:20:10 AM

This quickstart shows how to incorporate live video and audio into any web application using RealtimeKit's Core SDKs.

Core SDKs offer comprehensive customization and branding capabilities, enabling you to create your own user interface (UI) from scratch, without having to deal with complex media layers.

If you're looking for a quick and easy way to integrate video and audio into your application with a prebuilt UI, check out our [UI Kit](_ui-kit_quickstart.md).

## Objective[​](_web-core.md#objective)

You'll learn how to:

*   Install the RealtimeKit SDK
*   Initialize RealtimeKit Client
*   Connect to the meeting
*   Go live!

## Before Getting Started[​](_web-core.md#before-getting-started)

*   Make sure you've read the [Getting Started with RealtimeKit](_getting-started.md) topic and completed the following steps:
    
    *   Create a [developer account](https://dash.realtime.cloudflare.com/)
    *   Create a [RealtimeKit Meeting](_api.md#/operations/create_meeting)
    * [Add Participant](_api.md#/operations/add_participant) to the meeting

## Step 1: Install the SDK[​](_web-core.md#step-1-install-the-sdk)

You can install the package using CDN, npm or Yarn.

*   Javascript
*   React
```
npm install @cloudflare/realtimekit-react  
```
[![npm version](https://badge.fury.io/js/@cloudflare%2Frealtimekit-react.svg)](https://badge.fury.io/js/@cloudflare%2Frealtimekit-react)

## Step 2: Initialize the SDK[​](_web-core.md#step-2-initialize-the-sdk)

*   Javascript
*   React

To start, we need to initialize the libraries and wrap the application in the `<RealtimeKitProvider />` component. Import the `RealtimeKitProvider` from the `@cloudflare/realtimekit-react`.

The `<RealtimeKitProvider />` provides the necessary context for the various hooks to consume the `meeting` object as per their purpose. RealtimeKit provides the following built-in hooks for your usage:

*   `useRealtimeKitClient()`
*   `useRealtimeKitMeeting()`
*   `useRealtimeKitSelector()`

For more information on hooks, see [Use Web Core Hooks](_react-ui-kit_using-hooks.md).

To initialize, call the `init()` method and pass the `authToken`. You can get the `authToken` using the [Add Participant API](_api.md#/operations/add_participant).
```
import { RealtimeKitProvider, useRealtimeKitClient } from '@cloudflare/realtimekit-react';  
import { useEffect } from 'react';  
  
export default function App() {  
  const [meeting, initMeeting] = useRealtimeKitClient();  
  useEffect(() => {    initMeeting({      authToken: '<auth-token>',      defaults: {        audio: false,        video: false,      },    });  }, []);  
  return (    <RealtimeKitProvider value={meeting}>      {/* Render your UI here. Subcomponents can now use the `useRealtimeKitMeeting` and `useRealtimeKitSelector` hooks */}    </RealtimeKitProvider>  );}  
```
You can now use the `useRealtimeKitMeeting` and `useRealtimeKitSelector` hooks as required.

## Step 3: Connect to the meeting[​](_web-core.md#step-3-connect-to-the-meeting)

Now, you have established the connection with the RealtimeKit meeting server successfully, You may use the `meeting` object to set the users display name or apply a [video background middleware](https://www.npmjs.com/package/@cloudflare/realtimekit-virtual-background).

### Join the room[​](_web-core.md#join-the-room)

To join the meeting room, call join() method on the RealtimeKitClient instance as shown below.
```
await meeting.join();  
```
info

Once the join room process completes `roomJoined` event is emitted on the `meeting.self` namespace.

If you want to perform any actions, such as enabling audio, video, or starting and stopping recording, you can do so after the `roomJoined` event is fired.

For example:

*   Javascript
*   React
```
...  
const roomJoinedListener = () => {  
  console.log('User has joined the room', meeting.self.roomJoined);  // run my actions.}  
  
useEffect(() => {  
  meeting.self.on('roomJoined', roomJoinedListener);  
  return () => {  meeting.self.off('roomJoined', roomJoinedListener);  };}, [meeting]);  
...  
```
### Leave the room[​](_web-core.md#leave-the-room)

Once the meeting is over, you can leave the meeting room.

To leave the meeting room, call `leave()` method on the `meeting` as shown below.
```
await meeting.leave();  
```
info

Once the leave room process completes `roomLeft` event is emitted on `meeting.self`, `roomLeft` may also be called in case the user is kicked out of the room or disconnects

For example:

*   Javascript
*   React
```
...  
const roomLeftListener = () => {  
  console.log('User has left the room', meeting.self.roomJoined);  // run my actions.}  
  
useEffect(() => {  
  meeting.self.on('roomLeft', roomLeftListener);  
  return () => {    meeting.self.off('roomLeft', roomLeftListener);  };}, [meeting]);  
...  
```

#### _web-core_Introduction.md

> Source: https://docs.realtime.cloudflare.com/web-core/Introduction
> Scraped: 11/24/2025, 5:20:12 AM

The RealtimeKit Core SDK is designed to provide developers with an easy way to incorporate real-time communication (RTC) solutions into their apps and websites. With full customization and branding options, you can build your own user interface from the ground up without dealing with complicated media layers.

The Core SDK acts as a data-only layer, offering high-level primitives and abstracting away complex media and networking optimizations. It only provides simple APIs that are user-friendly and easy to work with.

*   Javascript
*   React

## Hooks[​](_web-core_Introduction.md#hooks)

[React Hooks](https://beta.reactjs.org/reference/react) are functions that allow developers to manage state and other React features in functional components. Hooks were introduced in React version 16.8 as a way to simplify the code. RealtimeKit provides the following built-in hooks:

*   useRealtimeKitClient()
*   useRealtimeKitMeeting()
*   useRealtimeKitSelector()

See [Hooks](_react-ui-kit_using-hooks.md) for more information.

## Utility Modules[​](_web-core_Introduction.md#utility-modules)

The Core SDK includes various modules for in-call utilities like chat, polls, and recording that enable building a UI on top of it. The following are the core SDK modules:

*   **meeting.self**: This consists of properties and methods corresponding to the current (local) user, such as enabling or disabling their audio and video, getting a list of media devices or changing the device, or sharing your mobile screen.
*   **meeting.participants**: Use this module to get useful information about the other participants that are present in the meeting. A host can use this module for access control. For example, the host can mute or kick a participant.
*   **meeting.chat**: It provides the methods to integrate chat features such as sending/receiving, editing, and deleting text, images, and files.
*   **meeting.polls**: Meetings can have polls. This module lets you perform actions related to polls, that is create and manage a poll within a meeting.
*   **meeting.recording**: When a meeting needs to be recorded, this module can be used. It lets you start or stop a recording, and get the current status of an ongoing recording.
*   **meeting.meta**: This object consists of all the metadata related to the current meeting, such as the title, the timestamp of when it started, and more.

#### _web-core_advanced_advance.md

> Source: https://docs.realtime.cloudflare.com/web-core/advanced/advance
> Scraped: 11/24/2025, 5:20:16 AM

## Defaults Configuration[​](_web-core_advanced_advance.md#defaults-configuration)

*   Javascript
*   React
```
useEffect(() => {  
  initMeeting({    defaults: {      ...    },  });}, []);  
```
While initializing RealtimeKitClient you can pass configuration overrides, the available options are
```
type DefaultOptions {  
	video?: boolean;	audio?: boolean;	mediaConfiguration?: {		video?: VideoQualityConstraints,		audio?: AudioQualityConstraints,		screenshare?: ScreenshareQualityConstraints,	}	isNonPreferredDevice?: (device: MediaDeviceInfo) => boolean;	autoSwitchAudioDevice?: boolean;	recording?: RecordingConfig;}  
```
### audio, video[​](_web-core_advanced_advance.md#audio-video)

This optional property is true by default and defines whether audio or video would be acquired and enabled on SDK initialization as soon as you join the meeting the SDK will produce your video and audio streams by default.

*   Javascript
*   React
```
useEffect(() => {  
  initMeeting({    authToken: '<auth-token>',    defaults: {      audio: false,      video: false,    },  });}, []);  
```
### mediaConfiguration.screenShare.displaySurface[​](_web-core_advanced_advance.md#mediaconfigurationscreensharedisplaysurface)

Specifies the _preferred_ screenshare surface, user will still be shown all possible options but the one configured here will be preselected

Allowed values: `window`, `monitor`, `browser`

[https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#displaysurface](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#displaysurface)

### mediaConfiguration[​](_web-core_advanced_advance.md#mediaconfiguration)

Defines media quality configuration

For audio -
```
{  
	echoCancellation?: boolean, // default true	noiseSupression?: boolean, // default true	autoGainControl?: boolean, // default true	enableStereo?: boolean, // default false	enableHighBitrate?: boolean // default false}  
```
For applications where audio quality needs to be high and as loseless as possible
```
{  
	echoCancellation: false,	noiseSupression: false,	autoGainControl: false,	enableStereo: true,	enableHighBitrate: true,}  
```
For video -
```
{  
	width: { ideal: number },	height: { ideal: number },	frameRate?: { ideal: number },}  
```
### isNonPreferredDevice[​](_web-core_advanced_advance.md#isnonpreferreddevice)

Our SDK will acquire media devices preferring virtual devices to not be selected by default (OBS, iPhone continuity) You can override this logic by using your own function to decide the preference
```
defaults: {  
  ...  isNonPreferredDevice: (device: MediaDeviceInfo) => {    if(device.label.startsWith("Virtual")) {      return false    }  }}  
```
### autoSwitchAudioDevice[​](_web-core_advanced_advance.md#autoswitchaudiodevice)

By default, when a new audio device is plugged in, our SDK switches to that device. You can configure that behaviour

### recording[​](_web-core_advanced_advance.md#recording)
```
{  
	fileNamePrefix?: string;	videoConfig?: {		height?: number;		width?: number;		codec?: string;	};}  
```
Refer to [recording codec guide](_guides_capabilities_recording_configure-codecs.md#configure-codecs) for info the `codec` parameter

#### _web-core_chat_edit-chat-messages.md

> Source: https://docs.realtime.cloudflare.com/web-core/chat/edit-chat-messages
> Scraped: 11/24/2025, 5:20:15 AM

As mentioned in introduction, there are 3 types of chat messages - text messages, images, and files. There is a method in meeting.chat to edit a message of each type.

## Edit a text message[​](_web-core_chat_edit-chat-messages.md#edit-a-text-message)

To edit a text message, the `meeting.chat.editTextMessage()` method can be used. This accepts a `messageId` (type `string`) and a `message` (type `string`).
```
const message = meeting.chat.messages[0];  
const messageId = message?.id;  
const newMessage = 'Is this the real life?';  
await;  
meeting.chat.editTextMessage(messageId, newMessage);  
```
## Edit an image[​](_web-core_chat_edit-chat-messages.md#edit-an-image)

You can send an image with the help of meeting.chat.editImageMessage(). This accepts a `messageId` of type `string` and an image of type `File`.
```
<label for="img">Edit image:</label>  
<input type="file" id="img" name="img" accept="image/*" />  
<button onclick="onEditImage()">Edit Image</button>  
```
```
async function onEditImage() {  
  const messageId = '...';  const image = document.getElementById('img');  await meeting.chat.editImageMessage(messageId, image.files[0]);}  
```
## Edit a file[​](_web-core_chat_edit-chat-messages.md#edit-a-file)

Editing a file is quite similar to editing an image. To edit a file use `meeting.chat.editFileMessage()`.
```
<label for="file">Edit file:</label>  
<input type="file" id="file" name="file" />  
<button onclick="onEditFile()">Edit File</button>  
```
```
async function onEditFile() {  
  const messageId = '...';  const file = document.getElementById('file');  await meeting.chat.editFileMessage(messageId, file.files[0]);}  
```
There is also a common method called `meeting.chat.editMessage()` that can be used to edit any of the 3 types of messages displayed above. It essentially calls one of the methods from above depending upon the type of payload you send to the method. The `editMessage()` method accepts a parameters `messageId` `message` of the following type:
```
async function editMessage(  
    messageId: string,    message: { type: 'text', message: string }        | { type: 'image', image: File }        | { type: 'file', file: File },) {...}  
```
Here's how you would use the `editMessage()` method to edit a text message.
```
const messageId = '...';  
const message = 'Is this just fantasy?';  
await meeting.chat.sendMessage(messageId, { type: 'text', message });  
```

#### _web-core_chat_introduction.md

> Source: https://docs.realtime.cloudflare.com/web-core/chat/introduction
> Scraped: 11/24/2025, 5:20:17 AM

The meeting chat object is stored in `meeting.chat`, which has methods for sending and receiving messages. There are 3 types of messages that can be sent in chat - text messages, images, and files.

The `meeting.chat.messages` array contains all the messages that have been sent in the chat. This is an array of objects, where each object is of type `Message`.

The type `Message` is defined in the following manner.
```
interface BaseMessage<T extends MessageType> {  
  type: T;  userId: string;  displayName: string;  time: Date;  id: string;  isEdited?: boolean;  read?: boolean;  pluginId?: string;  pinned?: boolean;  targetUserIds?: string[];}  
  
interface TextMessage extends BaseMessage<MessageType.text> {  
  message: string;}  
  
interface ImageMessage extends BaseMessage<MessageType.image> {  
  link: string;}  
  
interface FileMessage extends BaseMessage<MessageType.file> {  
  name: string;  size: number;  link: string;}  
  
type Message = TextMessage | ImageMessage | FileMessage;  
```

#### _web-core_chat_other-chat-functions.md

> Source: https://docs.realtime.cloudflare.com/web-core/chat/other-chat-functions
> Scraped: 11/24/2025, 5:20:17 AM

The `meeting.chat` object exposes certain other methods for convenience when working with chat.

## Get messages by a user[​](_web-core_chat_other-chat-functions.md#get-messages-by-a-user)

You can get messages by a particular user by passing the user's ID to the `meeting.chat.getMessagesByUser()` method.
```
// Find the userId of the user with name "Freddie".  
const { userId } = meeting.participants.joined  
  .toArray()  .find((p) => p.name === 'Freddie');  
const messages = meeting.chat.getMessagesByUser(userId);  
```
## Get messages of a particular type[​](_web-core_chat_other-chat-functions.md#get-messages-of-a-particular-type)

You can also get messages of a particular type using the `meeting.chat.getMessagesByType()` method. For example, you can get all image messages present in the chat using the following snippet.
```
const imageMessages = meeting.chat.getMessagesByType('image');  
```
## Pinning a chat message[​](_web-core_chat_other-chat-functions.md#pinning-a-chat-message)

You can `pin` a number of messages to the chat. When you pin a message, the message object will have the attribute `pinned: true`, using which you can identify if a message is pinned.

To pin a message, run the following snippet.
```
// Let's say we want to pin the first message in the chat (could be a text, image, or file).  
const { id } = meeting.chat.messages[0];  
  
await meeting.chat.pin(id);  
```
Once you pin a message, it will be added to `meeting.chat.pinned`.
```
const { id } = meeting.chat.messages[0];  
  
await meeting.chat.pin(id);  
  
console.log(meeting.chat.pinned);  
console.log(meeting.chat.pinned.length > 0); // Should be true  
```
You can also unpin a pinned message, by using the `meeting.chat.unpin()` method.
```
// Unpin the first pinned message.  
  
const { id } = meeting.chat.pinned[0];  
await meeting.chat.unpin(id);  
```
You can listen for events to know when a message is pinned or unpinned.
```
meeting.chat.on('pinMessage', ({ message }) => {  
  console.log('A message was pinned', JSON.stringify(message));});  
```
```
meeting.chat.on('unpinMessage', ({ message }) => {  
  console.log('A message was unpinned', JSON.stringify(message));});  
```
## Deleting a chat message[​](_web-core_chat_other-chat-functions.md#deleting-a-chat-message)

The `meeting.chat` namespace exposes a method called `deleteMessage()`. It takes a parameter `meesageId` of type `string`.
```
const messageId = '...';  
await meeting.chat.deleteMessage(messageId);  
```

#### _web-core_chat_receiving-chat-messages.md

> Source: https://docs.realtime.cloudflare.com/web-core/chat/receiving-chat-messages
> Scraped: 11/24/2025, 5:20:18 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# Receiving chat messages

The `meeting.chat` object emits events when new chat messages are received. You can listen for the `chatUpdate` event to log when a new chat message is received.

*   Javascript
*   React
```codeBlockLines_e6Vv
meeting.chat.on('chatUpdate', ({ message, messages }) => {  
  console.log(`Received message ${message}`);  console.log(`All messages in chat: ${messages.join(', ')}`);});  
```
```codeBlockLines_e6Vv
const messages = useRealtimeKitSelector((m) => m.chat.messages));  
```
Alternatively,
```codeBlockLines_e6Vv
meeting.chat.on('chatUpdate', ({ message, messages }) => {  
  console.log(`Received message ${message}`);  console.log(`All messages in chat: ${messages.join(', ')}`);});  
```
Here, the `message` is of type `Message`, as defined in [introduction](_web-core_chat_introduction.md). `messages` is a list of all chat messages in the meeting, which is the same as `meeting.chat.messages`.

When a chat message is received, the `meeting.chat.messages` list is also updated.
```codeBlockLines_e6Vv
console.log(JSON.stringify(meeting.chat.messages));  
meeting.chat.on('chatUpdate', () => {  
  console.log(JSON.stringify(meeting.chat.messages));});  
```

#### _web-core_chat_sending-a-chat-message.md

> Source: https://docs.realtime.cloudflare.com/web-core/chat/sending-a-chat-message
> Scraped: 11/24/2025, 5:20:18 AM

As mentioned in [introduction](_web-core_chat_introduction.md), there are 3 types of chat messages - text messages, images, and files. There is a method in `meeting.chat` to send a message of each type.

## Send a text message[​](_web-core_chat_sending-a-chat-message.md#send-a-text-message)

To send a text message, the `meeting.chat.sendTextMessage()` method can be used. This accepts a string `message` and sends it to the room.
```
const message = 'Is this the real life?';  
await meeting.chat.sendTextMessage(message);  
```
## Send an image[​](_web-core_chat_sending-a-chat-message.md#send-an-image)

You can send an image with the help of `meeting.chat.sendImageMessage()`. This accepts an image of type `File`, and sends it to the participants in the meeting.
```
<label for="img">Select image:</label>  
<input type="file" id="img" name="img" accept="image/*" />  
<button onclick="onSendImage()">Send Image</button>  
```
```
async function onSendImage() {  
  const image = document.getElementById('img');  await meeting.chat.sendImageMessage(image.files[0]);}  
```
## Send a file[​](_web-core_chat_sending-a-chat-message.md#send-a-file)

Sending a file is quite similar to sending an image. The only difference is that when you send an image, a preview will be shown in the meeting chat, which is not the case for sending files. That being said, an image can be sent as a file too using `meeting.chat.sendFileMessage()`.
```
<label for="file">Select file:</label>  
<input type="file" id="file" name="file" />  
<button onclick="onSendFile()">Send File</button>  
```
```
async function onSendFile() {  
  const file = document.getElementById('file');  await meeting.chat.sendFileMessage(file.files[0]);}  
```
There is also a common method called `meeting.chat.sendMessage()` that can be used to send any of the 3 types of messages displayed above. It essentially calls one of the methods from above depending upon the type of payload you send to the method. The `sendMessage()` method accepts a parameter `message` of the following type:
```
async function sendMessage(  
    message: { type: 'text', message: string }        | { type: 'image', image: File }        | { type: 'file', file: File },) {...}  
```
Here's how you would use the `sendMessage()` method to send a text message.
```
const message = 'Is this just fantasy?';  
await meeting.chat.sendMessage({ type: 'text', message });  
```

#### _web-core_error-codes_error-code-zero-ten.md

> Source: https://docs.realtime.cloudflare.com/web-core/error-codes/error-code-zero-ten
> Scraped: 11/24/2025, 5:20:23 AM

This topic describes web core system error codes 0-20.

This topic describes web core system error codes 0-20.
```
await meeting.joinRoom();  
```
Once the join room process completes, you'll see the `roomJoined` event is emitted on the `meeting.self` namespace.

#### _web-core_error-codes_error-code.md

> Source: https://docs.realtime.cloudflare.com/web-core/error-codes/error-code
> Scraped: 11/24/2025, 5:20:19 AM

Note

This information is intended for developers debugging or troubleshooting RealtimeKit's web core system errors.

Error codes are a standardized method for developers to convey application errors and issues to users or other developers in a structured manner. Error codes typically consist of a numerical or alphanumeric code and a description that provides more information about the error.

This document lists RealtimeKit's web core error codes that you may encounter in various scenarios. System error codes can arise in different parts of the system, and their descriptions may not always provide exact details. To address these codes effectively, you must first understand the programmatic and runtime contexts in which these errors occurred.

## Error codes and format[​](_web-core_error-codes_error-code.md#error-codes-and-format)

Error codes consist of four-digit numbers that are categorized by the type of error. The first two digits denote the module in which the error occurred, and the remaining digits specify the type of error.

## Error codes prefixes[​](_web-core_error-codes_error-code.md#error-codes-prefixes)

Here is a list of error code prefixes corresponding to each RealtimeKit modules:

**Module***Error Code Prefix**

RealtimeKitClient

00xx

Controller

01xx

RoomNodeClient

02xx

HiveNodeClient

03xx

SocketService

04xx

Chat

05xx

Plugins

06xx

Polls

07xx

Meta

08xx

Permissions/Presets

09xx

Recording

10xx

Self (or local media handling)

11xx

Participant

12xx

Spotlight

13xx

Remote Request

14xx

Webinar

15xx

Device

16xx

End-End Encryption

17xx

AI (transcripts, summary)

18xx

Livestream

19xx

Stage

20xx

* * *

#### _web-core_livestreaming.md

> Source: https://docs.realtime.cloudflare.com/web-core/livestreaming
> Scraped: 11/24/2025, 5:20:13 AM

*   Livestreaming is often used for events, such as concerts, conferences, and sports games, as well as for online classes, gaming, and social media platforms.
*   RealtimeKit uses LHLS to deliver low latency one way streams
*   The Interactive Livestream product delivers interactivity via chat, polls, reactions etc
*   Viewer can also be pulled in the livestream by the host using Stage Management APIs

This topic talks about how you can use livestreaming properties, events, and functions.

## Properties[​](_web-core_livestreaming.md#properties)

### Playlist URL[​](_web-core_livestreaming.md#playlist-url)

`meeting.livestream.playbackUrl` - This URL allows you to watch the live stream. It is the location of the video playlist file and can be accessed through a web browser or any media player.

### Livestream Status[​](_web-core_livestreaming.md#livestream-status)

`meeting.livestream.status` - The current status of the livestream. This field can assume the following values:

*   IDLE
*   STARTING
*   LIVESTREAMING
*   STOPPING

### Viewer Count[​](_web-core_livestreaming.md#viewer-count)

`meeting.livestream.viewerCount` - The number of people viewing the livestream, including hosts and viewers.

## Methods[​](_web-core_livestreaming.md#methods)

Use the following methods to start and stop the livestreaming.

### Start Livestream[​](_web-core_livestreaming.md#start-livestream)

Users with the permission `canLivestream` set to true can start a livestream.

`await meeting.livestream.start();`

### Stop Livestream[​](_web-core_livestreaming.md#stop-livestream)

Users with the permission `canLivestream` set to true can stop a livestream.

`await meeting.livestream.stop();`

## Events[​](_web-core_livestreaming.md#events)

Here is a list of events that the `meeting.livestream` module emits:

**Event***Description**

`livestreamUpdate`

This event is triggered when the state of the livestream changes, specifically when it is started or stopped.

`viewerCountUpdate`

Emitted when a new viewer joins or a viewer leaves the livestream.

#### _web-core_local-user_events.md

> Source: https://docs.realtime.cloudflare.com/web-core/local-user/events
> Scraped: 11/24/2025, 5:20:15 AM

You can subscribe to various events on the local user by calling `meeting.self.on(EVENT_NAME)`.

Triggered when the join event completes and now the `meeting` is ready to produce and consume media.

Triggered when the local user leaves the meeting.

Here are all the possible values of the `state` variable.

Triggered when the user starts / stops the video using `enableVideo` or `disableVideo`

Triggered when the user starts / stops the audio using `enableAudio` or `disableAudio`

Triggered when the user starts / stops the screen share using `enableScreenShare()` or `disableScreenShare()`.

Subscribe to the `deviceUpdate` event to handle the changing video, audio and speaker devices
```
meeting.self.on(  
  'mediaScoreUpdate',  ({ kind, isScreenshare, score, scoreStats }) => {    if (kind === 'video') {      console.log(        `Your ${isScreenshare ? 'screenshare' : 'video'} quality score is `,        score,      );    }  
    if (kind === 'audio') {      console.log('Your audio quality score is ', score);    }  
    if (score < 5) {      console.log('Your media quality is poor');    }  },);  
```
The `scoreStats` object contains the statistics that contributed to the calculated media score.

The `mediaScoreUpdate` event will be emitted with an object similar to the following example as its first parameter, every few seconds, if media is being shared.
```
// Audio Producer  
{  
    "kind": "audio",    "isScreenshare": false,    "score": 10,    "participantId": "c8aa91f6-0316-4025-8240-80d130e5acca", // meeting.self.id    "scoreStats": {        "score": 10,        "bitrate": 22452, // bytes per second        "packetsLostPercentage": 0,        "jitter": 0, // seconds        "isScreenShare": false    }}  
  
// Video Producer  
{  
    "kind": "video",    "isScreenshare": false,    "score": 10,    "participantId": "c8aa91f6-0316-4025-8240-80d130e5acca", // meeting.self.id    "scoreStats": {        "score": 10,        "frameWidth": 640,        "frameHeight": 480,        "framesPerSecond": 24,        "jitter": 0, // seconds        "isScreenShare": false,        "packetsLostPercentage": 0,        "bitrate": 576195, // bytes per second        "cpuLimitations": false,        "bandwidthLimitations": false    }}  
```
Subscribe to `chatUpdate`, `pollsUpdate`, `pluginsUpdate` or `*` for any kind of permission updates Example:

#### _web-core_local-user_extras.md

> Source: https://docs.realtime.cloudflare.com/web-core/local-user/extras
> Scraped: 11/24/2025, 5:20:17 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# Other Methods

## Update media resolution at runtime[​](#update-media-resolution-at-runtime)

### Camera[​](#camera)

meeting.self.updateVideoConstraints(resolution)

Example
```codeBlockLines_e6Vv
await meeting.self.updateVideoConstraints({  
  width: { ideal: 1920 },  height: { ideal: 1080 },});  
```
### Screenshare[​](#screenshare)

meeting.self.updateScreenshareConstraints(resolution)

Example
```codeBlockLines_e6Vv
await meeting.self.updateScreenshareConstraints({  
  width: { ideal: 1920 },  height: { ideal: 1080 },});  
```
## Using Middlewares[​](#using-middlewares)

Middlewares are add-ons that you can use to add effects and filters to your audio and video streams with ease. The `meeting.self` namespace exposes methods to add and remove these middlewares. Feel free to read more about how to work with [video middlewares](_guides_capabilities_video_processing.md) and [audio middlewares](_guides_capabilities_audio_processing.md).

### Create a middleware[​](#create-a-middleware)
```codeBlockLines_e6Vv
function RetroTheme() {  
  return (canvas, ctx) => {    ctx.filter = 'grayscale(1)';    ctx.shadowColor = '#000';    ctx.shadowBlur = 20;    ctx.lineWidth = 50;    ctx.strokeStyle = '#000';    ctx.strokeRect(0, 0, canvas.width, canvas.height);  };}  
```
### Working with video middlewares[​](#working-with-video-middlewares)
```codeBlockLines_e6Vv
// Add the video middleware  
meeting.self.addVideoMiddleware(RetroTheme);  
  
// Remove the video middleware  
meeting.self.removeVideoMiddleware(RetroTheme);  
```
### Working with audio middlewares[​](#working-with-audio-middlewares)
```codeBlockLines_e6Vv
// Add the audio middleware  
meeting.self.addAudioMiddleware(YourAudioMiddleware);  
  
// Remove the audio middleware  
meeting.self.removeAudioMiddleware(YourAudioMiddleware);  
```
## Pinning & unpinning[​](#pinning--unpinning)

You can pin or unpin yourself given you have the appropriate permissions. You can check the pinned status of the local user using `meeting.isPinned`.
```codeBlockLines_e6Vv
meeting.self.pin();  
```
```codeBlockLines_e6Vv
meeting.self.unpin();  
```

#### _web-core_local-user_introduction.md

> Source: https://docs.realtime.cloudflare.com/web-core/local-user/introduction
> Scraped: 11/24/2025, 5:20:17 AM

Accessible via `self` key within the `meeting` object, the local user object consists of all the information related to the current participant and methods to configure media and other states.

## Properties[​](_web-core_local-user_introduction.md#properties)

Here is a list of properties that local user provides:

**Metadata**   `userId`: User ID of the local user.
*   `customParticipantId`: Identifier provided by the developer while adding the participant.
*   `organizationId`: The ID of the organization the meeting is created from.
*   `name`: Contains Name of the local user.
*   `picture`: Display picture URL for the local user.
*   `permissions`: The permissions related to various capabilities for the local user defined by the preset
*   `config`: The configuration for how the meeting should appear for the local user

**Media**:

*   `mediaPermissions`: The current audio and video permissions given by the local user.
*   `audioTrack`: The audio track for the local user.
*   `videoTrack`: The video track for the local user.
*   `screenShareTracks`: The screen share video and audio tracks for the local user.
*   `audioEnabled`: A boolean value indicating if the audio is currently enabled.
*   `videoEnabled`: A boolean value indicating if the video is currently enabled.
*   `screenShareEnabled`: A boolean value indicating if the screen share is currently enabled.

**States**:

*   `isPinned`: A boolean value indicating if the local user is pinned or not.
    
*   `roomJoined`: A boolean value indicating if the local user is in the meeting
    
*   `roomState`: Indicates the state of the user in the meeting. It can take the following values:
    
    ```
    type RoomState =  
      | 'init'  | 'joined'  | 'waitlisted'  | 'rejected'  | 'kicked'  | 'left'  | 'ended'  | 'disconnected';
    ```
    

*   Javascript
*   React
```
// subscribe to roomState  
const roomState = useRealtimeKitSelector((m) => m.self.roomState)  
return (  
  <>    {roomState === "disconnected" && <div>disconnected</div>}  </>)  
```
## Change the name of the local user[​](_web-core_local-user_introduction.md#change-the-name-of-the-local-user)

Change the user's name by calling `setName` method. The changed name will reflect across all participants ONLY if the change happens before joining the meeting.
```
await meeting.self.setName('New Name');  
```
### Mute/Unmute microphone[​](_web-core_local-user_introduction.md#muteunmute-microphone)
```
// Mute Audio  
await meeting.self.disableAudio();  
  
// Unmute Audio  
await meeting.self.enableAudio();  
  
// Get current status  
meeting.self.audioEnabled;  
```
### Enable/Disable camera[​](_web-core_local-user_introduction.md#enabledisable-camera)
```
// Disable Video  
await meeting.self.disableVideo();  
  
// Enable Video  
await meeting.self.enableVideo();  
  
// Get current status  
meeting.self.videoEnabled;  
```
```
// Enable Screenshare  
await meeting.self.enableScreenShare();  
  
// Disable Screenshare  
await meeting.self.disableScreenShare();  
  
// Get current status  
meeting.self.screenShareEnabled;  
```
### Check all available media devices[​](_web-core_local-user_introduction.md#check-all-available-media-devices)
```
// Returns all media devices accessible by the local participant.  
await meeting.self.getAllDevices();  
```
### Change the media device in use[​](_web-core_local-user_introduction.md#change-the-media-device-in-use)

Given a device parameter, switches the corresponding input to given device. You can choose which device needs to be changed to from using the above getAllDevices function
```
/** Change the current media device that is being used by the local participant. * @param device The device that is to be used. A device of the same `kind` will be replaced. * the primary stream. */await meeting.self.setDevice(device);  
```
## Play Video Track[​](_web-core_local-user_introduction.md#play-video-track)

### Register Video Element[​](_web-core_local-user_introduction.md#register-video-element)

API to play a users video track on a provided `<video>` element.
```
// this is the video element where we want to play the users track  
const videoElement = document.querySelector('video.participant');  
  
meeting.self.registerVideoElement(videoElement);  
  
// if you want to play a preview video track which is local  
// and not sent to other users, you can pass  
// the second argument `isPreview` as `true`.  
meeting.self.registerVideoElement(videoElement, true);  
```
### Deregister Video Element[​](_web-core_local-user_introduction.md#deregister-video-element)

There is also a way to deregister a video element. This is typically done in the cleanup phase if you are using some framework like React.
```
meeting.self.deregisterVideoElement(videoElement);  
```

#### _web-core_local-user_manage-media-devices.md

> Source: https://docs.realtime.cloudflare.com/web-core/local-user/manage-media-devices
> Scraped: 11/24/2025, 5:20:17 AM

To get the list of media devices that are currently being used, you can use the following methods:
```
// Get all media devices  
const devices = await meeting.self.getAllDevices();  
  
// Get all audio devices  
const audioDevices = await meeting.self.getAudioDevices();  
  
// Get all video devices  
const videoDevices = await meeting.self.getVideoDevices();  
  
// Get all speakers  
const speakerDevices = await meeting.self.getSpeakerDevices();  
  
// Get device by ID  
const device = await meeting.self.getDeviceById('12345', 'audio');  
  
// Fetch current media devices being used  
const currentDevices = meeting.self.getCurrentDevices();  
```
To set a device as an active device, you can call `setDevice` method. This takes a `MediaDeviceInfo` object, and replaces the same `kind` device.

#### _web-core_local-user_media-permission-errors.md

> Source: https://docs.realtime.cloudflare.com/web-core/local-user/media-permission-errors
> Scraped: 11/24/2025, 5:20:17 AM

This event is triggered when RealtimeKit fails to acquire the user's local media (camera and/or microphone) or user revokes the permission for media devices.
```
meeting.self.on('mediaPermissionError', ({ message, kind }) => {  
  console.log(`Failed to capture ${kind}:  ${message}`);});  
```
This event shares information that can be used to show appropriate message for the user.

#### _web-core_participants.md

> Source: https://docs.realtime.cloudflare.com/web-core/participants
> Scraped: 11/24/2025, 5:20:17 AM

The data regarding all meeting participants is stored under `meeting.participants`. These **does not** include the local user. Use the methods and events to consume the participants data. For example, to get all the participants who joined the meeting:
```
// get all joined participants  
const joinedParticipants = meeting.participants.joined;  
```
The `meeting.participants` object has the following **maps** of participants

*   **joined**: A map that contains all the participants who are currently in the meeting except the local user
*   **waitlisted**: A map that contains all the participants waiting to join the meeting.
*   **active**: A map that contains all the participants except the local user whose media is subscribed to i.e participants are supposed to be on the screen at the moment except the local user
*   **pinned**: A map that contains all the pinned participants of the meeting.

Therefore if you were to make a video / audio grid of participants, you'd use the `active` map, but to display the list of all participants in the meeting you'd use the `joined` map.

Each participant in each of the `joined`, `waitlisted`, `active`, and `pinned` maps is of type [`RTKParticipant`](_web-core_reference_RTKParticipant.md). Read more about each individual `participant` object [here](_web-core_participants_participant-object.md).

Each of these maps are of type [`RTKParticipantMap`](_web-core_reference_RTKParticipantMap.md), and therefore emit a `participantJoined` event when a participant is added to the map, and a `participantLeft` event when a participant leaves the map. For instance, to listen for when a participant gets pinned in the meeting, you can use the following snippet:
```
meeting.participants.pinned.on('participantJoined', (participant) => {  
  console.log(`Participant ${participant.name} got pinned`);});  
```
* * *

and these other properties

*   `count`: The number of participants who are joined in the meeting.
*   `pageCount`: Number of pages available in paginated mode.
*   `maxActiveParticipantsCount`: The maximum number of participants that can be present in the active state.
*   `lastActiveSpeaker` : This stores the `participantId` of the last participant who spoke in the meeting.

## Set participant view mode[​](_web-core_participants.md#set-participant-view-mode)

The view mode indicates whether the participants are populated in `ACTIVE_GRID` mode or `PAGINATED` mode. In `ACTIVE_GRID` mode, the participants are automatically replaced in `meeting.participants.active`, based on who is speaking or who has their video turned on.

In `PAGINATED` mode, the participants in `meeting.participants.active` will be fixed. Only when you call the `meeting.participants.setPage(pageNumber)` method, it will replace the `active` participants with a different set of participants.

You can change the participant view between `ACTIVE_GRID` and `PAGINATED` mode using the following method. This will trigger `viewModeChanged` event as a side affect.
```
// set the view mode to paginated  
await meeting.participants.setViewMode('PAGINATED');  
  
// set the view mode to active grid  
await meeting.participants.setViewMode('ACTIVE_GRID');  
```
### Set page number in paginated mode[​](_web-core_participants.md#set-page-number-in-paginated-mode)

The `setPage()` method allows you to switch between pages of participants present in the meeting.
```
// switch to second page  
await meeting.participants.setPage(2);  
```
## Waiting room methods[​](_web-core_participants.md#waiting-room-methods)

The `acceptWaitingRoomRequest()` method accepts requests from waitlisted participants if user has appropriate permissions.
```
await meeting.participants.joined.acceptWaitingRoomRequest(participantId);  
```
The `rejectWaitingRoomRequest()` method requests from waitlisted participants if user has appropriate permissions.
```
await meeting.participants.joined.rejectWaitingRoomRequest(participantId);  
```

#### _web-core_participants_events.md

> Source: https://docs.realtime.cloudflare.com/web-core/participants/events
> Scraped: 11/24/2025, 5:20:16 AM

You can subscribe to events for all participants using `meeting.participants.on()` method. Here are the supported events:

### View mode change[​](_web-core_participants_events.md#view-mode-change)

Triggered when the View mode changes

*   Javascript
*   React
```
const viewMode = useRealtimeKitSelector((meeting) => meeting.participants.viewMode);  
```
### Page change[​](_web-core_participants_events.md#page-change)

*   Javascript
*   React
```
const pageChanged = useRealtimeKitSelector(  
  (meeting) => meeting.participants.pageCount,);  
```
### Active speaker[​](_web-core_participants_events.md#active-speaker)

This event is triggered when a participant becomes `active` when they starts to speak.

*   Javascript
*   React
```
const activeSpeaker = useRealtimeKitSelector(  
  (meeting) => meeting.participants.lastActiveSpeaker,);  
```
## Events on all participants[​](_web-core_participants_events.md#events-on-all-participants)

Instead of subscribing to individual participant events, you can subscribe to a participant map, such as `joined` & `active` and get updated when any of the participant emits an event.

If you want to subscribe to participants when they become `active`, you can do so by subscribing to `meetings.participants.active.on('participantJoined')`

### Participant joined[​](_web-core_participants_events.md#participant-joined)

Trigger an event when any participant joins the meeting.

*   Javascript
*   React
```
/** Returns a list of all joined participants in the meeting*/  
const joinedParticipants = useRealtimeKitSelector(  
  (meeting) => meeting.participants.joined,);  
```
Alternatively,
```
meeting.participants.joined.on('participantJoined', (participant) => {  
  console.log(`A participant with id "${participant.id}" has joined`);});  
```
### Participant left[​](_web-core_participants_events.md#participant-left)

Trigger an event when any participant leaves the meeting.

*   Javascript
*   React
```
/** Returns a list of all joined participants in the meeting*/  
const joinedParticipants = useRealtimeKitSelector(  
  (meeting) => meeting.participants.joined,);  
```
Alternatively,
```
meeting.participants.joined.on('participantLeft', (participant) => {  
  console.log(`A participant with id "${participant.id}" has left the meeting`);});  
```
### Participant pinned[​](_web-core_participants_events.md#participant-pinned)

Trigger an event when a participant is pinned.

*   Javascript
*   React
```
// Returns a list of all pinned participants in the meeting, to listen to pinned event check the Javascript event  
const pinnedParticipants = useRealtimeKitSelector(  
  (meeting) => meeting.participants.pinned,);  
```
### Participant unpinned[​](_web-core_participants_events.md#participant-unpinned)

Trigger an event when a participant is unpinned.

*   Javascript
*   React
```
// Returns a list of all pinned participants in the meeting, to listen to pinned event check the Javascript event  
const pinnedParticipants = useRealtimeKitSelector(  
  (meeting) => meeting.participants.pinned,);  
```
### Video update[​](_web-core_participants_events.md#video-update)

Trigger an event when any participant starts / stops video.

*   Javascript
*   React
```
// Check for one participant  
const videoEnabled = useRealtimeKitSelector(  
  (m) => m.participants.joined.get(participantId).videoEnabled,);  
// All video enabled participants  
const videoEnabledParticipants = useRealtimeKitSelector((m) =>  
  m.participants.joined.toArray().find((p) => p.videoEnabled),);  
```
### Audio update[​](_web-core_participants_events.md#audio-update)

Trigger an event when any participant starts / stops audio.

*   Javascript
*   React
```
// Check for one participant  
const audioEnabled = useRealtimeKitSelector(  
  (m) => m.participants.joined.get(participantId).audioEnabled,);  
// All audio enabled participants  
const audioEnabledParticipants = useRealtimeKitSelector((m) =>  
  m.participants.joined.toArray().find((p) => p.audioEnabled),);  
```
Trigger an event when any participant starts / stops screen share.

*   Javascript
*   React
```
// Check for one participant  
const screensharingParticipant = useRealtimeKitSelector((m) =>  
  m.participants.joined.toArray().find((p) => p.screenShareEnabled),);  
// All screen sharing participants  
const audioEnabledParticipants = useRealtimeKitSelector((m) =>  
  m.participants.joined.toArray().find((p) => p.screenShareEnabled),);  
```
## Network quality score[​](_web-core_participants_events.md#network-quality-score)

Subscribe to the `mediaScoreUpdate` event to monitor network
```
meeting.participants.joined.on(  
  'mediaScoreUpdate',  ({ participantId, kind, isScreenshare, score, scoreStats }) => {    if (kind === 'video') {      console.log(        `Participant ${participantId}'s ${          isScreenshare ? 'screenshare' : 'video'        } quality score is `,        score,      );    }  
    if (kind === 'audio') {      console.log(        `Participant ${participantId}'s audio quality score is `,        score,      );    }  
    if (score < 5) {      console.log(`Participant ${participantId}'s media quality is poor`);    }  },);  
```
The `scoreStats` object contains the statistics that contributed to the calculated media score.

The `mediaScoreUpdate` event will be emitted with an object similar to the following example as its first parameter, every few seconds, if any participant's media is being shared.
```
// Audio Consumer  
{  
    "kind": "audio",    "isScreenshare": false,    "score": 10,    "participantId": "f9b947d2-c9ca-4ea9-839b-c10304b0fffc",    "scoreStats": {        "score": 10,        "packetsLostPercentage": 0,        "jitter": 0.004, // seconds        "isScreenShare": false,        "bitrate": 1595 // bytes per second    }}  
  
// Video Consumer  
{  
    "kind": "video",    "isScreenshare": false,    "score": 10,    "participantId": "f9b947d2-c9ca-4ea9-839b-c10304b0fffc",    "scoreStats": {        "score": 10,        "frameWidth": 640,        "frameHeight": 480,        "framesPerSecond": 24,        "packetsLostPercentage": 0,        "jitter": 0.002, // seconds        "isScreenShare": false,        "bitrate": 340460 // bytes per second    }}  
```
## Events for specific participant[​](_web-core_participants_events.md#events-for-specific-participant)

If you want to subscribe to above events but for a specific participant only, you can do so by binding event to `meeting.participants.joined.get(peerId).on()` method. where the `peerId` is the id of the participant that you want to watch.

### Webinar events[​](_web-core_participants_events.md#webinar-events)

Here is a list of events that can are emitted for a participants in a `WEBINAR` setup.

**Event***Description**

`peerRequestToJoinStage`

Emitted when a user has requested to join the webinar meeting.

`peerRejectedToJoinStage`

Emitted when the user's request to join the meeting has been rejected.

`peerAcceptedToJoinStage`

Emitted when the user's request to join the meeting has been accepted

`peerStoppedPresenting`

Emitted when a participant stops presenting in the webinar meeting.

`peerStartedPresenting`

Emitted when a participant starts presenting in the webinar meeting.

#### _web-core_participants_participant-object.md

> Source: https://docs.realtime.cloudflare.com/web-core/participants/participant-object
> Scraped: 11/24/2025, 5:20:17 AM

The `participant` object consists of all the information related to a particular participant. For instance, it contains a participants video/audio/screenshare stream, and the participant's name. It also contains state variables that indicate whether a participant's camera is on or off, and whether they are muted or unmuted. Head over to [RTKParticipant](_web-core_reference_RTKParticipant.md) for a detailed reference.

The participant object has the following properties.

**Media**:

*   `videoEnabled`: Set to true if the participant's camera is on.
*   `audioEnabled`: Set to true if the participant is unmuted.
*   `screenShareEnabled`: Set to true if the participant is sharing their screen.
*   `videoTrack`: The video track of the participant.
*   `audioTrack`: The audio track of the participant.
*   `screenShareTracks`: The video and audio (if any) track of the participant's screen share stream.

**Metadata**:

*   `id`: The `participantId` of the participant (aka `peerId`).
*   `userId`: The `userId` of the participant.
*   `name`: The participant's name.
*   `picture`: The participant's picture (if any).
*   `customParticipantId`: An arbitrary ID that can be set to identify the participant.
*   `isPinned`: Set to true if the participant is pinned.
*   `presetName`: Name of the preset associated with the participant.

The participant object is an event emitter, so you can set listeners on this object for events such as video and audio updates. For instance, to fire a callback when a participant toggles their mic, you can subscribe to the following events.
```
meeting.participants.joined  
  .get(participantId)  .on('audioUpdate', ({ audioEnabled, audioTrack }) => {    // This will only be fired on mic toggles for the participant with ID `participantId`    console.log(      'The participant with id',      participantId,      'has toggled their mic to',      audioEnabled,    );  });
```
The events emitted by all participant objects are also re-emitted by all the maps in `meeting.participants`. Therefore, you can add a listener to `meeting.participants.joined` for the `audioUpdate` event. For instance, the same code above can be re-implemented as follows.
```
meeting.participants.joined.on(  
  'audioUpdate',  (participant, { audioEnabled, audioTrack }) => {    // This will be fired on mic toggles for all participants in the meeting    console.log(      'The participant with id',      participant.id,      'has toggled their mic to',      audioEnabled,    );  },);  
```
Read more about the participant events in the [events](_web-core_participants_events.md) section in the API reference.

## Host controls methods[​](_web-core_participants_participant-object.md#host-controls-methods)

If you (the local user) have the relevant permissions in the meeting, you can disable a participant's video/audio streams, or even remove them from the meeting.
```
const participant = meeting.participants.joined.get(participantId);  
  
// To disable a participant's video stream  
participant.disableVideo();  
  
// To disable a participant's audio stream  
participant.disableAudio();  
  
// To kick a participant from the meeting  
participant.kick();  
```
You can also `pin` or `unpin` a participant in the meeting. All "pinned" participants are added to the `meeting.participants.pinned` map.
```
const participant = meeting.participants.joined.get(participantId);  
  
// Pin a participant to the meeting.  
await participant.pin();  
  
// Unpin a participant in the meeting.  
await participant.unpin();  
```
## Play Video Track[​](_web-core_participants_participant-object.md#play-video-track)

### Register Video Element[​](_web-core_participants_participant-object.md#register-video-element)

API to play a users video track on a provided `<video>` element.
```
// this is the video element where we want to play the users track  
const videoElement = document.querySelector('video.participant');  
  
meeting.self.registerVideoElement(videoElement);  
  
// if you want to play a preview video track which is local  
// and not sent to other users, you can pass  
// the second argument `isPreview` as `true`.  
meeting.self.registerVideoElement(videoElement, true);  
```
### Deregister Video Element[​](_web-core_participants_participant-object.md#deregister-video-element)

There is also a way to deregister a video element. This is typically done in the cleanup phase if you are using some framework like React.
```
meeting.self.deregisterVideoElement(videoElement);  
```

#### _web-core_participants_permissions.md

> Source: https://docs.realtime.cloudflare.com/web-core/participants/permissions
> Scraped: 11/24/2025, 5:20:21 AM

Permissions for a participant are defined by the preset. However they can updated in meeting by calling `updatePermissions` for remote participants

Permissions can be updated for either a single participant or multiple participant at once. Find the `id`s of the participant whose permissions need to be updated
```
// Allow file upload permissions in public chat  
const newPermissions = { chat: { public: { files: true } } };  
  
meeting.participants.updatePermissions(participantIds, newPermissions);  
```
Allowed values for update permissions objects. Every field is optional

#### _web-core_participants_pip.md

> Source: https://docs.realtime.cloudflare.com/web-core/participants/pip
> Scraped: 11/24/2025, 5:20:17 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# Picture-in-Picture

Picture-in-Picture API allows you to render `meeting.participants.active` participant's video as a floating tile outside of the current webpage's context.

Supported in Chrome/Edge/Chromium based browsers

## Methods[​](#methods)

### Check if supported[​](#check-if-supported)

Use the boolean value at `meeting.participants.pip.isSupported` to check if the browser supports PIP capabilities

### Initialization[​](#initialization)

Call `meeting.participant.pip.init()` to activate PIP mode. Optionally you can pass height and width the configure the size of the PIP tile

*   Javascript
*   React
```codeBlockLines_e6Vv
meeting.participant.pip.init({  
  width: 360,  height: 360,});  
```
```codeBlockLines_e6Vv
const { meeting } = useRealtimeKitMeeting();  
meeting.participants.pip.init({  
  width: 360,  height: 360,});  
```
### Enable[​](#enable)

`meeting.participant.pip.enable()` to enable PIP mode if disabled

### Disable[​](#disable)

`meeting.participant.pip.disable()` to enable PIP mode if enabled

#### _web-core_plugins_disable-plugin.md

> Source: https://docs.realtime.cloudflare.com/web-core/plugins/disable-plugin
> Scraped: 11/24/2025, 5:20:15 AM

Each plugin in `meeting.plugins` object is of type [`RTKPlugin`](_web-core_plugins_introduction.md) and exposes the following functions to disable plugins.

## Remove Plugin View[​](_web-core_plugins_disable-plugin.md#remove-plugin-view)

This method is used for cleaning up event listeners attached to an iframe. It must be used before the iframe is removed from the DOM.

*   Javascript
*   React
```
const plugins = useRealtimeKitSelector((m) => m.plugins.all.toArray());  
plugins.forEach(async (plugin: RTKPlugin) => {  
  await plugin.removePluginView();});  
```
### Deactivate Plugins[​](_web-core_plugins_disable-plugin.md#deactivate-plugins)

The `deactivate()` method deactivates the plugin for all users in the meeting. When you deactivate a plugin, it gets removed from the active plugins map and can only be accessed from `meeting.plugins.all`.

The snippet below displays all active plugins and deactivate a plugin on click.

*   Javascript
*   React
```
const plugins = useRealtimeKitSelector((m) => m.plugins.active.toArray());  
plugins.forEach((plugin: RTKPlugin) => {  
  const button = document.createElement('button');  button.innerText = `Deactivate ${plugin.name}`;  button.onclick = async () => {    await plugin.deactivate();  };  document.body.appendChild(button);});  
```
Here is another way you can deactivate a plugin.
```
const plugins = meeting.plugins.active.toArray();  
const plugin = plugins.find((p) => p.name === 'YouTube');  
  
await plugin?.deactivate();  
```
### Disable Plugins[​](_web-core_plugins_disable-plugin.md#disable-plugins)

**_Deprecated_**

The `disable()` method deactivates the plugin for the current user. This does not affect other users in the meeting.
```
const plugins = meeting.plugins.active.toArray();  
const plugin = plugins.find((p) => p.name === 'YouTube');  
  
await plugin?.disable();  
```

#### _web-core_plugins_enable-plugin.md

> Source: https://docs.realtime.cloudflare.com/web-core/plugins/enable-plugin
> Scraped: 11/24/2025, 5:20:16 AM

Each plugin in `meeting.plugins` object is of type [`RTKPlugin`](_web-core_plugins_introduction.md) and exposes the following functions to enable plugins.

### Add Plugin View[​](_web-core_plugins_enable-plugin.md#add-plugin-view)

This method adds the communication layer between the plugin inside the iframe and the core application (meeting object) in the main window.

*   Javascript
*   React
```
const plugins = useRealtimeKitSelector((m) => m.plugins.all.toArray());  
plugins.forEach(async (plugin: RTKPlugin) => {  
  const iframe = document.createElement('iframe');  await plugin.addPluginView(iframe);});  
```
### Activate Plugins[​](_web-core_plugins_enable-plugin.md#activate-plugins)

The `activate()` method activates a plugin for all users in the meeting. When you activate a plugin, it moves into the active plugins map and can be accessed from `meeting.plugins.active`.

The snippet below displays all plugins and activates a plugin on click.

*   Javascript
*   React
```
const plugins = useRealtimeKitSelector((m) => m.plugins.all.toArray());  
plugins.forEach((plugin: RTKPlugin) => {  
  const button = document.createElement('button');  button.innerText = plugin.name;  button.onclick = async () => {    await plugin.activate();  };  document.body.appendChild(button);});  
```
Here is another way you can activate a plugin.

*   Javascript
*   React
```
const plugins = useRealtimeKitSelector((m) => m.plugins.all.toArray());  
const plugin = plugins.find((p) => p.name === 'YouTube');  
await plugin?.activate();  
```
### Enable Plugins[​](_web-core_plugins_enable-plugin.md#enable-plugins)

**_Deprecated_**

The `enable()` method enables a plugin for the current user. This does not affect other users in the meeting.
```
const plugins = meeting.plugins.all.toArray();  
const plugin = plugins.find((p) => p.name === 'YouTube');  
  
await plugin?.enable();  
```

#### _web-core_plugins_extra.md

> Source: https://docs.realtime.cloudflare.com/web-core/plugins/extra
> Scraped: 11/24/2025, 5:20:17 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# Other methods

## Subscribe to events from a plugin[​](#subscribe-to-events-from-a-plugin)

A plugin emits the following events:

*   `enabled` - Emitted when a plugin is enabled.
*   `closed` - Emitted when a plugin is closed.
*   `rtkStateUpdate` - Emitted when the state of the plugin has changed.
*   `ready` - Emitted when the plugin is ready to exchange data with client SDK.
*   `toggleViewMode` - Emitted when the control is toggled for users with view-only permissions for a plugin.
```codeBlockLines_e6Vv
const pluginId = '...';  
const plugin = meeting.plugins.active.get(pluginId);  
plugin.on('enabled', () => {  
  console.log('The plugin has been enabled');});  
```
## Send data to the plugin[​](#send-data-to-the-plugin)

You can send data (type `any`) to a plugin using the `sendData()` method. This method comes in handy when building your own plugin.
```codeBlockLines_e6Vv
const pluginId = '...';  
const plugin = meeting.plugins.active.get(pluginId);  
plugin.on('ready', () => {  
  plugin.sendData({    eventName: 'my-custom-event',    data: 'Hello world',  });});  
```

#### _web-core_plugins_introduction.md

> Source: https://docs.realtime.cloudflare.com/web-core/plugins/introduction
> Scraped: 11/24/2025, 5:20:17 AM

Plugins are one-click add-ons that can make your meetings more immersive and collaborative. RealtimeKit provides a bunch of inbuilt plugins to choose from, you can also build your own plugins using the Plugin SDK.

The meeting plugins can be accessed from the `meeting.plugins` object, it exposes the following.

Each plugin in the map is of type `RTKPlugin`.

Once a plugin is activated, `plugin.config` get's populated. It is of type `PluginConfig`.
```
interface PluginConfig {  
  name: string;  pluginId: string;  version: string;  description: string;  author?: string;  repository?: string;  tags?: string[];  picture?: string;  url?: string;  files: {    include: string[];    exclude?: string[];  };  views?: {    [viewId: string]: {      url: string;      suggestedPosition: string;    };  };  contentScript?: string;  permissions?: {    [key: string]: {      default: boolean;      description: string;    };  };  config?: {    [key: string]: string;  };}  
```

#### _web-core_polls_creating-a-poll.md

> Source: https://docs.realtime.cloudflare.com/web-core/polls/creating-a-poll
> Scraped: 11/24/2025, 5:20:15 AM

A new poll can be created using the `create` method from the [`meeting.polls`](_web-core_polls_introduction.md) object. The `meeting.polls.create()` method accepts the following params.

The following snippet creates a poll where votes are anonymous.
```
await meeting.poll.create(  
  'Are you an early bird or a night owl?',  ['Early bird', 'Night owl'],  true,);  
```

#### _web-core_polls_introduction.md

> Source: https://docs.realtime.cloudflare.com/web-core/polls/introduction
> Scraped: 11/24/2025, 5:20:17 AM

The meetings polls object can be accessed using `meeting.polls`. It provides methods to create polls, vote, and more.

`meeting.polls.items` returns an array of all polls created in a meeting, where each element is an object of type `Poll`.

The type `Poll` is defined in the following manner.
```
interface Poll {  
  id: string;  question: string;  options: PollOption[];  anonymous: boolean;  hideVotes: boolean;  createdBy: string;  createdByUserId: string;  voted: string[]; // stores participant ID}  
  
interface PollOption {  
  text: string;  votes: {    id: string; // stores participant ID    name: string;  }[];  count: number;}  
```

#### _web-core_polls_other-poll-functions.md

> Source: https://docs.realtime.cloudflare.com/web-core/polls/other-poll-functions
> Scraped: 11/24/2025, 5:20:18 AM

**The total votes on a poll can be accessed in the following manner.**

`votes` is an array of participant ID's (`meeting.participant.id`).

**The total votes on a poll option can be accessed in the following manner.**

An event is fired each time `meeting.polls.items` is updated or created. User can listen for this to get the updated list of polls. the response object contains the following properties.
```
meeting.polls.on('pollsUpdate', ({ polls, newPoll }) => {  
  console.log(polls, newPoll);});  
```

#### _web-core_polls_voting-on-a-poll.md

> Source: https://docs.realtime.cloudflare.com/web-core/polls/voting-on-a-poll
> Scraped: 11/24/2025, 5:20:18 AM

The `meeting.polls.vote()` method can be used to register a vote on a poll. It accepts the following params.

The following snippet votes for the 1st option on the 1st poll created in the meeting.
```
const poll = meeting.polls.items[0];  
await meeting.poll.vote(poll.id, 0);  
```

#### _web-core_pre-call_handling-permissions.md

> Source: https://docs.realtime.cloudflare.com/web-core/pre-call/handling-permissions
> Scraped: 11/24/2025, 5:20:18 AM

```
useEffect(() => {  
  const onMediaPermissionUpdate = ({ kind, message }) => {    console.log(`Permission update for ${kind} is ${message}`);  };  meeting.self?.on('mediaPermissionUpdate', onMediaPermissionUpdate);  return () => {    meeting.self?.off('mediaPermissionUpdate', onMediaPermissionUpdate);  };}, [meeting]);  
```

#### _web-core_pre-call_media-preview.md

> Source: https://docs.realtime.cloudflare.com/web-core/pre-call/media-preview
> Scraped: 11/24/2025, 5:20:12 AM

This section focuses on pre-call functionality, providing developers with the tools needed to prepare the media environment before joining the meeting. If you are using our UI Kits, this will be handled by `rtk-setup-screen` or could be built with `rtk-participant-tile`, `rtk-settings` components.

## Properties[​](_web-core_pre-call_media-preview.md#properties)

*   `audioEnabled`: A boolean value indicating if the audio is currently enabled.
    
*   `videoEnabled`: A boolean value indicating if the video is currently enabled.
    
*   `audioTrack`: The audio track for the local user.
    
*   `videoTrack`: The video track for the local user.
    

## Methods[​](_web-core_pre-call_media-preview.md#methods)

### Toggling Media[​](_web-core_pre-call_media-preview.md#toggling-media)

The same methods used by post joining meeting are also used to control media-pre meeting.

**1\. Mute/Unmute microphone**
```
// Mute Audio  
await meeting.self.disableAudio();  
  
// Unmute Audio  
await meeting.self.enableAudio();  
```
Anytime there is an update in audio state you will get a `audioUpdate` event

*   Javascript
*   React
```
const audioEnabled = useRealtimeKitSelector((m) => m.self.audioEnabled);  
const audioTrack = useRealtimeKitSelector((m) => m.self.audioTrack);  
```
or if you want a traditional JS event you can use the `audioUpdate` event
```
// Alternatively  
useEffect(() => {  
  if (!meeting) return;  
  const onAudioUpdate = ({ audioEnabled, audioTrack }) => {    // if enabled show a visual(izer) preview of the audio to the user  };  
  meeting.self.on('audioUpdate', onAudioUpdate);  return () => {    meeting.self.removeListener('audioUpdate', onAudioUpdate);  };}, [meeting]);  
```
**2\. Enable/Disable camera**
```
// Disable Video  
await meeting.self.disableVideo();  
  
// Enable Video  
await meeting.self.enableVideo();  
```
Anytime there is an update in audio state you will get a `videoUpdate` event

*   Javascript
*   React
```
const videoEnabled = useRealtimeKitSelector((m) => m.self.videoEnabled);  
const videoTrack = useRealtimeKitSelector((m) => m.self.videoTrack);  
```
or if you want a traditional JS event you can use the `videoUpdate` event
```
// Alternatively  
useEffect(() => {  
  if (!meeting) return;  
  const onVideoUpdate = ({ videoEnabled, videoTrack }) => {    // if videoEnabled play video here to a <video> element  };  
  meeting.self.on('videoUpdate', onVideoUpdate);  return () => {    meeting.self.removeListener('videoUpdate', onVideoUpdate);  };}, [meeting]);  
```
### Changing Media Device[​](_web-core_pre-call_media-preview.md#changing-media-device)

To get the list of media devices that are currently being used, you can use the following methods:
```
// Fetch current media devices being used  
const currentDevices = meeting.self.getCurrentDevices();  
```
```
// Get all media devices  
const devices = await meeting.self.getAllDevices();  
  
// Get all audio devices  
const audioDevices = await meeting.self.getAudioDevices();  
  
// Get all video devices  
const videoDevices = await meeting.self.getVideoDevices();  
  
// Get all speakers  
const speakerDevices = await meeting.self.getSpeakerDevices();  
```
These methods should be called when you want the user to be shown these preferences. When the user selects a device, use the below method to select the device.

**Set device**
```
meeting.self.setDevice(device);  
// eg. device = videoDevices[0];  
```

#### _web-core_pre-call_meeting-meta.md

> Source: https://docs.realtime.cloudflare.com/web-core/pre-call/meeting-meta
> Scraped: 11/24/2025, 5:20:18 AM

Allow the user to edit their name by calling `setName` method.

Before joining the meeting, you can get a list of people currently in the meeting by using the method
```
/** Returns all peers currently in the room, is a non paginated call * and should only be used if you are in a non room joined state, * if in a joined group call, use `meeting.participants.joined` */meeting.participants.getParticipantsInMeetingPreJoin();  
```

#### _web-core_pre-call_virtual-bg.md

> Source: https://docs.realtime.cloudflare.com/web-core/pre-call/virtual-bg
> Scraped: 11/24/2025, 5:20:18 AM

## Virtual Background & Blur[​](_web-core_pre-call_virtual-bg.md#virtual-background--blur)

### Installation[​](_web-core_pre-call_virtual-bg.md#installation)

To enable the virtual background feature in your application, you first need to install the "Background Transformer" package.

*   NPM
*   CDN
```
npm i @cloudflare/realtimekit-virtual-background  
```
### Initialize[​](_web-core_pre-call_virtual-bg.md#initialize)
```
import RealtimeKitVideoBackgroundTransformer from '@cloudflare/realtimekit-virtual-background';  
```
If you installed the package using a script tag, the `RealtimeKitVideoBackgroundTransformer` will be automatically available for use once the installation process is complete.

2.x versions of RealtimeKitVideoBackgroundTransformer use their own rendering mechanism thus require you to disable the default per frame canvas rendering.
```
await meeting.self.setVideoMiddlewareGlobalConfig({  
  disablePerFrameCanvasRendering: true,});  
```
Now that we have disabled the per frame rendering, we can initialise the RealtimeKitVideoBackgroundTransformer.
```
const videoBackgroundTransformer = await RealtimeKitVideoBackgroundTransformer.init({  
  meeting: meeting,  segmentationConfig: { // optional    pipeline: 'webgl2', // 'webgl2' | 'canvas2dCpu'  },});  
```
To customise RealtimeKitVideoBackgroundTransformer configs, please refer to the [RealtimeKit virtual background](https://www.npmjs.com/package/@cloudflare/realtimekit-virtual-background?activeTab=readme) NPM package.

### Add an image as a background[​](_web-core_pre-call_virtual-bg.md#add-an-image-as-a-background)

To incorporate an image as a background, create a static background video middleware using the `createStaticBackgroundVideoMiddleware` method provided by the `videoBackgroundTransformer` object.
```
const videoMiddleware =  
  await videoBackgroundTransformer.createStaticBackgroundVideoMiddleware(    `https://assets.dyte.io/backgrounds/bg-dyte-office.jpg`,  );meeting.self.addVideoMiddleware(videoMiddleware);  
```
note

Ensure that the URL of the image allows Cross-Origin Resource Sharing (CORS) to avoid canvas tainting issues. If the CORS policy is not allowed for the image, it may result in the video feed getting stuck on a frame or appearing blank.

### Blur the background[​](_web-core_pre-call_virtual-bg.md#blur-the-background)

Create a background blur video middleware using the `createBackgroundBlurVideoMiddleware` method provided by the `videoBackgroundTransformer` object.
```
const videoMiddleware =  
  await videoBackgroundTransformer.createBackgroundBlurVideoMiddleware(10);meeting.self.addVideoMiddleware(videoMiddleware);  
```
Pass intensity as a parameter between 1-100

### Remove blur/virtual background[​](_web-core_pre-call_virtual-bg.md#remove-blurvirtual-background)

Use the `removeVideoMiddleware` method
```
meeting.self.removeVideoMiddleware(videoMiddleware);  
```
## Noise Cancellation (Krisp.ai)[​](_web-core_pre-call_virtual-bg.md#noise-cancellation-krispai)

### Installation[​](_web-core_pre-call_virtual-bg.md#installation-1)

Create/Append to the `.npmrc` file in the project root with the below contents
```
//registry.npmjs.org/:_authToken=<paid-token-from-dyte>  
@dytesdk:registry=https://registry.npmjs.org/  
#always-auth=true  
```
```
npm i @dytesdk/krisp-noise-cancellation  
```
### Usage[​](_web-core_pre-call_virtual-bg.md#usage)

**Initialise the middleware**
```
const krisp = new Krisp();  
await krisp.init(meeting);  
```
**Enable / disable the noise cancellation**
```
krisp.activate()  
// krisp.deactivate()  
```

#### _web-core_pre-call_waiting-room.md

> Source: https://docs.realtime.cloudflare.com/web-core/pre-call/waiting-room
> Scraped: 11/24/2025, 5:20:17 AM

After you call `.join()` on meeting, you either get a `roomJoined` event if you are allowed to join or a `waitlisted` event.

Use the `self.roomState` to track the user's state in the meeting.

This diagram only represents the waiting room related states, the `roomState` property also transitions through other states

Each of these state changes generate their own events.

*   **joined**   Javascript
*   React
```
const roomState = useRealtimeKitSelector((m) => m.self.roomState);  
const joined = roomState === 'joined';  
```
Alternatively
```
meeting.self.on('roomJoined', () => {  
  // local user is in the meeting});  
```
*   **waitlisted**   Javascript
*   React
```
const roomState = useRealtimeKitSelector((m) => m.self.roomState);  
const isWaitlisted = roomState === 'waitlisted';  
```
Alternatively
```
meeting.self.on('waitlisted', () => {  
  // local user is waitlisted});  
```
*   **rejected**   Javascript
*   React
```
const roomState = useRealtimeKitSelector((m) => m.self.roomState);  
const rejected = roomState === 'rejected';  
```
Alternatively
```
meeting.self.on('roomLeft', ({ state }) => {  
  // state = rejected when host rejects the entry});  
```
Host can use [these methods to accept/reject participants](_web-core_participants.md#waiting-room-methods)

#### _web-core_recording.md

> Source: https://docs.realtime.cloudflare.com/web-core/recording
> Scraped: 11/24/2025, 5:20:13 AM

The `meeting.recording` object can be used start and stop recordings in a meeting. You can also get the current status of a recording using this API.

The `meeting.recording` object has the following properties:

## List recordings[​](_web-core_recording.md#list-recordings)

Retrieve a list of active recordings along with their current status.

*   Javascript
*   React
```
const recordings = useRealtimeKitSelector((m) => m.recording.recordings);  
```
it returns list of recording ids and their state
```
[  
  {    id: '<recording-id>',    state: '<recording-state>',  },];  
```
The recording states include `IDLE`, `STARTING`, `RECORDING`, `PAUSED`, and `STOPPING`.

## Start a recording[​](_web-core_recording.md#start-a-recording)

Initiate a recording using the start method.
```
await meeting.recording.start();  
```
To enable multiple parallel recordings, the first recording must be started with the option `{ allowMultiple: true }`.
```
await meeting.recording.start({ allowMultiple: true });  
```
Subsequent recordings can then be initiated while the first is still running.

## Stop a recording[​](_web-core_recording.md#stop-a-recording)

End an active recording with the stop method.
```
await meeting.recording.stop();  
```
To stop a specific recording, provide the recording ID:
```
await meeting.recording.stop(recordingId);  
```
Omitting the recording ID will stop all recordings in `RECORDING` or `PAUSED` state.

## Pause a recording[​](_web-core_recording.md#pause-a-recording)

Temporarily halt a recording using the pause method.
```
await meeting.recording.pause();  
```
To pause a specific recording, include the recording ID:
```
await meeting.recording.pause(recordingId);  
```
Without a recording ID, all recordings in the `RECORDING` state will be paused.

## Resume a recording[​](_web-core_recording.md#resume-a-recording)

Restart a paused recording with the resume method.
```
await meeting.recording.resume();  
```
For resuming a specific recording, pass the recording ID:
```
await meeting.recording.resume(recordingId);  
```
If no recording ID is specified, all recordings in the `PAUSED` state will be resumed.

## Recording Configuration[​](_web-core_recording.md#recording-configuration)

You can set the defaults for recording during initialization

*   Javascript
*   React
```
useEffect(() => {  
  initMeeting({    authToken,    defaults: {      recording: recordingConfig,    },  });}, []);  
```
In recording config you can specify height, width and codec of the recording output. You can also customize the recording file name prefix.
```
interface RecordingConfig {  
  videoConfig?: {    height?: number;    width?: number;    codec?: 'H264' | 'VP8';  };  fileNamePrefix?: string;}  
```
#### videoConfig[​](_web-core_recording.md#videoconfig)

1.  **codec** - Codec using which the recording will be encoded. `H264` will use a `mp4` container, `VP8` will use a `webm` container
    
    Allowed values: `H264` | `VP8`
    
    Default: `H264`
    
2.  **width** - Width of the recording video in pixels Allowed values: 1 >= width <= 1920
    
    Default: `1280`
    
3.  **height** - Height of the recording video in pixels Allowed values: 1 >= height <= 1920
    
    Default: `720`
    

#### fileNamePrefix[​](_web-core_recording.md#filenameprefix)

You can customize the file name generated by RealtimeKit recorder. All recordings for the meeting will start with the prefix provided here. It is equivalent of `file_name_prefix` in our [start recording API](_api.md#/)

## Check active recording state[​](_web-core_recording.md#check-active-recording-state)

The `meeting.recording.recordingState` property describes the current state of the recording. The valid states are `IDLE`, `STARTING`, `RECORDING`, `PAUSED` and `STOPPING`.

#### _web-core_reference_RTKAi.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKAi
> Scraped: 11/24/2025, 5:20:23 AM

This module consists of the `ai` object which is used to interface with RealtimeKit's AI features. You can obtain the live meeting transcript and use other meeting AI features such as summary, and agenda using this object.

* [RTKAi](_web-core_reference_RTKAi.md#module_RTKAi)
    * [.parseTranscript()](_web-core_reference_RTKAi.md#module_RTKAi.parseTranscript)
    * [.parseTranscripts()](_web-core_reference_RTKAi.md#module_RTKAi.parseTranscripts)

### meeting.ai.parseTranscript()[​](_web-core_reference_RTKAi.md#meetingaiparsetranscript)

Parse a single line transcript

**Kind**: static method of [`RTKAi`](_web-core_reference_RTKAi.md#module_RTKAi)

### meeting.ai.parseTranscripts()[​](_web-core_reference_RTKAi.md#meetingaiparsetranscripts)

Parse a multi-line transcript

**Kind**: static method of [`RTKAi`](_web-core_reference_RTKAi.md#module_RTKAi)

#### _web-core_reference_RTKChat.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKChat
> Scraped: 11/24/2025, 5:20:23 AM

This is the chat module, which can be used to send and receive messages from the meeting.

* [RTKChat](_web-core_reference_RTKChat.md#module_RTKChat)
    * [.messages](_web-core_reference_RTKChat.md#module_RTKChat+messages)
    * [.channels](_web-core_reference_RTKChat.md#module_RTKChat+channels)
    * [.socketJoined](_web-core_reference_RTKChat.md#module_RTKChat+socketJoined)
    * [.pinned](_web-core_reference_RTKChat.md#module_RTKChat+pinned)
    * [.setMaxTextLimit()](_web-core_reference_RTKChat.md#module_RTKChat+setMaxTextLimit)
    * [.sendTextMessage(message)](_web-core_reference_RTKChat.md#module_RTKChat+sendTextMessage)
    * [.sendImageMessage(image)](_web-core_reference_RTKChat.md#module_RTKChat+sendImageMessage)
    * [.sendFileMessage(file)](_web-core_reference_RTKChat.md#module_RTKChat+sendFileMessage)
    * [.sendMessage(message, participantIds)](_web-core_reference_RTKChat.md#module_RTKChat+sendMessage)
    * [.getMessagesByUser(userId)](_web-core_reference_RTKChat.md#module_RTKChat+getMessagesByUser)
    * [.getMessagesByType(type)](_web-core_reference_RTKChat.md#module_RTKChat+getMessagesByType)
    * [.pin(id)](_web-core_reference_RTKChat.md#module_RTKChat+pin)
    * [.unpin(id)](_web-core_reference_RTKChat.md#module_RTKChat+unpin)
    * [.getMessages()](_web-core_reference_RTKChat.md#module_RTKChat+getMessages)
    * [.createChannel()](_web-core_reference_RTKChat.md#module_RTKChat+createChannel)
    * [.updateChannel()](_web-core_reference_RTKChat.md#module_RTKChat+updateChannel)
    * [.sendMessageToChannel(message, channelId)](_web-core_reference_RTKChat.md#module_RTKChat+sendMessageToChannel)
    * [.getChannelMembers()](_web-core_reference_RTKChat.md#module_RTKChat+getChannelMembers)
    * [.searchMessages()](_web-core_reference_RTKChat.md#module_RTKChat+searchMessages)
    * [.markLastReadMessage()](_web-core_reference_RTKChat.md#module_RTKChat+markLastReadMessage)

### meeting.chat.messages[​](_web-core_reference_RTKChat.md#meetingchatmessages)

An array of chat messages.

**Kind**: instance property of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

### meeting.chat.channels[​](_web-core_reference_RTKChat.md#meetingchatchannels)

An Array of all available channels.

**Kind**: instance property of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

### meeting.chat.socketJoined[​](_web-core_reference_RTKChat.md#meetingchatsocketjoined)

Returns true if the local participant has joined the meeting.

**Kind**: instance property of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

### meeting.chat.pinned[​](_web-core_reference_RTKChat.md#meetingchatpinned)

Returns an array of pinned messages.

**Kind**: instance property of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

### meeting.chat.setMaxTextLimit()[​](_web-core_reference_RTKChat.md#meetingchatsetmaxtextlimit)

Set the max character limit of a text message

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

### meeting.chat.sendTextMessage(message)[​](_web-core_reference_RTKChat.md#meetingchatsendtextmessagemessage)

Sends a chat text message to the room.

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

Param

Description

message

The message that must be sent to the room.

### meeting.chat.sendImageMessage(image)[​](_web-core_reference_RTKChat.md#meetingchatsendimagemessageimage)

Sends an image message to the meeting.

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

Param

Description

image

The image that is to be sent.

### meeting.chat.sendFileMessage(file)[​](_web-core_reference_RTKChat.md#meetingchatsendfilemessagefile)

Sends a file to the meeting.

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

Param

Description

file

A File object.

### meeting.chat.sendMessage(message, participantIds)[​](_web-core_reference_RTKChat.md#meetingchatsendmessagemessage-participantids)

Sends a message to the meeting. This method can be used to send text, image, or file messages. The message type is determined by the key 'type' in `message` object.

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

Param

Description

message

An object including the type and content of the message.

participantIds

An array including the userIds of the participants.

### meeting.chat.getMessagesByUser(userId)[​](_web-core_reference_RTKChat.md#meetingchatgetmessagesbyuseruserid)

Returns an array of messages sent by a specific userId.

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

Param

Description

userId

The user id of the user that sent the message.

### meeting.chat.getMessagesByType(type)[​](_web-core_reference_RTKChat.md#meetingchatgetmessagesbytypetype)

Returns an array of 'text', 'image' or 'file' messages.

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

Param

Description

type

'text', 'image', or 'file'.

### meeting.chat.pin(id)[​](_web-core_reference_RTKChat.md#meetingchatpinid)

Pins a chat message

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

Param

Description

id

ID of the message to be pinned

### meeting.chat.unpin(id)[​](_web-core_reference_RTKChat.md#meetingchatunpinid)

Unpins a chat message

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

Param

Description

id

ID of the message to be unpinned

### meeting.chat.getMessages()[​](_web-core_reference_RTKChat.md#meetingchatgetmessages)

Gets chat messages in a paginated manner

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

### meeting.chat.createChannel()[​](_web-core_reference_RTKChat.md#meetingchatcreatechannel)

Creates a channel with specified name and userIds as members

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

### meeting.chat.updateChannel()[​](_web-core_reference_RTKChat.md#meetingchatupdatechannel)

Updates the channel

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

### meeting.chat.sendMessageToChannel(message, channelId)[​](_web-core_reference_RTKChat.md#meetingchatsendmessagetochannelmessage-channelid)

Sends a message to a channel. This method can be used to send text, image, or file messages. The message type is determined by the key 'type' in `message` object.

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

Param

Description

message

An object including the type and content of the message.

channelId

Id of the channel where you want to send the message.

### meeting.chat.getChannelMembers()[​](_web-core_reference_RTKChat.md#meetingchatgetchannelmembers)

returns a list of members added to the channel

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

### meeting.chat.searchMessages()[​](_web-core_reference_RTKChat.md#meetingchatsearchmessages)

search messages

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

### meeting.chat.markLastReadMessage()[​](_web-core_reference_RTKChat.md#meetingchatmarklastreadmessage)

marks last read message in a channel

**Kind**: instance method of [`RTKChat`](_web-core_reference_RTKChat.md#module_RTKChat)

#### _web-core_reference_RTKConnectedMeetings.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKConnectedMeetings
> Scraped: 11/24/2025, 5:20:19 AM

This consists of the methods to faciliate connected meetings

* [RTKConnectedMeetings](_web-core_reference_RTKConnectedMeetings.md#module_RTKConnectedMeetings)
    * [.getConnectedMeetings()](_web-core_reference_RTKConnectedMeetings.md#module_RTKConnectedMeetings+getConnectedMeetings)
    * [.createMeetings()](_web-core_reference_RTKConnectedMeetings.md#module_RTKConnectedMeetings+createMeetings)
    * [.updateMeetings()](_web-core_reference_RTKConnectedMeetings.md#module_RTKConnectedMeetings+updateMeetings)
    * [.deleteMeetings()](_web-core_reference_RTKConnectedMeetings.md#module_RTKConnectedMeetings+deleteMeetings)
    * [.moveParticipants(sourceMeetingId, destinationMeetingId, participantIds)](_web-core_reference_RTKConnectedMeetings.md#module_RTKConnectedMeetings+moveParticipants)
    * [.moveParticipantsWithCustomPreset()](_web-core_reference_RTKConnectedMeetings.md#module_RTKConnectedMeetings+moveParticipantsWithCustomPreset)

### meeting.connectedMeetings.getConnectedMeetings()[​](_web-core_reference_RTKConnectedMeetings.md#meetingconnectedmeetingsgetconnectedmeetings)

get connected meeting state

**Kind**: instance method of [`RTKConnectedMeetings`](_web-core_reference_RTKConnectedMeetings.md#module_RTKConnectedMeetings)

### meeting.connectedMeetings.createMeetings()[​](_web-core_reference_RTKConnectedMeetings.md#meetingconnectedmeetingscreatemeetings)

create connected meetings

**Kind**: instance method of [`RTKConnectedMeetings`](_web-core_reference_RTKConnectedMeetings.md#module_RTKConnectedMeetings)

### meeting.connectedMeetings.updateMeetings()[​](_web-core_reference_RTKConnectedMeetings.md#meetingconnectedmeetingsupdatemeetings)

update meeting title

**Kind**: instance method of [`RTKConnectedMeetings`](_web-core_reference_RTKConnectedMeetings.md#module_RTKConnectedMeetings)

### meeting.connectedMeetings.deleteMeetings()[​](_web-core_reference_RTKConnectedMeetings.md#meetingconnectedmeetingsdeletemeetings)

delete connected meetings

**Kind**: instance method of [`RTKConnectedMeetings`](_web-core_reference_RTKConnectedMeetings.md#module_RTKConnectedMeetings)

### meeting.connectedMeetings.moveParticipants(sourceMeetingId, destinationMeetingId, participantIds)[​](_web-core_reference_RTKConnectedMeetings.md#meetingconnectedmeetingsmoveparticipantssourcemeetingid-destinationmeetingid-participantids)

Trigger event to move participants

**Kind**: instance method of [`RTKConnectedMeetings`](_web-core_reference_RTKConnectedMeetings.md#module_RTKConnectedMeetings)

Param

Type

Description

sourceMeetingId

`string`

id of source meeting

destinationMeetingId

`string`

id of destination meeting

participantIds

`Array.<string>`

list of id of the participants

### meeting.connectedMeetings.moveParticipantsWithCustomPreset()[​](_web-core_reference_RTKConnectedMeetings.md#meetingconnectedmeetingsmoveparticipantswithcustompreset)

Trigger event to move participants with custom preset

**Kind**: instance method of [`RTKConnectedMeetings`](_web-core_reference_RTKConnectedMeetings.md#module_RTKConnectedMeetings)

#### _web-core_reference_RTKLivestream.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKLivestream
> Scraped: 11/24/2025, 5:20:21 AM

The RTKLivestream module represents the state of the current livestream, and allows to start/stop live streams.

* [RTKLivestream](_web-core_reference_RTKLivestream.md#module_RTKLivestream)
    * [.start()](_web-core_reference_RTKLivestream.md#module_RTKLivestream+start)
    * [.stop()](_web-core_reference_RTKLivestream.md#module_RTKLivestream+stop)

### meeting.livestream.start()[​](_web-core_reference_RTKLivestream.md#meetinglivestreamstart)

Starts livestreaming the meeting.

**Kind**: instance method of [`RTKLivestream`](_web-core_reference_RTKLivestream.md#module_RTKLivestream)

### meeting.livestream.stop()[​](_web-core_reference_RTKLivestream.md#meetinglivestreamstop)

Stops livestreaming the meeting.

**Kind**: instance method of [`RTKLivestream`](_web-core_reference_RTKLivestream.md#module_RTKLivestream)

#### _web-core_reference_RTKMeta.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKMeta
> Scraped: 11/24/2025, 5:20:22 AM

This consists of the metadata of the meeting, such as the room name and the title.

* [RTKMeta](_web-core_reference_RTKMeta.md#module_RTKMeta)
    * [.selfActiveTab](_web-core_reference_RTKMeta.md#module_RTKMeta+selfActiveTab)
    * [.broadcastTabChanges](_web-core_reference_RTKMeta.md#module_RTKMeta+broadcastTabChanges)
    * [.viewType](_web-core_reference_RTKMeta.md#module_RTKMeta+viewType)
    * [.meetingStartedTimestamp](_web-core_reference_RTKMeta.md#module_RTKMeta+meetingStartedTimestamp)
    * [.meetingTitle](_web-core_reference_RTKMeta.md#module_RTKMeta+meetingTitle)
    * [.sessionId](_web-core_reference_RTKMeta.md#module_RTKMeta+sessionId)
    * [.meetingId](_web-core_reference_RTKMeta.md#module_RTKMeta+meetingId)
    * [.setBroadcastTabChanges(broadcastTabChanges)](_web-core_reference_RTKMeta.md#module_RTKMeta+setBroadcastTabChanges)
    * [.setSelfActiveTab(spotlightTab)](_web-core_reference_RTKMeta.md#module_RTKMeta+setSelfActiveTab)

### meeting.meta.selfActiveTab[​](_web-core_reference_RTKMeta.md#meetingmetaselfactivetab)

Represents the current active tab

**Kind**: instance property of [`RTKMeta`](_web-core_reference_RTKMeta.md#module_RTKMeta)

### meeting.meta.broadcastTabChanges[​](_web-core_reference_RTKMeta.md#meetingmetabroadcasttabchanges)

Represents whether current user is spotlighted

**Kind**: instance property of [`RTKMeta`](_web-core_reference_RTKMeta.md#module_RTKMeta)

### meeting.meta.viewType[​](_web-core_reference_RTKMeta.md#meetingmetaviewtype)

The `viewType` tells the type of the meeting possible values are: GROUP\_CALL| LIVESTREAM | CHAT | AUDIO\_ROOM

**Kind**: instance property of [`RTKMeta`](_web-core_reference_RTKMeta.md#module_RTKMeta)

### meeting.meta.meetingStartedTimestamp[​](_web-core_reference_RTKMeta.md#meetingmetameetingstartedtimestamp)

The timestamp of the time when the meeting started.

**Kind**: instance property of [`RTKMeta`](_web-core_reference_RTKMeta.md#module_RTKMeta)

### meeting.meta.meetingTitle[​](_web-core_reference_RTKMeta.md#meetingmetameetingtitle)

The title of the meeting.

**Kind**: instance property of [`RTKMeta`](_web-core_reference_RTKMeta.md#module_RTKMeta)

### meeting.meta.sessionId[​](_web-core_reference_RTKMeta.md#meetingmetasessionid)

(Experimental) The sessionId this meeting object is part of.

**Kind**: instance property of [`RTKMeta`](_web-core_reference_RTKMeta.md#module_RTKMeta)

### meeting.meta.meetingId[​](_web-core_reference_RTKMeta.md#meetingmetameetingid)

The room name of the meeting.

**Kind**: instance property of [`RTKMeta`](_web-core_reference_RTKMeta.md#module_RTKMeta)

### meeting.meta.setBroadcastTabChanges(broadcastTabChanges)[​](_web-core_reference_RTKMeta.md#meetingmetasetbroadcasttabchangesbroadcasttabchanges)

Sets current user as broadcasting tab changes

**Kind**: instance method of [`RTKMeta`](_web-core_reference_RTKMeta.md#module_RTKMeta)

Param

broadcastTabChanges

### meeting.meta.setSelfActiveTab(spotlightTab)[​](_web-core_reference_RTKMeta.md#meetingmetasetselfactivetabspotlighttab)

Sets current active tab for user

**Kind**: instance method of [`RTKMeta`](_web-core_reference_RTKMeta.md#module_RTKMeta)

Param

spotlightTab

#### _web-core_reference_RTKParticipant.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKParticipant
> Scraped: 11/24/2025, 5:20:21 AM

This module represents a single participant in the meeting. The participant object can be accessed from one of the participant lists present in the `meeting.participants` object. For example,
```
const participant1 = meeting.participants.active.get(participantId);  
const participant2 = meeting.participants.joined.get(participantId);  
const participant3 = meeting.participants.active.toArray()[0];  
const participant4 = meeting.participants.active  
  .toArray()  .filter((p) => p.name === 'John');
```
* [RTKParticipant](_web-core_reference_RTKParticipant.md#module_RTKParticipant)
    * [this.](_web-core_reference_RTKParticipant.md#exp_module_RTKParticipant--this.) ⏏
        * [.id](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+id)
        * [.userId](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+userId)
        * [.name](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+name)
        * [.picture](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+picture)
        * [.customParticipantId](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+customParticipantId)
        * [.clientSpecificId](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+clientSpecificId)
        * [.device](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+device)
        * [.videoTrack](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+videoTrack)
        * [.audioTrack](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+audioTrack)
        * [.screenShareTracks](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+screenShareTracks)
        * [.videoEnabled](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+videoEnabled)
        * [.audioEnabled](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+audioEnabled)
        * [.screenShareEnabled](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+screenShareEnabled)
        * [.producers](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+producers)
        * [.manualProducerConfig](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+manualProducerConfig)
        * [.supportsRemoteControl](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+supportsRemoteControl)
        * [.presetName](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+presetName)
        * [.stageStatus](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+stageStatus)
        * [.mediaJoined](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+mediaJoined)
        * [.socketJoined](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+socketJoined)
        * [.isPinned](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+isPinned)
        * [.pin()](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+pin)
        * [.unpin()](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+unpin)
        * [.setIsPinned()](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+setIsPinned)
        * [.disableAudio()](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+disableAudio)
        * [.kick()](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+kick)
        * [.disableVideo()](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+disableVideo)
        * [.updateVideo()](_web-core_reference_RTKParticipant.md#module_RTKParticipant--this.+updateVideo)

### this. ⏏[​](_web-core_reference_RTKParticipant.md#this-)

NOTE(ishita1805): Added a fallback value to support hive group-call till stage support is not completed for hive.

**Kind**: Exported member

#### participant.id[​](_web-core_reference_RTKParticipant.md#participantid)

The peer ID of the participant. The participants are indexed by this ID in the participant map.

#### participant.userId[​](_web-core_reference_RTKParticipant.md#participantuserid)

The user ID of the participant.

#### participant.name[​](_web-core_reference_RTKParticipant.md#participantname)

The name of the participant.

#### participant.picture[​](_web-core_reference_RTKParticipant.md#participantpicture)

The picture of the participant.

#### participant.customParticipantId[​](_web-core_reference_RTKParticipant.md#participantcustomparticipantid)

The custom id of the participant set during Add Participant REST API

#### participant.clientSpecificId[​](_web-core_reference_RTKParticipant.md#participantclientspecificid)

**_Deprecated_**

#### participant.device[​](_web-core_reference_RTKParticipant.md#participantdevice)

The device configuration of the participant.

#### participant.videoTrack[​](_web-core_reference_RTKParticipant.md#participantvideotrack)

The participant's video track.

#### participant.audioTrack[​](_web-core_reference_RTKParticipant.md#participantaudiotrack)

The participant's audio track.

#### participant.screenShareTracks[​](_web-core_reference_RTKParticipant.md#participantscreensharetracks)

The participant's screenshare video and audio track.

#### participant.videoEnabled[​](_web-core_reference_RTKParticipant.md#participantvideoenabled)

This is true if the participant's video is enabled.

#### participant.audioEnabled[​](_web-core_reference_RTKParticipant.md#participantaudioenabled)

This is true if the participant's audio is enabled.

#### participant.screenShareEnabled[​](_web-core_reference_RTKParticipant.md#participantscreenshareenabled)

This is true if the participant is screensharing.

#### participant.producers[​](_web-core_reference_RTKParticipant.md#participantproducers)

producers created by participant

#### participant.manualProducerConfig[​](_web-core_reference_RTKParticipant.md#participantmanualproducerconfig)

producer config passed during manual subscription

#### participant.supportsRemoteControl[​](_web-core_reference_RTKParticipant.md#participantsupportsremotecontrol)

This is true if the RealtimeKit participant supports remote control.

#### participant.presetName[​](_web-core_reference_RTKParticipant.md#participantpresetname)

The preset of the participant.

#### participant.stageStatus[​](_web-core_reference_RTKParticipant.md#participantstagestatus)

Denotes the participants's current stage status.

#### participant.mediaJoined[​](_web-core_reference_RTKParticipant.md#participantmediajoined)

Returns true if the local participant has joined the meeting.

#### participant.socketJoined[​](_web-core_reference_RTKParticipant.md#participantsocketjoined)

Returns true if the local participant has joined the meeting.

#### participant.isPinned[​](_web-core_reference_RTKParticipant.md#participantispinned)

Returns true if the participant is pinned.

#### participant.pin()[​](_web-core_reference_RTKParticipant.md#participantpin)

Returns `participant.id` if user has permission to pin participants.

#### participant.unpin()[​](_web-core_reference_RTKParticipant.md#participantunpin)

Returns `participant.id` if user has permission to unpin participants.

#### participant.setIsPinned()[​](_web-core_reference_RTKParticipant.md#participantsetispinned)

#### participant.disableAudio()[​](_web-core_reference_RTKParticipant.md#participantdisableaudio)

Disables audio for this participant. Requires the permission to disable participant audio.

#### participant.kick()[​](_web-core_reference_RTKParticipant.md#participantkick)

Kicks this participant from the meeting. Requires the permission to kick a participant.

#### participant.disableVideo()[​](_web-core_reference_RTKParticipant.md#participantdisablevideo)

Disables video for this participant. Requires the permission to disable video for a participant.

#### participant.updateVideo()[​](_web-core_reference_RTKParticipant.md#participantupdatevideo)

Internal method, do not use

#### _web-core_reference_RTKParticipantMap.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKParticipantMap
> Scraped: 11/24/2025, 5:20:20 AM

This is a map of participants, indexed by `participant.id` (a participant's peer ID). This map emits an event whenever a participant present in the map emits an event. For example, when a participant is added to this map, a `participantJoined` event is emitted from the map. When a participant object emits an event `videoUpdate`, the map re-emits that event (provided the participant is present in the map).

#### _web-core_reference_RTKParticipants.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKParticipants
> Scraped: 11/24/2025, 5:20:22 AM

This module represents all the participants in the meeting (except the local user). It consists of 4 maps:

*   `joined`: A map of all participants that have joined the meeting.
*   `waitlisted`: A map of all participants that have been added to the waitlist.
*   `active`: A map of active participants who should be displayed in the meeting grid.
*   `pinned`: A map of pinned participants.

* [RTKParticipants](_web-core_reference_RTKParticipants.md#module_RTKParticipants)
    * [.waitlisted](_web-core_reference_RTKParticipants.md#module_RTKParticipants+waitlisted)
    * [.joined](_web-core_reference_RTKParticipants.md#module_RTKParticipants+joined)
    * [.active](_web-core_reference_RTKParticipants.md#module_RTKParticipants+active)
    * [.videoSubscribed](_web-core_reference_RTKParticipants.md#module_RTKParticipants+videoSubscribed)
    * [.audioSubscribed](_web-core_reference_RTKParticipants.md#module_RTKParticipants+audioSubscribed)
    * [.pinned](_web-core_reference_RTKParticipants.md#module_RTKParticipants+pinned)
    * [.all](_web-core_reference_RTKParticipants.md#module_RTKParticipants+all)
    * [.pip](_web-core_reference_RTKParticipants.md#module_RTKParticipants+pip)
    * [.socketJoined](_web-core_reference_RTKParticipants.md#module_RTKParticipants+socketJoined)
    * [.mediaJoined](_web-core_reference_RTKParticipants.md#module_RTKParticipants+mediaJoined)
    * [.viewMode](_web-core_reference_RTKParticipants.md#module_RTKParticipants+viewMode)
    * [.currentPage](_web-core_reference_RTKParticipants.md#module_RTKParticipants+currentPage)
    * [.lastActiveSpeaker](_web-core_reference_RTKParticipants.md#module_RTKParticipants+lastActiveSpeaker)
    * [.selectedPeers](_web-core_reference_RTKParticipants.md#module_RTKParticipants+selectedPeers)
    * [.count](_web-core_reference_RTKParticipants.md#module_RTKParticipants+count)
    * [.maxActiveParticipantsCount](_web-core_reference_RTKParticipants.md#module_RTKParticipants+maxActiveParticipantsCount)
    * [.pageCount](_web-core_reference_RTKParticipants.md#module_RTKParticipants+pageCount)
    * [.setMaxActiveParticipantsCount(limit:)](_web-core_reference_RTKParticipants.md#module_RTKParticipants+setMaxActiveParticipantsCount)
    * [.acceptWaitingRoomRequest(id)](_web-core_reference_RTKParticipants.md#module_RTKParticipants+acceptWaitingRoomRequest)
    * [.acceptAllWaitingRoomRequest()](_web-core_reference_RTKParticipants.md#module_RTKParticipants+acceptAllWaitingRoomRequest)
    * [.rejectWaitingRoomRequest(id)](_web-core_reference_RTKParticipants.md#module_RTKParticipants+rejectWaitingRoomRequest)
    * [.setViewMode(viewMode)](_web-core_reference_RTKParticipants.md#module_RTKParticipants+setViewMode)
    * [.setPage(page)](_web-core_reference_RTKParticipants.md#module_RTKParticipants+setPage)
    * [.disableAllAudio(allowUnmute)](_web-core_reference_RTKParticipants.md#module_RTKParticipants+disableAllAudio)
    * [.disableAllVideo()](_web-core_reference_RTKParticipants.md#module_RTKParticipants+disableAllVideo)
    * [.disableAudio(participantId)](_web-core_reference_RTKParticipants.md#module_RTKParticipants+disableAudio)
    * [.disableVideo(participantId)](_web-core_reference_RTKParticipants.md#module_RTKParticipants+disableVideo)
    * [.kick(participantId)](_web-core_reference_RTKParticipants.md#module_RTKParticipants+kick)
    * [.kickAll()](_web-core_reference_RTKParticipants.md#module_RTKParticipants+kickAll)
    * [.broadcastMessage(target)](_web-core_reference_RTKParticipants.md#module_RTKParticipants+broadcastMessage)
    * [.getAllJoinedPeers()](_web-core_reference_RTKParticipants.md#module_RTKParticipants+getAllJoinedPeers)
    * [.getParticipantsInMeetingPreJoin()](_web-core_reference_RTKParticipants.md#module_RTKParticipants+getParticipantsInMeetingPreJoin)

### meeting.participants.waitlisted[​](_web-core_reference_RTKParticipants.md#meetingparticipantswaitlisted)

Returns a list of participants waiting to join the meeting.

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.joined[​](_web-core_reference_RTKParticipants.md#meetingparticipantsjoined)

Returns a list of all participants in the meeting.

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.active[​](_web-core_reference_RTKParticipants.md#meetingparticipantsactive)

**_Deprecated_***Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.videoSubscribed[​](_web-core_reference_RTKParticipants.md#meetingparticipantsvideosubscribed)

Returns a list of participants whose video streams are currently consumed.

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.audioSubscribed[​](_web-core_reference_RTKParticipants.md#meetingparticipantsaudiosubscribed)

Returns a list of participants whose audio streams are currently consumed.

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.pinned[​](_web-core_reference_RTKParticipants.md#meetingparticipantspinned)

Returns a list of participants who have been pinned.

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.all[​](_web-core_reference_RTKParticipants.md#meetingparticipantsall)

Returns all added participants irrespective of whether they are currently in the meeting or not

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.pip[​](_web-core_reference_RTKParticipants.md#meetingparticipantspip)

Return the controls for Picture-in-Picture

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.socketJoined[​](_web-core_reference_RTKParticipants.md#meetingparticipantssocketjoined)

Returns true if the local participant has joined the meeting.

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.mediaJoined[​](_web-core_reference_RTKParticipants.md#meetingparticipantsmediajoined)

Returns true if the local participant has joined the meeting.

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.viewMode[​](_web-core_reference_RTKParticipants.md#meetingparticipantsviewmode)

Indicates whether the meeting is in 'ACTIVE\_GRID' mode or 'PAGINATED' mode.

In 'ACTIVE\_GRID' mode, participants are populated in the participants.active map dynamically. The participants present in the map will keep changing when other participants unmute their audio or turn on their videos.

In 'PAGINATED' mode, participants are populated in the participants.active map just once, and the participants in the map will only change if the page number is changed by the user using setPage(page).

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.currentPage[​](_web-core_reference_RTKParticipants.md#meetingparticipantscurrentpage)

This indicates the current page that has been set by the user in PAGINATED mode. If the meeting is in ACTIVE\_GRID mode, this value will be 0.

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.lastActiveSpeaker[​](_web-core_reference_RTKParticipants.md#meetingparticipantslastactivespeaker)

This stores the `participantId` of the last participant who spoke in the meeting.

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.selectedPeers[​](_web-core_reference_RTKParticipants.md#meetingparticipantsselectedpeers)

Keeps a list of all participants who have been present in the selected peers list.

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.count[​](_web-core_reference_RTKParticipants.md#meetingparticipantscount)

Returns the number of participants who are joined in the meeting.

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.maxActiveParticipantsCount[​](_web-core_reference_RTKParticipants.md#meetingparticipantsmaxactiveparticipantscount)

Returns the maximum number of participants that can be present in the active map.

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.pageCount[​](_web-core_reference_RTKParticipants.md#meetingparticipantspagecount)

Returns the number of pages that are available in the meeting in PAGINATED mode. If the meeting is in ACTIVE\_GRID mode, this value will be 0.

**Kind**: instance property of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.setMaxActiveParticipantsCount(limit:)[​](_web-core_reference_RTKParticipants.md#meetingparticipantssetmaxactiveparticipantscountlimit)

Updates the maximum number of participants that are populated in the active map.

**Kind**: instance method of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

Param

Description

limit:

Updated max limit

### meeting.participants.acceptWaitingRoomRequest(id)[​](_web-core_reference_RTKParticipants.md#meetingparticipantsacceptwaitingroomrequestid)

Accepts requests from waitlisted participants if user has appropriate permissions.

**Kind**: instance method of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

Param

Description

id

peerId or userId of the waitlisted participant.

### meeting.participants.acceptAllWaitingRoomRequest()[​](_web-core_reference_RTKParticipants.md#meetingparticipantsacceptallwaitingroomrequest)

We need a new event for socket service events since if we send them all together, sequence of events can be unreliable

**Kind**: instance method of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.rejectWaitingRoomRequest(id)[​](_web-core_reference_RTKParticipants.md#meetingparticipantsrejectwaitingroomrequestid)

Rejects requests from waitlisted participants if user has appropriate permissions.

**Kind**: instance method of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

Param

Description

id

participantId of the waitlisted participant.

### meeting.participants.setViewMode(viewMode)[​](_web-core_reference_RTKParticipants.md#meetingparticipantssetviewmodeviewmode)

Sets the view mode of the meeting to either ACTIVE\_GRID or PAGINATED.

**Kind**: instance method of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

Param

Description

viewMode

The mode in which the active map should be populated

### meeting.participants.setPage(page)[​](_web-core_reference_RTKParticipants.md#meetingparticipantssetpagepage)

Populates the active map with participants present in the page number indicated by the parameter `page` in PAGINATED mode. Does not do anything in ACTIVE\_GRID mode.

**Kind**: instance method of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

Param

Description

page

The page number to be set.

### meeting.participants.disableAllAudio(allowUnmute)[​](_web-core_reference_RTKParticipants.md#meetingparticipantsdisableallaudioallowunmute)

Disables audio for all participants in the meeting.

**Kind**: instance method of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

Param

Description

allowUnmute

Allow participants to unmute after they are muted.

### meeting.participants.disableAllVideo()[​](_web-core_reference_RTKParticipants.md#meetingparticipantsdisableallvideo)

Disables video for all participants in the meeting.

**Kind**: instance method of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.disableAudio(participantId)[​](_web-core_reference_RTKParticipants.md#meetingparticipantsdisableaudioparticipantid)

**_Deprecated_***Kind**: instance method of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

Param

Description

participantId

ID of participant to be muted.

### meeting.participants.disableVideo(participantId)[​](_web-core_reference_RTKParticipants.md#meetingparticipantsdisablevideoparticipantid)

**_Deprecated_***Kind**: instance method of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

Param

Description

participantId

ID of participant to be muted.

### meeting.participants.kick(participantId)[​](_web-core_reference_RTKParticipants.md#meetingparticipantskickparticipantid)

**_Deprecated_***Kind**: instance method of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

Param

Description

participantId

ID of participant to be kicked.

### meeting.participants.kickAll()[​](_web-core_reference_RTKParticipants.md#meetingparticipantskickall)

Kicks all participants from the meeting.

**Kind**: instance method of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.broadcastMessage(target)[​](_web-core_reference_RTKParticipants.md#meetingparticipantsbroadcastmessagetarget)

Broadcasts the message to participants

If no `target` is specified it is sent to all participants including `self`.

**Kind**: instance method of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

Param

Description

target

object containing a list of `participantIds` or object containing `presetName` - every user with that preset will be sent the message

### meeting.participants.getAllJoinedPeers()[​](_web-core_reference_RTKParticipants.md#meetingparticipantsgetalljoinedpeers)

Returns all peers currently present in the room If you are in a group call, use `meeting.participants.joined` instead

**Kind**: instance method of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

### meeting.participants.getParticipantsInMeetingPreJoin()[​](_web-core_reference_RTKParticipants.md#meetingparticipantsgetparticipantsinmeetingprejoin)

Returns all peers currently in the room, is a non paginated call and should only be used if you are in a non room joined state, if in a joined group call, use `meeting.participants.joined`

**Kind**: instance method of [`RTKParticipants`](_web-core_reference_RTKParticipants.md#module_RTKParticipants)

#### _web-core_reference_RTKPermissionsPreset.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKPermissionsPreset
> Scraped: 11/24/2025, 5:20:22 AM

The RTKPermissionsPreset class represents the meeting permissions for the current participant

* [RTKPermissionsPreset](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)
    *   _instance_
        * [.stageEnabled](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+stageEnabled)
        * [.stageAccess](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+stageAccess)
        * [.acceptWaitingRequests](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+acceptWaitingRequests)
        * [.requestProduceVideo](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+requestProduceVideo)
        * [.requestProduceAudio](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+requestProduceAudio)
        * [.requestProduceScreenshare](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+requestProduceScreenshare)
        * [.canAllowParticipantAudio](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+canAllowParticipantAudio)
        * [.canAllowParticipantScreensharing](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+canAllowParticipantScreensharing)
        * [.canAllowParticipantVideo](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+canAllowParticipantVideo)
        * [.canDisableParticipantAudio](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+canDisableParticipantAudio)
        * [.canDisableParticipantVideo](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+canDisableParticipantVideo)
        * [.kickParticipant](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+kickParticipant)
        * [.pinParticipant](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+pinParticipant)
        * [.canRecord](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+canRecord)
        * [.waitingRoomType](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+waitingRoomType)
        * [.waitingRoomBehaviour](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+waitingRoomBehaviour)
        * [.plugins](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+plugins)
        * [.polls](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+polls)
        * [.produceVideo](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+produceVideo)
        * [.requestProduce](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+requestProduce)
        * [.canProduceVideo](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+canProduceVideo)
        * [.produceScreenshare](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+produceScreenshare)
        * [.canProduceScreenshare](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+canProduceScreenshare)
        * [.produceAudio](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+produceAudio)
        * [.canProduceAudio](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+canProduceAudio)
        * [.chatPublic](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+chatPublic)
        * [.chatPrivate](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+chatPrivate)
        * [.hiddenParticipant](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+hiddenParticipant)
        * [.showParticipantList](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+showParticipantList)
        * [.canChangeParticipantRole](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+canChangeParticipantRole)
        * [.canChangeParticipantPermissions](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+canChangeParticipantPermissions)
        * [.canChangeTheme](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+canChangeTheme)
        * [.canPresent](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+canPresent)
        * [.acceptPresentRequests](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+acceptPresentRequests)
        * [.maxScreenShareCount](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+maxScreenShareCount)
        * [.canLivestream](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset+canLivestream)
    *   _static_
        * [.fromResponse()](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset.fromResponse)
        * [.default()](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset.default)

### meeting.self.permissions.stageEnabled[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsstageenabled)

The `stageEnabled` property returns a boolean value. If `true`, stage management is available for the participant.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.stageAccess[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsstageaccess)

The `stageAccess` property dictactes how a user interacts with the stage. There possible values are `ALLOWED`, `NOT_ALLOWED`, `CAN_REQUEST`;

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.acceptWaitingRequests[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsacceptwaitingrequests)

The `acceptWaitingRequests` returns boolean value. If `true`, participant can accept the request of waiting participant.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.requestProduceVideo[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsrequestproducevideo)

The `requestProduceVideo` returns boolean value. If `true`, participant can send request to participants about producing video.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.requestProduceAudio[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsrequestproduceaudio)

The `requestProduceAudio` returns boolean value. If `true`, participant can send request to participants about producing audio.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.requestProduceScreenshare[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsrequestproducescreenshare)

The `requestProduceScreenshare` returns boolean value. If `true`, participant can send request to participants about sharing screen.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.canAllowParticipantAudio[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionscanallowparticipantaudio)

The `canAllowParticipantAudio` returns boolean value. If `true`, participant can enable other participants\` audio.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.canAllowParticipantScreensharing[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionscanallowparticipantscreensharing)

The `canAllowParticipantScreensharing` returns boolean value. If `true`, participant can enable other participants\` screen share.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.canAllowParticipantVideo[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionscanallowparticipantvideo)

The `canAllowParticipantVideo` returns boolean value. If `true`, participant can enable other participants\` video.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.canDisableParticipantAudio[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionscandisableparticipantaudio)

If `true`, a participant can disable other participants\` audio.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.canDisableParticipantVideo[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionscandisableparticipantvideo)

If `true`, a participant can disable other participants\` video.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.kickParticipant[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionskickparticipant)

The `kickParticipant` returns boolean value. If `true`, participant can remove other participants from the meeting.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.pinParticipant[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionspinparticipant)

The `pinParticipant` returns boolean value. If `true`, participant can pin a participant in the meeting.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.canRecord[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionscanrecord)

The `canRecord` returns boolean value. If `true`, participant can record the meeting.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.waitingRoomType[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionswaitingroomtype)

**_Deprecated_***Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.waitingRoomBehaviour[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionswaitingroombehaviour)

The `waitingRoomType` returns string value. type of waiting room behavior possible values are `SKIP`, `ON_PRIVILEGED_USER_ENTRY`, `SKIP_ON_ACCEPT`

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.plugins[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsplugins)

The `plugins` tells if the participant can act on plugins there are 2 permissions with boolean values, `canStart` and `canClose`.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.polls[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionspolls)

The `polls` tells if the participant can use polls. There are 3 permissions with boolean values, `canCreate`, `canVote`, `canViewResults`

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.produceVideo[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsproducevideo)

**_Deprecated_***Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.requestProduce[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsrequestproduce)

**_Deprecated_***Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.canProduceVideo[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionscanproducevideo)

The `canProduceVideo` shows permissions for enabling video. There possible values are `ALLOWED`, `NOT_ALLOWED`, `CAN_REQUEST`

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.produceScreenshare[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsproducescreenshare)

**_Deprecated_***Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.canProduceScreenshare[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionscanproducescreenshare)

The `canProduceScreenshare` shows permissions for sharing screen. There possible values are `ALLOWED`, `NOT_ALLOWED`, `CAN_REQUEST`

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.produceAudio[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsproduceaudio)

**_Deprecated_***Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.canProduceAudio[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionscanproduceaudio)

The `canProduceAudio` shows permissions for enabling audio. There possible values are `ALLOWED`, `NOT_ALLOWED`, `CAN_REQUEST`

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.chatPublic[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionschatpublic)

The `chatPublic` shows permissions for public chat there are 4 permissions `canSend` - if true, the participant can send chat `text` - if true, the participant can send text `files` - if true, the participant can send files

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.chatPrivate[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionschatprivate)

The `chatPrivate` shows permissions for public chat there are 4 permissions `canSend` - if true, the participant can send private chat `text` - if true, the participant can send text as private chat `files` - if true, the participant can send files as private chat `canReceive` - (optional) if true, the participant can receive private chat

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.hiddenParticipant[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionshiddenparticipant)

The `hiddenParticipant` returns boolean value. If `true`, participant is hidden.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.showParticipantList[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsshowparticipantlist)

The `showParticipantList` returns boolean value. If `true`, participant list can be shown to the participant.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.canChangeParticipantRole[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionscanchangeparticipantrole)

**_Deprecated_***Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.canChangeParticipantPermissions[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionscanchangeparticipantpermissions)

The `canChangeParticipantPermissions` returns boolean value. If `true`, allow changing the participants' permissions.

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.canChangeTheme[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionscanchangetheme)

**_Deprecated_***Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.canPresent[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionscanpresent)

**_Deprecated_***Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.acceptPresentRequests[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsacceptpresentrequests)

**_Deprecated_***Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.maxScreenShareCount[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsmaxscreensharecount)

**_Deprecated_***Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.canLivestream[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionscanlivestream)

Livestream

**Kind**: instance property of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)

### meeting.self.permissions.fromResponse()[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsfromresponse)

**Kind**: static method of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)  
**Deprecated.**: Use init()

### meeting.self.permissions.default()[​](_web-core_reference_RTKPermissionsPreset.md#meetingselfpermissionsdefault)

**Kind**: static method of [`RTKPermissionsPreset`](_web-core_reference_RTKPermissionsPreset.md#module_RTKPermissionsPreset)  
**Deprecated.**: Use init()

#### _web-core_reference_RTKPlugin.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKPlugin
> Scraped: 11/24/2025, 5:20:23 AM

The RTKPlugin module represents a single plugin in the meeting. A plugin can be obtained from one of the plugin arrays in `meeting.plugins`. For example,
```
const plugin1 = meeting.plugins.active.get(pluginId);  
const plugin2 = meeting.plugins.all.get(pluginId);  
```
* [RTKPlugin](_web-core_reference_RTKPlugin.md#module_RTKPlugin)
    * [.sendIframeEvent(message)](_web-core_reference_RTKPlugin.md#module_RTKPlugin+sendIframeEvent)
    * [.sendData(payload)](_web-core_reference_RTKPlugin.md#module_RTKPlugin+sendData)
    * [.removePluginView(viewId)](_web-core_reference_RTKPlugin.md#module_RTKPlugin+removePluginView)
    * [.addPluginView(iframe, viewId)](_web-core_reference_RTKPlugin.md#module_RTKPlugin+addPluginView)
    * [.activateForSelf()](_web-core_reference_RTKPlugin.md#module_RTKPlugin+activateForSelf)
    * [.deactivateForSelf()](_web-core_reference_RTKPlugin.md#module_RTKPlugin+deactivateForSelf)
    * [.enable()](_web-core_reference_RTKPlugin.md#module_RTKPlugin+enable)
    * [.disable()](_web-core_reference_RTKPlugin.md#module_RTKPlugin+disable)
    * [.activate()](_web-core_reference_RTKPlugin.md#module_RTKPlugin+activate)
    * [.deactivate()](_web-core_reference_RTKPlugin.md#module_RTKPlugin+deactivate)

### plugin.sendIframeEvent(message)[​](_web-core_reference_RTKPlugin.md#pluginsendiframeeventmessage)

**Kind**: instance method of [`RTKPlugin`](_web-core_reference_RTKPlugin.md#module_RTKPlugin)

Param

Description

message

Socket message forwarded to this plugin.

### plugin.sendData(payload)[​](_web-core_reference_RTKPlugin.md#pluginsenddatapayload)

This method is used to send arbitrary data to the plugin.

**Kind**: instance method of [`RTKPlugin`](_web-core_reference_RTKPlugin.md#module_RTKPlugin)

Param

Description

payload

The payload that you want to send inside the plugin.

payload.eventName

Name of the event. This is used to listen for the event in plugin SDK.

payload.data

Data you wish to emit. It can assume any data type.

### plugin.removePluginView(viewId)[​](_web-core_reference_RTKPlugin.md#pluginremovepluginviewviewid)

This method is used for cleaning up event listeners attached to an iframe. It must be used before the iframe is removed from the DOM.

**Kind**: instance method of [`RTKPlugin`](_web-core_reference_RTKPlugin.md#module_RTKPlugin)

Param

Default

Description

viewId

`default`

ID of the view corresponding to this iframe. Default is 'default'.

### plugin.addPluginView(iframe, viewId)[​](_web-core_reference_RTKPlugin.md#pluginaddpluginviewiframe-viewid)

This method adds the communcation layer between the plugin inside the iframe and the core application (meeting object) in the main window.

**Kind**: instance method of [`RTKPlugin`](_web-core_reference_RTKPlugin.md#module_RTKPlugin)

Param

Default

Description

iframe

Iframe element to display this plugin.

viewId

`default`

ID of the view corresponding to this iframe. Default is 'default'.

### plugin.activateForSelf()[​](_web-core_reference_RTKPlugin.md#pluginactivateforself)

**Kind**: instance method of [`RTKPlugin`](_web-core_reference_RTKPlugin.md#module_RTKPlugin)

### plugin.deactivateForSelf()[​](_web-core_reference_RTKPlugin.md#plugindeactivateforself)

**Kind**: instance method of [`RTKPlugin`](_web-core_reference_RTKPlugin.md#module_RTKPlugin)

### plugin.enable()[​](_web-core_reference_RTKPlugin.md#pluginenable)

**_Deprecated_***Kind**: instance method of [`RTKPlugin`](_web-core_reference_RTKPlugin.md#module_RTKPlugin)

### plugin.disable()[​](_web-core_reference_RTKPlugin.md#plugindisable)

**_Deprecated_***Kind**: instance method of [`RTKPlugin`](_web-core_reference_RTKPlugin.md#module_RTKPlugin)

### plugin.activate()[​](_web-core_reference_RTKPlugin.md#pluginactivate)

Activate this plugin for all participants.

**Kind**: instance method of [`RTKPlugin`](_web-core_reference_RTKPlugin.md#module_RTKPlugin)

### plugin.deactivate()[​](_web-core_reference_RTKPlugin.md#plugindeactivate)

Deactivate this plugin for all participants.

**Kind**: instance method of [`RTKPlugin`](_web-core_reference_RTKPlugin.md#module_RTKPlugin)

#### _web-core_reference_RTKPluginMap.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKPluginMap
> Scraped: 11/24/2025, 5:20:23 AM

This is a map of plugins, indexed by `plugin.id`. This map emits an event whenever a plugin present in the map emits an event. For example, when a plugin is added to this map, a `pluginAdded` event is emitted from the map. When a plugin object emits an event `stateUpdate`, the map re-emits that event (provided the plugin is present in the map).

#### _web-core_reference_RTKPlugins.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKPlugins
> Scraped: 11/24/2025, 5:20:23 AM

The RTKPlugins module consists of all the plugins in the meeting. It has 2 maps:

*   `all`: Consists of all the plugins in the meeting.
*   `active`: Consists of the plugins that are currently in use.

* [RTKPlugins](_web-core_reference_RTKPlugins.md#module_RTKPlugins)
    * [.all](_web-core_reference_RTKPlugins.md#module_RTKPlugins+all)
    * [.active](_web-core_reference_RTKPlugins.md#module_RTKPlugins+active)

### meeting.plugins.all[​](_web-core_reference_RTKPlugins.md#meetingpluginsall)

All plugins accessible by the current user.

**Kind**: instance property of [`RTKPlugins`](_web-core_reference_RTKPlugins.md#module_RTKPlugins)

### meeting.plugins.active[​](_web-core_reference_RTKPlugins.md#meetingpluginsactive)

All plugins that are currently enabled in the room.

**Kind**: instance property of [`RTKPlugins`](_web-core_reference_RTKPlugins.md#module_RTKPlugins)

#### _web-core_reference_RTKPolls.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKPolls
> Scraped: 11/24/2025, 5:20:22 AM

The RTKPolls module consists of the polls that have been created in the meeting.

* [RTKPolls](_web-core_reference_RTKPolls.md#module_RTKPolls)
    * [.items](_web-core_reference_RTKPolls.md#module_RTKPolls+items)
    * [.socketJoined](_web-core_reference_RTKPolls.md#module_RTKPolls+socketJoined)
    * [.create(question, options, anonymous, hideVotes)](_web-core_reference_RTKPolls.md#module_RTKPolls+create)
    * [.vote(pollId, index)](_web-core_reference_RTKPolls.md#module_RTKPolls+vote)

### meeting.polls.items[​](_web-core_reference_RTKPolls.md#meetingpollsitems)

An array of poll items.

**Kind**: instance property of [`RTKPolls`](_web-core_reference_RTKPolls.md#module_RTKPolls)

### meeting.polls.socketJoined[​](_web-core_reference_RTKPolls.md#meetingpollssocketjoined)

Returns true if the local participant has joined the meeting.

**Kind**: instance property of [`RTKPolls`](_web-core_reference_RTKPolls.md#module_RTKPolls)

### meeting.polls.create(question, options, anonymous, hideVotes)[​](_web-core_reference_RTKPolls.md#meetingpollscreatequestion-options-anonymous-hidevotes)

Creates a poll in the meeting.

**Kind**: instance method of [`RTKPolls`](_web-core_reference_RTKPolls.md#module_RTKPolls)

Param

Default

Description

question

The question that is to be voted for.

options

The options of the poll.

anonymous

`false`

If true, the poll votes are anonymous.

hideVotes

`false`

If true, the votes on the poll are hidden.

### meeting.polls.vote(pollId, index)[​](_web-core_reference_RTKPolls.md#meetingpollsvotepollid-index)

Casts a vote on an existing poll.

**Kind**: instance method of [`RTKPolls`](_web-core_reference_RTKPolls.md#module_RTKPolls)

Param

Description

pollId

The ID of the poll that is to be voted on.

index

The index of the option.

#### _web-core_reference_RTKRecording.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKRecording
> Scraped: 11/24/2025, 5:20:23 AM

The RTKRecording module represents the state of the current recording, and allows to start/stop recordings and check if there's a recording in progress.

* [RTKRecording](_web-core_reference_RTKRecording.md#module_RTKRecording)
    * [.start()](_web-core_reference_RTKRecording.md#module_RTKRecording+start)
    * [.stop()](_web-core_reference_RTKRecording.md#module_RTKRecording+stop)
    * [.pause()](_web-core_reference_RTKRecording.md#module_RTKRecording+pause)
    * [.resume()](_web-core_reference_RTKRecording.md#module_RTKRecording+resume)

### meeting.recording.start()[​](_web-core_reference_RTKRecording.md#meetingrecordingstart)

Starts recording the meeting.

**Kind**: instance method of [`RTKRecording`](_web-core_reference_RTKRecording.md#module_RTKRecording)

### meeting.recording.stop()[​](_web-core_reference_RTKRecording.md#meetingrecordingstop)

Stops all recording currently in 'RECORDING' state

**Kind**: instance method of [`RTKRecording`](_web-core_reference_RTKRecording.md#module_RTKRecording)

### meeting.recording.pause()[​](_web-core_reference_RTKRecording.md#meetingrecordingpause)

Pauses all recording currently in 'RECORDING' state

**Kind**: instance method of [`RTKRecording`](_web-core_reference_RTKRecording.md#module_RTKRecording)

### meeting.recording.resume()[​](_web-core_reference_RTKRecording.md#meetingrecordingresume)

Resumes all recording currently in 'PAUSED' state

**Kind**: instance method of [`RTKRecording`](_web-core_reference_RTKRecording.md#module_RTKRecording)

#### _web-core_reference_RTKSelf.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKSelf
> Scraped: 11/24/2025, 5:20:22 AM

The RTKSelf module represents the current user, and allows to modify the state of the user in the meeting. The audio and video streams of the user can be retrieved from this module.

* [RTKSelf](_web-core_reference_RTKSelf.md#module_RTKSelf)
    * [.roomState](_web-core_reference_RTKSelf.md#module_RTKSelf+roomState)
    * [.permissions](_web-core_reference_RTKSelf.md#module_RTKSelf+permissions)
    * [.config](_web-core_reference_RTKSelf.md#module_RTKSelf+config)
    * [.roomJoined](_web-core_reference_RTKSelf.md#module_RTKSelf+roomJoined)
    * [.isPinned](_web-core_reference_RTKSelf.md#module_RTKSelf+isPinned)
    * [.cleanupEvents()](_web-core_reference_RTKSelf.md#module_RTKSelf+cleanupEvents)
    * [.setName(name)](_web-core_reference_RTKSelf.md#module_RTKSelf+setName)
    * [.setupTracks(options)](_web-core_reference_RTKSelf.md#module_RTKSelf+setupTracks)
    * [.enableAudio()](_web-core_reference_RTKSelf.md#module_RTKSelf+enableAudio)
    * [.enableVideo()](_web-core_reference_RTKSelf.md#module_RTKSelf+enableVideo)
    * [.updateVideoConstraints()](_web-core_reference_RTKSelf.md#module_RTKSelf+updateVideoConstraints)
    * [.enableScreenShare()](_web-core_reference_RTKSelf.md#module_RTKSelf+enableScreenShare)
    * [.updateScreenshareConstraints()](_web-core_reference_RTKSelf.md#module_RTKSelf+updateScreenshareConstraints)
    * [.disableAudio()](_web-core_reference_RTKSelf.md#module_RTKSelf+disableAudio)
    * [.disableVideo()](_web-core_reference_RTKSelf.md#module_RTKSelf+disableVideo)
    * [.disableScreenShare()](_web-core_reference_RTKSelf.md#module_RTKSelf+disableScreenShare)
    * [.getAllDevices()](_web-core_reference_RTKSelf.md#module_RTKSelf+getAllDevices)
    * [.setIsPinned()](_web-core_reference_RTKSelf.md#module_RTKSelf+setIsPinned)
    * [.pin()](_web-core_reference_RTKSelf.md#module_RTKSelf+pin)
    * [.unpin()](_web-core_reference_RTKSelf.md#module_RTKSelf+unpin)
    * [.hide()](_web-core_reference_RTKSelf.md#module_RTKSelf+hide)
    * [.show()](_web-core_reference_RTKSelf.md#module_RTKSelf+show)
    * [.setDevice(device)](_web-core_reference_RTKSelf.md#module_RTKSelf+setDevice)
    * [.updateVideo()](_web-core_reference_RTKSelf.md#module_RTKSelf+updateVideo)

### meeting.self.roomState[​](_web-core_reference_RTKSelf.md#meetingselfroomstate)

Returns the current state of room init - Inital State joined - User is in the meeting waitlisted - User is in the waitlist state rejected - User's was in the waiting room, but the entry was rejected kicked - A priveleged user removed the user from the meeting left - User left the meeting ended - The meeting was ended

**Kind**: instance property of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.permissions[​](_web-core_reference_RTKSelf.md#meetingselfpermissions)

Returns the current permission given to the user for the meeting.

**Kind**: instance property of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.config[​](_web-core_reference_RTKSelf.md#meetingselfconfig)

Returns configuration for the meeting.

**Kind**: instance property of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.roomJoined[​](_web-core_reference_RTKSelf.md#meetingselfroomjoined)

Returns true if the local participant has joined the meeting.

**Kind**: instance property of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.isPinned[​](_web-core_reference_RTKSelf.md#meetingselfispinned)

Returns true if the current user is pinned.

**Kind**: instance property of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.cleanupEvents()[​](_web-core_reference_RTKSelf.md#meetingselfcleanupevents)

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.setName(name)[​](_web-core_reference_RTKSelf.md#meetingselfsetnamename)

The name of the user can be set by calling this method. This will get reflected to other participants ONLY if this method is called before the room is joined.

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

Param

Description

name

Name of the user.

### meeting.self.setupTracks(options)[​](_web-core_reference_RTKSelf.md#meetingselfsetuptracksoptions)

Sets up the local media tracks.

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

Param

Description

options

The audio and video options.

options.video

If true, the video stream is fetched.

options.audio

If true, the audio stream is fetched.

### meeting.self.enableAudio()[​](_web-core_reference_RTKSelf.md#meetingselfenableaudio)

This method is used to unmute the local participant's audio.

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.enableVideo()[​](_web-core_reference_RTKSelf.md#meetingselfenablevideo)

This method is used to start streaming the local participant's video to the meeting.

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.updateVideoConstraints()[​](_web-core_reference_RTKSelf.md#meetingselfupdatevideoconstraints)

This method is used to apply constraints to the current video stream.

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.enableScreenShare()[​](_web-core_reference_RTKSelf.md#meetingselfenablescreenshare)

This method is used to start sharing the local participant's screen to the meeting.

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.updateScreenshareConstraints()[​](_web-core_reference_RTKSelf.md#meetingselfupdatescreenshareconstraints)

This method is used to apply constraints to the current screenshare stream.

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.disableAudio()[​](_web-core_reference_RTKSelf.md#meetingselfdisableaudio)

This method is used to mute the local participant's audio.

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.disableVideo()[​](_web-core_reference_RTKSelf.md#meetingselfdisablevideo)

This participant is used to disable the local participant's video.

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.disableScreenShare()[​](_web-core_reference_RTKSelf.md#meetingselfdisablescreenshare)

This method is used to stop sharing the local participant's screen.

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.getAllDevices()[​](_web-core_reference_RTKSelf.md#meetingselfgetalldevices)

Returns all media devices accessible by the local participant.

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.setIsPinned()[​](_web-core_reference_RTKSelf.md#meetingselfsetispinned)

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.pin()[​](_web-core_reference_RTKSelf.md#meetingselfpin)

Returns `self.id` if user has permission to pin participants.

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.unpin()[​](_web-core_reference_RTKSelf.md#meetingselfunpin)

Returns `self.id` if user has permission to unpin participants.

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.hide()[​](_web-core_reference_RTKSelf.md#meetingselfhide)

Hide's user's tile in the UI (locally)

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.show()[​](_web-core_reference_RTKSelf.md#meetingselfshow)

Show's user's tile in the UI if hidden (locally)

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

### meeting.self.setDevice(device)[​](_web-core_reference_RTKSelf.md#meetingselfsetdevicedevice)

Change the current media device that is being used by the local participant.

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

Param

Description

device

The device that is to be used. A device of the same `kind` will be replaced. the primary stream.

### meeting.self.updateVideo()[​](_web-core_reference_RTKSelf.md#meetingselfupdatevideo)

Internal method, do not use

**Kind**: instance method of [`RTKSelf`](_web-core_reference_RTKSelf.md#module_RTKSelf)

#### _web-core_reference_RTKStage.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKStage
> Scraped: 11/24/2025, 5:20:23 AM

The RTKStage module represents a class to mange the Stage of the meeting Stage refers to a virtual area, where participants stream are visible to other participants. When a participant is off stage, they are not producing media but only consuming media from participants who are on Stage

* [RTKStage](_web-core_reference_RTKStage.md#module_RTKStage)
    * [.getAccessRequests()](_web-core_reference_RTKStage.md#module_RTKStage+getAccessRequests)
    * [.requestAccess()](_web-core_reference_RTKStage.md#module_RTKStage+requestAccess)
    * [.cancelRequestAccess()](_web-core_reference_RTKStage.md#module_RTKStage+cancelRequestAccess)
    * [.grantAccess()](_web-core_reference_RTKStage.md#module_RTKStage+grantAccess)
    * [.denyAccess()](_web-core_reference_RTKStage.md#module_RTKStage+denyAccess)
    * [.join()](_web-core_reference_RTKStage.md#module_RTKStage+join)
    * [.leave()](_web-core_reference_RTKStage.md#module_RTKStage+leave)
    * [.kick()](_web-core_reference_RTKStage.md#module_RTKStage+kick)

### meeting.stage.getAccessRequests()[​](_web-core_reference_RTKStage.md#meetingstagegetaccessrequests)

Method to fetch all Stage access requests from viewers

**Kind**: instance method of [`RTKStage`](_web-core_reference_RTKStage.md#module_RTKStage)

### meeting.stage.requestAccess()[​](_web-core_reference_RTKStage.md#meetingstagerequestaccess)

Method to send a request to privileged users to join the stage

**Kind**: instance method of [`RTKStage`](_web-core_reference_RTKStage.md#module_RTKStage)

### meeting.stage.cancelRequestAccess()[​](_web-core_reference_RTKStage.md#meetingstagecancelrequestaccess)

Method to cancel a previous Stage join request

**Kind**: instance method of [`RTKStage`](_web-core_reference_RTKStage.md#module_RTKStage)

### meeting.stage.grantAccess()[​](_web-core_reference_RTKStage.md#meetingstagegrantaccess)

Method to grant access to Stage. This can be in response to a Stage Join request but it can be called on other users as well

`permissions.acceptStageRequests` privilege required

**Kind**: instance method of [`RTKStage`](_web-core_reference_RTKStage.md#module_RTKStage)

### meeting.stage.denyAccess()[​](_web-core_reference_RTKStage.md#meetingstagedenyaccess)

Method to deny access to Stage. This should be called in response to a Stage Join request

**Kind**: instance method of [`RTKStage`](_web-core_reference_RTKStage.md#module_RTKStage)

### meeting.stage.join()[​](_web-core_reference_RTKStage.md#meetingstagejoin)

Method to join the stage Users either need to have the permission in the preset or must be accepted by a priveleged user to call this method

**Kind**: instance method of [`RTKStage`](_web-core_reference_RTKStage.md#module_RTKStage)

### meeting.stage.leave()[​](_web-core_reference_RTKStage.md#meetingstageleave)

Method to leave the stage Users must either be on the stage already or be accepted to join the stage to call this method

**Kind**: instance method of [`RTKStage`](_web-core_reference_RTKStage.md#module_RTKStage)

### meeting.stage.kick()[​](_web-core_reference_RTKStage.md#meetingstagekick)

Method to kick a user off the stage

`permissions.acceptStageRequests` privilege required

**Kind**: instance method of [`RTKStage`](_web-core_reference_RTKStage.md#module_RTKStage)

#### _web-core_reference_RTKThemePreset.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RTKThemePreset
> Scraped: 11/24/2025, 5:20:23 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# RTKThemePreset

The RTKThemePreset class represents the meeting theme for the current participant

* [RTKThemePreset](#module_RTKThemePreset)
    *   _instance_
        * [.setupScreen](#module_RTKThemePreset+setupScreen)
        * [.waitingRoom](#module_RTKThemePreset+waitingRoom)
        * [.controlBar](#module_RTKThemePreset+controlBar)
        * [.header](#module_RTKThemePreset+header)
        * [.pipMode](#module_RTKThemePreset+pipMode)
        * [.viewType](#module_RTKThemePreset+viewType)
        * [.livestreamViewerQualities](#module_RTKThemePreset+livestreamViewerQualities)
        * [.maxVideoStreams](#module_RTKThemePreset+maxVideoStreams)
        * [.maxScreenShareCount](#module_RTKThemePreset+maxScreenShareCount)
        * [.plugins](#module_RTKThemePreset+plugins)
        * [.disabledPlugins](#module_RTKThemePreset+disabledPlugins)
    *   _static_
        * [.fromResponse()](#module_RTKThemePreset.fromResponse)
        * [.default()](#module_RTKThemePreset.default)

### RTKThemePreset.setupScreen[​](#rtkthemepresetsetupscreen)

**_Deprecated_***Kind**: instance property of [`RTKThemePreset`](#module_RTKThemePreset)

### RTKThemePreset.waitingRoom[​](#rtkthemepresetwaitingroom)

**_Deprecated_***Kind**: instance property of [`RTKThemePreset`](#module_RTKThemePreset)

### RTKThemePreset.controlBar[​](#rtkthemepresetcontrolbar)

**_Deprecated_***Kind**: instance property of [`RTKThemePreset`](#module_RTKThemePreset)

### RTKThemePreset.header[​](#rtkthemepresetheader)

**_Deprecated_***Kind**: instance property of [`RTKThemePreset`](#module_RTKThemePreset)

### RTKThemePreset.pipMode[​](#rtkthemepresetpipmode)

**_Deprecated_***Kind**: instance property of [`RTKThemePreset`](#module_RTKThemePreset)

### RTKThemePreset.viewType[​](#rtkthemepresetviewtype)

The `viewType` tells the type of the meeting possible values are: GROUP\_CALL| LIVESTREAM | CHAT | AUDIO\_ROOM

**Kind**: instance property of [`RTKThemePreset`](#module_RTKThemePreset)

### RTKThemePreset.livestreamViewerQualities[​](#rtkthemepresetlivestreamviewerqualities)

The `livestreamViewerQualities` specifies the allowed qualities of a stream, that can be viewed by a livestream viewer

**Kind**: instance property of [`RTKThemePreset`](#module_RTKThemePreset)

### RTKThemePreset.maxVideoStreams[​](#rtkthemepresetmaxvideostreams)

The `maxVideoStreams` contains the maximum video streams for mobile and desktop

**Kind**: instance property of [`RTKThemePreset`](#module_RTKThemePreset)

### RTKThemePreset.maxScreenShareCount[​](#rtkthemepresetmaxscreensharecount)

The `maxScreenShareCount` contains the maximum possible concurrent screen shares

**Kind**: instance property of [`RTKThemePreset`](#module_RTKThemePreset)

### RTKThemePreset.plugins[​](#rtkthemepresetplugins)

**_Deprecated_***Kind**: instance property of [`RTKThemePreset`](#module_RTKThemePreset)

### RTKThemePreset.disabledPlugins[​](#rtkthemepresetdisabledplugins)

The `disabledPlugins` property returns id of all disabled plugins

**Kind**: instance property of [`RTKThemePreset`](#module_RTKThemePreset)

### RTKThemePreset.fromResponse()[​](#rtkthemepresetfromresponse)

**Kind**: static method of [`RTKThemePreset`](#module_RTKThemePreset)  
**Deprecated.**: Use init()

### RTKThemePreset.default()[​](#rtkthemepresetdefault)

**Kind**: static method of [`RTKThemePreset`](#module_RTKThemePreset)  
**Deprecated.**: Use init()

#### _web-core_reference_RealtimeKitClient.md

> Source: https://docs.realtime.cloudflare.com/web-core/reference/RealtimeKitClient
> Scraped: 11/24/2025, 5:20:22 AM

The RealtimeKitClient class is the main class of the web core library. An object of the RealtimeKitClient class can be created using `await RealtimeKitClient.init({ ... })`. Typically, an object of `RealtimeKitClient` is named `meeting`.

* [RealtimeKitClient](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient)
    *   _instance_
        * [.participants](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient+participants)
        * [.self](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient+self)
        * [.meta](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient+meta)
        * [.ai](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient+ai)
        * [.plugins](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient+plugins)
        * [.chat](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient+chat)
        * [.polls](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient+polls)
        * [.connectedMeetings](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient+connectedMeetings)
        * [.**internals**](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient+__internals__)
        * [.join()](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient+join)
        * [.leave()](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient+leave)
        * [.joinRoom()](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient+joinRoom)
        * [.leaveRoom()](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient+leaveRoom)
    *   _static_
        * [.init(options)](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient.init)

### meeting.participants[​](_web-core_reference_RealtimeKitClient.md#meetingparticipants)

The `participants` object consists of 4 maps of participants, `waitlisted`, `joined`, `active`, `pinned`. The maps are indexed by `peerId`s, and the values are the corresponding participant objects.

**Kind**: instance property of [`RealtimeKitClient`](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient)

### meeting.self[​](_web-core_reference_RealtimeKitClient.md#meetingself)

The `self` object can be used to manipulate audio and video settings, and other configurations for the local participant. This exposes methods to enable and disable media tracks, share the user's screen, etc.

**Kind**: instance property of [`RealtimeKitClient`](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient)

### meeting.meta[​](_web-core_reference_RealtimeKitClient.md#meetingmeta)

The `room` object stores information about the current meeting, such as chat messages, polls, room name, etc.

**Kind**: instance property of [`RealtimeKitClient`](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient)

### meeting.ai[​](_web-core_reference_RealtimeKitClient.md#meetingai)

The `ai` object is used to interface with RealtimeKit's AI features. You can obtain the live meeting transcript and use other meeting AI features such as summary, and agenda using this object.

**Kind**: instance property of [`RealtimeKitClient`](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient)

### meeting.plugins[​](_web-core_reference_RealtimeKitClient.md#meetingplugins)

The `plugins` object stores information about the plugins available in the current meeting. It exposes methods to activate and deactivate them.

**Kind**: instance property of [`RealtimeKitClient`](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient)

### meeting.chat[​](_web-core_reference_RealtimeKitClient.md#meetingchat)

The chat object stores the chat messages that were sent in the meeting. This includes text messages, images, and files.

**Kind**: instance property of [`RealtimeKitClient`](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient)

### meeting.polls[​](_web-core_reference_RealtimeKitClient.md#meetingpolls)

The polls object stores the polls that were initiated in the meeting. It exposes methods to create and vote on polls.

**Kind**: instance property of [`RealtimeKitClient`](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient)

### meeting.connectedMeetings[​](_web-core_reference_RealtimeKitClient.md#meetingconnectedmeetings)

The connectedMeetings object stores the connected meetings states. It exposes methods to create/read/update/delete methods for connected meetings.

**Kind**: instance property of [`RealtimeKitClient`](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient)

### meeting.\_\_internals\_\_[​](_web-core_reference_RealtimeKitClient.md#meeting__internals__)

The **internals** object exposes the internal tools & utilities such as features and logger so that client can utilise the same to build their own feature based UI. RTKLogger (**internals**.logger) can be used to send logs to RealtimeKit's servers to inform RealtimeKit of issues, if any, proactively.

**Kind**: instance property of [`RealtimeKitClient`](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient)

### meeting.join()[​](_web-core_reference_RealtimeKitClient.md#meetingjoin)

The `join()` method can be used to join the meeting. A `roomJoined` event is emitted on `self` when the room is joined successfully.

**Kind**: instance method of [`RealtimeKitClient`](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient)

### meeting.leave()[​](_web-core_reference_RealtimeKitClient.md#meetingleave)

The `leave()` method can be used to leave a meeting.

**Kind**: instance method of [`RealtimeKitClient`](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient)

### meeting.joinRoom()[​](_web-core_reference_RealtimeKitClient.md#meetingjoinroom)

**_Deprecated_***Kind**: instance method of [`RealtimeKitClient`](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient)

### meeting.leaveRoom()[​](_web-core_reference_RealtimeKitClient.md#meetingleaveroom)

**_Deprecated_***Kind**: instance method of [`RealtimeKitClient`](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient)

### meeting.init(options)[​](_web-core_reference_RealtimeKitClient.md#meetinginitoptions)

The `init` method can be used to instantiate the RealtimeKitClient class. This returns an instance of RealtimeKitClient, which can be used to perform actions on the meeting.

**Kind**: static method of [`RealtimeKitClient`](_web-core_reference_RealtimeKitClient.md#module_RealtimeKitClient)

Param

Description

options

The options object.

options.authToken

The authorization token received using the API.

options.baseURI

The base URL of the API.

options.defaults

The default audio and video settings.

#### _web-core_release-notes.md

> Source: https://docs.realtime.cloudflare.com/web-core/release-notes
> Scraped: 11/24/2025, 5:20:13 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# Release Notes

The release notes lists all new features, resolved issues, and known issues of Web Core in chronological order.

## v1.2.1[​](#1.2.1)

Released on November 18, 2025

Fixed Issues

Resolved an issue preventing default media device selection

Fixed SDK bundle to include `browser.js` instead of incorrectly shipping `index.iife.js` in 1.2.0

Enhancements

External media devices are now prioritized over internal devices when no preferred device is set

## v1.2.0[​](#1.2.0)

Released on October 30, 2025

Breaking Changes

Legacy media engine support has been removed. If your organization was created before March 1, 2025 and you are upgrading to this SDK version or later, you may experience recording issues. Please contact support to migrate to the new Cloudflare SFU media engine to ensure continued recording functionality.

Features

Added support for configuring simulcast via `initMeeting({ overrides: { simulcastConfig: { disable: false, encodings: [{ scaleResolutionDownBy: 2 }] } }) }`.

Fixed Issues

Resolved an issue where remote participants' video feeds were not visible during grid pagination in certain edge cases.

Fixed a bug preventing participants from switching microphones if the first listed microphone was non-functional.

## v1.1.7[​](#1.1.7)

Released on August 26, 2025

Fixed Issues

Prevents speaker change events from being emitted when the active speaker does not change.

Addressed a behavioral change in microphone switching on recent versions of Google Chrome.

Added `deviceInfo` logs to improve debugging capabilities for React Native.

Fixed an issue that queued multiple media consumers for the same peer, optimizing resource usage.

## v1.1.6[​](#1.1.6)

Released on August 14, 2025

Enhancements

Internal changes to make debugging, of media consumption issues, easier and faster

## v1.1.5[​](#1.1.5)

Released on August 4, 2025

Fixed Issues

Improved React Native support for AudioActivityReporter with proper audio sampling

Resolved issue preventing users from creating polls

Fixed issue where leaving a meeting took more than 20 seconds

## v1.1.4[​](#1.1.4)

Released on July 17, 2025

Fixed Issues

Livestream feature is now available to all BETA users

Fixed livestream stage functionality where hosts were not consuming peer videos upon participant's stage join

Resolved issues with viewer joins and leaves in livestream stage

## v1.1.3[​](#1.1.3)

Released on July 8, 2025

Fixed Issues

Fixed issue where users could not enable video mid-meeting if they joined without video initially

## v1.1.2[​](#1.1.2)

Released on July 2, 2025

Fixed Issues

Fixed edge case in large meetings where existing participants could not hear or see newly joined users

## v1.1.0-1.1.1[​](#1.1.0-1.1.1)

Released on June 30, 2025

New API

Broadcast messages across meetings: `meeting.participants.broadcastMessage('<message_type>', { message: 'Hi' }, { meetingIds: ['<connected_meeting_id>'] });`

Features

Added methods to toggle self tile visibility

Introduced broadcast functionality across connected meetings (breakout rooms)

Enhancements

Reduced time to display videos of newly joined participants when joining in bulk

Added support for multiple meetings on the same page in RealtimeKit Core SDK

## v1.0.2[​](#1.0.2)

Released on June 17, 2025

Fixed Issues

Enhanced error handling for media operations

Fixed issue where active participants with audio/video were not appearing in the active participant list

## v1.0.1[​](#1.0.1)

Released on May 29, 2025

Fixed Issues

Resolved initial setup issues with Cloudflare RealtimeKit integration

Fixed meeting join and media connectivity issues

Enhanced media track handling

## v1.0.0[​](#1.0.0)

Released on May 29, 2025

Features

Initial release of Cloudflare RealtimeKit with support for Group Calls, Webinars, Livestreaming, Polls, and Chat

#### _web-core_room-metadata.md

> Source: https://docs.realtime.cloudflare.com/web-core/room-metadata
> Scraped: 11/24/2025, 5:20:13 AM

```
const [meetingTitle, roomJoined] = useRealtimeKitSelector((m) =>   
  [m.meta.meetingTitle, m.self.roomJoined]  
);  
useEffect(() => {  
  if (roomJoined) {    console.log(      `The local user has joined a meeting with title ${meetingTitle}.`,    );  }}, [roomJoined, meetingTitle])  
```

#### _web-core_stage.md

> Source: https://docs.realtime.cloudflare.com/web-core/stage
> Scraped: 11/24/2025, 5:20:13 AM

_Below documentation relevant for Interactive Livestream(LHLS) and Webinar(WebRTC) use cases_

Instead of a traditional publish-subscribe model, where a user can publish their media and others can choose to subscribe, RealtimeKit comes with an optional managed configuration. In this managed configuration, a less privileged can be configured with a default behavior to not publish media and the user can then request for permission to be allowed to publish their media, where then a privileged user can choose to grant or deny access.

Using RealtimeKit's stage management APIs a user can do actions such as leave and join stage, manage stage requests and permissions, kick participants and so on.

## Access the stage APIs[​](_web-core_stage.md#access-the-stage-apis)

The stage module can be accessed under [`meeting.stage`](_react-web-core_reference_RTKStage.md) namespace.

## Properties[​](_web-core_stage.md#properties)

### Status[​](_web-core_stage.md#status)

`meeting.stage.status` returns the current stage status of the local user

*   **ON\_STAGE**: This value indicates that the user is currently on the stage and participating in the live stream.
*   **OFF\_STAGE**: This value means that the user is viewing the live stream but is not on the stage.
*   **REQUESTED\_TO\_JOIN\_STAGE**: The user has a pending request to join livestream. If the user has made a request to join the stage, this value will be assigned to their status until the host accepts or rejects their request.
*   **ACCEPTED\_TO\_JOIN\_STAGE**: The host has accepted user's request to join livestream. If the host accepts the user's request to join the stage, this value will be assigned to the user's status.

A user with permission to join stage directly can only assume `ON_STAGE` and `ACCEPTED_TO_JOIN_STAGE` status values.

## Host controls[​](_web-core_stage.md#host-controls)

RealtimeKit's stage management APIs allow hosts to receive and manage stage requests as well as leave and join the stage.

### Join stage[​](_web-core_stage.md#join-stage)

This method connects the user to the media room, enabling them to interact with other peers in the meeting.

`await meeting.stage.join();`

### Leave stage[​](_web-core_stage.md#leave-stage)

By employing this method, the user will be disconnected from the media room and subsequently unable to communicate with their peers. Additionally, their audio and video will no longer be visible to others in the room.

`await meeting.stage.leave();`

### Grant access[​](_web-core_stage.md#grant-access)

A privileged user can grant access to stage for a set of users with `grantAccess` method.

**Parameters***Type**

userIds

string\[\]

`await meeting.stage.grantAccess(userIds);`

### Deny access[​](_web-core_stage.md#deny-access)

A privileged user can deny access to stage for a set of users with `denyAccess` method.

**Parameters***Type**

userIds

string\[\]

`await meeting.stage.denyAccess(userIds);`

### Kick users[​](_web-core_stage.md#kick-users)

A privileged user can remove a set of users from stage using the `kick` method

**Parameters***Type**

userIds

string\[\]

`await meeting.stage.kick(userIds);`

## Participant controls[​](_web-core_stage.md#participant-controls)

RealtimeKit's stage management APIs allow participants to receive and manage stage requests as well as leave and join the stage.

### Request access[​](_web-core_stage.md#request-access)

This method is used to create a new stage request which can be approved by the host. Each user (viewer or host) must call this method in order to join the stage.

When the host calls this method, their status will be updated to `ACCEPTED_TO_JOIN_STAGE`.

`await meeting.stage.requestAccess();`

### Cancel access request[​](_web-core_stage.md#cancel-access-request)

You can call this method in order to cancel your stage request.

`await meeting.stage.cancelRequestAccess();`

## Events[​](_web-core_stage.md#events)

Here is a list of events that the `meeting.stage` module emits:

**Event***Description**

`stageAccessRequestUpdate`

Emitted to the users with the permission `acceptPresentRequests` set to true. When a new request is made or a request is cancelled, this event is triggered. It contains the updated list of stage requests in its payload.

`stageStatusUpdate`

Emitted when the user's stage status changes. It contains the updated stage status in the payload.

`newStageRequest`

Emitted to the users with the permission `acceptPresentRequests` set to true. This event is triggered when there are new stage requests. It contains the number of stage requests in its payload. For example, to show notifications.

`stageRequestApproved`

Emitted when a user's request to join stage has been approved.

`stageRequestRejected`

Emitted when a user's request to join stage has been rejected.

#### _web-core_tags.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags
> Scraped: 11/24/2025, 5:20:14 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# Tags

## C[​](#C)

* [chat5](_web-core_tags_chat.md)
* [create1](_web-core_tags_create.md)

* * *

## L[​](#L)

* [local-user5](_web-core_tags_local-user.md)

* * *

## M[​](#M)

* [methods1](_web-core_tags_methods.md)

* * *

## P[​](#P)

* [participant3](_web-core_tags_participant.md)
* [participants4](_web-core_tags_participants.md)
* [plugins4](_web-core_tags_plugins.md)
* [polls4](_web-core_tags_polls.md)

* * *

## Q[​](#Q)

* [quickstart1](_web-core_tags_quickstart.md)

* * *

## R[​](#R)

* [recording1](_web-core_tags_recording.md)
* [releasenotes1](_web-core_tags_releasenotes.md)
* [results1](_web-core_tags_results.md)
* [room-metadata1](_web-core_tags_room-metadata.md)

* * *

## S[​](#S)

* [self6](_web-core_tags_self.md)
* [self events3](_web-core_tags_self-events.md)
* [setup1](_web-core_tags_setup.md)

* * *

## U[​](#U)

* [updates1](_web-core_tags_updates.md)

* * *

## V[​](#V)

* [votes1](_web-core_tags_votes.md)

* * *

## W[​](#W)

* [web-core26](_web-core_tags_web-core.md)

* * *

#### _web-core_tags_chat.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/chat
> Scraped: 11/24/2025, 5:20:19 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# 5 docs tagged with "chat"

[View all tags](_web-core_tags.md)

[

## Editing Chat Messages

](_web-core_chat_edit-chat-messages.md)

Edit chat messages that you have sent in a meeting.

[

## Introducing chat

](_web-core_chat_introduction.md)

Send and receive chat messages in a meeting.

[

## Other chat functions

](_web-core_chat_other-chat-functions.md)

Other functionality associated with chat.

[

## Receiving chat messages

](_web-core_chat_receiving-chat-messages.md)

Receive chat messages that have been sent in a meeting.

[

## Sending a chat message

](_web-core_chat_sending-a-chat-message.md)

Send a chat message in a meeting.

#### _web-core_tags_create.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/create
> Scraped: 11/24/2025, 5:20:20 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# One doc tagged with "create"

[View all tags](_web-core_tags.md)

[

## Creating a poll

](_web-core_polls_creating-a-poll.md)

Create polls in a meeting.

#### _web-core_tags_local-user.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/local-user
> Scraped: 11/24/2025, 5:20:21 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# 5 docs tagged with "local-user"

[View all tags](_web-core_tags.md)

[

## Events

](_web-core_local-user_events.md)

Local user events guide.

[

## Introduction

](_web-core_local-user_introduction.md)

Local user setup guide.

[

## Manage Media Devices

](_web-core_local-user_manage-media-devices.md)

Local user media guide to manage media permissions.

[

## Media Permission Errors

](_web-core_local-user_media-permission-errors.md)

Local user media guide to local media permission errors.

[

## Other Methods

](_web-core_local-user_extras.md)

Methods to manage the local user.

#### _web-core_tags_methods.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/methods
> Scraped: 11/24/2025, 5:20:21 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# One doc tagged with "methods"

[View all tags](_web-core_tags.md)

[

## Other Methods

](_web-core_local-user_extras.md)

Methods to manage the local user.

#### _web-core_tags_participant.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/participant
> Scraped: 11/24/2025, 5:20:20 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# 3 docs tagged with "participant"

[View all tags](_web-core_tags.md)

[

## Participant Maps

](_web-core_participants.md)

Events, methods and data pertaining to meeting participants.

[

## Participant Object

](_web-core_participants_participant-object.md)

The object corresponding to a particular participant.

[

## Picture-in-Picture

](_web-core_participants_pip.md)

Events, methods and data pertaining to browser picture in picture mode

#### _web-core_tags_participants.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/participants
> Scraped: 11/24/2025, 5:20:20 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# 4 docs tagged with "participants"

[View all tags](_web-core_tags.md)

[

## Events

](_web-core_participants_events.md)

Event handling for participants.

[

## Participant Maps

](_web-core_participants.md)

Events, methods and data pertaining to meeting participants.

[

## Participant Object

](_web-core_participants_participant-object.md)

The object corresponding to a particular participant.

[

## Picture-in-Picture

](_web-core_participants_pip.md)

Events, methods and data pertaining to browser picture in picture mode

#### _web-core_tags_plugins.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/plugins
> Scraped: 11/24/2025, 5:20:20 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# 4 docs tagged with "plugins"

[View all tags](_web-core_tags.md)

[

## Functions to disable plugins

](_web-core_plugins_disable-plugin.md)

Methods on a plugin in a meeting.

[

## Functions to enable plugins

](_web-core_plugins_enable-plugin.md)

Methods on a plugin in a meeting.

[

## Introduction

](_web-core_plugins_introduction.md)

Manage plugins in a meeting.

[

## Other methods

](_web-core_plugins_extra.md)

Methods on a plugin in a meeting.

#### _web-core_tags_polls.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/polls
> Scraped: 11/24/2025, 5:20:20 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# 4 docs tagged with "polls"

[View all tags](_web-core_tags.md)

[

## Creating a poll

](_web-core_polls_creating-a-poll.md)

Create polls in a meeting.

[

## Introduction

](_web-core_polls_introduction.md)

Create, receive and interact with polls in a meeting.

[

## Other poll functions

](_web-core_polls_other-poll-functions.md)

Other poll functions

[

## Voting on a poll

](_web-core_polls_voting-on-a-poll.md)

Voting on polls in a meeting.

#### _web-core_tags_quickstart.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/quickstart
> Scraped: 11/24/2025, 5:20:12 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# One doc tagged with "quickstart"

[View all tags](_web-core_tags.md)

[

## Quickstart

](_web-core.md)

This quickstart shows how to incorporate live video and audio into any web application using RealtimeKit's Core SDKs.

#### _web-core_tags_recording.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/recording
> Scraped: 11/24/2025, 5:20:18 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# One doc tagged with "recording"

[View all tags](_web-core_tags.md)

[

## Recording

](_web-core_recording.md)

Control recordings in a meeting.

#### _web-core_tags_releasenotes.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/releasenotes
> Scraped: 11/24/2025, 5:20:18 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# One doc tagged with "releasenotes"

[View all tags](_web-core_tags.md)

[

## Release Notes

](_web-core_release-notes.md)

The release notes lists all new features, resolved issues, and known issues of Web Core in chronological order.

#### _web-core_tags_results.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/results
> Scraped: 11/24/2025, 5:20:20 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# One doc tagged with "results"

[View all tags](_web-core_tags.md)

[

## Other poll functions

](_web-core_polls_other-poll-functions.md)

Other poll functions

#### _web-core_tags_room-metadata.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/room-metadata
> Scraped: 11/24/2025, 5:20:19 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# One doc tagged with "room-metadata"

[View all tags](_web-core_tags.md)

[

## Meeting Metadata

](_web-core_room-metadata.md)

All metadata pertaining to a meeting.

#### _web-core_tags_self-events.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/self-events
> Scraped: 11/24/2025, 5:20:21 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# 3 docs tagged with "self events"

[View all tags](_web-core_tags.md)

[

## Events

](_web-core_local-user_events.md)

Local user events guide.

[

## Manage Media Devices

](_web-core_local-user_manage-media-devices.md)

Local user media guide to manage media permissions.

[

## Media Permission Errors

](_web-core_local-user_media-permission-errors.md)

Local user media guide to local media permission errors.

#### _web-core_tags_self.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/self
> Scraped: 11/24/2025, 5:20:20 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# 6 docs tagged with "self"

[View all tags](_web-core_tags.md)

[

## Events

](_web-core_local-user_events.md)

Local user events guide.

[

## Events

](_web-core_participants_events.md)

Event handling for participants.

[

## Introduction

](_web-core_local-user_introduction.md)

Local user setup guide.

[

## Manage Media Devices

](_web-core_local-user_manage-media-devices.md)

Local user media guide to manage media permissions.

[

## Media Permission Errors

](_web-core_local-user_media-permission-errors.md)

Local user media guide to local media permission errors.

[

## Other Methods

](_web-core_local-user_extras.md)

Methods to manage the local user.

#### _web-core_tags_setup.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/setup
> Scraped: 11/24/2025, 5:20:12 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# One doc tagged with "setup"

[View all tags](_web-core_tags.md)

[

## Quickstart

](_web-core.md)

This quickstart shows how to incorporate live video and audio into any web application using RealtimeKit's Core SDKs.

#### _web-core_tags_updates.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/updates
> Scraped: 11/24/2025, 5:20:20 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# One doc tagged with "updates"

[View all tags](_web-core_tags.md)

[

## Other poll functions

](_web-core_polls_other-poll-functions.md)

Other poll functions

#### _web-core_tags_votes.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/votes
> Scraped: 11/24/2025, 5:20:20 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# One doc tagged with "votes"

[View all tags](_web-core_tags.md)

[

## Voting on a poll

](_web-core_polls_voting-on-a-poll.md)

Voting on polls in a meeting.

#### _web-core_tags_web-core.md

> Source: https://docs.realtime.cloudflare.com/web-core/tags/web-core
> Scraped: 11/24/2025, 5:20:12 AM

[Skip to main content](#__docusaurus_skipToContent_fallback)
# 26 docs tagged with "web-core"

[View all tags](_web-core_tags.md)

[

## Creating a poll

](_web-core_polls_creating-a-poll.md)

Create polls in a meeting.

[

## Editing Chat Messages

](_web-core_chat_edit-chat-messages.md)

Edit chat messages that you have sent in a meeting.

[

## Events

](_web-core_local-user_events.md)

Local user events guide.

[

## Events

](_web-core_participants_events.md)

Event handling for participants.

[

## Functions to disable plugins

](_web-core_plugins_disable-plugin.md)

Methods on a plugin in a meeting.

[

## Functions to enable plugins

](_web-core_plugins_enable-plugin.md)

Methods on a plugin in a meeting.

[

## Introducing chat

](_web-core_chat_introduction.md)

Send and receive chat messages in a meeting.

[

## Introduction

](_web-core_local-user_introduction.md)

Local user setup guide.

[

## Introduction

](_web-core_plugins_introduction.md)

Manage plugins in a meeting.

[

## Introduction

](_web-core_polls_introduction.md)

Create, receive and interact with polls in a meeting.

[

## Manage Media Devices

](_web-core_local-user_manage-media-devices.md)

Local user media guide to manage media permissions.

[

## Media Permission Errors

](_web-core_local-user_media-permission-errors.md)

Local user media guide to local media permission errors.

[

## Meeting Metadata

](_web-core_room-metadata.md)

All metadata pertaining to a meeting.

[

## Other chat functions

](_web-core_chat_other-chat-functions.md)

Other functionality associated with chat.

[

## Other methods

](_web-core_plugins_extra.md)

Methods on a plugin in a meeting.

[

## Other Methods

](_web-core_local-user_extras.md)

Methods to manage the local user.

[

## Other poll functions

](_web-core_polls_other-poll-functions.md)

Other poll functions

[

## Participant Maps

](_web-core_participants.md)

Events, methods and data pertaining to meeting participants.

[

## Participant Object

](_web-core_participants_participant-object.md)

The object corresponding to a particular participant.

[

## Picture-in-Picture

](_web-core_participants_pip.md)

Events, methods and data pertaining to browser picture in picture mode

[

## Quickstart

](_web-core.md)

This quickstart shows how to incorporate live video and audio into any web application using RealtimeKit's Core SDKs.

[

## Receiving chat messages

](_web-core_chat_receiving-chat-messages.md)

Receive chat messages that have been sent in a meeting.

[

## Recording

](_web-core_recording.md)

Control recordings in a meeting.

[

## Release Notes

](_web-core_release-notes.md)

The release notes lists all new features, resolved issues, and known issues of Web Core in chronological order.

[

## Sending a chat message

](_web-core_chat_sending-a-chat-message.md)

Send a chat message in a meeting.

[

## Voting on a poll

](_web-core_polls_voting-on-a-poll.md)

Voting on polls in a meeting.

#### _web-core_upgrade.md

> Source: https://docs.realtime.cloudflare.com/web-core/upgrade
> Scraped: 11/24/2025, 5:20:13 AM

With this major release we tried to reduce the number of breaking changes to the minimal amount.

**1\. Removal of V1 REST API terminology in favor of V2 REST API terminology***2\. Event changes ️‍🔥 ️‍🔥 ️‍🔥**

Network disconnects now trigger roomLeft event on meeting.self with a state indicating the cause of leaving the room. If you have redirection logic on `roomLeft`, please update it accordingly.
```
meeting.self.on('roomLeft', ({ state }) => {  
	if(state === 'ended' || state == "left" || state == "kicked"){		// maybe redirect to another page	}}  
```
Possible state values are ‘kicked’ | 'ended' | 'left' | 'rejected' | 'connected-meeting' | 'disconnected' | 'failed';

**3\. Handling Reconnection / Disconnection**

