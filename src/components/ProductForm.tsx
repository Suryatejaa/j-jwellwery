'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { convertPrivateToPublicR2Url } from '@/lib/url-utils';
import ImageCropper from './ImageCropper';
import { CATEGORIES as categories } from '@/lib/categories';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: any) => Promise<void>;
}

export default function ProductForm({ product, onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    category: product?.category || '',
    image: product?.image || '',
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    product?.images?.length ? product.images : (product?.image ? [product.image] : [])
  );
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(product?.video || null);
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [filesToCrop, setFilesToCrop] = useState<File[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    
    // If the removed image was the main image, set the first remaining image as main
    if (formData.image === uploadedImages[index]) {
      setFormData((prev) => ({ ...prev, image: newImages[0] || '' }));
    }
  };

  const handleVideoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only one video allowed
    if (uploadedVideo) {
      setError('Only one video is allowed per product');
      return;
    }

    // Size check: <= 2MB (2048 KB)
    const MAX_VIDEO_BYTES = 2 * 1024 * 1024; // 2 MB
    if (file.size > MAX_VIDEO_BYTES) {
      setError('Video file must be 2MB (2048 KB) or smaller');
      return;
    }

    setError('');
    const objectUrl = URL.createObjectURL(file);
    setVideoPreview(objectUrl);

    // Check duration
    try {
      await new Promise<void>((resolve, reject) => {
        const vid = document.createElement('video');
        vid.preload = 'metadata';
        vid.src = objectUrl;
        const cleanup = () => {
          vid.src = '';
          URL.revokeObjectURL(objectUrl);
          vid.remove();
        };

        const onLoaded = () => {
          const duration = vid.duration || 0;
          cleanup();
          if (duration > 5) {
            reject(new Error('Video duration must be 5 seconds or less'));
          } else {
            resolve();
          }
        };

        const onError = () => {
          cleanup();
          reject(new Error('Failed to read video metadata'));
        };

        vid.addEventListener('loadedmetadata', onLoaded, { once: true });
        vid.addEventListener('error', onError, { once: true });
      });
    } catch (err: any) {
      setVideoPreview(null);
      setError(err.message || 'Invalid video');
      return;
    }

    // Upload video
    setVideoUploading(true);
    try {
      const form = new FormData();
      form.append('video', file);

      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Video upload failed');

      setUploadedVideo(data.url);
      setVideoPreview(null);
    } catch (err: any) {
      console.error('[VIDEO UPLOAD] Error:', err);
      setError(err.message || 'Video upload failed');
    } finally {
      setVideoUploading(false);
    }
  };

  const removeVideo = () => {
    setUploadedVideo(null);
    setVideoPreview(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (uploadedImages.length + files.length > 6) {
      setError('Maximum 6 images allowed');
      return;
    }

    setError('');
    
    // Start cropping process
    setFilesToCrop(Array.from(files));
    setCurrentCropIndex(0);
    
    // Show crop modal for first image
    const reader = new FileReader();
    reader.onload = (event) => {
      setCropImage(event.target?.result as string);
    };
    reader.readAsDataURL(files[0]);
  };

  const handleCropDone = async (croppedFile: File) => {
    const newFiles = [...filesToCrop];
    newFiles[currentCropIndex] = croppedFile;
    setFilesToCrop(newFiles);

    // Move to next image or upload
    if (currentCropIndex < filesToCrop.length - 1) {
      setCurrentCropIndex(currentCropIndex + 1);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCropImage(event.target?.result as string);
      };
      reader.readAsDataURL(filesToCrop[currentCropIndex + 1]);
    } else {
      // All images cropped, now upload
      await uploadCroppedImages(newFiles);
      setCropImage(null);
      setFilesToCrop([]);
      setCurrentCropIndex(0);
    }
  };

  const uploadCroppedImages = async (croppedFiles: File[]) => {
    setUploading(true);
    try {
      console.log('[UPLOAD] Starting upload for', croppedFiles.length, 'cropped files');
      
      const uploadFormData = new FormData();
      croppedFiles.forEach(file => {
        uploadFormData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      console.log('[UPLOAD] Response status:', response.status);
      const responseData = await response.json();
      console.log('[UPLOAD] Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to upload images');
      }

      const { urls } = responseData;
      console.log('[UPLOAD] All files uploaded. Public URLs:', urls);
      
      const newImages = [...uploadedImages, ...urls];
      setUploadedImages(newImages);
      console.log('[UPLOAD] Uploaded images state updated:', newImages);

      // Set first image as main image
      setFormData((prev) => ({ ...prev, image: newImages[0] }));
      console.log('[UPLOAD] Image URLs saved to form:', newImages);
    } catch (err: any) {
      console.error('[UPLOAD] Error:', err);
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setCropImage(null);
    setFilesToCrop([]);
    setCurrentCropIndex(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Prevent submit while video is still uploading
    if (videoUploading) {
      setError('Video is still uploading — please wait until it finishes.');
      setLoading(false);
      return;
    }

    try {
      if (!formData.name || !formData.price || !formData.image || !formData.category) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Pass both image (main), images (array) and optional video URL to backend
      await onSubmit({
        ...formData,
        images: uploadedImages,
        video: uploadedVideo || null,
      });
      
      if (!product) {
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          image: '',
        });
        setUploadedImages([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {cropImage && (
        <ImageCropper
          imageSrc={cropImage}
          onCropDone={handleCropDone}
          onCancel={handleCropCancel}
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          autoFocus
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="e.g., Diamond Ring"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Product details and features..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (₹) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Images * (Up to 6 images)
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading || uploadedImages.length >= 6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          {uploadedImages.length}/6 images uploaded. Max 5MB per image.
        </p>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Video (Optional — 1 file, ≤ 2MB, ≤ 5s)
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoSelected}
          disabled={videoUploading || !!uploadedVideo}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          {uploadedVideo ? '1 video uploaded' : 'No video uploaded. Max 2MB (2048 KB), max duration 5 seconds.'}
        </p>

        {videoPreview && (
          <div className="mt-3">
            <video src={videoPreview} className="w-48 h-28 object-cover rounded-lg" controls />
          </div>
        )}

        {uploadedVideo && (
          <div className="mt-3 flex items-start gap-3">
            <video
              src={convertPrivateToPublicR2Url(uploadedVideo)}
              className="w-48 h-28 object-cover rounded-lg"
              controls
              onError={(e) => {
                console.log('[VIDEO PREVIEW] Failed to load video preview', e);
              }}
            />
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={removeVideo}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Remove Video
              </button>
              <p className="text-xs text-gray-500">Uploaded video will be shown on product page.</p>
            </div>
          </div>
        )}

        {videoUploading && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm mt-3">
            Uploading video...
          </div>
        )}
      </div>

      {uploadedImages.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</p>
          <div className="grid grid-cols-3 gap-3">
            {uploadedImages.map((imageUrl, index) => {
              const displayUrl = convertPrivateToPublicR2Url(imageUrl);
              return (
              <div key={index} className="relative group">
                <img
                  src={displayUrl}
                  alt={`Product ${index + 1}`}
                  className={`w-24 h-24 object-cover rounded-lg border-2 ${
                    formData.image === imageUrl
                      ? 'border-emerald-600'
                      : 'border-gray-300'
                  }`}
                  onError={(e) => {
                    console.log(`[PREVIEW] Image failed to load at index ${index}:`, displayUrl);
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                  onLoad={() => {
                    console.log(`[PREVIEW] Image loaded successfully at index ${index}:`, displayUrl);
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition-all">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {formData.image === imageUrl && (
                  <div className="absolute top-1 right-1 bg-emerald-600 text-white text-xs px-2 py-1 rounded">
                    Main
                  </div>
                )}
              </div>
            );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {uploadedImages[0] === formData.image ? 'First image' : 'Select first image'} will be shown in store
          </p>
        </div>
      )}

      {uploading && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
          Uploading images...
        </div>
      )}

      <button
        type="submit"
        disabled={loading || uploading || videoUploading}
        className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
      >
        {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
      </button>
    </form>
    </>
  );
}
