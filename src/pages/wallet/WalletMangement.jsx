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
    } catch (err) {
      toast.error(err?.response?.data?.error || "User not found");
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
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${type} $${amount}?`
    );
    if (!confirmed) return;

    setActionLoading(type);

    try {
      const { data } = await axios.post(
        `http://185.131.54.49:8000/api/wallet/add-money/`,
        {
          amount: parseFloat(amount),
          type,
          user_email: email,
        },
        config
      );
      toast.success(data.message || "Transaction successful");
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(err.response.data.error || "Internal server error");
    } finally {
      setActionLoading("");
    }
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
                        "Check"
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {balance !== null && (
                <>
                  <div className="mb-3">
                    <strong>User USD Balance:</strong> ${balance}
                  </div>
                  <div className="row align-items-end">
                    <div className="col-md-6">
                      <label>Amount</label>
                      <div className="input-group p-0">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-6 d-flex gap-2">
                      <button
                        className="btn btn-success"
                        type="button"
                        onClick={() => handleWalletAction("add")}
                        disabled={actionLoading === "add"}
                      >
                        {actionLoading === "add" ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Loading...
                          </>
                        ) : (
                          "Add"
                        )}
                      </button>
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={() => handleWalletAction("remove")}
                        disabled={actionLoading === "remove"}
                      >
                        {actionLoading === "remove" ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Loading...
                          </>
                        ) : (
                          "Reduce"
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
