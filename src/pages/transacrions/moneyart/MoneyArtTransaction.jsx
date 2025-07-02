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
  Modal,
  Box,
  Typography,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import SideNav from "../../../components/SideNav";
import TopNav from "../../../components/TopNav";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import Loader from "../../../components/Loader";

const MoneyArtTransaction = () => {
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_transactions: 0,
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [showing, setShowing] = useState(10);

  // Filter states
  const [filters, setFilters] = useState({
    email: "",
    mobile_number: "",
    start_date: "",
    end_date: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    email: "",
    mobile_number: "",
    start_date: "",
    end_date: "",
  });

  // Validation states
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [dateError, setDateError] = useState("");
  const [exporting, setExporting] = useState(false);

  const token = Cookies.get("authToken");
  const today = dayjs().format("YYYY-MM-DD");
  const minDate = "0000-01-01";

  const getData = async (page = 1, pageSize = resultsPerPage) => {
    setLoading(true);
    try {
      const params = {
        ...appliedFilters,
        page,
        page_size: pageSize,
      };

      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/utility-app/admin/bill-transactions/`,
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) getData();
  }, [token, appliedFilters, resultsPerPage]);

  useEffect(() => {
    if (resetTrigger) {
      getData(1);
      setResetTrigger(false);
    }
  }, [resetTrigger]);

  const handleResultsPerPageChange = (event) => {
    setResultsPerPage(event.target.value);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handlePageChange = (event, page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
    getData(page, resultsPerPage);
  };

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

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
      setMobileError("Mobile must be 8 to 15 digits");
      isValid = false;
    } else {
      setMobileError("");
    }

    // Date validation
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
      setPagination((prev) => ({ ...prev, current_page: 1 }));
      handleCloseFilter();
    }
  };

  const resetFilters = () => {
    setFilters({
      email: "",
      mobile_number: "",
      start_date: "",
      end_date: today,
    });
    setAppliedFilters({
      email: "",
      mobile_number: "",
      start_date: "",
      end_date: today,
    });
    setEmailError("");
    setMobileError("");
    setDateError("");
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
    if (appliedFilters.start_date && appliedFilters.end_date)
      filterLabels.push(
        `to ${dayjs(appliedFilters.end_date).format("DD/MM/YYYY")}`
      );

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
        ...appliedFilters,
      };

      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/utility-app/admin/bill-transactions/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (res.data.status === 200) {
        const { transactions } = res.data.data;
        if (transactions.length === 0) {
          alert("No data to export");
          return;
        }

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `moneyart_transactions_${timestamp}`;

        // Flatten transactions for CSV
        const flattenedTransactions = transactions.map((txn) => ({
          id: txn.id,
          created_at: txn.created_at,
          updated_at: txn.updated_at,
          consumer_number: txn.consumer_number,
          operator_code: txn.operator_code,
          amount: txn.amount,
          mobile_no: txn.mobile_no,
          customer_name: txn.customer_name,
          bill_ref_no: txn.bill_ref_no,
          due_date: txn.due_date,
          bill_type: txn.bill_type,
          client_order_id: txn.client_order_id,
          order_id: txn.order_id,
          utr: txn.utr,
          status: txn.status,
          message: txn.message,
          user_email: txn.user_details?.email || "",
          user_phone: txn.user_details?.phone_number || "",
          user_full_name: txn.user_details?.full_name || "",
        }));

        // Define CSV columns
        const columns = [
          { id: "id", title: "ID" },
          { id: "created_at", title: "Created At" },
          { id: "updated_at", title: "Updated At" },
          { id: "consumer_number", title: "Consumer Number" },
          { id: "operator_code", title: "Operator Code" },
          { id: "amount", title: "Amount" },
          { id: "mobile_no", title: "Mobile Number" },
          { id: "customer_name", title: "Customer Name" },
          { id: "bill_ref_no", title: "Bill Ref No" },
          { id: "due_date", title: "Due Date" },
          { id: "bill_type", title: "Bill Type" },
          { id: "client_order_id", title: "Client Order ID" },
          { id: "order_id", title: "Order ID" },
          { id: "utr", title: "UTR" },
          { id: "status", title: "Status" },
          { id: "message", title: "Message" },
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
        const dataRows = flattenedTransactions.map((txn) =>
          columns.map((col) => escapeField(txn[col.id])).join(",")
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
      }
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      success: "success",
      failed: "error",
      pending: "warning",
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
                    <div className="all-members-list">
                      MoneyArt Bill Transaction List
                    </div>

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
                        <>
                          <h5 className="text-center">{getNoDataMessage()}</h5>
                        </>
                      ) : (
                        <>
                          <div className="overflow-auto ">
                            <table className="table table-responsive">
                              <thead>
                                <tr
                                  className="rounded-4"
                                  style={{ backgroundColor: "#EEEEEE" }}
                                >
                                  <th>#</th>
                                  <th className="main-table">DATE & TIME</th>
                                  <th className="main-table">ORDER ID</th>
                                  <th className="main-table">BILL REF NO</th>
                                  <th className="main-table">USER</th>
                                  <th className="main-table">MOBILE NO.</th>
                                  <th className="main-table-2">STATUS</th>
                                  <th className="main-table-2">AMOUNT</th>
                                  <th className="text-center">
                                    ACTION
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {loading ? (
                                  <tr>
                                    <td
                                      colSpan={10}
                                      className="text-center py-5"
                                    >
                                      <CircularProgress />
                                    </td>
                                  </tr>
                                ) : transactions.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={10}
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
                                        {dayjs(txn.created_at).format(
                                          "DD/MM/YYYY hh:mm A"
                                        )}
                                      </td>
                                      <td className="main-table">
                                        {txn.order_id}
                                      </td>
                                      <td className="main-table">
                                        {txn.bill_ref_no}
                                      </td>
                                      <td className="main-table">
                                        {txn.user_details?.full_name}
                                      </td>
                                      <td className="main-table">
                                        {txn.user_details?.phone_number}
                                      </td>
                                      <td className="main-table-2">
                                        {getStatusBadge(txn.status)}
                                      </td>
                                      <td className="main-table-2">
                                        $ {txn.amount}
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
        </div>
      )}

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
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent style={{ maxHeight: "80vh", overflow: "auto" }}>
          {selectedTransaction ? (
            <Table>
              <TableBody>
                {/* Special handling for user_details */}
                <TableRow>
                  <TableCell style={{ width: "30%" }}>
                    <strong>User Email</strong>
                  </TableCell>
                  <TableCell>
                    {selectedTransaction.user_details?.email || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>User Phone Number</strong>
                  </TableCell>
                  <TableCell>
                    {selectedTransaction.user_details?.phone_number || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>User Full Name</strong>
                  </TableCell>
                  <TableCell>
                    {selectedTransaction.user_details?.full_name || "N/A"}
                  </TableCell>
                </TableRow>

                {/* Handle other properties */}
                {Object.entries(selectedTransaction)
                  .filter(([key]) => key !== "user_details")
                  .map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell style={{ width: "30%" }}>
                        <strong>{formatKey(key)}</strong>
                      </TableCell>
                      <TableCell>
                        {key.includes("date") || key.includes("_at")
                          ? dayjs(value).format("DD/MM/YYYY hh:mm A")
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

export default MoneyArtTransaction;
