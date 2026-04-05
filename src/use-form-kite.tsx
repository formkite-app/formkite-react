// src/useForm.ts
import { useState, useEffect } from "react";
import { FormkiteClient, type Form } from "./client";

interface UseFormOptions {
  formId: string;
  publishableKey: string;
  baseUrl?: string;
  version: "v1";
}

export function useFormKite({
  formId,
  publishableKey,
  baseUrl = "https://api.formkite.com",
  version,
}: UseFormOptions) {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const client = new FormkiteClient({
    apiKey: publishableKey,
    baseUrl,
    version,
  });

  useEffect(() => {
    client
      .getSchema(formId)
      .then(setForm)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [formId]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const result = await client.submit(formId, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    steps: form?.schema?.steps || [],
    loading,
    error,
    submitting,
    submit: handleSubmit,
  };
}
