import React, { useState } from "react";
import SideNav from "../../components/SideNav";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import TopNav from "../../components/TopNav";
import { Button, TextField } from "@mui/material";

const token = Cookies.get("authToken");

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

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

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
      setEmailError(errorMsg);
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

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

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
      toast.error(errorMsg);
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
    <>
      <div className="container-fluid p-0 m-0">
        <TopNav />
        <div className="row m-0">
          <div
            className="col-3 p-0"
            style={{ maxHeight: "100%", overflowY: "auto" }}
          >
            <SideNav />
          </div>
          <div className="col-9">
            <div className="row m-0">
              <div
                className="col-12 py-3"
                style={{ background: "#EEEEEE", minHeight: "93vh" }}
              >
                <div className="frame-1597880849">
                  <div className="all-members-list">Wallet Management</div>
                </div>

                <div className="card shadow border-0 mt-4">
                  <div className="card-body">
                    <form onSubmit={handleFetchBalance}>
                      <div className="row m-0">
                        <div className="col-6">
                          <label className="form-label">Email</label>
                          <TextField
                            fullWidth
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (emailError) setEmailError("");
                            }}
                            error={!!emailError}
                            helperText={emailError}
                            required
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "12px",
                                backgroundColor: "#f5f5f5",
                              },
                              // "& .MuiFormHelperText-root": {
                              //   textTransform:"capitalize"
                              // },
                            }}
                            disabled={loading || balance}
                          />
                        </div>

                        <div className="col-6 my-4">
                          <Button
                            variant="contained"
                            type="submit"
                            className="rounded-1"
                            disabled={loading || balance}
                            sx={{
                              height: "55px",
                            }}
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
                          </Button>
                          <Button
                            variant="outlined"
                            color="dark"
                            onClick={(e) => handleClear(e)}
                            className="btn btn-outline-dark ms-2"
                            sx={{
                              height: "55px",
                            }}
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    </form>

                    {balance !== null && (
                      <>
                        <div className="alert alert-info mb-3">
                          <strong>User USD Balance:</strong> $
                          {Number(balance)?.toFixed(2)}
                        </div>
                        <div className="row m-0">
                          <div className="col-md-6">
                            <label className="form-label">
                              Amount (In '$')
                            </label>
                            <TextField
                              fullWidth
                              value={amount}
                              onChange={handleAmountChange}
                              onKeyPress={(e) => {
                                if (!/[0-9]/.test(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              error={!!amountError}
                              helperText={amountError}
                              inputProps={{
                                maxLength: 8,
                                inputMode: "numeric",
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "12px",
                                  backgroundColor: "#f5f5f5",
                                },
                              }}
                            />
                          </div>

                          <div className="col-md-6 d-flex gap-2 my-4 ">
                            <Button
                              variant="contained"
                              type="button"
                              color="success"
                              onClick={() => handleWalletAction("add")}
                              disabled={
                                actionLoading === "add" || !amount || !email
                              }
                              sx={{ height: "55px" }}
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
                            </Button>
                            <Button
                              variant="contained"
                              type="button"
                              color="error"
                              sx={{ height: "55px" }}
                              onClick={() => handleWalletAction("remove")}
                              disabled={
                                actionLoading === "remove" || !amount || !email
                              }
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
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletManagement;
