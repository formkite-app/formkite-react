import { useState } from "react";
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

interface FormkiteProps {
  formId: string;
  publishableKey: string;
  baseUrl?: string;
  components?: FieldComponents;
  onSuccess?: (result: unknown) => void;
  onError?: (error: Error) => void;
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

  const base =
    "formkite-input w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          id={field.id}
          placeholder={field.placeholder}
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`formkite-textarea w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]`}
        />
      );
    case "dropdown":
      return (
        <select
          id={field.id}
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`formkite-select ${base}`}
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
          className="formkite-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
          className={base}
        />
      );
    }
  }
}

function StepView({
  step,
  values,
  onChange,
  components,
}: {
  step: Step;
  values: Record<string, string>;
  onChange: (id: string, val: string) => void;
  components?: FieldComponents | undefined;
}) {
  return (
    <div className="formkite-step space-y-4">
      {step.title && (
        <h2 className="formkite-step-title text-lg font-semibold text-gray-800">
          {step.title}
        </h2>
      )}
      {step.fields.map((field) => (
        <div key={field.id} className="formkite-field flex flex-col gap-1">
          <label
            htmlFor={field.id}
            className="formkite-label text-sm font-medium text-gray-700"
          >
            {field.label}
            {field.required && (
              <span className="formkite-required ml-1 text-red-500">*</span>
            )}
          </label>
          <FieldInput
            field={field}
            value={values[field.id] ?? ""}
            onChange={(val) => onChange(field.id, val)}
            components={components}
          />
        </div>
      ))}
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
}: FormkiteProps) {
  const { form, steps, loading, error, submitting, submit } = useFormKite({
    formId,
    publishableKey,
    ...(baseUrl !== undefined && { baseUrl }),
    version: "v1",
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const isLastStep = stepIndex === steps.length - 1;

  const handleChange = (id: string, val: string) => {
    setValues((prev) => ({ ...prev, [id]: val }));
  };

  const handleNext = () => {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLastStep) {
      handleNext();
      return;
    }
    try {
      const result = await submit(values);
      setSubmitted(true);
      onSuccess?.(result);
    } catch (err) {
      onError?.(err as Error);
    }
  };

  if (loading) {
    return (
      <div className="formkite-loading text-sm text-gray-500">
        Loading form...
      </div>
    );
  }

  if (error) {
    return (
      <div className="formkite-error text-sm text-red-600">
        Failed to load form: {error.message}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="formkite-success text-sm text-green-600">
        {form?.end_message ?? "Your response has been submitted. Thank you!"}
      </div>
    );
  }

  const currentStep = steps[stepIndex];

  return (
    <form onSubmit={handleSubmit} className="formkite space-y-6">
      {form?.name && (
        <h1 className="formkite-title text-xl font-bold text-gray-900">
          {form.name}
        </h1>
      )}

      {steps.length > 1 && (
        <div className="formkite-progress text-xs text-gray-400">
          Step {stepIndex + 1} of {steps.length}
        </div>
      )}

      {currentStep && (
        <StepView
          step={currentStep}
          values={values}
          onChange={handleChange}
          components={components}
        />
      )}

      <div className="formkite-actions flex justify-between gap-2">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="formkite-btn-back rounded px-4 py-2 text-sm text-gray-600 border border-gray-300 hover:bg-gray-50"
          >
            Back
          </button>
        )}
        {!isLastStep ? (
          <button
            type="button"
            onClick={handleNext}
            className="formkite-btn-next ml-auto rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="formkite-btn-submit ml-auto rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </form>
  );
}
