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
  TextField,
  Button,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Modal,
  Box,
  Typography,
  Switch,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import SideNav from "../../components/SideNav";
import TopNav from "../../components/TopNav";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import axios from "axios";

const BankAccountList = () => {
  // Define min and max allowed dates
  const minAllowedDate = "0000-01-01";
  const maxAllowedDate = dayjs().format("YYYY-MM-DD");

  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [accounts, setAccounts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    email: "",
    currency: "",
    start_date: "",
    end_date: maxAllowedDate,
  });
  const [appliedFilters, setAppliedFilters] = useState({
    email: "",
    currency: "",
    start_date: "",
    end_date: maxAllowedDate,
  });

  // Validation states
  const [emailError, setEmailError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");

  const token = Cookies.get("authToken");

  const fetchAccounts = async (page = 1, pageSize = resultsPerPage) => {
    setLoading(true);
    try {
      const params = {
        email: appliedFilters.email || undefined,
        start_date: appliedFilters.start_date || undefined,
        end_date: appliedFilters.end_date || undefined,
        currency: appliedFilters.currency || undefined,
        page,
        page_size: pageSize,
      };

      // Remove undefined parameters
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/wallet/admin/bank-accounts/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (res.data.status === 200) {
        const { accounts: accts, pagination: pg } = res.data.data;
        setAccounts(accts);
        setTotalPages(pg.total_pages);
        setCurrentPage(pg.current_page);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (token) fetchAccounts(currentPage); 
}, [token, appliedFilters, resultsPerPage, currentPage]);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleResultsPerPageChange = (event) => {
    setResultsPerPage(event.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors when field changes
    if (name === "email") setEmailError("");
    if (name === "start_date") setStartDateError("");
    if (name === "end_date") setEndDateError("");
  };

  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setEmailError("");
    setStartDateError("");
    setEndDateError("");

    // Email validation
    const trimmedEmail = filters.email.trim();

    if (
      trimmedEmail &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmedEmail)
    ) {
      setEmailError("Invalid email address");
      isValid = false;
    }

    // Start date validation
    if (filters.start_date) {
      const start = dayjs(filters.start_date);
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
    if (filters.end_date) {
      const end = dayjs(filters.end_date);
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
    if (filters.start_date && filters.end_date) {
      const start = dayjs(filters.start_date);
      const end = dayjs(filters.end_date);

      if (end.isBefore(start)) {
        setEndDateError("End date must be after start date");
        isValid = false;
      }
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
      currency: "",
      start_date: "",
      end_date: maxAllowedDate,
    });
    setAppliedFilters({
      email: "",
      currency: "",
      start_date: "",
      end_date: maxAllowedDate,
    });
    setEmailError("");
    setStartDateError("");
    setEndDateError("");
    setCurrentPage(1);
    setOpenFilter(false);
  };

  const handleViewDetails = (account) => {
    setSelectedAccount(account);
    setOpen(true);
  };

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

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
      !appliedFilters.currency &&
      !appliedFilters.start_date &&
      !appliedFilters.end_date
    ) {
      return "No bank accounts found";
    }

    let message = "No bank accounts found";
    const filterLabels = [];

    if (appliedFilters.email) filterLabels.push(`email: ${appliedFilters.email}`);
    if (appliedFilters.currency) filterLabels.push(`currency: ${appliedFilters.currency}`);
    if (appliedFilters.start_date)
      filterLabels.push(`from ${dayjs(appliedFilters.start_date).format("DD/MM/YYYY")}`);
    if (appliedFilters.end_date)
      filterLabels.push(`to ${dayjs(appliedFilters.end_date).format("DD/MM/YYYY")}`);

    if (filterLabels.length > 0) {
      message += ` with ${filterLabels.join(", ")}`;
    }

    return message;
  };

  const fetchExportData = async () => {
    if (!validateForm()) return;

    setExporting(true);
    try {
      const params = {
        email: appliedFilters.email || undefined,
        start_date: appliedFilters.start_date || undefined,
        end_date: appliedFilters.end_date || undefined,
        currency: appliedFilters.currency || undefined,
      };

      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/wallet/admin/bank-accounts/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (res.data.status === 200) {
        const { accounts: accts } = res.data.data;
        if (accts.length === 0) {
          alert("No data to export");
          return;
        }

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `bank_accounts_${timestamp}`;

        // Flatten accounts for CSV
        const flattenedAccounts = accts.map((account) => ({
          id: account.id,
          created_at: account.created_at,
          account_number: account.account_number,
          currency: account.currency,
          balance: account.balance,
          bank_name: account.bank_name || "",
          account_holder_name: account.account_holder_name || "",
          user_email: account.user_details?.email || "",
          user_phone: account.user_details?.phone_number || "",
          user_full_name: account.user_details?.full_name || "",
        }));

        // Define CSV columns
        const columns = [
          { id: "id", title: "ID" },
          { id: "created_at", title: "Created At" },
          { id: "account_number", title: "Account Number" },
          { id: "currency", title: "Currency" },
          { id: "balance", title: "Balance" },
          { id: "bank_name", title: "Bank Name" },
          { id: "account_holder_name", title: "Account Holder" },
          { id: "user_email", title: "User Email" },
          { id: "user_phone", title: "User Phone" },
          { id: "user_full_name", title: "User Full Name" },
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
        const dataRows = flattenedAccounts.map((account) =>
          columns.map((col) => escapeField(account[col.id])).join(",")
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

  return (
    <>
      <div className="container-fluid p-0">
        <TopNav />
        <div className="row m-0">
          <div className="col-3 p-0" style={{ maxHeight: "100%", overflowY: "auto" }}>
            <SideNav />
          </div>
          <div className="col-9">
            <div className="row m-0">
              <div
                className="col-12 py-3"
                style={{ background: "#EEEEEE", minHeight: "93vh" }}
              >
                <div className="frame-1597880849">
                  <div className="all-members-list">Bank Accounts</div>

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
                          <><FileDownloadIcon className="me-2" /> Export</>
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
                    <div className="overflow-auto ">
                      <table className="table table-responsive">
                        <thead>
                          <tr
                            className="rounded-4"
                            style={{ backgroundColor: "#EEEEEE" }}
                          >
                            <th>#</th>
                            <th className="main-table">USER NAME</th>
                            <th className="main-table">EMAIL</th>
                            <th className="main-table">ACCOUNT NUMBER</th>
                            <th className="main-table">CURRENCY</th>
                            <th className="main-table">BALANCE</th>
                            <th className="text-center">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={7} className="text-center py-5">
                                <CircularProgress />
                              </td>
                            </tr>
                          ) : accounts.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-5">
                                {getNoDataMessage()}
                              </td>
                            </tr>
                          ) : (
                            accounts.map((account, index) => (
                              <tr key={account.id}>
                                <td>
                                  {(currentPage - 1) * resultsPerPage + index + 1}
                                </td>
                                <td className="main-table">{account.user_details?.full_name || "N/A"}</td>
                                <td className="main-table">{account.user_details?.email || "N/A"}</td>
                                <td className="main-table">{account.account_number || "N/A"}</td>
                                <td className="main-table">{account.currency || "N/A"}</td>
                                <td className="main-table">{account.balance || "0.00"}</td>
                                <td>
                                  <div className="d-flex justify-content-around">
                                    <Tooltip title="View Details">
                                      <IconButton
                                        color="info"
                                        onClick={() => handleViewDetails(account)}
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
                            disabled={accounts.length === 0}
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
              <label className="form-label">Currency</label>
              <FormControl fullWidth>
                <Select
                  value={filters.currency}
                  onChange={(e) => handleFilterChange("currency", e.target.value)}
                  sx={{
                    "& .MuiSelect-select": {
                      borderRadius: "12px",
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  <MenuItem value="">All Currencies</MenuItem>
                  <MenuItem value="AED">AED</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
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
                error={!!startDateError}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#f5f5f5",
                  },
                }}
                helperText={startDateError || ""}
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
                error={!!endDateError}
                helperText={endDateError || ""}
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
            <div className="col-6 mt-4">
              <Button
                variant="contained"
                onClick={applyFilters}
                className="me-2 w-100"
                sx={{ height: "45px" }}
              >
                Apply
              </Button>
            </div>
            <div className="col-6 mt-4">
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

      {/* Account Details Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Bank Account Details</DialogTitle>
        <DialogContent style={{ maxHeight: "80vh", overflow: "auto" }}>
          {selectedAccount ? (
            <Table>
              <TableBody>
                {/* User Details */}
                {selectedAccount.user_details && (
                  <>
                    <TableRow>
                      <TableCell style={{ width: "30%" }}>
                        <strong>User Name</strong>
                      </TableCell>
                      <TableCell>
                        {selectedAccount.user_details.full_name || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>User Email</strong>
                      </TableCell>
                      <TableCell>
                        {selectedAccount.user_details.email || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>User Phone</strong>
                      </TableCell>
                      <TableCell>
                        {selectedAccount.user_details.phone_number || "N/A"}
                      </TableCell>
                    </TableRow>
                  </>
                )}

                {/* Account Details */}
                <TableRow>
                  <TableCell>
                    <strong>Account Number</strong>
                  </TableCell>
                  <TableCell>
                    {selectedAccount.account_number || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Currency</strong>
                  </TableCell>
                  <TableCell>
                    {selectedAccount.currency || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Balance</strong>
                  </TableCell>
                  <TableCell>
                    {selectedAccount.balance || "0.00"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Bank Name</strong>
                  </TableCell>
                  <TableCell>
                    {selectedAccount.bank_name || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Account Holder</strong>
                  </TableCell>
                  <TableCell>
                    {selectedAccount.account_holder_name || "N/A"}
                  </TableCell>
                </TableRow>

                {/* Additional Fields */}
                {Object.entries(selectedAccount)
                  .filter(
                    ([key]) =>
                      ![
                        "user_details",
                        "account_number",
                        "currency",
                        "balance",
                        "bank_name",
                        "account_holder_name",
                      ].includes(key)
                  )
                  .map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>
                        <strong>{formatKey(key)}</strong>
                      </TableCell>
                      <TableCell>
                        {typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : value}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-4">No account details available</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BankAccountList;