interface FormkiteConfig {
  apiKey: string;
  baseUrl: string;
  version: string;
}

export interface Form {
  prefix_id: string;
  name: string;
  slug: null;
  status: string;
  schema: Schema;
  published_at: null;
  redirect_url: null;
  end_message: null;
  created_at: string;
  updated_at: string;
}

export interface Schema {
  steps: Step[];
}

export interface Step {
  id: string;
  title: string;
  fields: Field[];
}

export interface Field {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
}

export class FormkiteClient {
  private apiKey: string;
  private baseUrl: string;
  private version: string;

  constructor(config: FormkiteConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.formkite.com";
    this.version = config.version || "v1";
  }

  async getSchema(formId: string): Promise<Form> {
    const res = await fetch(
      `${this.baseUrl}/api/${this.version}/forms/${formId}`,
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      },
    );
    if (!res.ok) throw new Error(`Failed to fetch form: ${res.status}`);
    return res.json();
  }

  async submit(formId: string, data: Record<string, unknown>) {
    const res = await fetch(
      `${this.baseUrl}/api/${this.version}/forms/${formId}/submissions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submission: {
            data,
          },
        }),
      },
    );
    if (!res.ok) throw new Error(`Submission failed: ${res.status}`);
    return res.json();
  }
}
