import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const rawMethod = searchParams.get("method") || "esewa";
    const method = rawMethod.split("?")[0].split("&")[0].toLowerCase();
    const dataFromQuery = searchParams.get("data");
    const dataFromMethod = rawMethod.includes("?data=")
      ? rawMethod.split("?data=")[1]
      : "";
    const data = dataFromQuery || dataFromMethod;
    const pidx = searchParams.get("pidx");
    const purchaseOrderId = searchParams.get("purchase_order_id");

    if (method === "khalti" && !pidx && !purchaseOrderId) {
      setStatus("error");
      setMessage("Invalid payment response. Khalti transaction data missing.");
      return;
    }

    if (method !== "khalti" && !data) {
      setStatus("error");
      setMessage("Invalid payment response. Data missing.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token =
          user.token ||
          user.accessToken ||
          user.jwtToken ||
          localStorage.getItem("token") ||
          "";
        const res = await fetch("http://localhost:8080/api/payments/verify", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(
            method === "khalti"
              ? {
                  method: "KHALTI",
                  pidx,
                  purchase_order_id: purchaseOrderId,
                }
              : { method: "ESEWA", data },
          ),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        setStatus("success");
        setMessage(
          `Payment successful via ${method === "khalti" ? "Khalti" : "eSewa"}! Your profile is now under review by the administrator.`,
        );

        // Optionally fetch updated user details here or just wait for them to log out/in.
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage(err.message || "Verification failed.");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "3rem",
          borderRadius: "1rem",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        {status === "processing" && (
          <>
            <Loader2
              size={64}
              color="#3b82f6"
              style={{ margin: "0 auto", animation: "spin 1s linear infinite" }}
            />
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginTop: "1.5rem",
              }}
            >
              Verifying Payment...
            </h2>
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
              Please do not close this window.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle
              size={64}
              color="#10b981"
              style={{ margin: "0 auto" }}
            />
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginTop: "1.5rem",
                color: "#111827",
              }}
            >
              Payment Verified!
            </h2>
            <p
              style={{ color: "#4b5563", marginTop: "1rem", lineHeight: "1.5" }}
            >
              {message}
            </p>
            <button
              onClick={() => {
                navigate("/");
              }}
              style={{
                marginTop: "2rem",
                backgroundColor: "#21ab87",
                color: "white",
                padding: "0.75rem 2rem",
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              Continue
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <AlertTriangle
              size={64}
              color="#ef4444"
              style={{ margin: "0 auto" }}
            />
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginTop: "1.5rem",
                color: "#111827",
              }}
            >
              Verification Failed
            </h2>
            <p style={{ color: "#4b5563", marginTop: "1rem" }}>{message}</p>
            <button
              onClick={() => navigate("/tutor/verify")}
              style={{
                marginTop: "2rem",
                backgroundColor: "#ef4444",
                color: "white",
                padding: "0.75rem 2rem",
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
