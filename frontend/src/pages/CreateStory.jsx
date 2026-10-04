import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import { createPost } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useReveal } from '../hooks/useReveal';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const WORDS_PER_MINUTE = 200;

function readingTime(content) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function wordCount(content) {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

function CreateStory() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mode, setMode] = useState('write');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const rootRef = useReveal([]);

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
      setMode('write');
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

  const minutes = readingTime(content);
  const words = wordCount(content);
  const previewParagraphs = content
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean);

  return (
    <div className="write-desk" ref={rootRef}>
      {/* Editorial masthead */}
      <header className="write-masthead">
        <div className="write-index-row hero-seq hero-seq-1">
          <span>INKA Journal • Write Desk</span>
          <span>Vol. 01</span>
        </div>
        <div className="write-workflow hero-seq hero-seq-1" aria-label="Publication stages">
          {['Write', 'Shape', 'Preview', 'Publish'].map((stage, i) => {
            const activeIndex = mode === 'write' ? (content.trim() ? 1 : 0) : 2;
            return (
              <span key={stage} className="write-workflow-step">
                <span className={i <= activeIndex ? 'on' : ''}>{stage}</span>
                {i < 3 && <span className="write-workflow-sep" aria-hidden="true">·</span>}
              </span>
            );
          })}
        </div>
        <h1 className="write-title">
          <span className="line line-1" aria-hidden="true"><span>Write something</span></span>
          <span className="line line-2" aria-hidden="true"><span>worth reading.</span></span>
          <span className="sr-only">Write something worth reading.</span>
        </h1>
        <p className="write-sub hero-seq hero-seq-desc">
          Shape a thought, a story, or a moment into something worth keeping.
        </p>
        <div className="write-modes hero-seq hero-seq-actions" role="group" aria-label="Write or preview">
          <button
            type="button"
            className={`write-mode-btn${mode === 'write' ? ' active' : ''}`}
            aria-pressed={mode === 'write'}
            onClick={() => setMode('write')}
            disabled={isSubmitting}
          >
            Write
          </button>
          <button
            type="button"
            className={`write-mode-btn${mode === 'preview' ? ' active' : ''}`}
            aria-pressed={mode === 'preview'}
            onClick={() => setMode('preview')}
            disabled={isSubmitting}
          >
            Preview
          </button>
        </div>
      </header>

      {apiError && (
        <div className="alert-error" role="alert" aria-live="assertive">
          <span>⚠️</span>
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="write-spread">
          {/* Main writing surface */}
          <div className="write-main" data-reveal="up">
            {mode === 'write' ? (
              <>
                <div className="desk-field">
                  <label className="desk-field-label" htmlFor="story-title">
                    <span className="desk-field-num" aria-hidden="true">01</span> Story title
                  </label>
                  <input
                    id="story-title"
                    name="title"
                    type="text"
                    className={`desk-title-input${errors.title ? ' has-error' : ''}`}
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                      if (apiError) setApiError('');
                    }}
                    placeholder="Give this story a name…"
                    required
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby={errors.title ? 'story-title-error' : undefined}
                  />
                  {errors.title && (
                    <p id="story-title-error" className="form-error" role="alert">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="desk-field">
                  <span className="desk-field-label" id="cover-label">
                    <span className="desk-field-num" aria-hidden="true">02</span> Cover image
                    <span className="desk-field-sub" aria-hidden="true">Editorial feature</span>
                  </span>
                  {!imagePreview ? (
                    <div
                      className="desk-cover-empty"
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      aria-labelledby="cover-label"
                      aria-describedby="cover-hint"
                    >
                      <span className="desk-cover-mark" aria-hidden="true">＋</span>
                      <span className="desk-cover-text">Choose an image that introduces the story.</span>
                      <span className="desk-cover-hint" id="cover-hint">PNG, JPG, WebP, GIF — max 5MB, optional</span>
                    </div>
                  ) : (
                    <figure className="desk-cover-frame">
                      <img src={imagePreview} alt="Cover preview" className="desk-cover-img" />
                      <figcaption className="desk-cover-actions">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSubmitting}
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm btn-danger-outline"
                          onClick={handleRemoveImage}
                          disabled={isSubmitting}
                          aria-label="Remove selected image"
                        >
                          Remove
                        </button>
                      </figcaption>
                    </figure>
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

                <div className="desk-field">
                  <label className="desk-field-label" htmlFor="story-content">
                    <span className="desk-field-num" aria-hidden="true">03</span> Manuscript
                  </label>
                  <textarea
                    id="story-content"
                    name="content"
                    className={`desk-manuscript${errors.content ? ' has-error' : ''}`}
                    rows={14}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      if (errors.content) setErrors((prev) => ({ ...prev, content: '' }));
                      if (apiError) setApiError('');
                    }}
                    placeholder="Begin writing… separate paragraphs with a blank line."
                    required
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.content)}
                    aria-describedby={errors.content ? 'story-content-error' : undefined}
                  />
                  {errors.content && (
                    <p id="story-content-error" className="form-error" role="alert">
                      {errors.content}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="write-preview" aria-label="Story preview">
                <div className="story-details-kicker">
                  <span className="story-details-issue-badge">INKA Publication</span>
                  <span className="story-details-kicker-dot">•</span>
                  <span className="story-details-genre">Personal Essay</span>
                </div>
                <h2 className={`story-details-title${title.trim() ? '' : ' preview-untitled'}`}>{title.trim() || 'Untitled story'}</h2>
                <div className="story-details-byline">
                  <span>Written by <strong className="story-author-badge">{user?.name || 'Storyteller'}</strong></span>
                  <span aria-hidden="true" className="byline-dot">•</span>
                  <span>{minutes} min read</span>
                </div>
                <p className="preview-draft-note">Preview — not yet published</p>
                {imagePreview ? (
                  <figure className="story-details-cover-wrapper">
                    <img src={imagePreview} alt="Cover preview" className="story-details-cover" />
                  </figure>
                ) : (
                  <div className="preview-cover-empty" aria-hidden="true">
                    <span>Cover image will appear here</span>
                  </div>
                )}
                <div className="story-details-body">
                  {previewParagraphs.length > 0 ? (
                    previewParagraphs.map((para, index) => {
                      if (index === 1 && previewParagraphs.length >= 3 && para.length < 220) {
                        return (
                          <blockquote key={index} className="editorial-pullquote">
                            <p>{para}</p>
                          </blockquote>
                        );
                      }
                      return <p key={index}>{para}</p>;
                    })
                  ) : (
                    <p className="preview-empty">Your words will appear here as you write…</p>
                  )}
                </div>
                <div className="story-editorial-endmark" aria-hidden="true">
                  <span>◆</span>
                  <span>◆</span>
                  <span>◆</span>
                </div>
              </div>
            )}
          </div>

          {/* Editorial sidebar */}
          <aside className="write-side" data-reveal="subtle" aria-label="Story information">
            <section className="side-block">
              <h2 className="side-label">Story</h2>
              <dl className="side-rows">
                <div className="side-row">
                  <dt>Title</dt>
                  <dd>{title.trim() || 'Untitled'}</dd>
                </div>
                <div className="side-row">
                  <dt>Words</dt>
                  <dd>{words}</dd>
                </div>
                <div className="side-row">
                  <dt>Reading</dt>
                  <dd>{minutes} min</dd>
                </div>
                <div className="side-row">
                  <dt>Cover</dt>
                  <dd>{imagePreview ? 'Attached' : 'Missing'}</dd>
                </div>
              </dl>
            </section>

            <section className="side-block">
              <h2 className="side-label">Publication</h2>
              <p className="side-pub">INKA Journal</p>
              <p className="side-note">Personal stories &amp; essays · Issue 01</p>
            </section>

            <section className="side-block side-actions">
              <p className={`side-ready${title.trim() && content.trim() ? ' is-ready' : ''}`} aria-live="polite">
                {title.trim() && content.trim() ? 'Ready for publication' : 'Draft in progress'}
              </p>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Publish Story
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setMode(mode === 'write' ? 'preview' : 'write')}
                disabled={isSubmitting}
              >
                {mode === 'write' ? 'Preview Story' : 'Back to Writing'}
              </Button>
              <Link to="/journal" className="desk-back-link">
                ← Back to Journal
              </Link>
            </section>
          </aside>
        </div>
      </form>
    </div>
  );
}

export default CreateStory;
