import React, { useState } from "react";
import SideNav from "../../components/SideNav";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const token = Cookies.get("authToken");

const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

const WalletManagement = () => {
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  // NEW: Error states
  const [emailError, setEmailError] = useState("");
  const [amountError, setAmountError] = useState("");

  const handleFetchBalance = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailError("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/wallet/admin/get-user-balance/`,
        { user_email: email },
        config
      );
      const usd_balance = response?.data?.data?.balances?.usd_balance;
      setBalance(usd_balance);
      toast.success("Balance fetched successfully");
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch user balance";
      setEmailError(errorMsg); // NEW: Set email error
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setBalance(null);
    setAmount("");
    setEmailError("");
    setAmountError("");
  };

  const handleWalletAction = async (type) => {
    // NEW: Reset amount errors first
    setAmountError("");

    let error = "";
    if (!amount || isNaN(amount)) {
      error = "Please enter a valid amount";
    } else {
      const amountNum = parseFloat(amount);

      if (amountNum <= 0) {
        error = "Amount must be greater than 0";
      } else if (amountNum > 99999999) {
        error = "Amount cannot exceed $99,999,999";
      } else if (type === "remove" && amountNum > balance) {
        error = "Reduction amount exceeds user balance";
      }
    }

    // NEW: Set error and return if validation fails
    if (error) {
      setAmountError(error);
      return;
    }

    const amountNum = parseFloat(amount);
    const actionType = type === "add" ? "Add" : "Reduce";
    const confirmed = window.confirm(
      `Are you sure you want to ${actionType.toLowerCase()} $${amountNum.toFixed(
        2
      )} ?`
    );
    if (!confirmed) return;

    setActionLoading(type);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/wallet/add-money/`,
        {
          amount: amountNum,
          type,
          user_email: email,
        },
        config
      );
      toast.success(data.message || "Transaction successful");
      resetForm();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Transaction failed";
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setActionLoading("");
    }
  };

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, ""); 
    if (raw.length <= 8) {
      setAmount(raw);
      if (amountError) setAmountError("");
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setEmail("");
    setBalance(null);
    setAmount("");
    setEmailError("");
    setAmountError("");
  };

  return (
    <div className="container py-5 mb-lg-4">
      <div className="row pt-sm-2 pt-lg-0">
        <SideNav />
        <div className="col-lg-9 pt-4 pb-2 pb-sm-4">
          <div className="d-sm-flex align-items-center mb-4">
            <h1 className="h2 mb-4 mb-sm-0 me-4">Wallet Management</h1>
          </div>

          <div className="card shadow border-0">
            <div className="card-body">
              <form onSubmit={handleFetchBalance}>
                <div className="row">
                  <div className="col-6">
                    <label>Email</label>
                    <input
                      type="email"
                      className={`form-control ${
                        emailError ? "is-invalid" : ""
                      }`}
                      placeholder="Enter user email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      required
                    />
                    {/* NEW: Email error display */}
                    {emailError && (
                      <div className="invalid-feedback d-block">
                        {emailError}
                      </div>
                    )}
                  </div>
                  <div className="col-6 my-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || balance}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Loading...
                        </>
                      ) : (
                        "Check Balance"
                      )}
                    </button>
                    <button
                      onClick={(e) => handleClear(e)}
                      className="btn btn-outline-dark ms-2"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </form>

              {balance !== null && (
                <>
                  <div className="alert alert-info mb-3">
                    <strong>User USD Balance:</strong> $
                    {Number(balance)?.toFixed(2)}
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label>Amount</label>
                      <div className="input-group p-0">
                        <span className="input-group-text">$</span>
                        <input
                          type="text"
                          className={`form-control ${
                            amountError ? "is-invalid" : ""
                          }`}
                          placeholder="Enter amount (max 8 digits)"
                          value={amount}
                          onChange={handleAmountChange}
                          onKeyPress={(e) => {
                            // Allow only digits
                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          inputMode="numeric"
                          maxLength={8}
                        />
                      </div>
                      {/* NEW: Amount error display */}
                      {amountError && (
                        <div className="invalid-feedback d-block">
                          {amountError}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 d-flex gap-2 my-4 ">
                      <button
                        className="btn btn-success"
                        type="button"
                        onClick={() => handleWalletAction("add")}
                        disabled={actionLoading === "add" || !amount}
                      >
                        {actionLoading === "add" ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Processing...
                          </>
                        ) : (
                          "Add Funds"
                        )}
                      </button>
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={() => handleWalletAction("remove")}
                        disabled={actionLoading === "remove" || !amount}
                      >
                        {actionLoading === "remove" ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Processing...
                          </>
                        ) : (
                          "Reduce Funds"
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletManagement;
