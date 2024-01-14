import React, { useState, useEffect  } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';

const Chitters = () => {
  const [messages, setMessages] = useState([]);
  const ROBOFLOW_API_KEY = 'pnHKQq7IhPYTY8LpehFz';


const introMessage = {
  _id: 0,
  text: 'Welcome to Treense! Feel free to upload photos of trees for me to analyse!',
  createdAt: new Date(),
  user: {
    _id: 2,
    name: 'Treense',
  },
};

useEffect(() => {
  // Set the introductory message when the component mounts
  setMessages([introMessage]);
}, []); // Empty dependency array means this effect runs once when the component mounts

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

  const sendImageToRoboflow = async (imageUri) => {
    try {
      let base64Img = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      base64Img = `data:image/jpg;base64,${base64Img}`;
  
      const roboflowResponse = await fetch('https://classify.roboflow.com/treense/1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // Update content type
        'Authorization': 'Bearer ' + ROBOFLOW_API_KEY,
      },
      body: JSON.stringify({ image: base64Img }),
      });
  
      if (!roboflowResponse.ok) {
        console.error('Request failed:', roboflowResponse.status, roboflowResponse.statusText);
        const responseBody = await roboflowResponse.json();
        console.error(responseBody);
        return;
      }
  
      const responseData = await roboflowResponse.json();
  
      // Assuming GiftedChat message format
      const updatedMessage = {
        _id: new Date().getTime(),
        text: 'The tree appears to be healthy.',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Treense',
        },
        image: imageUri,
        analysis: responseData, // Store analysis results in the message
      };
  
      // Update the state to replace the previous message with updated information
      setMessages((previousMessages) => {
        const index = previousMessages.findIndex(message => message.image === imageUri);
        if (index !== -1) {
          return [...previousMessages.slice(0, index), updatedMessage, ...previousMessages.slice(index + 1)];
        } else {
          return previousMessages;
        }
      });
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
  
      if (!result.canceled) {
        let base64Img = await FileSystem.readAsStringAsync(result.assets[0].uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
  
        base64Img = base64Img.replace(/^data:image\/[a-z]+;base64,/, "");
  
        let roboflowResponse = await axios.post(
          'https://classify.roboflow.com/treense/1',
          base64Img,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Bearer ' + ROBOFLOW_API_KEY,
            },
          }
        );
  
        let top = roboflowResponse.data.top;
  
        let botMessageText;
        if (top === 'healthy') {
          botMessageText = 'The tree appears to be healthy.';
        } else if (top === 'unhealthy') {
          botMessageText = 'The tree may be unhealthy.';
        } else {
          botMessageText = 'I am not sure about the health of the tree.';
        }
  
        const botMessage = {
          _id: new Date().getTime() + 1,
          text: botMessageText,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'Treense',
          },
        };
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, botMessage)
        );
      }
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
        <MaterialIcons name="android" size={32} color="green" />
      </View>
    );
  };

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
            borderBottomWidth: 1,
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
            renderInputToolbar={renderInputToolbar}
            renderAvatar={renderAvatar} // Add this line to use the custom avatar renderer
            listViewProps={{ style: { width: '100%', backgroundColor: 'grey' } }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chitters;
