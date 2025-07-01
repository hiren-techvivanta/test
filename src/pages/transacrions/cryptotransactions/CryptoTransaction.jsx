import React, { useEffect, useState } from "react";
import {
  IconButton,
  Pagination,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
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
  Modal,
  Box,
  Typography,
  Chip,
  Switch,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import SideNav from "../../../components/SideNav";
import TopNav from "../../../components/TopNav";

const CryptoTransaction = () => {
  // Define min and max allowed dates
  const minAllowedDate = "0000-01-01";
  const maxAllowedDate = dayjs().format("YYYY-MM-DD");

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    email: "",
    mobile_number: "",
    start_date: "",
    end_date: maxAllowedDate,
  });
  const [appliedFilters, setAppliedFilters] = useState({
    email: "",
    mobile_number: "",
    start_date: "",
    end_date: maxAllowedDate,
  });
  const [open, setOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [dateError, setDateError] = useState("");

  const token = Cookies.get("authToken");

  const getData = async (page = 1, pageSize = resultsPerPage) => {
    setLoading(true);
    try {
      const params = {
        ...appliedFilters,
        page,
        page_size: pageSize,
      };

      Object.keys(params).forEach(
        (key) => params[key] === "" && delete params[key]
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
        setTotalPages(res.data.data.pagination.total_pages || 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) getData();
  }, [token, currentPage, resultsPerPage, appliedFilters]);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleResultsPerPageChange = (event) => {
    setResultsPerPage(event.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when field changes
    if (name === "email") setEmailError("");
    if (name === "mobile_number") setMobileError("");
    if (name === "start_date" || name === "end_date") setDateError("");
  };

  const validateForm = () => {
    let isValid = true;

    const trimmedEmail = filters.email.trim();

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
    if (filters.mobile_number && !/^\d{8,15}$/.test(filters.mobile_number)) {
      setMobileError("Mobile must be 8 to 15 digits");
      isValid = false;
    } else {
      setMobileError("");
    }

    // Date validation
    const start = dayjs(filters.start_date);
    const end = dayjs(filters.end_date);
    const min = dayjs(minAllowedDate);
    const max = dayjs(maxAllowedDate);

    if (filters.start_date && filters.end_date && start.isAfter(end)) {
      setDateError("End date must be after start date");
      isValid = false;
    } else if (
      filters.start_date &&
      (start.isBefore(min) || start.isAfter(max))
    ) {
      setDateError(
        `Start date must be between ${min.format("DD/MM/YYYY")} and today`
      );
      isValid = false;
    } else if (filters.end_date && (end.isBefore(min) || end.isAfter(max))) {
      setDateError(
        `End date must be between ${min.format("DD/MM/YYYY")} and today`
      );
      isValid = false;
    } else {
      setDateError("");
    }

    return isValid;
  };

  const applyFilters = () => {
    if (validateForm()) {
      setAppliedFilters({ ...filters });
      setCurrentPage(1);
    }
  };

  const resetFilters = () => {
    const resetValues = {
      email: "",
      mobile_number: "",
      start_date: "",
      end_date: maxAllowedDate,
    };
    setFilters(resetValues);
    setAppliedFilters(resetValues);
    setEmailError("");
    setMobileError("");
    setDateError("");
    setCurrentPage(1);
  };

  const handleExport = async () => {
    if (!validateForm()) return;

    setExporting(true);
    try {
      const params = {
        ...appliedFilters,
      };

      Object.keys(params).forEach(
        (key) => params[key] === "" && delete params[key]
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
        if (transactions.length === 0) return;

        // Create CSV content
        const headers = [
          "ID",
          "Email",
          "Phone Number",
          "Full Name",
          "Coin",
          "Amount",
          "Type",
          "Fee",
          "From Address",
          "To Address",
          "Transaction Hash",
          "Status",
          "Balance After",
          "Internal",
          "Created At",
        ];

        const rows = transactions.map((txn) => [
          txn.id,
          txn.user_details?.email || "",
          txn.user_details?.phone_number || "",
          txn.user_details?.full_name || "",
          txn.coin || "",
          txn.amount
            ? Number(txn.amount)
                .toFixed(18)
                .replace(/\.?0+$/, "")
            : "",
          txn.transaction_type || "",
          txn.fee || "",
          txn.from_address || "",
          txn.to_address || "",
          txn.transaction_hash || "",
          txn.status || "",
          txn.balance_after_transaction || "",
          txn.is_internal ? "Yes" : "No",
          dayjs(txn.created_at).format("DD/MM/YYYY hh:mm A"),
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
          ...rows.map((row) => row.map(escapeField).join(",")),
        ].join("\n");

        // Create Blob and download
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
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
      }
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

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
    if (
      !appliedFilters.email &&
      !appliedFilters.mobile_number &&
      !appliedFilters.start_date &&
      !appliedFilters.end_date
    ) {
      return "No transactions found";
    }

    let message = "No transactions found";
    const filterLabels = [];

    if (appliedFilters.email)
      filterLabels.push(`email: ${appliedFilters.email}`);
    if (appliedFilters.mobile_number)
      filterLabels.push(`mobile: ${appliedFilters.mobile_number}`);
    if (appliedFilters.start_date)
      filterLabels.push(
        `from ${dayjs(appliedFilters.start_date).format("DD/MM/YYYY")}`
      );
    if (appliedFilters.end_date)
      filterLabels.push(
        `to ${dayjs(appliedFilters.end_date).format("DD/MM/YYYY")}`
      );

    if (filterLabels.length > 0) {
      message += ` with ${filterLabels.join(", ")}`;
    }

    return message;
  };

  return (
    <>
      <div className="container-fluid p-0">
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
                  <div className="all-members-list">Crypto Transactions</div>

                  <div className="frame-1597880735">
                    <div className="frame-1597880734">
                      <Button
                        variant="contained"
                        className="excel"
                        sx={{ padding: "0 16px", height: "48px" }}
                        onClick={handleExport}
                        disabled={exporting}
                      >
                        {exporting ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          <>
                            <FileDownloadIcon className="me-2" /> Export
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="frame-15978807352">
                      <Button
                        variant="contained"
                        startIcon={<FilterListIcon />}
                        className="filter"
                        sx={{ padding: "0 16px", height: "48px" }}
                        disableElevation
                        onClick={() => setOpenFilter(true)}
                      >
                        Filter
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="card mw-100 mt-5 rounded-4 border-0">
                  <div className="card-body">
                    <div className="overflow-auto ">
                      <table className="table table-responsive">
                        <thead>
                          <tr
                            className="rounded-4"
                            style={{ backgroundColor: "#EEEEEE" }}
                          >
                            <th>#</th>
                            <th className="main-table">EMAIL</th>
                            <th className="main-table">COIN</th>
                            <th className="main-table">AMOUNT</th>
                            <th className="main-table">TYPE</th>
                            <th className="main-table">STATUS</th>
                            <th className="main-table">CREATED AT</th>
                            <th className="main-table text-center">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={8} className="text-center py-5">
                                <CircularProgress />
                              </td>
                            </tr>
                          ) : transactions.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center py-5">
                                {getNoDataMessage()}
                              </td>
                            </tr>
                          ) : (
                            transactions.map((txn, idx) => (
                              <tr key={txn.id}>
                                <td>
                                  {(currentPage - 1) * resultsPerPage + idx + 1}
                                </td>
                                <td className="main-table">
                                  {txn.user_details?.email || "N/A"}
                                </td>
                                <td className="main-table">
                                  {txn.coin || "N/A"}
                                </td>
                                <td className="main-table">
                                  {txn.amount
                                    ? Number(txn.amount)
                                        .toFixed(18)
                                        .replace(/\.?0+$/, "")
                                    : "N/A"}
                                </td>
                                <td className="main-table">
                                  {txn.transaction_type || "N/A"}
                                </td>
                                <td className="main-table">
                                  <span
                                    className={`badge bg-${
                                      txn.status === "completed"
                                        ? "success"
                                        : "warning"
                                    } py-2`}
                                  >
                                    {txn.status || "N/A"}
                                  </span>
                                </td>
                                <td className="main-table">
                                  {txn.created_at
                                    ? dayjs(txn.created_at).format(
                                        "DD/MM/YYYY hh:mm A"
                                      )
                                    : "N/A"}
                                </td>
                                <td className="main-table">
                                  <div className="d-flex justify-content-around">
                                    <Tooltip title="View Details">
                                      <IconButton
                                        color="info"
                                        onClick={() => handleViewDetails(txn)}
                                      >
                                        <VisibilityRoundedIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="container-fluid mt-4 mb-3">
                      <div className="row align-items-center">
                        <div className="col-md-3">
                          <FormControl variant="standard" fullWidth>
                            <InputLabel id="results-label">
                              Results per page
                            </InputLabel>
                            <Select
                              labelId="results-label"
                              id="results-select"
                              value={resultsPerPage}
                              onChange={handleResultsPerPageChange}
                            >
                              <MenuItem value={10}>10</MenuItem>
                              <MenuItem value={25}>25</MenuItem>
                              <MenuItem value={50}>50</MenuItem>
                              <MenuItem value={100}>100</MenuItem>
                            </Select>
                          </FormControl>
                        </div>
                        <div className="col-md-9 d-flex justify-content-end">
                          <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            disabled={transactions.length === 0}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <Modal
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        aria-labelledby="filter-modal-title"
        aria-describedby="filter-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            bgcolor: "#fff",
            boxShadow: 24,
            p: 3,
            borderRadius: "12px",
          }}
        >
          <Typography
            id="filter-modal-title"
            className="fw-semibold"
            variant="h6"
            component="h2"
          >
            Search Records
          </Typography>
          <hr />

          <div className="row g-3 mt-3">
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <TextField
                fullWidth
                value={filters.email}
                onChange={(e) => handleFilterChange("email", e.target.value)}
                error={!!emailError}
                helperText={emailError}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#f5f5f5",
                  },
                }}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Mobile No.</label>
              <TextField
                fullWidth
                value={filters.mobile_number}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d{0,15}$/.test(value)) {
                    handleFilterChange("mobile_number", value);
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#f5f5f5",
                  },
                }}
                error={!!mobileError}
                helperText={mobileError}
                inputProps={{ maxLength: 15 }}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Start Date</label>
              <TextField
                fullWidth
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  handleFilterChange("start_date", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                error={!!dateError}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#f5f5f5",
                  },
                }}
                inputProps={{
                  min: minAllowedDate,
                  max: maxAllowedDate,
                }}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">End Date</label>
              <TextField
                fullWidth
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!dateError}
                helperText={dateError || ``}
                disabled={!filters.start_date}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#f5f5f5",
                  },
                }}
                inputProps={{
                  min: filters.start_date || minAllowedDate,
                  max: maxAllowedDate,
                }}
              />
            </div>
            <div className="col-6">
              <Button
                variant="contained"
                onClick={() => {
                  setOpenFilter(false);
                  applyFilters();
                }}
                className="me-2 w-100"
                sx={{ height: "45px" }}
              >
                Apply
              </Button>
            </div>
            <div className="col-6">
              <Button
                variant="outlined"
                className="w-100"
                onClick={() => {
                  setOpenFilter(false);
                  resetFilters();
                }}
                sx={{ height: "45px" }}
              >
                Reset
              </Button>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Transaction Details Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent style={{ maxHeight: "80vh", overflow: "auto" }}>
          {selectedTransaction ? (
            <Table>
              <TableBody>
                {/* User Details */}
                {selectedTransaction.user_details && (
                  <>
                    <TableRow>
                      <TableCell style={{ width: "30%" }}>
                        <strong>User Email</strong>
                      </TableCell>
                      <TableCell>
                        {selectedTransaction.user_details.email || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>User Phone Number</strong>
                      </TableCell>
                      <TableCell>
                        {selectedTransaction.user_details.phone_number || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>User Full Name</strong>
                      </TableCell>
                      <TableCell>
                        {selectedTransaction.user_details.full_name || "N/A"}
                      </TableCell>
                    </TableRow>
                  </>
                )}

                {/* Transaction Details */}
                <TableRow>
                  <TableCell>
                    <strong>Coin</strong>
                  </TableCell>
                  <TableCell>{selectedTransaction.coin || "N/A"}</TableCell>
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
                    {selectedTransaction.transaction_type || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={selectedTransaction.status || "N/A"}
                      color={
                        selectedTransaction.status === "completed"
                          ? "success"
                          : "warning"
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Created At</strong>
                  </TableCell>
                  <TableCell>
                    {selectedTransaction.created_at
                      ? dayjs(selectedTransaction.created_at).format(
                          "DD/MM/YYYY hh:mm A"
                        )
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
                        {key.includes("date") || key.includes("_at")
                          ? dayjs(value).format("DD/MM/YYYY hh:mm A")
                          : typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : value}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-4">No transaction details available</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CryptoTransaction;
