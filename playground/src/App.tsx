import { Formkite } from "../../src";

export function App() {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 0" }}>
      <Formkite
        baseUrl="http://localhost:3100"
        formId="form_DP27wBZm4YbJdtNYK3zxONM8"
        publishableKey="986c3bf1340fcd5f6bf36b1c00574849d51fa447aec063a568056fe0ac00"
        theme="wolf"
        onStarted={() => console.log("Form started")}
        onPageChange={(page) => console.log("Page changed to:", page)}
        onSuccess={(result) => console.log("Submitted successfully:", result)}
        onCompleted={(values) =>
          console.log("Form completed with values:", values)
        }
        onError={(err) => console.error("Error:", err)}
      />
    </div>
  );
}
