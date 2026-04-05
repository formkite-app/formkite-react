import { Formkite } from "../../src";
import { type Field } from "../../src/client";

function MyCustomInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <input
      id={field.id}
      type={field.type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ backgroundColor: "#f0f0f0", padding: "16px" }}
    />
  );
}

export function App() {
  return (
    <div>
      <Formkite
        baseUrl="http://localhost:3100"
        formId="form_DP27wBZm4YbJdtNYK3zxONM8"
        publishableKey="8dcc7b3cb669148e2b97b2cc8d869ae136c273285fa5ad93b7ba748164c5"
        onSuccess={(result) => console.log("Submitted", result)}
        onError={(err) => console.error("Error:", err)}
        components={{
          input: MyCustomInput,
        }}
      />
    </div>
  );
}
