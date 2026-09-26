import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { createPost } from '../services/api';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function CreateStory() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: 'Only JPEG, PNG, WebP, and GIF images are supported.'
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        image: 'File size must not exceed 5MB.'
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: '' }));
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await createPost(formData);
      const newPostId = res.data?.post?.id;

      if (newPostId) {
        navigate(`/stories/${newPostId}`);
      } else {
        navigate('/my-stories');
      }
    } catch (err) {
      console.error('Failed to create story:', err);
      const message =
        err.response?.data?.message ||
        'Failed to publish story. Please check your inputs and try again.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-story-page" style={{ maxWidth: '780px', margin: '0 auto' }}>
      <header className="page-header motion-fade-up">
        <div className="editorial-journey-kicker">
          <span className="editorial-journey-step">Draft</span>
          <span className="editorial-journey-arrow">→</span>
          <span className="editorial-journey-step">Shape</span>
          <span className="editorial-journey-arrow">→</span>
          <span className="editorial-journey-step active">Publish</span>
        </div>
        <h1 className="page-title">Write a Story</h1>
        <p className="page-subtitle">
          Transform your reflections, observations, and narratives into a published editorial piece.
        </p>
      </header>

      <div className="form-card motion-scale-in motion-stagger-1" style={{ maxWidth: '100%' }}>
        {apiError && (
          <div className="alert-error" role="alert" aria-live="assertive">
            <span>⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Story Title"
            id="story-title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              if (apiError) setApiError('');
            }}
            placeholder="e.g., The Architecture of Solitude"
            error={errors.title}
            required
            disabled={isSubmitting}
          />

          {/* Cover Image Upload */}
          <div className="file-upload-group">
            <label className="form-label" htmlFor="story-image">
              Cover Image (Optional)
            </label>

            {!imagePreview ? (
              <div
                className="file-upload-box"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                aria-label="Upload story cover image"
              >
                <div className="file-upload-label">
                  <span className="file-upload-icon" aria-hidden="true">🖼️</span>
                  <span>Click or press Enter to choose an image</span>
                  <span className="file-upload-hint">PNG, JPG, WebP, GIF (Max 5MB)</span>
                </div>
              </div>
            ) : (
              <div className="image-preview-wrapper">
                <img src={imagePreview} alt="Cover preview" className="image-preview-img" />
                <div className="image-preview-actions">
                  <button
                    type="button"
                    className="image-remove-btn"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                    aria-label="Remove selected image"
                  >
                    ✕ Remove Image
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              id="story-image"
              name="image"
              accept=".jpg,.jpeg,.png,.webp,.gif"
              style={{ display: 'none' }}
              onChange={handleImageChange}
              disabled={isSubmitting}
            />

            {errors.image && (
              <p className="form-error" role="alert" style={{ marginTop: '0.4rem' }}>
                {errors.image}
              </p>
            )}
          </div>

          <Input
            label="Story Content"
            id="story-content"
            name="content"
            as="textarea"
            rows={12}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content) setErrors((prev) => ({ ...prev, content: '' }));
              if (apiError) setApiError('');
            }}
            placeholder="Compose your thoughts, essays, and stories here..."
            error={errors.content}
            required
            disabled={isSubmitting}
          />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Publish Story
            </Button>
            <Link to="/journal" className="btn btn-outline btn-md">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateStory;
