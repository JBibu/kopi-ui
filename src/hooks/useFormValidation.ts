import { useState, useCallback } from 'react';

/**
 * Unified form validation hook to replace the complex componentRef pattern
 * @param {Object} initialState - Initial form state
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Form state and handlers
 */
export const useFormValidation = (initialState = {}, requiredFields = []) => {
  const [state, setState] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((name, value) => {
    setState(prev => ({ ...prev, [name]: value }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleChangeEvent = useCallback((event, valueGetter = (x) => x.value) => {
    const fieldName = event.target.name;
    const fieldValue = valueGetter(event.target);
    handleChange(fieldName, fieldValue);
  }, [handleChange]);

  const setFieldTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    requiredFields.forEach(field => {
      if (!state[field] || state[field] === '') {
        newErrors[field] = 'This field is required';
        isValid = false;
      }
    });

    setErrors(newErrors);

    // Mark all fields as touched when validating
    const allTouched = {};
    Object.keys(state).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    return isValid;
  }, [state, requiredFields]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const resetForm = useCallback(() => {
    setState(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    state,
    setState: updateState,
    errors,
    touched,
    handleChange,
    handleChangeEvent,
    setFieldTouched,
    validate,
    clearErrors,
    resetForm,
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).length > 0
  };
};

/**
 * Legacy compatibility function for existing forms
 * Creates a component-like object that works with existing form utilities
 * @param {Object} formState - State from useFormValidation hook
 * @returns {Object} Component-like object for legacy compatibility
 */
export const createLegacyFormRef = (formState) => {
  return {
    state: formState.state,
    setState: formState.setState,
    handleChange: formState.handleChangeEvent
  };
};