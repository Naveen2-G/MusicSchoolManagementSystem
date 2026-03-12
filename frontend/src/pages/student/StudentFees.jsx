import React, { useEffect, useState } from "react";
import { api } from "../../utils/api.js";

const StudentFees = () => {
  const [fees, setFees] = useState([]);
  const [payAmountByFee, setPayAmountByFee] = useState({});
  const [activePaymentFeeId, setActivePaymentFeeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  const loadFees = async () => {
    const res = await api.get("/student/fees");
    setFees(res.data);
  };

  useEffect(() => {
    loadFees();
  }, []);

  useEffect(() => {
    const processCheckoutReturn = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");
        const feeId = params.get("fee_id");
        const canceled = params.get("canceled");

        if (canceled === "1") {
          setMessage("Payment canceled. You can try again.");
          window.history.replaceState({}, "", "/student/fees");
          return;
        }

        if (!sessionId || !feeId) return;

        const verifyRes = await api.post(`/student/fees/${feeId}/verify-checkout-session`, {
          sessionId
        });

        // Fetch latest fees to reliably populate receipt details after redirect.
        const feesRes = await api.get("/student/fees");
        const latestFees = feesRes.data || [];
        setFees(latestFees);
        const paidFee = latestFees.find((f) => String(f.id) === String(feeId));

        setMessage(`Payment successful. Payment ID: ${verifyRes.data.paymentId}`);
        setReceipt({
          paymentId: verifyRes.data.paymentId,
          orderId: verifyRes.data.orderId,
          amount: verifyRes.data.amount,
          instrument: paidFee?.instrument || "N/A",
          year: paidFee?.year || "N/A",
          paidAt: new Date().toISOString()
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to verify payment session.");
      } finally {
        window.history.replaceState({}, "", "/student/fees");
      }
    };

    processCheckoutReturn();
  }, []);

  const loadStripeScript = () =>
    new Promise((resolve) => {
      if (window.Stripe) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayNow = async (fee) => {
    try {
      setError("");
      setMessage("");
      setActivePaymentFeeId(fee.id);
      setLoading(true);

      const scriptLoaded = await loadStripeScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Stripe checkout. Please try again.");
      }

      const rawInput = payAmountByFee[fee.id];
      const requestedAmount = rawInput ? Number(rawInput) : fee.balance;
      if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
        throw new Error("Enter a valid amount to pay.");
      }

      const checkoutRes = await api.post(`/student/fees/${fee.id}/create-checkout-session`, {
        amount: requestedAmount
      });

      const { sessionId, publishableKey } = checkoutRes.data;
      const stripe = window.Stripe(publishableKey);

      if (!stripe) {
        throw new Error("Stripe initialization failed.");
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) {
        throw new Error(stripeError.message || "Stripe checkout failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment failed.");
    } finally {
      setLoading(false);
      setActivePaymentFeeId(null);
    }
  };

  const badge = (status) => {
    if (status === "Paid") return "badge badge-success";
    if (status === "Overpaid") return "badge badge-info";
    if (status === "Partially Paid") return "badge badge-warning";
    return "badge badge-danger";
  };

  const handlePrintReceipt = () => {
    if (!receipt) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      setError("Please allow popups to print the receipt.");
      return;
    }

    const printableDate = new Date(receipt.paidAt).toLocaleString();
    const printableAmount = `Rs ${Number(receipt.amount).toFixed(2)}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111;
            background: #fff;
            margin: 0;
            padding: 24px;
          }
          .receipt {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            max-width: 720px;
            margin: 0 auto;
          }
          h1 {
            margin: 0 0 16px 0;
            font-size: 22px;
          }
          p {
            margin: 8px 0;
            line-height: 1.5;
            font-size: 14px;
          }
          strong {
            display: inline-block;
            width: 140px;
          }
          .status {
            color: #166534;
            font-weight: 700;
          }
          @media print {
            body {
              padding: 0;
            }
            .receipt {
              border: none;
              border-radius: 0;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <h1>Music School Management - Payment Receipt</h1>
          <p><strong>Status:</strong> <span class="status">Payment successful</span></p>
          <p><strong>Payment ID:</strong> ${receipt.paymentId || "-"}</p>
          <p><strong>Order ID:</strong> ${receipt.orderId || "-"}</p>
          <p><strong>Amount:</strong> ${printableAmount}</p>
          <p><strong>Instrument:</strong> ${receipt.instrument || "-"}</p>
          <p><strong>Year:</strong> ${receipt.year || "-"}</p>
          <p><strong>Date:</strong> ${printableDate}</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="card">
      <h2>My Yearly Fees</h2>
      {message ? <p className="muted" style={{ color: "#0f766e" }}>{message}</p> : null}
      {error ? <p className="muted" style={{ color: "#b91c1c" }}>{error}</p> : null}
      <div className="table-container">
        <table className="table">
        <thead>
          <tr>
            <th>Year</th>
            <th>Instrument / Level</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {fees.map((f) => (
            <tr key={f.id}>
              <td>{f.year}</td>
              <td>
                {f.instrument} / {f.courseLevel}
              </td>
              <td>₹{f.yearlyFee.toFixed(2)}</td>
              <td>₹{f.amountPaid.toFixed(2)}</td>
              <td>₹{f.balance.toFixed(2)}</td>
              <td>
                <span className={badge(f.status)}>{f.status}</span>
              </td>
              <td>
                {f.balance > 0 ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      max={f.balance}
                      value={payAmountByFee[f.id] ?? ""}
                      placeholder={`Max ${f.balance.toFixed(2)}`}
                      onChange={(e) =>
                        setPayAmountByFee((prev) => ({
                          ...prev,
                          [f.id]: e.target.value
                        }))
                      }
                      style={{ width: "120px" }}
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handlePayNow(f)}
                      disabled={loading && activePaymentFeeId === f.id}
                    >
                      {loading && activePaymentFeeId === f.id ? "Processing..." : "Pay with Stripe"}
                    </button>
                  </div>
                ) : (
                  <span className="muted">No due amount</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {receipt ? (
        <div className="card" style={{ marginTop: "16px", border: "1px solid #d1d5db" }}>
          <h3>Payment Receipt</h3>
          <p><strong>Status:</strong> Payment successful</p>
          <p><strong>Payment ID:</strong> {receipt.paymentId}</p>
          <p><strong>Order ID:</strong> {receipt.orderId}</p>
          <p><strong>Amount:</strong> ₹{Number(receipt.amount).toFixed(2)}</p>
          <p><strong>Instrument:</strong> {receipt.instrument}</p>
          <p><strong>Year:</strong> {receipt.year}</p>
          <p><strong>Date:</strong> {new Date(receipt.paidAt).toLocaleString()}</p>
          <button type="button" className="btn-primary" onClick={handlePrintReceipt}>
            Print Receipt
          </button>
        </div>
      ) : null}
      <p className="muted">
        Enter amount (or leave blank to pay full balance), complete Stripe checkout, then print your receipt.
      </p>
    </div>
  );
};

export default StudentFees;


