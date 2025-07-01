import React, { useEffect, useState } from "react";
import {
  IconButton,
  Pagination,
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
  Chip,
  Box,
  Modal,
  Typography,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import SideNav from "../../components/SideNav";
import TopNav from "../../components/TopNav";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import Loader from "../../components/Loader";

const WalletTopup = () => {
  // Define min and max allowed dates
  const minAllowedDate = "0000-01-01";
  const maxAllowedDate = dayjs().format("YYYY-MM-DD");

  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(maxAllowedDate);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const token = Cookies.get("authToken");

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const getData = async (page = 1, pageSize = resultsPerPage) => {
    setLoading(true);
    try {
      const params = {
        email: email || undefined,
        status: status || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page,
        page_size: pageSize,
      };

      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/wallet/admin/wallet-topups/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (res.data.status === 200) {
        const { topups, pagination: pg } = res.data.data;
        setTransactions(topups);
        setPagination({
          current_page: pg.current_page,
          total_pages: pg.total_pages,
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

  useEffect(() => {
    if (resetTrigger) {
      getData(1);
      setResetTrigger(false);
    }
  }, [resetTrigger]);

  const handleChange = (event) => {
    const value = event.target.value;
    setResultsPerPage(value);
    getData(1, value);
  };

  const handlePageChange = (event, page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
    getData(page, resultsPerPage);
  };

  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setEmailError("");
    setStartDateError("");
    setEndDateError("");

    // Email validation
    const trimmedEmail = email.trim();

    if (
      trimmedEmail &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmedEmail)
    ) {
      setEmailError("Invalid email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Start date validation
    if (startDate) {
      const start = dayjs(startDate);
      const minDate = dayjs(minAllowedDate);
      const maxDate = dayjs(maxAllowedDate);

      if (start.isBefore(minDate)) {
        setStartDateError(
          `Date must be on or after ${minDate.format("DD/MM/YYYY")}`
        );
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
        setEndDateError(
          `Date must be on or after ${minDate.format("DD/MM/YYYY")}`
        );
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
      handleCloseFilter();
    }
  };

  const resetFilters = () => {
    setEmail("");
    setStatus("");
    setStartDate("");
    setEndDate(maxAllowedDate);
    setEmailError("");
    setStartDateError("");
    setEndDateError("");
    setResetTrigger(true);
    handleCloseFilter();
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
    if (!email && !status && !startDate && !endDate) {
      return "No topup transactions found";
    }

    let message = "No topup transactions found";
    const filters = [];

    if (email) filters.push(`email: ${email}`);
    if (status) filters.push(`status: ${status}`);
    if (startDate)
      filters.push(`from ${dayjs(startDate).format("DD/MM/YYYY")}`);
    if (startDate && endDate)
      filters.push(`to ${dayjs(endDate).format("DD/MM/YYYY")}`);

    if (filters.length > 0) {
      message += ` with ${filters.join(" and ")}`;
    }

    return message;
  };

  // Format currency amount
  const formatCurrency = (amount, currency) => {
    if (!amount) return "0.00";

    // Add currency symbols if needed
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
    };

    const symbol = symbols[currency] || currency || "";
    return `${symbol} ${parseFloat(amount).toFixed(2)}`;
  };

  // Export functionality
  const fetchExportData = async () => {
    if (!validateForm()) return;

    setExporting(true);
    try {
      const params = {
        email: email || undefined,
        status: status || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/wallet/admin/wallet-topups/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (res.data.status === 200) {
        const { topups } = res.data.data;
        if (topups.length === 0) {
          alert("No data to export");
          return;
        }

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `wallet_topups_${timestamp}`;

        // Flatten transactions for CSV
        const flattenedTopups = topups.map((topup) => ({
          id: topup.id,
          created_at: topup.created_at,
          completed_at: topup.completed_at,
          user_email: topup.user_email,
          user_full_name: topup.user_full_name,
          currency: topup.currency,
          amount: topup.amount,
          status: topup.status,
          external_transaction_id: topup.external_transaction_id,
          airopay_transaction_id: topup.airopay_transaction_id,
          charge_link: topup.charge_link,
        }));

        // Define CSV columns
        const columns = [
          { id: "id", title: "ID" },
          { id: "created_at", title: "Created At" },
          { id: "completed_at", title: "Completed At" },
          { id: "user_email", title: "User Email" },
          { id: "user_full_name", title: "User Full Name" },
          { id: "currency", title: "Currency" },
          { id: "amount", title: "Amount" },
          { id: "status", title: "Status" },
          { id: "external_transaction_id", title: "External Transaction ID" },
          { id: "airopay_transaction_id", title: "Airopay Transaction ID" },
          { id: "charge_link", title: "Charge Link" },
        ];

        // Escape CSV fields
        const escapeField = (field) => {
          if (field == null) return "";
          const str = String(field);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        };

        // Generate CSV content
        const headerRow = columns
          .map((col) => escapeField(col.title))
          .join(",");
        const dataRows = flattenedTopups.map((topup) =>
          columns.map((col) => escapeField(topup[col.id])).join(",")
        );

        const csvContent = [headerRow, ...dataRows].join("\n");
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });

        // Trigger download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.csv`;
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Export failed:", res.data.message);
        alert("Failed to export data");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Error exporting data");
    } finally {
      setExporting(false);
    }
  };

  // Format status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      completed: "success",
      initiated: "warning",
      failed: "error",
    };

    const color = statusMap[status.toLowerCase()] || "default";
    const label = status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <Chip label={label} color={color} className="text-white" size="small" />
    );
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
                      <div className="all-members-list">Wallet Topup</div>

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
                        {transactions.length === 0 ? (
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
                                    <th className="main-table">USER NAME</th>
                                    <th className="main-table">USER EMAIL</th>
                                    <th className="main-table">CURRENCY</th>
                                    <th className="main-table">AMOUNT</th>
                                    <th className="main-table">STATUS</th>
                                    <th className="main-table">
                                      TRANSACTION TIME
                                    </th>
                                    <th className="main-table text-center">
                                      ACTION
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {loading ? (
                                    <tr>
                                      <td
                                        colSpan={8}
                                        className="text-center py-5"
                                      >
                                        <CircularProgress />
                                      </td>
                                    </tr>
                                  ) : transactions.length === 0 ? (
                                    <tr>
                                      <td
                                        colSpan={8}
                                        className="text-center py-5"
                                      >
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
                                          {txn?.user_full_name || "N/A"}
                                        </td>
                                        <td className="main-table">
                                          {txn?.user_email || "N/A"}
                                        </td>
                                        <td className="main-table">
                                          {txn.currency || "N/A"}
                                        </td>
                                        <td className="main-table">
                                          {formatCurrency(
                                            txn.amount,
                                            txn.currency
                                          )}
                                        </td>
                                        <td className="main-table">
                                          {getStatusBadge(txn.status)}
                                        </td>
                                        <td>
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
                                      onChange={handleChange}
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
                                    disabled={transactions.length === 0}
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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
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
                    <label className="form-label">Status</label>
                    <FormControl fullWidth>
                      <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        sx={{
                          "& .MuiSelect-select": {
                            borderRadius: "12px",
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="initiated">Initiated</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                      </Select>
                    </FormControl>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Start Date</label>
                    <TextField
                      fullWidth
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (startDateError) setStartDateError("");
                      }}
                      InputLabelProps={{ shrink: true }}
                      error={!!startDateError}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                      helperText={startDateError ? "" : ``}
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
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        if (endDateError) setEndDateError("");
                      }}
                      InputLabelProps={{ shrink: true }}
                      error={!!endDateError}
                      helperText={endDateError || ``}
                      disabled={!startDate}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                      inputProps={{
                        min: startDate || minAllowedDate,
                        max: maxAllowedDate,
                      }}
                    />
                  </div>

                  <div className="col-6">
                    <Button
                      variant="contained"
                      onClick={handleFilterSubmit}
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
              onClose={() => setOpen(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Topup Transaction Details</DialogTitle>
              <DialogContent style={{ maxHeight: "80vh", overflow: "auto" }}>
                {selectedTransaction ? (
                  <Table>
                    <TableBody>
                      {Object.entries(selectedTransaction).map(
                        ([key, value]) => {
                          let displayValue;

                          // Format date values
                          if (
                            typeof value === "string" &&
                            (key.includes("date") || key.includes("_at"))
                          ) {
                            displayValue = value
                              ? dayjs(value).format("DD/MM/YYYY hh:mm A")
                              : "-";
                          }
                          // Handle all other nested objects
                          else if (
                            typeof value === "object" &&
                            value !== null
                          ) {
                            displayValue = (
                              <Table size="small">
                                <TableBody>
                                  {Object.entries(value).map(
                                    ([subKey, subVal]) => (
                                      <TableRow key={subKey}>
                                        <TableCell style={{ width: "30%" }}>
                                          <strong>{formatKey(subKey)}</strong>
                                        </TableCell>
                                        <TableCell>
                                          {typeof subVal === "boolean" ? (
                                            <Chip
                                              label={subVal ? "Yes" : "No"}
                                              color={
                                                subVal ? "success" : "default"
                                              }
                                              size="small"
                                            />
                                          ) : subKey.includes("date") ||
                                            subKey.includes("_at") ? (
                                            subVal ? (
                                              dayjs(subVal).format(
                                                "DD/MM/YYYY hh:mm A"
                                              )
                                            ) : (
                                              "-"
                                            )
                                          ) : subVal === null ||
                                            subVal === "" ? (
                                            "-"
                                          ) : (
                                            subVal.toString()
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            );
                          }
                          // Default case: show plain values
                          else {
                            displayValue = value || "-";
                          }

                          return (
                            <TableRow key={key}>
                              <TableCell style={{ width: "30%" }}>
                                <strong>{formatKey(key)}</strong>
                              </TableCell>
                              <TableCell>{displayValue}</TableCell>
                            </TableRow>
                          );
                        }
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
        </>
      )}
    </>
  );
};

export default WalletTopup;
