import React, { useEffect, useState } from "react";
import {
  IconButton,
  Pagination,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import SideNav from "../../../components/SideNav";
import Loader from "../../../components/Loader";

const CryptoTransaction = () => {
  // Define min and max allowed dates
  const minAllowedDate = "0000-01-01";
  const maxAllowedDate = dayjs().format("YYYY-MM-DD");
  
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_transactions: 0,
  });
  const [loading, setLoading] = useState(false);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [exporting, setExporting] = useState(false); // New state for export loading

  const token = Cookies.get("authToken");

  const getData = async (page = 1, pageSize = resultsPerPage) => {
    setLoading(true);
    try {
      const params = {
        email: email || undefined,
        mobile_number: mobile || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page,
        page_size: pageSize,
      };
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/deposite/admin/transactions/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (res.data.status === 200) {
        setTransactions(res.data.data.transactions);
        setPagination({
          total_pages: res.data.data.pagination.total_pages || 1,
          current_page: res.data.data.pagination.current_page || 1,
          total_transactions: res.data.data.pagination.total_transactions || 0,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) getData();
  }, [token]);

  const handlePageChange = (event, page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
    getData(page);
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setResultsPerPage(value);
    getData(1, value);
  };

  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setEmailError("");
    setMobileError("");
    setStartDateError("");
    setEndDateError("");

   // Email validation
    const trimmedEmail = email.trim(); 

    // Email validation
    if (
      trimmedEmail &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmedEmail)
    ) {
      setEmailError("Invalid email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Mobile validation
    if (mobile && !/^\d{10}$/.test(mobile)) {
      setMobileError("Mobile must be 10 digits");
      isValid = false;
    }

    // Start date validation
    if (startDate) {
      const start = dayjs(startDate);
      const minDate = dayjs(minAllowedDate);
      const maxDate = dayjs(maxAllowedDate);
      
      if (start.isBefore(minDate)) {
        setStartDateError(`Date must be on or after ${minDate.format("DD/MM/YYYY")}`);
        isValid = false;
      }
      
      if (start.isAfter(maxDate)) {
        setStartDateError("Future dates are not allowed");
        isValid = false;
      }
    }

    // End date validation
    if (endDate) {
      const end = dayjs(endDate);
      const minDate = dayjs(minAllowedDate);
      const maxDate = dayjs(maxAllowedDate);
      
      if (end.isBefore(minDate)) {
        setEndDateError(`Date must be on or after ${minDate.format("DD/MM/YYYY")}`);
        isValid = false;
      }
      
      if (end.isAfter(maxDate)) {
        setEndDateError("Future dates are not allowed");
        isValid = false;
      }
    }

    // Cross validation between dates
    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      
      if (end.isBefore(start)) {
        setEndDateError("End date must be after start date");
        isValid = false;
      }
    }

    return isValid;
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      getData(1);
    }
  };

  const resetFilters = () => {
    setEmail("");
    setMobile("");
    setStartDate("");
    setEndDate("");
    setEmailError("");
    setMobileError("");
    setStartDateError("");
    setEndDateError("");
    setResetTrigger(true);
  };

  // NEW: Export functionality
  const handleExport = async () => {
    if (!validateForm()) return;
    
    setExporting(true);
    try {
      const params = {
        email: email || undefined,
        mobile_number: mobile || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/deposite/admin/transactions/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (res.data.status === 200) {
        const transactions = res.data.data.transactions;
        if (transactions.length === 0) {
          return;
        }

        // Create CSV content
        const headers = [
          "ID", "Email", "Phone Number", "Full Name", "Coin", 
          "Amount", "Type", "Fee", "From Address", "To Address", 
          "Transaction Hash", "Status", "Balance After", "Internal", 
          "Created At"
        ];

        const rows = transactions.map(txn => [
          txn.id,
          txn.user_details?.email || "",
          txn.user_details?.phone_number || "",
          txn.user_details?.full_name || "",
          txn.coin || "",
          txn.amount ? Number(txn.amount).toFixed(18).replace(/\.?0+$/, "") : "",
          txn.transaction_type || "",
          txn.fee || "",
          txn.from_address || "",
          txn.to_address || "",
          txn.transaction_hash || "",
          txn.status || "",
          txn.balance_after_transaction || "",
          txn.is_internal ? "Yes" : "No",
          dayjs(txn.created_at).format("DD/MM/YYYY hh:mm A")
        ]);

        // Escape CSV fields
        const escapeField = (field) => {
          if (field == null) return "";
          const str = String(field);
          return str.includes(",") || str.includes('"') || str.includes("\n") 
            ? `"${str.replace(/"/g, '""')}"` 
            : str;
        };

        // Create CSV content
        const csvContent = [
          headers.map(escapeField).join(","),
          ...rows.map(row => row.map(escapeField).join(","))
        ].join("\n");

        // Create Blob and download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        
        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        link.download = `crypto_transactions_${timestamp}.csv`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
      }
    } catch (error) {
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (resetTrigger) {
      getData(1);
      setResetTrigger(false);
    }
  }, [resetTrigger]);

  const handleViewDetails = (txn) => {
    setSelectedTransaction(txn);
    setOpen(true);
  };

  // Format key for display in modal
  const formatKey = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get custom no data message
  const getNoDataMessage = () => {
    if (!email && !mobile && !startDate && !endDate) {
      return "No transactions found";
    }

    let message = "No transactions found";
    const filters = [];

    if (email) filters.push(`email: ${email}`);
    if (mobile) filters.push(`mobile: ${mobile}`);
    if (startDate)
      filters.push(`from ${dayjs(startDate).format("DD/MM/YYYY")}`);
    if (endDate) filters.push(`to ${dayjs(endDate).format("DD/MM/YYYY")}`);

    if (filters.length > 0) {
      message += ` with ${filters.join(" and ")}`;
    }

    return message;
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="container py-5 mb-lg-4">
          <div className="row pt-sm-2 pt-lg-0">
            <SideNav />
            <div className="col-lg-9 pt-4 pb-2 pb-sm-4">
              <div className="d-sm-flex align-items-center mb-4">
                <h1 className="h2 mb-4 mb-sm-0 me-4">Crypto Transactions</h1>
              </div>

              <div className="card shadow border-0">
                <div className="card-body">
                  {/* Filter Form */}
                  <form onSubmit={handleFilterSubmit} className="">
                    <div className="row g-3">
                      <div className="col-md-3">
                        <TextField
                          label="Email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError("");
                          }}
                          error={!!emailError}
                          helperText={emailError}
                          fullWidth
                          size="small"
                        />
                      </div>
                      <div className="col-md-3">
                        <TextField
                          label="Mobile Number"
                          value={mobile}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only allow numbers and limit to 10 digits
                            if (value === "" || /^\d{0,10}$/.test(value)) {
                              setMobile(value);
                              if (mobileError) setMobileError("");
                            }
                          }}
                          error={!!mobileError}
                          helperText={mobileError}
                          fullWidth
                          size="small"
                          inputProps={{ maxLength: 10 }}
                        />
                      </div>
                      <div className="col-md-3">
                        <TextField
                          label="Start Date"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            if (startDateError) setStartDateError("");
                          }}
                          inputProps={{
                            min: minAllowedDate,
                            max: maxAllowedDate
                          }}
                          error={!!startDateError}
                          helperText={startDateError}
                          fullWidth
                          size="small"
                        />
                      </div>
                      <div className="col-md-3">
                        <TextField
                          label="End Date"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          value={endDate}
                          onChange={(e) => {
                            setEndDate(e.target.value);
                            if (endDateError) setEndDateError("");
                          }}
                          inputProps={{
                            min: minAllowedDate,
                            max: maxAllowedDate
                          }}
                          error={!!endDateError}
                          helperText={endDateError}
                          fullWidth
                          size="small"
                        />
                      </div>
                      <div className="col-md-2 d-flex align-items-end">
                        <Button
                          variant="contained"
                          color="primary"
                          type="submit"
                          fullWidth
                        >
                          Apply
                        </Button>
                      </div>
                      <div className="col-md-2 d-flex align-items-end">
                        <Button
                          variant="outlined"
                          onClick={resetFilters}
                          fullWidth
                          color="light"
                        >
                          Reset
                        </Button>
                      </div>
                      {/* NEW: Export Button */}
                      <div className="col-md-2 d-flex align-items-end">
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleExport}
                          disabled={exporting}
                          fullWidth
                        >
                          {exporting ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            "Export"
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Table */}
              <div className="card shadow border-0 mt-3">
                <div className="card-body">
                  <div className="overflow-auto">
                    {transactions.length === 0 ? (
                      <h6 className="text-center">{getNoDataMessage()}</h6>
                    ) : (
                      <>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Email</th>
                              <th>Coin</th>
                              <th>Amount</th>
                              <th>Type</th>
                              <th>Status</th>
                              <th>Created At</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((txn, idx) => (
                              <tr key={txn.id}>
                                <td>
                                  {(pagination.current_page - 1) *
                                    resultsPerPage +
                                    idx +
                                    1}
                                </td>
                                <td>{txn.user_details?.email || "N/A"}</td>
                                <td>{txn.coin || "N/A"}</td>
                                <td>
                                  {txn.amount
                                    ? Number(txn.amount)
                                        .toFixed(18)
                                        .replace(/\.?0+$/, "")
                                    : "N/A"}
                                </td>
                                <td>{txn.transaction_type || "N/A"}</td>
                                <td>
                                  <span
                                    className={`badge bg-${
                                      txn.status === "completed"
                                        ? "success"
                                        : "warning"
                                    }`}
                                  >
                                    {txn.status || "N/A"}
                                  </span>
                                </td>
                                <td>
                                  {txn.created_at
                                    ? dayjs(txn.created_at).format(
                                        "DD/MM/YYYY hh:mm A"
                                      )
                                    : "N/A"}
                                </td>
                                <td>
                                  <Tooltip title="View Details">
                                    <IconButton
                                      onClick={() => handleViewDetails(txn)}
                                      color="info"
                                    >
                                      <VisibilityRoundedIcon />
                                    </IconButton>
                                  </Tooltip>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Pagination and Per Page Select */}
                        <div className="container-fluid mb-3">
                          <div className="row">
                            <div className="col-3">
                              <FormControl variant="standard" fullWidth>
                                <InputLabel>Results</InputLabel>
                                <Select
                                  value={resultsPerPage}
                                  onChange={handleChange}
                                >
                                  <MenuItem value={10}>10</MenuItem>
                                  <MenuItem value={25}>25</MenuItem>
                                  <MenuItem value={50}>50</MenuItem>
                                  <MenuItem value={100}>100</MenuItem>
                                </Select>
                              </FormControl>
                            </div>
                            <div className="col-9 d-flex justify-content-end">
                              <Pagination
                                count={pagination.total_pages}
                                page={pagination.current_page}
                                onChange={handlePageChange}
                                color="primary"
                                disabled={transactions.length === 0}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Dialog */}
                    <Dialog
                      open={open}
                      onClose={() => setOpen(false)}
                      maxWidth="md"
                      fullWidth
                    >
                      <DialogTitle>Transaction Details</DialogTitle>
                      <DialogContent
                        style={{ maxHeight: "80vh", overflow: "auto" }}
                      >
                        {selectedTransaction ? (
                          <Table>
                            <TableBody>
                              {/* User Details */}
                              {selectedTransaction.user_details && (
                                <>
                                  <TableRow>
                                    <TableCell>
                                      <strong>User Email</strong>
                                    </TableCell>
                                    <TableCell>
                                      {selectedTransaction.user_details.email ||
                                        "N/A"}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>
                                      <strong>User Phone Number</strong>
                                    </TableCell>
                                    <TableCell>
                                      {selectedTransaction.user_details
                                        .phone_number || "N/A"}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>
                                      <strong>User Full Name</strong>
                                    </TableCell>
                                    <TableCell>
                                      {selectedTransaction.user_details
                                        .full_name || "N/A"}
                                    </TableCell>
                                  </TableRow>
                                </>
                              )}

                              {/* Transaction Details */}
                              <TableRow>
                                <TableCell>
                                  <strong>Coin</strong>
                                </TableCell>
                                <TableCell>
                                  {selectedTransaction.coin || "N/A"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <strong>Amount</strong>
                                </TableCell>
                                <TableCell>
                                  {selectedTransaction.amount
                                    ? Number(selectedTransaction.amount)
                                        .toFixed(18)
                                        .replace(/\.?0+$/, "")
                                    : "N/A"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <strong>Type</strong>
                                </TableCell>
                                <TableCell>
                                  {selectedTransaction.transaction_type ||
                                    "N/A"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <strong>Status</strong>
                                </TableCell>
                                <TableCell>
                                  {selectedTransaction.status || "N/A"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <strong>Created At</strong>
                                </TableCell>
                                <TableCell>
                                  {selectedTransaction.created_at
                                    ? dayjs(
                                        selectedTransaction.created_at
                                      ).format("DD/MM/YYYY hh:mm A")
                                    : "N/A"}
                                </TableCell>
                              </TableRow>

                              {/* Additional Fields */}
                              {Object.entries(selectedTransaction)
                                .filter(
                                  ([key]) =>
                                    ![
                                      "user_details",
                                      "coin",
                                      "amount",
                                      "transaction_type",
                                      "status",
                                      "created_at",
                                    ].includes(key)
                                )
                                .map(([key, value]) => (
                                  <TableRow key={key}>
                                    <TableCell>
                                      <strong>{formatKey(key)}</strong>
                                    </TableCell>
                                    <TableCell>
                                      {key.includes("date") ||
                                      key.includes("_at")
                                        ? dayjs(value).format(
                                            "DD/MM/YYYY hh:mm A"
                                          )
                                        : typeof value === "object"
                                        ? JSON.stringify(value, null, 2)
                                        : value}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <DialogContentText>
                            No transaction details available
                          </DialogContentText>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CryptoTransaction;