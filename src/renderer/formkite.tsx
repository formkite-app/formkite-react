import { useState, useEffect } from "react";
import { useFormKite } from "../use-form-kite";
import type { Field, Step } from "../client";

export interface FieldComponentProps {
  field: Field;
  value: string;
  onChange: (val: string) => void;
}

export type FieldComponents = Partial<
  Record<string, React.ComponentType<FieldComponentProps>>
>;

export interface FormkiteProps {
  formId: string;
  publishableKey: string;
  baseUrl?: string;
  components?: FieldComponents;
  onSuccess?: (result: unknown) => void;
  onError?: (error: Error) => void;
  onPageChange?: (page: number) => void;
  onStepChange?: (step: Step) => void;
  onStarted?: () => void;
  onCompleted?: (values: Record<string, string>) => void;
  theme?: "fox" | "mantis" | "orca" | "oscar" | "raven" | "wolf" | string;
  className?: string;
  style?: React.CSSProperties;
}

function validateStep(
  step: Step,
  values: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of step.fields) {
    if (!field.required) continue;
    const val = values[field.id] ?? "";
    if (field.type === "checkbox" ? val !== "true" : val.trim() === "") {
      errors[field.id] = `${field.label} is required`;
    }
  }
  return errors;
}

function FieldInput({
  field,
  value,
  onChange,
  components,
}: {
  field: Field;
  value: string;
  onChange: (val: string) => void;
  components?: FieldComponents | undefined;
}) {
  const Custom = components?.[field.type];
  if (Custom) return <Custom field={field} value={value} onChange={onChange} />;

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          id={field.id}
          placeholder={field.placeholder}
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="formkite-textarea"
        />
      );
    case "dropdown":
      return (
        <select
          id={field.id}
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="formkite-select"
        >
          <option value="">{field.placeholder || "Select..."}</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case "checkbox":
      return (
        <input
          id={field.id}
          type="checkbox"
          required={field.required}
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          className="formkite-checkbox"
        />
      );
    default: {
      const DefaultInput = components?.["input"];
      if (DefaultInput)
        return <DefaultInput field={field} value={value} onChange={onChange} />;
      return (
        <input
          id={field.id}
          type={field.type === "email" ? "email" : "text"}
          placeholder={field.placeholder}
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="formkite-input"
        />
      );
    }
  }
}

function StepView({
  step,
  values,
  errors,
  onChange,
  components,
}: {
  step: Step;
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (id: string, val: string) => void;
  components?: FieldComponents | undefined;
}) {
  return (
    <div className="formkite-step">
      {step.title && <h2 className="formkite-step-title">{step.title}</h2>}
      <div className="formkite-fields">
        {step.fields.map((field) => {
          const hasError = !!errors[field.id];
          return (
            <div
              key={field.id}
              className={`formkite-field ${hasError ? "formkite-field--error" : ""}`}
            >
              <label htmlFor={field.id} className="formkite-label">
                {field.label}
                {field.required && <span className="formkite-required">*</span>}
              </label>
              <FieldInput
                field={field}
                value={values[field.id] ?? ""}
                onChange={(val) => onChange(field.id, val)}
                components={components}
              />
              {hasError && (
                <span className="formkite-field-error">{errors[field.id]}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Formkite({
  formId,
  publishableKey,
  baseUrl,
  components,
  onSuccess,
  onError,
  onPageChange,
  onStepChange,
  onStarted,
  onCompleted,
  theme,
  className,
  style,
}: FormkiteProps) {
  const { form, steps, loading, error, submitting, submit } = useFormKite({
    formId,
    publishableKey,
    ...(baseUrl !== undefined && { baseUrl }),
    version: "v1",
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!loading && form && onStarted) {
      onStarted();
    }
  }, [loading, form, onStarted]);

  const isLastStep = stepIndex === steps.length - 1;
  const currentStep = steps[stepIndex];

  const handleChange = (id: string, val: string) => {
    setValues((prev) => ({ ...prev, [id]: val }));
    if (fieldErrors[id]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const tryAdvance = (): boolean => {
    if (!currentStep) return true;
    const errors = validateStep(currentStep, values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleNext = () => {
    if (!tryAdvance()) return;
    const nextIndex = Math.min(stepIndex + 1, steps.length - 1);
    if (nextIndex !== stepIndex) {
      setStepIndex(nextIndex);
      onPageChange?.(nextIndex);
      onStepChange?.(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    setFieldErrors({});
    const nextIndex = Math.max(stepIndex - 1, 0);
    if (nextIndex !== stepIndex) {
      setStepIndex(nextIndex);
      onPageChange?.(nextIndex);
      onStepChange?.(steps[nextIndex]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLastStep) handleNext();
  };

  const handleFinalSubmit = async () => {
    if (!tryAdvance()) return;
    try {
      const result = await submit(values);
      setSubmitted(true);
      onSuccess?.(result);
      onCompleted?.(values);
    } catch (err) {
      onError?.(err as Error);
    }
  };

  const containerClass = [
    "formkite",
    theme && `fk-theme-${theme}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (loading) {
    return (
      <div className={containerClass} style={style}>
        <div className="formkite-loading">
          <div className="formkite-spinner" />
          <span>Loading form...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClass} style={style}>
        <div className="formkite-error-container">
          <svg
            className="formkite-error-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="formkite-error-message">
            Failed to load form: {error.message}
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={containerClass} style={style}>
        <div className="formkite-success-container">
          <div className="formkite-success-icon-bg">
            <svg
              className="formkite-success-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="formkite-success-title">Thank you!</h2>
          <p className="formkite-success-message">
            {form?.end_message ?? "Your response has been submitted."}
          </p>
        </div>
      </div>
    );
  }

  const progress =
    steps.length > 0 ? ((stepIndex + 1) / steps.length) * 100 : 0;

  return (
    <form onSubmit={handleFormSubmit} className={containerClass} style={style}>
      <header className="formkite-header">
        {form?.name && <h1 className="formkite-title">{form.name}</h1>}
        {steps.length > 1 && (
          <div className="formkite-progress">
            <div className="formkite-progress-info">
              <span className="formkite-progress-step">
                Step {stepIndex + 1} of {steps.length}
              </span>
              <span className="formkite-progress-percent">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="formkite-progress-bar">
              <div
                className="formkite-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <div className="formkite-body">
        {currentStep && (
          <StepView
            step={currentStep}
            values={values}
            errors={fieldErrors}
            onChange={handleChange}
            components={components}
          />
        )}
      </div>

      <footer className="formkite-actions">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="formkite-btn-back"
          >
            Back
          </button>
        )}
        {!isLastStep ? (
          <button
            type="button"
            onClick={handleNext}
            className="formkite-btn-next"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={submitting}
            className="formkite-btn-submit"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </footer>
    </form>
  );
}
