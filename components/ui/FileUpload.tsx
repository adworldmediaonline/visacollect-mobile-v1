import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

import { FileText, Upload, X } from 'lucide-react-native';

import { apiService } from '../../services/api';

interface FileUploadProps {
  onFilesSelected: (files: any[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
  applicationId?: string;
}

interface UploadedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
  // Cloudinary metadata
  url?: string;
  publicId?: string;
  uploadedAt?: string;
  format?: string;
  width?: number;
  height?: number;
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'application/pdf'],
  className = '',
  applicationId,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelection = async () => {
    try {
      setIsUploading(true);

      // Request permissions for image picker
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your media library.'
        );
        return;
      }

      // Show action sheet for file type selection
      Alert.alert(
        'Select File Type',
        'Choose how you want to select your files',
        [
          {
            text: 'Camera',
            onPress: () => selectFromCamera(),
          },
          {
            text: 'Photo Library',
            onPress: () => selectFromLibrary(),
          },
          {
            text: 'Documents',
            onPress: () => selectDocuments(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('File selection error:', error);
      Alert.alert('Error', 'Failed to select files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFilesToCloudinary = async (files: UploadedFile[]) => {
    if (!applicationId) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const folder = `turkey_visa/${applicationId}`;
      const response = await apiService.uploadFilesToCloudinary(files, folder);

      if (response.success) {
        // Merge Cloudinary metadata with local file data
        const cloudinaryFiles = response.data.map(
          (cloudinaryFile: any, index: number) => ({
            ...files[index],
            url: cloudinaryFile.url,
            publicId: cloudinaryFile.publicId,
            uploadedAt: cloudinaryFile.uploadedAt,
            format: cloudinaryFile.format,
            width: cloudinaryFile.width,
            height: cloudinaryFile.height,
          })
        );

        const updatedFiles = [...uploadedFiles, ...cloudinaryFiles];
        setUploadedFiles(updatedFiles);
        onFilesSelected(updatedFiles);
        setUploadProgress(100);

        Alert.alert(
          'Success',
          `${cloudinaryFiles.length} file(s) uploaded successfully!`
        );
      }
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      Alert.alert(
        'Upload Error',
        error.message || 'Failed to upload files. Please try again.'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const selectFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newFile: UploadedFile = {
          uri: asset.uri,
          name: asset.fileName || `camera_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
        };

        // Upload to Cloudinary if applicationId is provided
        if (applicationId) {
          await uploadFilesToCloudinary([newFile]);
        } else {
          const updatedFiles = [...uploadedFiles, newFile];
          setUploadedFiles(updatedFiles);
          onFilesSelected(updatedFiles);
        }
      }
    } catch (error) {
      console.error('Camera selection error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const selectFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newFiles: UploadedFile[] = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
        }));

        // Upload to Cloudinary if applicationId is provided
        if (applicationId) {
          await uploadFilesToCloudinary(newFiles);
        } else {
          const updatedFiles = [...uploadedFiles, ...newFiles];
          setUploadedFiles(updatedFiles);
          onFilesSelected(updatedFiles);
        }
      }
    } catch (error) {
      console.error('Library selection error:', error);
      Alert.alert('Error', 'Failed to select images. Please try again.');
    }
  };

  const selectDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newFiles: UploadedFile[] = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size || 0,
        }));

        // Upload to Cloudinary if applicationId is provided
        if (applicationId) {
          await uploadFilesToCloudinary(newFiles);
        } else {
          const updatedFiles = [...uploadedFiles, ...newFiles];
          setUploadedFiles(updatedFiles);
          onFilesSelected(updatedFiles);
        }
      }
    } catch (error) {
      console.error('Document selection error:', error);
      Alert.alert('Error', 'Failed to select documents. Please try again.');
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (type: string) => {
    return type.startsWith('image/');
  };

  return (
    <View className={`w-full ${className}`}>
      {/* Upload Button */}
      <TouchableOpacity
        onPress={handleFileSelection}
        disabled={isUploading || uploadedFiles.length >= maxFiles}
        className={`
          w-full p-6 border-2 border-dashed border-primary-300 rounded-xl
          items-center justify-center
          ${
            isUploading || uploadedFiles.length >= maxFiles
              ? 'opacity-50 bg-gray-50'
              : 'bg-primary-50'
          }
        `}
      >
        <View className="items-center gap-3">
          <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center">
            <Upload size={24} color="#1e8ec2" />
          </View>
          <View className="items-center gap-1">
            <Text className="text-lg font-semibold text-primary-700">
              {isUploading
                ? uploadProgress > 0
                  ? `Uploading... ${uploadProgress}%`
                  : 'Selecting Files...'
                : uploadedFiles.length >= maxFiles
                  ? 'Maximum Files Reached'
                  : 'Upload Documents'}
            </Text>
            <Text className="text-sm text-primary-600 text-center">
              {uploadedFiles.length >= maxFiles
                ? `You have uploaded ${maxFiles} files`
                : 'Tap to select photos, documents, or take a picture'}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              Max {maxFiles} files • PDF, JPG, PNG supported
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <View className="mt-4 gap-3">
          <Text className="text-sm font-medium text-gray-700">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </Text>
          {uploadedFiles.map((file, index) => (
            <View
              key={index}
              className="flex-row items-center p-3 bg-white border border-gray-200 rounded-lg"
            >
              {/* File Icon/Preview */}
              <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center mr-3">
                {isImage(file.type) ? (
                  <Image
                    source={{ uri: file.uri }}
                    className="w-10 h-10 rounded-lg"
                    resizeMode="cover"
                  />
                ) : (
                  <FileText size={20} color="#6b7280" />
                )}
              </View>

              {/* File Info */}
              <View className="flex-1">
                <Text
                  className="text-sm font-medium text-gray-900"
                  numberOfLines={1}
                >
                  {file.name}
                </Text>
                <Text className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {file.type}
                </Text>
              </View>

              {/* Remove Button */}
              <TouchableOpacity
                onPress={() => removeFile(index)}
                className="w-8 h-8 bg-red-100 rounded-full items-center justify-center"
              >
                <X size={16} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
