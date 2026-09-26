import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/journal';

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const message =
        err.response?.data?.message ||
        'Unable to log in. Please verify your credentials and try again.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page" style={{ maxWidth: '480px', margin: '2rem auto' }}>
      <header className="page-header motion-fade-up" style={{ textAlign: 'center' }}>
        <span className="page-category-tag">Access</span>
        <h1 className="page-title">Welcome Back</h1>
        <p className="page-subtitle">
          Log in to write, edit, and manage your personal stories.
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
            label="Email Address"
            id="login-email"
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
            id="login-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.password}
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
            Log In
          </Button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-muted-text)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--color-bright-pink)', fontWeight: 700 }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
