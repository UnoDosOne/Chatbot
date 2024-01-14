import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // For dropdown selection
import { DocumentPicker } from 'react-native-document-picker'; // For file selection
import styles from './styles'; // Import the styles

const Upload = () => {
  const [selectedMethod, setSelectedMethod] = useState('upload');
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [model, setModel] = useState('');
  const [version, setVersion] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState('');

  const handleFileSelection = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      setSelectedFile(result);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        throw err;
      }
    }
  };

  const handleSubmit = () => {
    // Implement your logic for submitting the form and handling API calls here
    // You can access the selectedMethod, selectedFormat, selectedFile, imageUrl, model, version, apiKey, and perform necessary actions.
    // Update the 'result' state with the inference result.
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Replace 'Image' component with your React Native image component */}
        {/* Also, adjust styling as needed */}
        <Text>Roboflow Inference</Text>
        <TextInput
          placeholder="Model"
          value={model}
          onChangeText={(text) => setModel(text)}
        />
        <TextInput
          placeholder="Version"
          value={version}
          onChangeText={(text) => setVersion(text)}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="API Key"
          value={apiKey}
          onChangeText={(text) => setApiKey(text)}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Picker
          selectedValue={selectedMethod}
          onValueChange={(itemValue) => setSelectedMethod(itemValue)}
        >
          <Picker.Item label="Upload" value="upload" />
          <Picker.Item label="URL" value="url" />
        </Picker>

        {selectedMethod === 'upload' && (
          <View>
            {/* File Selection */}
            <TouchableOpacity onPress={handleFileSelection}>
              <Text>Browse</Text>
            </TouchableOpacity>
            <TextInput
              placeholder="File Name"
              value={selectedFile ? selectedFile.name : ''}
              editable={false}
            />
          </View>
        )}

        {selectedMethod === 'url' && (
          <TextInput
            placeholder="Enter Image URL"
            value={imageUrl}
            onChangeText={(text) => setImageUrl(text)}
          />
        )}

        {/* Format Selection */}
        <Picker
          selectedValue={selectedFormat}
          onValueChange={(itemValue) => setSelectedFormat(itemValue)}
        >
          <Picker.Item label="JSON" value="json" />
        </Picker>

        {/* Submit Button */}
        <Button title="Run Inference" onPress={handleSubmit} />

        {/* Result */}
        <View>
          <Text>Result</Text>
          <TouchableOpacity>
            <Text>Copy Code</Text>
          </TouchableOpacity>
          <Text>{result}</Text>
        </View>
      </View>
    </View>
  );
};



export default Upload;
