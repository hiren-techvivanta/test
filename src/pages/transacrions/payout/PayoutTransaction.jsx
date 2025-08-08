import React, { useState, useEffect } from "react";
import SideNav from "../../../components/SideNav";
import TopNav from "../../../components/TopNav";
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
  Box,
  Typography,
  Pagination,
  Modal,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import Loader from "../../../components/Loader";

const PayoutTransaction = () => {
  // State management
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    email: "",
    mobile_number: "",
    status: "success", // Default to success
    transaction_type: "", // All by default
    start_date: "",
    end_date: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    email: "",
    mobile_number: "",
    status: "success", // Default to success
    transaction_type: "",
    start_date: "",
    end_date: "",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_transactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Constants
  const token = Cookies.get("authToken");
  const today = dayjs().format("YYYY-MM-DD");
  const minDate = "1970-01-01";

  // Fetch transaction data
  const getData = async (page = 1, pageSize = resultsPerPage) => {
    setLoading(true);
    try {
      const params = {
        ...appliedFilters,
        page,
        page_size: pageSize,
      };

      // Clean undefined parameters
      Object.keys(params).forEach(
        (key) => params[key] === "" && delete params[key]
      );

      const res = await axios.get(
        `http://185.131.54.50:8000/api/finunique/admin/payout-payin/transactions-history`,
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
      toast.error(error.response?.data?.message || "Internal server error");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (token) getData();
  }, [token, appliedFilters, resultsPerPage]);

  // Validate form inputs
  const validateForm = () => {
    const errors = {};

    // Email validation with regex
    const trimmedEmail = filters.email.trim();
    if (
      trimmedEmail &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(trimmedEmail)
    ) {
      errors.email = "Please enter a valid email address";
    }

    // Mobile number validation (8 to 15 digits)
    const trimmedMobile = filters.mobile_number.trim();
    if (trimmedMobile) {
      // Remove any non-digit characters for validation
      const cleanMobile = trimmedMobile.replace(/\D/g, '');
      if (cleanMobile.length < 8 || cleanMobile.length > 15) {
        errors.mobile_number = "Mobile number must be 8 to 15 digits";
      } else if (!/^\+?[1-9]\d{7,14}$/.test(trimmedMobile)) {
        errors.mobile_number = "Please enter a valid mobile number";
      }
    }

    // Date validation
    const start = dayjs(filters.start_date);
    const end = dayjs(filters.end_date);

    if (filters.start_date && start.isAfter(dayjs())) {
      errors.date = "Start date cannot be in the future";
    }

    if (filters.end_date && end.isAfter(dayjs())) {
      errors.date = "End date cannot be in the future";
    }

    if (filters.start_date && start.isBefore(dayjs(minDate))) {
      errors.date = `Start date must be after ${dayjs(minDate).format(
        "DD/MM/YYYY"
      )}`;
    }

    if (filters.end_date && end.isBefore(dayjs(minDate))) {
      errors.date = `End date must be after ${dayjs(minDate).format(
        "DD/MM/YYYY"
      )}`;
    }

    if (filters.start_date && filters.end_date && start.isAfter(end)) {
      errors.date = "End date must be after start date";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Apply filters
  const applyFilters = () => {
    if (validateForm()) {
      setAppliedFilters({ ...filters });
      setPagination((prev) => ({ ...prev, current_page: 1 }));
      handleCloseFilter();
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      email: "",
      mobile_number: "",
      status: "success", // Reset to default success
      transaction_type: "",
      start_date: "",
      end_date: today,
    });
    setAppliedFilters({
      email: "",
      mobile_number: "",
      status: "success", // Reset to default success
      transaction_type: "",
      start_date: "",
      end_date: today,
    });
    setValidationErrors({});
  };

  // Handle page change
  const handlePageChange = (event, page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
    getData(page);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setResultsPerPage(newSize);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
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
    if (
      !appliedFilters.email &&
      !appliedFilters.mobile_number &&
      !appliedFilters.status &&
      !appliedFilters.transaction_type &&
      !appliedFilters.start_date &&
      !appliedFilters.end_date
    ) {
      return "No transactions found";
    }

    const filterLabels = [];
    if (appliedFilters.email) filterLabels.push(`email: ${appliedFilters.email}`);
    if (appliedFilters.mobile_number) 
      filterLabels.push(`mobile: ${appliedFilters.mobile_number}`);
    if (appliedFilters.status && appliedFilters.status !== "")
      filterLabels.push(`status: ${appliedFilters.status}`);
    if (appliedFilters.transaction_type && appliedFilters.transaction_type !== "")
      filterLabels.push(`type: ${appliedFilters.transaction_type}`);
    if (appliedFilters.start_date)
      filterLabels.push(
        `from ${dayjs(appliedFilters.start_date).format("DD/MM/YYYY")}`
      );
    if (appliedFilters.start_date && appliedFilters.end_date)
      filterLabels.push(
        `to ${dayjs(appliedFilters.end_date).format("DD/MM/YYYY")}`
      );

    return `No transactions found with ${filterLabels.join(", ")}`;
  };

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when field changes
    if (name === "email")
      setValidationErrors((prev) => ({ ...prev, email: "" }));
    if (name === "mobile_number")
      setValidationErrors((prev) => ({ ...prev, mobile_number: "" }));
    if (name === "start_date" || name === "end_date")
      setValidationErrors((prev) => ({ ...prev, date: "" }));
  };

  // Open/close filter modal
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  // Export data to CSV
  const fetchExportData = async () => {
    setExporting(true);
    try {
      const params = { 
        ...appliedFilters,
        page: 1,
        page_size: 10000 // Large page size to get all data
      };

      // Clean undefined parameters
      Object.keys(params).forEach(
        (key) => params[key] === "" && delete params[key]
      );

      const res = await axios.get(
        `http://185.131.54.50:8000/api/finunique/admin/payout-payin/transactions-history`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (res.data.status === 200 && res.data.data.transactions.length > 0) {
        const { transactions } = res.data.data;
        const headers = [
          "Transaction ID",
          "Client Order ID",
          "Created At",
          "Mobile",
          "Payable Amount",
          "Status",
          "Message",
          "UTR",
          "Transaction Type",
          "User Email",
          "User Phone",
          "User Full Name",
        ];

        const rows = transactions.map((txn) => [
          txn.id,
          txn.client_order_id,
          dayjs(txn.created_at).format("YYYY-MM-DD HH:mm:ss"),
          txn.mobile,
          txn.payable_amount,
          txn.status,
          txn.message,
          txn.utr || "",
          txn.transaction_type,
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
          `payout_transactions_${dayjs().format("YYYYMMDD_HHmmss")}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Export completed successfully!");
      } else {
        toast.info("No data available for export");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      {loading === true ? (
        <Loader />
      ) : (
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
                    <div className="all-members-list">Payout Transactions</div>

                    <div className="frame-1597880735">
                      <div className="frame-1597880734">
                        <Button
                          variant="contained"
                          className="excel"
                          sx={{ padding: "0 16px", height: "48px" }}
                          onClick={fetchExportData}
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
                          onClick={handleOpenFilter}
                        >
                          Filter
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="card mw-100 mt-5 rounded-4 border-0">
                    <div className="card-body">
                      {transactions?.length === 0 ? (
                        <h5 className="text-center">{getNoDataMessage()}</h5>
                      ) : (
                        <>
                          <div className="overflow-auto">
                            <table className="table table-responsive">
                              <thead>
                                <tr
                                  className="rounded-4"
                                  style={{ backgroundColor: "#EEEEEE" }}
                                >
                                  <th>#</th>
                                  <th className="main-table">DATE & TIME</th>
                                  <th className="main-table">USER</th>
                                  <th className="main-table">MOBILE</th>
                                  <th className="main-table-2">AMOUNT</th>
                                  <th className="main-table-2">STATUS</th>
                                  <th className="main-table-2">TYPE</th>
                                  <th className="main-table">ORDER ID</th>
                                  <th className="text-center">ACTION</th>
                                </tr>
                              </thead>
                              <tbody>
                                {loading ? (
                                  <tr>
                                    <td colSpan={9} className="text-center py-5">
                                      <CircularProgress />
                                    </td>
                                  </tr>
                                ) : transactions.length === 0 ? (
                                  <tr>
                                    <td colSpan={9} className="text-center py-5">
                                      {getNoDataMessage()}
                                    </td>
                                  </tr>
                                ) : (
                                  transactions.map((txn, idx) => (
                                    <tr key={txn.id}>
                                      <td>
                                        {(pagination.current_page - 1) *
                                          resultsPerPage +
                                          idx +
                                          1}
                                      </td>
                                      <td className="main-table">
                                        {dayjs(txn.created_at).format(
                                          "DD/MM/YYYY hh:mm A"
                                        )}
                                      </td>
                                      <td className="main-table">
                                        {txn.user_details?.full_name || "-"}
                                      </td>
                                      <td className="main-table">
                                        {txn.mobile}
                                      </td>
                                      <td>${txn.payable_amount}</td>
                                      <td>
                                        <span
                                          className={`badge text-capitalize bg-${
                                             txn.status === "success"
                                              ? "success"
                                              : txn.status === "processed"
                                              ? "warning"
                                              : "danger"
                                          } py-2`}
                                        >
                                          {txn.status}
                                        </span>
                                      </td>
                                      <td>
                                        <span
                                          className={`badge text-capitalize bg-${
                                            txn.transaction_type === "credit"
                                              ? "success"
                                              : "danger"
                                          } py-2`}
                                        >
                                          {txn.transaction_type}
                                        </span>
                                      </td>
                                      <td className="main-table">
                                        {txn.client_order_id}
                                      </td>
                                      <td>
                                        <div className="d-flex justify-content-around">
                                          <Tooltip title="View Details">
                                            <IconButton
                                              color="info"
                                              onClick={() =>
                                                handleViewDetails(txn)
                                              }
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
                                    onChange={handleRowsPerPageChange}
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
                                  count={pagination.total_pages}
                                  page={pagination.current_page}
                                  onChange={handlePageChange}
                                  color="primary"
                                />
                              </div>
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

          {/* Filter Modal */}
          <Modal
            open={openFilter}
            onClose={handleCloseFilter}
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
                    onChange={(e) =>
                      handleFilterChange("email", e.target.value)
                    }
                    error={!!validationErrors.email}
                    helperText={validationErrors.email}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Mobile Number</label>
                  <TextField
                    fullWidth
                    value={filters.mobile_number}
                    onChange={(e) =>
                      handleFilterChange("mobile_number", e.target.value)
                    }
                    error={!!validationErrors.mobile_number}
                    helperText={validationErrors.mobile_number}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <FormControl fullWidth>
                    <Select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      sx={{
                        "& .MuiSelect-select": {
                          borderRadius: "12px",
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="success">Success</MenuItem>
                      <MenuItem value="processed">Processed</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Transaction Type</label>
                  <FormControl fullWidth>
                    <Select
                      value={filters.transaction_type}
                      onChange={(e) =>
                        handleFilterChange("transaction_type", e.target.value)
                      }
                      sx={{
                        "& .MuiSelect-select": {
                          borderRadius: "12px",
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="credit">Credit</MenuItem>
                      <MenuItem value="debit">Debit</MenuItem>
                    </Select>
                  </FormControl>
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
                    error={!!validationErrors.date}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                    inputProps={{
                      min: minDate,
                      max: today,
                    }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">End Date</label>
                  <TextField
                    fullWidth
                    type="date"
                    value={filters.end_date || today}
                    onChange={(e) =>
                      handleFilterChange("end_date", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    error={!!validationErrors.date}
                    helperText={validationErrors.date || ``}
                    disabled={!filters.start_date}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                    inputProps={{
                      min: filters.start_date || minDate,
                      max: today,
                    }}
                  />
                </div>
                <div className="col-6">
                  <Button
                    variant="contained"
                    onClick={applyFilters}
                    className="me-2 w-100"
                    sx={{ height: "45px" }}
                  >
                    Apply Filters
                  </Button>
                </div>
                <div className="col-6">
                  <Button
                    variant="outlined"
                    className="w-100"
                    onClick={() => {
                      resetFilters();
                      handleCloseFilter();
                    }}
                    sx={{ height: "45px" }}
                  >
                    Reset Filters
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
                    {Object.entries(selectedTransaction).map(([key, value]) => {
                      // Skip user_details object - we'll handle it separately
                      if (key === "user_details") return null;

                      let displayValue = value;

                      // Format date values
                      if (
                        typeof value === "string" &&
                        (key.includes("date") || key.includes("_at"))
                      ) {
                        displayValue = value
                          ? dayjs(value).format("DD/MM/YYYY hh:mm A")
                          : "-";
                      }

                      return (
                        <TableRow key={key}>
                          <TableCell style={{ width: "30%" }}>
                            <strong>{formatKey(key)}</strong>
                          </TableCell>
                          <TableCell>{displayValue || "-"}</TableCell>
                        </TableRow>
                      );
                    })}

                    {/* Special handling for user_details */}
                    {selectedTransaction.user_details && (
                      <TableRow>
                        <TableCell colSpan={2}>
                          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                            User Details
                          </Typography>
                          <Table size="small">
                            <TableBody>
                              {Object.entries(
                                selectedTransaction.user_details
                              ).map(([key, value]) => (
                                <TableRow key={key}>
                                  <TableCell style={{ width: "30%" }}>
                                    <strong>{formatKey(key)}</strong>
                                  </TableCell>
                                  <TableCell>{value || "-"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4">
                  No transaction details available
                </p>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
};

export default PayoutTransaction;
