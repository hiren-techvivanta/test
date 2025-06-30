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
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import SideNav from "../../components/SideNav";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import TopNav from "../../components/TopNav";
import { InputAdornment, Modal, Box, Typography } from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import EmailIcon from "@mui/icons-material/Email";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

const UserList = () => {
  const today = dayjs().format("YYYY-MM-DD");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    email: "",
    mobile_number: "",
    kyc_status: "",
    start_date: "",
    end_date: today,
  });
  const [appliedFilters, setAppliedFilters] = useState({
    email: "",
    mobile_number: "",
    kyc_status: "",
    start_date: "",
    end_date: today,
  });
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Validation states
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [dateError, setDateError] = useState("");

  const [showing, setShowing] = useState(10);
  const [openFilter, setOpenFilter] = useState(false);

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const token = Cookies.get("authToken");

  // Define date constraints
  const minDate = "0000-01-01";

  const fetchUsers = async () => {
    setLoading(true);

    let url = `${process.env.REACT_APP_BACKEND_URL}/api/auth/admin/users/?page=${currentPage}&page_size=${resultsPerPage}`;

    // Add filters to URL - use appliedFilters instead of filters
    if (appliedFilters.email) url += `&email=${appliedFilters.email}`;
    if (appliedFilters.mobile_number)
      url += `&mobile_number=${appliedFilters.mobile_number}`;
    if (appliedFilters.kyc_status)
      url += `&kyc_status=${appliedFilters.kyc_status}`;
    if (appliedFilters.start_date)
      url += `&start_date=${appliedFilters.start_date}`;
    if (appliedFilters.end_date) url += `&end_date=${appliedFilters.end_date}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.status === 200) {
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.total_pages);
      } else {
        console.error("Failed to fetch users:", data.message);
      }
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [currentPage, resultsPerPage, token, appliedFilters]);

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

    // ✅ Email validation
    if (
      trimmedEmail &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmedEmail)
    ) {
      setEmailError("Invalid email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    // ✅ Mobile number validation
    if (filters.mobile_number && !/^\d{10}$/.test(filters.mobile_number)) {
      setMobileError("Mobile must be 10 digits");
      isValid = false;
    } else {
      setMobileError("");
    }

    // ✅ Date validation
    const start = dayjs(filters.start_date);
    const end = dayjs(filters.end_date);
    const min = dayjs(minDate);
    const max = dayjs(today);

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
      setOpenFilter(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      email: "",
      mobile_number: "",
      kyc_status: "",
      start_date: "",
      end_date: today,
    });
    setAppliedFilters({
      email: "",
      mobile_number: "",
      kyc_status: "",
      start_date: "",
      end_date: today,
    });
    setEmailError("");
    setMobileError("");
    setDateError("");
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: "success",
      pending: "warning",
      rejected: "error",
      not_submitted: "default",
    };

    const color = statusMap[status.toLowerCase()] || "default";
    const label =
      status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");

    return <Chip label={label} color={color} size="small" />;
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
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
      !appliedFilters.end_date &&
      !appliedFilters.kyc_status
    ) {
      return "No users found";
    }

    let message = "No users found";
    const filterLabels = [];

    if (appliedFilters.email)
      filterLabels.push(`email: ${appliedFilters.email}`);
    if (appliedFilters.mobile_number)
      filterLabels.push(`mobile: ${appliedFilters.mobile_number}`);
    if (appliedFilters.kyc_status)
      filterLabels.push(`KYC status: ${appliedFilters.kyc_status}`);
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

  const formatBalance = (val) => {
    const num = Number(val);
    return isNaN(num) ? val : num.toFixed(4);
  };

  // Fetch data for CSV export
  const fetchExportData = async () => {
    setExporting(true);

    try {
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/auth/admin/users/?`;

      // Only include non-empty filters
      const validFilters = Object.entries(appliedFilters).filter(
        ([key, value]) => value !== ""
      );

      if (validFilters.length > 0) {
        const params = new URLSearchParams(validFilters).toString();
        url += `&${params}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.status === 200) {
        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `wave_money_${timestamp}_user_list`;

        // Flatten nested objects for CSV
        const flattenedUsers = data.data.users.map((user) => ({
          sr_no: user.sr_no,
          email: user.email,
          full_name: user.full_name,
          phone_number: user.phone_number,
          country: user.country.match(/name: ([^)]+)/)?.[1] || user.country,
          is_bank_account: user.is_bank_account ? "Yes" : "No",
          is_verified: user.is_verified ? "Yes" : "No",
          is_active: user.is_active ? "Yes" : "No",
          kyc_status: user.kyc_status,
          kyc_id: user.kyc_details?.kyc_id || "",
          kyc_submission_date: user.kyc_details?.submission_date || "",
          kyc_admin_message: user.kyc_details?.admin_message || "",
          wallet_balance: user.wallet_info?.balance || "",
          wallet_currency: user.wallet_info?.currency || "",
          bnb_balance: user.crypto_balances?.bnb_balance || "",
          usdt_balance: user.crypto_balances?.usdt_balance || "",
          usdc_balance: user.crypto_balances?.usdc_balance || "",
          wave_balance: user.crypto_balances?.wave_balance || "",
          referral_code: user.referral_code,
          referred_by: user.referred_by || "",
          total_referrals: user.total_referrals,
          created_at: user.created_at,
          last_login: user.last_login || "",
        }));

        // Define CSV columns
        const columns = [
          { id: "sr_no", title: "SR No" },
          { id: "email", title: "Email" },
          { id: "full_name", title: "Full Name" },
          { id: "phone_number", title: "Phone Number" },
          { id: "country", title: "Country" },
          { id: "is_bank_account", title: "Has Bank Account" },
          { id: "is_verified", title: "Verified" },
          { id: "is_active", title: "Active" },
          { id: "kyc_status", title: "KYC Status" },
          { id: "kyc_id", title: "KYC ID" },
          { id: "kyc_submission_date", title: "KYC Submission Date" },
          { id: "kyc_admin_message", title: "KYC Admin Message" },
          { id: "wallet_balance", title: "Wallet Balance" },
          { id: "wallet_currency", title: "Wallet Currency" },
          { id: "bnb_balance", title: "BNB Balance" },
          { id: "usdt_balance", title: "USDT Balance" },
          { id: "usdc_balance", title: "USDC Balance" },
          { id: "wave_balance", title: "WAVE Balance" },
          { id: "referral_code", title: "Referral Code" },
          { id: "referred_by", title: "Referred By" },
          { id: "total_referrals", title: "Total Referrals" },
          { id: "created_at", title: "Created At" },
          { id: "last_login", title: "Last Login" },
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
        const dataRows = flattenedUsers.map((user) =>
          columns.map((col) => escapeField(user[col.id])).join(",")
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
        console.error("Export failed:", data.message);
      }
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
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
                  <div className="all-members-list">Users List</div>

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
                    <div className="overflow-auto ">
                      <table className="table table-responsive">
                        <thead>
                          <tr
                            className="rounded-4"
                            style={{ backgroundColor: "#EEEEEE" }}
                          >
                            <th>#</th>
                            <th className="main-table">NAME</th>
                            <th className="main-table">EMAIL</th>
                            <th className="main-table">PHONE</th>
                            <th className="main-table">KYC STATUS</th>
                            <th>USER STATUS</th>
                            <th className="main-table text-center">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={7} className="text-center py-5">
                                <CircularProgress />
                              </td>
                            </tr>
                          ) : users.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-5">
                                {getNoDataMessage()}
                              </td>
                            </tr>
                          ) : (
                            users.map((user) => (
                              <tr key={user.sr_no}>
                                <td>{user.sr_no}</td>
                                <td className="main-table">{user.full_name}</td>
                                <td className="main-table">{user.email}</td>
                                <td className="main-table">
                                  {user.phone_number}
                                </td>
                                <td className="main-table">
                                  <span
                                    className={`badge bg-${
                                      user.kyc_status === "Approved"
                                        ? "success"
                                        : user.kyc_status === "Pending"
                                        ? "warning"
                                        : user.kyc_status === "Rejected"
                                        ? "danger"
                                        : "dark"
                                    } py-2`}
                                  >
                                    {user.kyc_status}
                                  </span>
                                </td>
                                <td>
                                  <Switch />
                                </td>
                                <td className="main-table">
                                  <div className="d-flex justify-content-around">
                                    <Tooltip title="Edit">
                                      <IconButton color="primary">
                                        <EditRoundedIcon />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="View Details">
                                      <IconButton
                                        color="info"
                                        onClick={() => handleViewDetails(user)}
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={openFilter}
        onClose={handleCloseFilter}
        aria-labelledby="filter-modal-title"
        aria-describedby="filter-modal-description"
        sx={{}}
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
                type="email"
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
                  if (value === "" || /^\d{0,10}$/.test(value)) {
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
                inputProps={{ maxLength: 10 }}
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
                  min: filters.start_date || minDate,
                  max: today,
                }}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">KYC Status</label>
              <FormControl fullWidth>
                <Select
                  value={filters.kyc_status}
                  onChange={(e) =>
                    handleFilterChange("kyc_status", e.target.value)
                  }
                  sx={{
                    "& .MuiSelect-select": {
                      borderRadius: "12px",
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="not_submitted">Not Submitted</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="col-md-6"></div>
            <div className="col-6">
              <Button
                variant="contained"
                onClick={() => {
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

      {/* User Details Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent style={{ maxHeight: "80vh", overflow: "auto" }}>
          {selectedUser ? (
            <Table>
              <TableBody>
                {Object.entries(selectedUser).map(([key, value]) => {
                  let displayValue;

                  // Format country string
                  if (key === "country" && typeof value === "string") {
                    const match = value.match(/name:\s?([^)]+)/);
                    displayValue = match ? match[1] : value;
                  }
                  // Format boolean values
                  else if (typeof value === "boolean") {
                    displayValue = (
                      <Chip
                        label={value ? "Yes" : "No"}
                        color={value ? "success" : "default"}
                        size="small"
                      />
                    );
                  }
                  // Format date values
                  else if (
                    typeof value === "string" &&
                    (key.includes("date") || key.includes("_at"))
                  ) {
                    displayValue = value
                      ? dayjs(value).format("DD/MM/YYYY hh:mm A")
                      : "-";
                  }
                  // Handle crypto_balances specifically
                  else if (
                    key === "crypto_balances" &&
                    typeof value === "object"
                  ) {
                    displayValue = (
                      <Table size="small">
                        <TableBody>
                          {Object.entries(value).map(([subKey, subVal]) => (
                            <TableRow key={subKey}>
                              <TableCell style={{ width: "30%" }}>
                                <strong>{formatKey(subKey)}</strong>
                              </TableCell>
                              <TableCell>{formatBalance(subVal)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    );
                  }
                  // Handle wallet_addresses specifically
                  else if (
                    key === "wallet_addresses" &&
                    typeof value === "object"
                  ) {
                    displayValue = (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Coin</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Created At</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(value).map(([coin, details]) => (
                            <TableRow key={coin}>
                              <TableCell>{coin.toUpperCase()}</TableCell>
                              <TableCell style={{ wordBreak: "break-all" }}>
                                {details.address || "-"}
                              </TableCell>
                              <TableCell>
                                {details.created_at
                                  ? dayjs(details.created_at).format(
                                      "DD/MM/YYYY hh:mm A"
                                    )
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    );
                  }
                  // Handle all other nested objects
                  else if (typeof value === "object" && value !== null) {
                    displayValue = (
                      <Table size="small">
                        <TableBody>
                          {Object.entries(value).map(([subKey, subVal]) => (
                            <TableRow key={subKey}>
                              <TableCell style={{ width: "30%" }}>
                                <strong>{formatKey(subKey)}</strong>
                              </TableCell>
                              <TableCell>
                                {typeof subVal === "boolean" ? (
                                  <Chip
                                    label={subVal ? "Yes" : "No"}
                                    color={subVal ? "success" : "default"}
                                    size="small"
                                  />
                                ) : subKey.includes("date") ||
                                  subKey.includes("_at") ? (
                                  subVal ? (
                                    dayjs(subVal).format("DD/MM/YYYY hh:mm A")
                                  ) : (
                                    "-"
                                  )
                                ) : subVal === null || subVal === "" ? (
                                  "-"
                                ) : (
                                  subVal.toString()
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
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
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-4">No user details available</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserList;
