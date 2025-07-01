import React, { useState, useEffect } from "react";
import {
  IconButton,
  Pagination,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Switch,
  TableHead,
  Box,
  Typography,
  Modal,
} from "@mui/material";
import SideNav from "../../../components/SideNav";
import TopNav from "../../../components/TopNav";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Loader from "../../../components/Loader";

const MobileRechargeTransaction = () => {
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [open, setOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    email: "",
    mobile_number: "",
    status: "",
    start_date: "",
    end_date: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    email: "",
    mobile_number: "",
    status: "",
    start_date: "",
    end_date: "",
  });

  // Validation states
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [dateError, setDateError] = useState("");

  const token = Cookies.get("authToken");

  // Date constraints
  const MIN_DATE = "0000-01-01";
  const today = dayjs().format("YYYY-MM-DD");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: resultsPerPage,
        ...appliedFilters,
      };

      Object.keys(params).forEach(
        (key) => params[key] === "" && delete params[key]
      );

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/utility-app/admin/mobile-transactions/`,
        {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 200) {
        setTransactions(response.data.data.transactions);
        setTotalPages(response.data.data.pagination.total_pages);
      } else {
        toast.error(response.data.error || "Failed to fetch data");
      }
    } catch (e) {
      toast.error(e.response?.data?.error || "Internal server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTransactions();
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
    let dateErrorMsg = "";
    const todayObj = dayjs().startOf("day");
    const minDateObj = dayjs(MIN_DATE);

    // Email validation
    const trimmedEmail = filters.email.trim();
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
      setMobileError("Mobile must be 8 to 10 digits");
      isValid = false;
    } else {
      setMobileError("");
    }

    // Date validation
    if (filters.start_date) {
      const start = dayjs(filters.start_date);
      if (start.isBefore(minDateObj)) {
        dateErrorMsg = "Start date cannot be before 0000-01-01";
      } else if (start.isAfter(todayObj)) {
        dateErrorMsg = "Start date cannot be in the future";
      }
    }

    if (filters.end_date && !dateErrorMsg) {
      const end = dayjs(filters.end_date);
      if (end.isBefore(minDateObj)) {
        dateErrorMsg = "End date cannot be before 0000-01-01";
      } else if (end.isAfter(todayObj)) {
        dateErrorMsg = "End date cannot be in the future";
      }
    }

    if (filters.start_date && filters.end_date && !dateErrorMsg) {
      if (dayjs(filters.start_date).isAfter(dayjs(filters.end_date))) {
        dateErrorMsg = "End date must be after start date";
      }
    }

    if (dateErrorMsg) {
      setDateError(dateErrorMsg);
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
      setOpenFilter(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      email: "",
      mobile_number: "",
      status: "",
      start_date: "",
      end_date: today,
    });
    setAppliedFilters({
      email: "",
      mobile_number: "",
      status: "",
      start_date: "",
      end_date: today,
    });
    setEmailError("");
    setMobileError("");
    setDateError("");
    setCurrentPage(1);
    setOpenFilter(false);
  };

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const handleOpenModal = (transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedTransaction(null);
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
      !appliedFilters.end_date &&
      !appliedFilters.status
    ) {
      return "No transactions found";
    }

    let message = "No transactions found";
    const filterLabels = [];

    if (appliedFilters.email)
      filterLabels.push(`email: ${appliedFilters.email}`);
    if (appliedFilters.mobile_number)
      filterLabels.push(`mobile: ${appliedFilters.mobile_number}`);
    if (appliedFilters.status)
      filterLabels.push(`status: ${appliedFilters.status}`);
    if (appliedFilters.start_date)
      filterLabels.push(
        `from ${dayjs(appliedFilters.start_date).format("DD/MM/YYYY")}`
      );
    if (appliedFilters.start_date && appliedFilters.end_date)
      filterLabels.push(
        `to ${dayjs(appliedFilters.end_date).format("DD/MM/YYYY")}`
      );

    if (filterLabels.length > 0) {
      message += ` with ${filterLabels.join(", ")}`;
    }

    return message;
  };

  // Handle CSV export
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

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/utility-app/admin/mobile-transactions/`,
        {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 200) {
        const transactions = response.data.data.transactions;
        if (transactions.length === 0) {
          toast.info("No data to export");
          return;
        }

        // Create CSV content
        const headers = [
          "ID",
          "Order ID",
          "Client Order ID",
          "Mobile Number",
          "Operator Code",
          "Amount",
          "Status",
          "Recharge Type",
          "UTR",
          "Created At",
          "User Name",
          "User Email",
          "User Phone",
        ];

        const rows = transactions.map((txn) => [
          txn.id,
          txn.order_id,
          txn.client_order_id,
          txn.number,
          txn.operator_code,
          txn.amount,
          txn.status === "1" ? "Success" : "Failed",
          txn.recharge_type,
          txn.utr,
          dayjs(txn.created_at).format("DD/MM/YYYY hh:mm A"),
          txn.user_details?.full_name || "",
          txn.user_details?.email || "",
          txn.user_details?.phone_number || "",
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
        link.download = `mobile_recharge_${timestamp}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        toast.error("Failed to fetch data for export");
      }
    } catch (error) {
      toast.error(
        "Export failed: " +
          (error.response?.data?.error || "Internal server error")
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      {loading === true ? (
        <>
          <Loader />
        </>
      ) : (
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
                      <div className="all-members-list">
                        Mobile Recharge Transactions
                      </div>

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
                          <>
                            <h5 className="text-center">
                              {getNoDataMessage()}
                            </h5>
                          </>
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
                                    <th className="main-table">
                                      OPERATOR CODE
                                    </th>
                                    <th className="main-table">USER NAME</th>
                                    <th className="main-table">EMAIL</th>
                                    <th className="main-table">MOBILE NO.</th>
                                    <th className="main-table">STATUS</th>
                                    <th className="main-table">AMOUNT</th>
                                    <th className="main-table text-center">
                                      ACTION
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {loading ? (
                                    <tr>
                                      <td
                                        colSpan={9}
                                        className="text-center py-5"
                                      >
                                        <CircularProgress />
                                      </td>
                                    </tr>
                                  ) : transactions.length === 0 ? (
                                    <tr>
                                      <td
                                        colSpan={9}
                                        className="text-center py-5"
                                      >
                                        {getNoDataMessage()}
                                      </td>
                                    </tr>
                                  ) : (
                                    transactions.map((txn, index) => (
                                      <tr key={txn.id}>
                                        <td>
                                          {(currentPage - 1) * resultsPerPage +
                                            index +
                                            1}
                                        </td>
                                        <td className="main-table">
                                          {dayjs(txn.created_at).format(
                                            "DD/MM/YYYY hh:mm A"
                                          )}
                                        </td>
                                        <td className="main-table">
                                          {txn.operator_code}
                                        </td>
                                        <td className="main-table">
                                          {txn.user_details?.full_name || "N/A"}
                                        </td>
                                        <td className="main-table">
                                          {txn.user_details?.email || "N/A"}
                                        </td>
                                        <td className="main-table">
                                          {txn.user_details?.phone_number ||
                                            "N/A"}
                                        </td>
                                        <td className="main-table">
                                          <span
                                            className={`badge bg-${
                                              txn.status === "1"
                                                ? "success"
                                                : "danger"
                                            } py-2`}
                                          >
                                            {txn.status === "1"
                                              ? "Success"
                                              : "Failed"}
                                          </span>
                                        </td>
                                        <td className="main-table">
                                          $ {txn.amount}
                                        </td>
                                        <td className="main-table">
                                          <div className="d-flex justify-content-around">
                                            <Tooltip title="View Details">
                                              <IconButton
                                                color="info"
                                                onClick={() =>
                                                  handleOpenModal(txn)
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
                    helperText={dateError ? "" : ``}
                    inputProps={{
                      min: MIN_DATE,
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
                      min: filters.start_date || MIN_DATE,
                      max: today,
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
                      <MenuItem value="1">Success</MenuItem>
                      <MenuItem value="0">Failed</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="col-md-6"></div>
                <div className="col-6">
                  <Button
                    variant="contained"
                    onClick={applyFilters}
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
                    onClick={resetFilters}
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
            onClose={handleCloseModal}
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
                            <strong>User Name</strong>
                          </TableCell>
                          <TableCell>
                            {selectedTransaction.user_details.full_name ||
                              "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Email</strong>
                          </TableCell>
                          <TableCell>
                            {selectedTransaction.user_details.email || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Mobile</strong>
                          </TableCell>
                          <TableCell>
                            {selectedTransaction.user_details.phone_number ||
                              "N/A"}
                          </TableCell>
                        </TableRow>
                      </>
                    )}

                    {/* Transaction Details */}
                    <TableRow>
                      <TableCell>
                        <strong>Order ID</strong>
                      </TableCell>
                      <TableCell>
                        {selectedTransaction.order_id || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Client Order ID</strong>
                      </TableCell>
                      <TableCell>
                        {selectedTransaction.client_order_id || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Mobile Number</strong>
                      </TableCell>
                      <TableCell>
                        {selectedTransaction.number || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Operator Code</strong>
                      </TableCell>
                      <TableCell>
                        {selectedTransaction.operator_code || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Amount</strong>
                      </TableCell>
                      <TableCell>
                        ${selectedTransaction.amount || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Recharge Type</strong>
                      </TableCell>
                      <TableCell>
                        {selectedTransaction.recharge_type || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Status</strong>
                      </TableCell>
                      <TableCell>
                        {selectedTransaction.status === "1"
                          ? "Success"
                          : "Failed"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>UTR</strong>
                      </TableCell>
                      <TableCell>{selectedTransaction.utr || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Date & Time</strong>
                      </TableCell>
                      <TableCell>
                        {dayjs(selectedTransaction.created_at).format(
                          "DD/MM/YYYY hh:mm A"
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4">
                  No transaction details available
                </p>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};

export default MobileRechargeTransaction;
