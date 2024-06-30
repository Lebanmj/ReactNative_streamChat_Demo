import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useChatClient } from './src/useChatClient';
import { AppProvider } from "./src/AppContext";
import {
  Chat,
  OverlayProvider,
  ChannelList,
  Channel,
  MessageList,
  MessageInput,
  Thread,
  ChannelPreviewMessenger,
  useMessageContext,
} from 'stream-chat-react-native'; // Or stream-chat-expo
import { StreamChat } from 'stream-chat';
import { chatApiKey, chatUserId }from './src/chatConfig';
import { useAppContext } from './src/AppContext';

const Stack = createStackNavigator();
const CustomListItem = props => {
  const { unread } = props;
  const backgroundColor = unread ? '#e6f7ff' : '#fff';
  return (
    <View style={{ backgroundColor }}>
    <ChannelPreviewMessenger {...props} />
    </View>
  )
}
const ThreadScreen = props => {
  const { channel, thread } = useAppContext();
  return (
    <Channel channel={channel}
     thread={thread} 
     threadList
     MessageSimple={CustomMessage}>
      <Thread />
    </Channel>
  );
}
const CustomMessage = () => {
  const { message, isMyMessage } = useMessageContext();

  return (
    <View style={{
      alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
      backgroundColor: isMyMessage ? 'red' : '#ededed',
      padding: 10,
      margin: 10,
      borderRadius: 10,
      width: '70%',
    }}>
      <Text>{message.text}</Text>
    </View>
  )
}
const chatTheme = {
  channelPreview: {
    container: {
      backgroundColor: 'transparent',
    }
  }
};
const ChannelScreen = props => {
  const { navigation } = props;
  const { channel, setThread } = useAppContext();
  return (
    <Channel channel={channel}>
      <MessageList
        onThreadSelect={(message) => {
          if (channel?.id) {
            setThread(message);
            navigation.navigate('ThreadScreen');
          }
        }}
      />
      <MessageInput />
    </Channel>
  );
};

const filters = {
  members: {
    '$in': [chatUserId]
  },
};

const sort = {
  last_message_at: -1,
};
const ChannelListScreen = props => {
  const { setChannel } = useAppContext();
  return (
    <ChannelList
    onSelect={(channel) => {
      const { navigation } = props;
      setChannel(channel);
      navigation.navigate('ChannelScreen');
    }}
    Preview={CustomListItem}
      filters={filters}
      sort={sort}
    />
  );
};
const chatClient = StreamChat.getInstance(chatApiKey);
const NavigationStack = () => {
  const { clientIsReady } = useChatClient();

  if (!clientIsReady) {
    return <Text>Loading chat ...</Text>
  }
  const CustomMessage = () => {
    return null;
  }
  return (
    <OverlayProvider value={{ style: chatTheme }}>
                  <Chat client={chatClient}>
    <Stack.Navigator>
    <Stack.Screen name="ChannelList" component={ChannelListScreen} />   
    <Stack.Screen name="ChannelScreen" component={ChannelScreen} />
    <Stack.Screen name="ThreadScreen" component={ThreadScreen} />
     </Stack.Navigator>
    </Chat>
    </OverlayProvider>
  );
};
export default () => {
  return (
    <AppProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor="red" barStyle="light-content" />
      <NavigationContainer>
        <NavigationStack />
      </NavigationContainer>
    </SafeAreaView>
    </GestureHandlerRootView>
    </AppProvider>

  );
};