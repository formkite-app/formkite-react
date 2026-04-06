import { Formkite } from "../../src";
import { type Field } from "../../src/client";

export function App() {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <Formkite
        baseUrl="http://localhost:3100"
        formId="form_DP27wBZm4YbJdtNYK3zxONM8"
        publishableKey="8dcc7b3cb669148e2b97b2cc8d869ae136c273285fa5ad93b7ba748164c5"
        onSuccess={(result) => console.log("Submitted", result)}
        onError={(err) => console.error("Error:", err)}
      />
    </div>
  );
}
