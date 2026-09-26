import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/journal';

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      navigate(from, { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      const message =
        err.response?.data?.message ||
        'Unable to complete registration. Please check your details and try again.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page" style={{ maxWidth: '480px', margin: '2rem auto' }}>
      <header className="page-header motion-fade-up" style={{ textAlign: 'center' }}>
        <span className="page-category-tag">Join</span>
        <h1 className="page-title">Join INKA</h1>
        <p className="page-subtitle">
          Become a storyteller and share your personal narratives.
        </p>
      </header>

      <div className="form-card motion-scale-in motion-stagger-1">
        {apiError && (
          <div className="alert-error" role="alert" aria-live="assertive">
            <span>⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Your Name"
            id="register-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Jane Doe"
            error={errors.name}
            required
            disabled={isSubmitting}
          />

          <Input
            label="Email Address"
            id="register-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={errors.email}
            required
            disabled={isSubmitting}
          />

          <Input
            label="Password"
            id="register-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            error={errors.password}
            helperText="Must be at least 6 characters long."
            required
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            variant="primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Create Account
          </Button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-muted-text)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-bright-pink)', fontWeight: 700 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
