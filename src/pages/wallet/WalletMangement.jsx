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

const WalletMangement = () => {
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const handleFetchBalance = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      const errorMsg = err.response?.data?.error || 
                      err.message || 
                      "Failed to fetch user balance";
      toast.error(`Error: ${errorMsg}`);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setBalance(null);
    setAmount("");
  };

  const handleWalletAction = async (type) => {
    // FIXED: Added missing closing parenthesis in this condition
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount.");
      return;
    }

    const amountNum = parseFloat(amount);
    
    if (amountNum <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (amountNum > 99999999) {
      toast.error("Amount cannot exceed $99,999,999");
      return;
    }

    if (type === "remove" && amountNum > balance) {
      toast.error("Reduction amount exceeds user balance");
      return;
    }

    const actionType = type === "add" ? "Add" : "Reduce";
    const confirmed = window.confirm(
      `Are you sure you want to ${actionType.toLowerCase()} $${amountNum.toFixed(2)}?`
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
      const errorMsg = err.response?.data?.error || 
                      err.message || 
                      "Transaction failed";
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setActionLoading("");
    }
  };

  const handleAmountChange = (e) => {
    let value = e.target.value;
    
    // Remove any negative signs
    if (value.startsWith('-')) value = value.substring(1);
    
    // Limit to 8 digits before decimal
    const parts = value.split('.');
    if (parts[0].length > 8) {
      toast.error("Maximum 8 digits allowed");
      return;
    }
    
    // Limit to 2 decimal places
    if (parts.length > 1 && parts[1].length > 2) {
      value = `${parts[0]}.${parts[1].substring(0, 2)}`;
    }
    
    setAmount(value);
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
                <div className="row align-items-end mb-3">
                  <div className="col-6">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter user email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
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
                  </div>
                </div>
              </form>

              {balance !== null && (
                <>
                  <div className="alert alert-info mb-3">
                    <strong>User USD Balance:</strong> ${Number(balance)?.toFixed(2)}
                  </div>
                  <div className="row align-items-end">
                    <div className="col-md-6">
                      <label>Amount</label>
                      <div className="input-group p-0">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter amount (max 8 digits)"
                          value={amount}
                          onChange={handleAmountChange}
                          min="0"
                          max="99999999"
                          step="0.01"
                        />
                      </div>
                      <small className="text-muted">
                        Max 8 digits, 2 decimal places
                      </small>
                    </div>
                    <div className="col-md-6 d-flex gap-2 mt-3 mt-md-0">
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

export default WalletMangement;