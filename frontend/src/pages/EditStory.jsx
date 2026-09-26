import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { getPost, updatePost } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function EditStory() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loadingStory, setLoadingStory] = useState(true);
  const [isAuthor, setIsAuthor] = useState(true);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    getPost(id)
      .then((res) => {
        if (!isMounted) return;
        const post = res.data;
        if (post) {
          setTitle(post.title || '');
          setContent(post.content || '');
          setExistingImageUrl(post.image_url || null);

          // Check author match if available
          if (user && post.user_id && Number(post.user_id) !== Number(user.id)) {
            setIsAuthor(false);
          }
        }
        setLoadingStory(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load story for editing:', err);
        const status = err.response?.status;
        if (status === 404) {
          setApiError('Story not found or has been removed.');
        } else if (status === 403) {
          setApiError('You do not have permission to edit this story.');
          setIsAuthor(false);
        } else {
          setApiError('Unable to load story data.');
        }
        setLoadingStory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, user]);

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
    setNewImageFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveNewImage = () => {
    setNewImageFile(null);
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
      if (newImageFile) {
        formData.append('image', newImageFile);
      }

      await updatePost(id, formData);
      navigate(`/stories/${id}`);
    } catch (err) {
      console.error('Failed to update story:', err);
      const message =
        err.response?.data?.message ||
        'Failed to save changes. Please verify your permissions and inputs.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingStory) {
    return (
      <div className="state-container" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true" />
        <h2 className="state-title">Loading Story Details…</h2>
      </div>
    );
  }

  if (!isAuthor) {
    return (
      <div className="state-container" role="alert">
        <h2 className="state-title" style={{ color: 'var(--color-error)' }}>Access Forbidden</h2>
        <p className="state-desc">You are not authorized to edit this story because you are not its author.</p>
        <Link to="/journal" className="btn btn-primary btn-sm">
          Return to Journal
        </Link>
      </div>
    );
  }

  const API_ROOT = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
    : 'http://localhost:5000';
  const currentCoverUrl = existingImageUrl ? `${API_ROOT}${existingImageUrl}` : null;

  return (
    <div className="edit-story-page" style={{ maxWidth: '780px', margin: '0 auto' }}>
      <header className="page-header motion-fade-up">
        <div className="editorial-journey-kicker">
          <span className="editorial-journey-step">Manuscript</span>
          <span className="editorial-journey-arrow">→</span>
          <span className="editorial-journey-step active">Revision</span>
          <span className="editorial-journey-arrow">→</span>
          <span className="editorial-journey-step">Update</span>
        </div>
        <h1 className="page-title">Edit Story</h1>
        <p className="page-subtitle">
          Refine your narrative, polish your thoughts, and update your published piece.
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
            id="edit-title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              if (apiError) setApiError('');
            }}
            error={errors.title}
            required
            disabled={isSubmitting}
          />

          {/* Cover Image Replacement */}
          <div className="file-upload-group">
            <label className="form-label" htmlFor="edit-image">
              Cover Image
            </label>

            {/* Display Replacement Preview or Existing Image */}
            {imagePreview ? (
              <div className="image-preview-wrapper">
                <img src={imagePreview} alt="New replacement preview" className="image-preview-img" />
                <div className="image-preview-actions">
                  <button
                    type="button"
                    className="image-remove-btn"
                    onClick={handleRemoveNewImage}
                    disabled={isSubmitting}
                    aria-label="Cancel new image selection"
                  >
                    ✕ Cancel Replacement
                  </button>
                </div>
              </div>
            ) : currentCoverUrl ? (
              <div style={{ marginBottom: '1rem' }}>
                <div className="image-preview-wrapper" style={{ maxHeight: '200px' }}>
                  <img src={currentCoverUrl} alt="Current story cover" className="image-preview-img" />
                </div>
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="form-helper">Current cover image</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    Change Image
                  </Button>
                </div>
              </div>
            ) : (
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
                  <span>Click to add a cover image</span>
                  <span className="file-upload-hint">PNG, JPG, WebP, GIF (Max 5MB)</span>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              id="edit-image"
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
            id="edit-content"
            name="content"
            as="textarea"
            rows={12}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content) setErrors((prev) => ({ ...prev, content: '' }));
              if (apiError) setApiError('');
            }}
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
              Save Changes
            </Button>
            <Link to={`/stories/${id}`} className="btn btn-outline btn-md">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStory;
