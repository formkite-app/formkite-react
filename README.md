# FormKite

React form library for building forms powered by FormKite.

## Installation

```bash
npm install formkite
```

## Usage

```tsx
import { Formkite } from "formkite";

export default function MyForm() {
  return (
    <Formkite
      formId="your-form-id"
      publishableKey="pk_xxx"
    />
  );
}
```

## Hooks API

### useFormKite

Main hook that fetches form schema and handles submission.

```tsx
const { form, steps, loading, error, submitting, submit } = useFormKite({
  formId: "your-form-id",
  publishableKey: "pk_xxx",
});
```

### useFormKiteSchema

Fetches only the form schema. Useful when you need manual control over loading state.

```tsx
const { form, steps, loading, error, refetch } = useFormKiteSchema({
  formId: "your-form-id",
  publishableKey: "pk_xxx",
});
```

### useFormKiteSubmit

Handles submission only. Use with `useFormKiteSchema` or your own schema.

```tsx
const { submit, submitting, error } = useFormKiteSubmit({
  formId: "your-form-id",
  publishableKey: "pk_xxx",
});
```

### useFormKiteBuilder

Full form builder with local state management. Perfect for custom form UIs.

```tsx
const { data, setData, updateField, setField, reset, loading, submitting, submit } = useFormKiteBuilder({
  formId: "your-form-id",
  publishableKey: "pk_xxx",
  initialData: {},
});
```

### useFormKiteResponse

Manages response data after submission. Useful for displaying results or handling redirects.

```tsx
const { response, setResponseData, clearResponse, loading, error } = useFormKiteResponse(
  "your-form-id",
  "pk_xxx"
);

// After successful submission
setResponseData(result);
```

## Options

All hooks accept these options:

| Prop | Type | Default |
|------|------|---------|
| `formId` | `string` | Required |
| `publishableKey` | `string` | Required |
| `baseUrl` | `string` | `https://formkite.com` |
| `version` | `string` | `"v1"` |

## Development

- Install dependencies: `npm install`
- Run the playground: `npm run play`
- Run unit tests: `npm run test`
- Build the library: `npm run build`

## Themes

| Theme | Description |
|-------|-------------|
| `fox.css` | Warm ambers and terracotta, earthy and inviting |
| `raven.css` | Dark mode, deep charcoal with violet accents |
| `wolf.css` | Cool slate grays, uppercase labels, minimal and sharp |
| `mantis.css` | Lush greens, soft sage backgrounds, organic feel |
| `orca.css` | High-contrast black/white with teal accents, bold borders, no radius |