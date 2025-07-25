/**
 * File Upload Hook
 * Provides file upload functionality with image processing
 */

import { useState, useCallback } from 'react';
import { apiService } from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  uploadedAt: string;
  associatedWith?: {
    type: 'listing' | 'profile' | 'message';
    id: string;
  };
}

interface UseFileUploadReturn {
  uploadedFiles: UploadedFile[];
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  
  // Actions
  pickImage: (options?: {
    allowsMultiple?: boolean;
    quality?: number;
    aspect?: [number, number];
    allowsEditing?: boolean;
  }) => Promise<UploadedFile[]>;
  pickImageFromCamera: (options?: {
    quality?: number;
    aspect?: [number, number];
    allowsEditing?: boolean;
  }) => Promise<UploadedFile | null>;
  uploadImage: (uri: string, options?: {
    compress?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }) => Promise<UploadedFile | null>;
  uploadMultipleImages: (uris: string[], options?: {
    compress?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }) => Promise<UploadedFile[]>;
  getUserImages: () => Promise<void>;
  deleteImage: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const { state: authState } = useAuth();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission to access camera roll is required!');
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission to access camera is required!');
      return false;
    }
    return true;
  };

  const processImage = async (uri: string, options?: {
    compress?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }) => {
    try {
      const manipulatorOptions: ImageManipulator.ImageManipulatorOptions = [];

      if (options?.compress || options?.maxWidth || options?.maxHeight) {
        const maxWidth = options.maxWidth || 1200;
        const maxHeight = options.maxHeight || 1200;
        
        manipulatorOptions.push({
          resize: { width: maxWidth, height: maxHeight }
        });
      }

      const result = await ImageManipulator.manipulateAsync(
        uri,
        manipulatorOptions,
        {
          compress: options?.quality || 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return result.uri;
    } catch (error) {
      console.error('Error processing image:', error);
      return uri; // Return original URI if processing fails
    }
  };

  const pickImage = useCallback(async (options?: {
    allowsMultiple?: boolean;
    quality?: number;
    aspect?: [number, number];
    allowsEditing?: boolean;
  }): Promise<UploadedFile[]> => {
    if (!authState.isAuthenticated) {
      setError('Please log in to upload images');
      return [];
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return [];

    try {
      setError(null);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: options?.allowsMultiple || false,
        quality: options?.quality || 0.8,
        aspect: options?.aspect,
        allowsEditing: options?.allowsEditing || false,
      });

      if (!result.canceled && result.assets) {
        const uris = result.assets.map(asset => asset.uri);
        return await uploadMultipleImages(uris, {
          compress: true,
          quality: options?.quality || 0.8,
        });
      }

      return [];
    } catch (error) {
      setError('Failed to pick image');
      return [];
    }
  }, [authState.isAuthenticated]);

  const pickImageFromCamera = useCallback(async (options?: {
    quality?: number;
    aspect?: [number, number];
    allowsEditing?: boolean;
  }): Promise<UploadedFile | null> => {
    if (!authState.isAuthenticated) {
      setError('Please log in to upload images');
      return null;
    }

    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return null;

    try {
      setError(null);
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: options?.quality || 0.8,
        aspect: options?.aspect,
        allowsEditing: options?.allowsEditing || false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        return await uploadImage(result.assets[0].uri, {
          compress: true,
          quality: options?.quality || 0.8,
        });
      }

      return null;
    } catch (error) {
      setError('Failed to take photo');
      return null;
    }
  }, [authState.isAuthenticated]);

  const uploadImage = useCallback(async (uri: string, options?: {
    compress?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }): Promise<UploadedFile | null> => {
    if (!authState.isAuthenticated) {
      setError('Please log in to upload images');
      return null;
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // Process image if needed
      let processedUri = uri;
      if (options?.compress !== false) {
        processedUri = await processImage(uri, options);
      }

      // Create FormData
      const formData = new FormData();
      formData.append('image', {
        uri: processedUri,
        type: 'image/jpeg',
        name: `image_${Date.now()}.jpg`,
      } as any);

      setUploadProgress(50);

      const response = await apiService.uploadImage(formData);
      
      if (response.success && response.data) {
        const uploadedFile = response.data;
        setUploadedFiles(prev => [uploadedFile, ...prev]);
        setUploadProgress(100);
        return uploadedFile;
      } else {
        setError(response.error || 'Failed to upload image');
        return null;
      }
    } catch (error) {
      setError('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [authState.isAuthenticated]);

  const uploadMultipleImages = useCallback(async (uris: string[], options?: {
    compress?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }): Promise<UploadedFile[]> => {
    if (!authState.isAuthenticated) {
      setError('Please log in to upload images');
      return [];
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      const formData = new FormData();
      
      for (let i = 0; i < uris.length; i++) {
        let processedUri = uris[i];
        
        // Process image if needed
        if (options?.compress !== false) {
          processedUri = await processImage(uris[i], options);
        }

        formData.append('images', {
          uri: processedUri,
          type: 'image/jpeg',
          name: `image_${Date.now()}_${i}.jpg`,
        } as any);

        setUploadProgress((i + 1) / uris.length * 50);
      }

      const response = await apiService.uploadMultipleImages(formData);
      
      if (response.success && response.data) {
        const uploadedFiles = response.data.files || [];
        setUploadedFiles(prev => [...uploadedFiles, ...prev]);
        setUploadProgress(100);
        return uploadedFiles;
      } else {
        setError(response.error || 'Failed to upload images');
        return [];
      }
    } catch (error) {
      setError('Failed to upload images');
      return [];
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [authState.isAuthenticated]);

  const getUserImages = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    try {
      setError(null);
      
      const response = await apiService.getUserImages();
      
      if (response.success && response.data) {
        setUploadedFiles(response.data.images || []);
      } else {
        setError(response.error || 'Failed to load images');
        setUploadedFiles([]);
      }
    } catch (error) {
      setError('Failed to load images');
      setUploadedFiles([]);
    }
  }, [authState.isAuthenticated]);

  const deleteImage = useCallback(async (id: string): Promise<boolean> => {
    if (!authState.isAuthenticated) {
      setError('Please log in to delete images');
      return false;
    }

    try {
      setError(null);
      
      const response = await apiService.deleteImage(id);
      
      if (response.success) {
        setUploadedFiles(prev => prev.filter(file => file.id !== id));
        return true;
      } else {
        setError(response.error || 'Failed to delete image');
        return false;
      }
    } catch (error) {
      setError('Failed to delete image');
      return false;
    }
  }, [authState.isAuthenticated]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadedFiles,
    isUploading,
    uploadProgress,
    error,
    pickImage,
    pickImageFromCamera,
    uploadImage,
    uploadMultipleImages,
    getUserImages,
    deleteImage,
    clearError,
  };
};