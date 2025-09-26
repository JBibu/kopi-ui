import { useState, useCallback } from 'react';

export interface FormValidationState {
  state: Record<string, unknown>;
  setState: (updates: Record<string, unknown>) => void;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
  handleChange: (name: string, value: unknown) => void;
  handleChangeEvent: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, valueGetter?: (target: EventTarget & (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)) => unknown) => void;
  setFieldTouched: (name: string) => void;
  validate: () => boolean;
  clearErrors: () => void;
  resetForm: () => void;
  isValid: boolean;
  hasErrors: boolean;
}

export interface LegacyFormRef {
  state: Record<string, unknown>;
  setState: (updates: Record<string, unknown>) => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, valueGetter?: (target: EventTarget & (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)) => unknown) => void;
}

/**
 * Unified form validation hook to replace the complex componentRef pattern
 */
export const useFormValidation = (
  initialState: Record<string, unknown> = {},
  requiredFields: string[] = []
): FormValidationState => {
  const [state, setState] = useState<Record<string, unknown>>(initialState);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((name: string, value: unknown) => {
    setState(prev => ({ ...prev, [name]: value }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleChangeEvent = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    valueGetter: (target: EventTarget & (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)) => unknown = (x) => x.value
  ) => {
    const fieldName = event.target.name;
    const fieldValue = valueGetter(event.target);
    handleChange(fieldName, fieldValue);
  }, [handleChange]);

  const setFieldTouched = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    requiredFields.forEach(field => {
      if (!state[field] || state[field] === '') {
        newErrors[field] = 'This field is required';
        isValid = false;
      }
    });

    setErrors(newErrors);

    // Mark all fields as touched when validating
    const allTouched: Record<string, boolean> = {};
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

  const updateState = useCallback((updates: Record<string, unknown>) => {
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
 */
export const createLegacyFormRef = (formState: FormValidationState): LegacyFormRef => {
  return {
    state: formState.state,
    setState: formState.setState,
    handleChange: formState.handleChangeEvent
  };
};