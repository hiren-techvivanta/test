import React, { useState, useEffect } from "react";
import SideNav from "../../../components/SideNav";
import {
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Button,
  CircularProgress,
  TableContainer,
  Paper,
  TableHead,
  TablePagination,
  FormHelperText,
  Box,
  Typography,
  DialogContentText,
  Pagination,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";

const WalletTransaction = () => {
  // State management
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [email, setEmail] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_transactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Constants
  const token = Cookies.get("authToken");
  const today = dayjs().format("YYYY-MM-DD");
  const minDate = "1970-01-01";
  const [endDate, setEndDate] = useState(today);

  // Fetch transaction data
  const getData = async (page = 1, pageSize = resultsPerPage) => {
    setLoading(true);
    try {
      const params = {
        email: email || undefined,
        transaction_type: transactionType || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page,
        page_size: pageSize,
      };

      // Clean undefined parameters
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/wallet/admin/transactions/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (res.data.status === 200) {
        const { transactions, pagination: pg } = res.data.data;
        setTransactions(transactions);
        setPagination({
          current_page: pg.current_page,
          total_pages: pg.total_pages,
          total_transactions: pg.total_transactions,
        });
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (token) getData();
  }, [token]);

  // Validate form inputs
  const validateForm = () => {
    const errors = {};

    // Email validation
    const trimmedEmail = email.trim();
    if (
      trimmedEmail &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmedEmail)
    ) {
      errors.email = "Invalid email address";
    }

    // Date validation
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (startDate && start.isAfter(dayjs())) {
      errors.date = "Start date cannot be in the future";
    }

    if (endDate && end.isAfter(dayjs())) {
      errors.date = "End date cannot be in the future";
    }

    if (startDate && start.isBefore(dayjs(minDate))) {
      errors.date = `Start date must be after ${dayjs(minDate).format(
        "DD/MM/YYYY"
      )}`;
    }

    if (endDate && end.isBefore(dayjs(minDate))) {
      errors.date = `End date must be after ${dayjs(minDate).format(
        "DD/MM/YYYY"
      )}`;
    }

    if (startDate && endDate && start.isAfter(end)) {
      errors.date = "End date must be after start date";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      getData(1);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setEmail("");
    setTransactionType("");
    setStartDate("");
    setEndDate(today);
    setValidationErrors({});
    getData(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, current_page: newPage }));
    getData(newPage, resultsPerPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setResultsPerPage(newSize);
    getData(1, newSize);
  };

  // View transaction details
  const handleViewDetails = (txn) => {
    setSelectedTransaction(txn);
    setOpen(true);
  };

  // Format key for display
  const formatKey = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get no data message
  const getNoDataMessage = () => {
    if (!email && !transactionType && !startDate && !endDate) {
      return "No transactions found";
    }

    const filters = [];
    if (email) filters.push(`email: ${email}`);
    if (transactionType) filters.push(`type: ${transactionType}`);
    if (startDate)
      filters.push(`from ${dayjs(startDate).format("DD/MM/YYYY")}`);
    if (endDate) filters.push(`to ${dayjs(endDate).format("DD/MM/YYYY")}`);

    return `No transactions found with ${filters.join(" and ")}`;
  };

  // Export data to CSV
  const fetchExportData = async () => {
    if (!validateForm()) return;

    setExporting(true);
    try {
      const params = {
        email: email || undefined,
        transaction_type: transactionType || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      // Clean undefined parameters
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/wallet/admin/transactions/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (res.data.status === 200 && res.data.data.transactions.length > 0) {
        const { transactions } = res.data.data;
        const headers = [
          "Transaction ID",
          "Created At",
          "Transaction Type",
          "Amount",
          "Balance After",
          "Remarks",
          "User Email",
          "User Phone",
          "User Full Name",
        ];

        const rows = transactions.map((txn) => [
          txn.transaction_id,
          dayjs(txn.created_at).format("YYYY-MM-DD HH:mm:ss"),
          txn.transaction_type,
          txn.amount,
          txn.balance_after_transaction,
          txn.remarks,
          txn.user_details?.email || "",
          txn.user_details?.phone_number || "",
          txn.user_details?.full_name || "",
        ]);

        let csvContent =
          "data:text/csv;charset=utf-8," +
          headers.join(",") +
          "\n" +
          rows
            .map((row) =>
              row
                .map((field) => `"${field.toString().replace(/"/g, '""')}"`)
                .join(",")
            )
            .join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
          "download",
          `wallet_transactions_${dayjs().format("YYYYMMDD_HHmmss")}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.log("No data available for export");
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="container py-5 mb-lg-4 ">
      <div className="row pt-sm-2 pt-lg-0">
        <SideNav />

        <div className="col-lg-9 pt-4 pb-2 pb-sm-4">
          <div className="d-sm-flex align-items-center mb-4">
            <h1 className="h2 mb-4 mb-sm-0 me-4">Wallet Transaction List</h1>
          </div>

          <div className="card shadow border-0">
            <div className="card-body">
              <form onSubmit={handleFilterSubmit}>
                <div className="row g-3">
                  <div className="col-md-3">
                    <TextField
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={!!validationErrors.email}
                      helperText={validationErrors.email}
                      fullWidth
                      size="small"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormControl fullWidth size="small">
                      <InputLabel>Transaction Type</InputLabel>
                      <Select
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                        label="Transaction Type"
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="credit">Credit</MenuItem>
                        <MenuItem value="debit">Debit</MenuItem>
                      </Select>
                    </FormControl>
                  </div>

                  <div className="col-md-3">
                    <TextField
                      label="Start Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      fullWidth
                      size="small"
                      inputProps={{
                        min: minDate,
                        max: today,
                      }}
                    />
                  </div>

                  <div className="col-md-3">
                    <TextField
                      label="End Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      fullWidth
                      size="small"
                      inputProps={{
                        min: startDate || minDate,
                        max: today,
                      }}
                      disabled={!startDate}
                    />
                  </div>

                  {validationErrors.date && (
                    <div className="col-12">
                      <FormHelperText error>
                        {validationErrors.date}
                      </FormHelperText>
                    </div>
                  )}

                  <div className="col-md-2 d-flex align-items-end">
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      fullWidth
                      disabled={loading}
                    >
                      Apply
                    </Button>
                  </div>

                  <div className="col-md-2 d-flex align-items-end">
                    <Button
                      variant="outlined"
                      color="light"
                      onClick={resetFilters}
                      fullWidth
                      disabled={loading}
                    >
                      Reset
                    </Button>
                  </div>

                  <div className="col-md-2 d-flex align-items-end">
                    <Button
                      variant="contained"
                      className="w-100"
                      color="success"
                      onClick={fetchExportData}
                      disabled={exporting || loading}
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

          <div className="card shadow border-0 mt-3">
            <div className="card-body">
              <div className="overflow-auto">
                {transactions.length === 0 && !loading ? (
                  <h6 className="text-center">{getNoDataMessage()}</h6>
                ) : (
                  <>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Date & Time</th>
                          <th>User</th>
                          <th>Email</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Balance</th>
                          <th>Remarks</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={9} className="text-center">
                              <CircularProgress />
                            </td>
                          </tr>
                        ) : (
                          transactions.map((txn, idx) => (
                            <tr key={txn.transaction_id}>
                              <td>
                                {(pagination.current_page - 1) *
                                  resultsPerPage +
                                  idx +
                                  1}
                              </td>
                              <td>
                                {dayjs(txn.created_at).format(
                                  "DD/MM/YYYY hh:mm A"
                                )}
                              </td>
                              
                              <td>{txn.user_details?.full_name}</td>
                                <td>{txn.user_details?.email}</td>
                              <td>
                                <span
                                  className={`badge bg-${
                                    txn.transaction_type === "credit"
                                      ? "success"
                                      : "danger"
                                  }`}
                                >
                                  {txn.transaction_type}
                                </span>
                              </td>
                              <td>$ {txn.amount}</td>
                              <td>$ {txn.balance_after_transaction}</td>
                              <td>{txn.remarks}</td>
                              <td>
                                <Tooltip title="View Details">
                                  <IconButton
                                    color="info"
                                    onClick={() => handleViewDetails(txn)}
                                  >
                                    <VisibilityRoundedIcon />
                                  </IconButton>
                                </Tooltip>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    <div className="container-fluid mb-3">
                      <div className="row">
                        <div className="col-3">
                          <FormControl variant="standard" fullWidth>
                            <InputLabel id="results-label">Results</InputLabel>
                            <Select
                              labelId="results-label"
                              id="results-select"
                              value={resultsPerPage}
                              onChange={handleRowsPerPageChange}
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
                            onChange={(event, page) => handlePageChange(page)}
                            color="primary"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Dialog
                  open={open}
                  onClose={() => setOpen(false)}
                  maxWidth="md"
                  fullWidth
                >
                  <DialogTitle>Transaction Details</DialogTitle>
                  <DialogContent sx={{ maxHeight: "80vh", overflow: "auto" }}>
                    {selectedTransaction ? (
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <strong>Transaction ID</strong>
                            </TableCell>
                            <TableCell>
                              {selectedTransaction.transaction_id}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Type</strong>
                            </TableCell>
                            <TableCell>
                              {selectedTransaction.transaction_type}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Amount</strong>
                            </TableCell>
                            <TableCell>
                              $ {selectedTransaction.amount}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Balance After</strong>
                            </TableCell>
                            <TableCell>
                              $ {selectedTransaction.balance_after_transaction}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Remarks</strong>
                            </TableCell>
                            <TableCell>{selectedTransaction.remarks}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Created At</strong>
                            </TableCell>
                            <TableCell>
                              {dayjs(selectedTransaction.created_at).format(
                                "DD/MM/YYYY hh:mm A"
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>User Email</strong>
                            </TableCell>
                            <TableCell>
                              {selectedTransaction.user_details?.email || "N/A"}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>User Phone</strong>
                            </TableCell>
                            <TableCell>
                              {selectedTransaction.user_details?.phone_number ||
                                "N/A"}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>User Full Name</strong>
                            </TableCell>
                            <TableCell>
                              {selectedTransaction.user_details?.full_name ||
                                "N/A"}
                            </TableCell>
                          </TableRow>
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
  );
};

export default WalletTransaction;
