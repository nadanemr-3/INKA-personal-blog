function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const customClass = className ? ` ${className}` : '';

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass}${customClass}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 0 }} aria-hidden="true" />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
