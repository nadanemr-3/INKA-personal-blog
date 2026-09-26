function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  as = 'input',
  rows = 4,
  className = '',
  ...props
}) {
  const inputId = id || name;
  const isTextarea = as === 'textarea';
  const hasError = Boolean(error);
  const inputClass = isTextarea ? 'form-textarea' : 'form-input';

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span style={{ color: 'var(--color-bright-pink)' }}>*</span>}
        </label>
      )}

      {isTextarea ? (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className={`${inputClass} ${hasError ? 'has-error' : ''}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`${inputClass} ${hasError ? 'has-error' : ''}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
      )}

      {hasError && (
        <p id={`${inputId}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}

      {!hasError && helperText && (
        <p id={`${inputId}-helper`} className="form-helper">
          {helperText}
        </p>
      )}
    </div>
  );
}

export default Input;
