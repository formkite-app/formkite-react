// src/useForm.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { FormkiteClient, type Form, type Step, type Field } from "./client";

interface UseFormOptions {
  formId: string;
  publishableKey: string;
  baseUrl?: string;
  version: "v1";
}

function createClient(publishableKey: string, baseUrl: string, version: string) {
  return new FormkiteClient({
    apiKey: publishableKey,
    baseUrl,
    version,
  });
}

export function useFormKite({
  formId,
  publishableKey,
  baseUrl = "https://formkite.com",
  version,
}: UseFormOptions) {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const client = useMemo(
    () => createClient(publishableKey, baseUrl, version),
    [publishableKey, baseUrl, version]
  );

  useEffect(() => {
    client
      .getSchema(formId)
      .then(setForm)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [client, formId]);

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

export function useFormKiteSchema({
  formId,
  publishableKey,
  baseUrl = "https://formkite.com",
  version,
}: UseFormOptions) {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const client = useMemo(
    () => createClient(publishableKey, baseUrl, version),
    [publishableKey, baseUrl, version]
  );

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await client.getSchema(formId);
      setForm(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [client, formId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    form,
    steps: form?.schema?.steps || [],
    loading,
    error,
    refetch,
  };
}

export function useFormKiteSubmit({
  formId,
  publishableKey,
  baseUrl = "https://formkite.com",
  version,
}: UseFormOptions) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const client = useMemo(
    () => createClient(publishableKey, baseUrl, version),
    [publishableKey, baseUrl, version]
  );

  const submit = useCallback(
    async (data: Record<string, unknown>) => {
      setSubmitting(true);
      setError(null);
      try {
        const result = await client.submit(formId, data);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [client, formId]
  );

  return { submit, submitting, error };
}

export interface UseFormKiteBuilderOptions extends UseFormOptions {
  initialData?: Record<string, unknown>;
}

export function useFormKiteBuilder({
  formId,
  publishableKey,
  baseUrl = "https://formkite.com",
  version,
  initialData = {},
}: UseFormKiteBuilderOptions) {
  const [data, setData] = useState<Record<string, unknown>>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const client = useMemo(
    () => createClient(publishableKey, baseUrl, version),
    [publishableKey, baseUrl, version]
  );

  useEffect(() => {
    client
      .getSchema(formId)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [client, formId]);

  const updateField = useCallback((fieldId: string, value: unknown) => {
    setData((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const setField = useCallback((fieldId: string, value: unknown) => {
    setData((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
  }, [initialData]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      const result = await client.submit(formId, data);
      setData(initialData);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [client, formId, data, initialData]);

  return {
    data,
    setData,
    updateField,
    setField,
    reset,
    loading,
    error,
    submitting,
    submit,
  };
}

export function useFormKiteResponse(
  formId: string,
  publishableKey: string,
  baseUrl: string = "https://api.formkite.com",
  version: string = "v1"
) {
  const [response, setResponse] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const client = useMemo(
    () => createClient(publishableKey, baseUrl, version),
    [publishableKey, baseUrl, version]
  );

  const setResponseData = useCallback(
    (data: Record<string, unknown>) => {
      setResponse(data);
    },
    []
  );

  const clearResponse = useCallback(() => {
    setResponse(null);
  }, []);

  return {
    response,
    setResponseData,
    clearResponse,
    loading,
    error,
  };
}
