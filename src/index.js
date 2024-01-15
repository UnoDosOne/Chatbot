import React, { useState, useEffect  } from 'react';
import { View, Image, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';

const Chitters = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Set the introductory message when the component mounts
    const delayTime1 = 3000;
  
    // Set isTyping to true before the delay
    setIsTyping(true);
  
    // Use setTimeout to delay the execution of the introductory message
    setTimeout(() => {
      // Assuming GiftedChat message format for the introductory message
      const introMessage = {
        _id: 0,
        text: 'Welcome to Treense! Feel free to upload photos of trees for me to analyse!',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Treense', 
        },
      };
  
      // Set the introductory message after the delay
      setMessages([introMessage]);
  
      // Set isTyping to false after the delay
      setIsTyping(false);
    }, delayTime1);
  }, []);  
  
  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        // Create a new message with the image URI
        const newMessage = {
          _id: new Date().getTime(),
          image: result.assets[0].uri, // Access the URI within the first asset
          createdAt: new Date(),
          user: {
            _id: 1,
            name: 'User',
          },
        };

        // Update the state to include the new message
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, newMessage)
        );

        // Now you can send the image to the Roboflow model and update the message later
        sendImageToRoboflow(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }
  
    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled && result.assets.length > 0) {
        // Create a new message with the image URI
        const newMessage = {
          _id: new Date().getTime(),
          image: result.assets[0].uri, // Access the URI within the first asset
          createdAt: new Date(),
          user: {
            _id: 1,
            name: 'User',
          },
        };

        // Update the state to include the new message
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, newMessage)
        );

        // Now you can send the image to the Roboflow model and update the message later
        sendImageToRoboflow(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendImageToRoboflow = async (imageUri) => {
    try {
      // Set isTyping to true before making the API call
      setIsTyping(true);
  
      let base64Img = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      base64Img = `data:image/jpg;base64,${base64Img}`;
  
      axios({
        method: 'POST',
        url: "https://classify.roboflow.com/treense/1?api_key=pnHKQq7IhPYTY8LpehFz",
        data: base64Img,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }).then((res) => {
        console.log("Results", res.request._response);
  
        const responseData = res.data;
        const top = responseData.top;
  
        // Create a bot message based on the analysis results
        let botMessageText;
        if (top === 'healthy') {
          botMessageText = (
            <Text>
              The tree you uploaded appears to be{' '}
              <Text style={{ color: 'green' }}>healthy</Text>.
            </Text>
          );
        } else if (top === 'unhealthy') {
          botMessageText = (
            <Text>
              This tree may be in{' '}
              <Text style={{ color: 'red' }}>unhealthy</Text> condition, please seek expert advice.
            </Text>
          );
        } else {
          botMessageText = 'I am not sure about the health of the tree.';
        }
  
        // Assuming GiftedChat message format for the bot message
        const botMessage = {
          _id: new Date().getTime() + 1,
          text: botMessageText,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'Treense',
          },
          image: imageUri,
        };
  
        // Update the state to include the bot message
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, botMessage)
        );
  
        // Set isTyping to false after the responses are generated
        setIsTyping(false);
  
        // Set a time delay (e.g., 5000 milliseconds or 5 seconds) for the encouragement message
        const delayTime = 5000;
  
        const encouragementMessages = [
          'Feel free to upload another image for analysis!',
          'Great job! Want to analyze another tree?',
          'Thats awesome, care to upload more?',
        ];
        // Randomly select an encouragement message
        const randomEncouragementMessage =
          encouragementMessages[
            Math.floor(Math.random() * encouragementMessages.length)
          ];
        // Use setTimeout to delay the execution of the encouragement message
        setIsTyping(true);
        setTimeout(() => {
          // Assuming GiftedChat message format for the encouragement message
          const encourageMessage = {
            _id: new Date().getTime() + 2,
            text: randomEncouragementMessage,
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'Treense',
            },
          };
          // Update the state to include the encouragement message
          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, encourageMessage)
          );
          // Set isTyping to false after the encouragement message is added
          setIsTyping(false);
        }, delayTime);

      });
    } catch (error) {
      console.error(error);
    }
  };
  

  const renderInputToolbar = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 10,
        }}
      >
        <TouchableOpacity
          style={{
            alignSelf: "center",
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#43D338",
            paddingVertical: 5,
            paddingHorizontal: 90,
            borderWidth: 2,
            borderRadius: 20,
          }}
          onPress={handleImagePicker}
        >
          <Text>Upload Photo</Text>
          <MaterialIcons name="attach-file" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            alignSelf: "center",
            backgroundColor: "#43D338",
            paddingVertical: 5,
            paddingHorizontal: 20,
            borderWidth: 2,
            borderRadius: 20,
          }}
          onPress={handleCamera}
        >
          <MaterialIcons name="camera-alt" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderAvatar = (props) => {
    // Customize the avatar for each message
    return (
      <View style={{ marginRight: 5 }}>
        {/* <MaterialIcons name="android" size={32} color="green" /> */}
        <Image
          source={require('../assets/avatar.png')}
          style={{ width: 32, height: 32, borderRadius: 20, backgroundColor: 'white', }}
        />
      </View>
    );
  };
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#43D338',
            borderWidth: 1,

          },
          left: {
            backgroundColor: '#fff',
            borderWidth: 1,

          }
        }}
      />
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: '#f5f5f5',
            padding: 10,
            marginTop: 40,
            marginBottom: 5,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Treense
          </Text>
          <GiftedChat
            messages={messages}
            onSend={(newMessages) => handleSend(newMessages)}
            user={{ _id: 1 }}
            isTyping={isTyping}
            renderInputToolbar={renderInputToolbar}
            renderBubble={renderBubble}
            renderAvatar={renderAvatar} // Add this line to use the custom avatar renderer
            listViewProps={{ style: {
               width: '100%', 
               backgroundColor: '#EAF2EC', 
               paddingVertical: 10, 
               borderWidth: 1,
               borderRadius:20,
              } }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chitters;