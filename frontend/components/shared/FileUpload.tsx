'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './index';

interface FileUploadProps {
  onUpload: (file: File) => Promise<any>;
  accept?: string;
  label?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function FileUpload({
  onUpload,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  label = 'Upload File',
  isLoading = false,
  disabled = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 20, 90));
      }, 200);

      await onUpload(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');

      // Reset after 2 seconds
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        setUploadStatus('idle');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
    } catch (error: any) {
      setUploadStatus('error');
      setErrorMessage(error.response?.data?.error?.message || 'Upload failed');
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || isLoading}
        className="hidden"
      />

      {uploadStatus === 'idle' && !selectedFile && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading}
          className="w-full p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="text-xs text-gray-500 mt-1">PDF, DOC, JPG, PNG</p>
        </button>
      )}

      {selectedFile && uploadStatus === 'idle' && (
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-800">{selectedFile.name}</p>
            <p className="text-xs text-gray-600">{(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleUpload}
              isLoading={isLoading}
              className="flex-1"
            >
              Upload
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="flex-1"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {uploadStatus === 'uploading' && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 text-center">{uploadProgress}% Uploading...</p>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-600" />
          <p className="text-sm text-green-800">File uploaded successfully!</p>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
          <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Upload failed</p>
            <p className="text-xs text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
