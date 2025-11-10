"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "20px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center"
        }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Something went wrong!
          </h1>
          <p style={{ color: "#666", marginBottom: "2rem" }}>
            {error.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
