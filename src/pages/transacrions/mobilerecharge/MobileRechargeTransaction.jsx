import React, { useState, useEffect } from "react";
import SideNav from "../../../components/SideNav";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  IconButton,
  DialogContentText,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import Loader from "../../../components/Loader";

const MobileRechargeTransaction = () => {
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    page_size: 10,
    total_transactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [open, setOpen] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [dateError, setDateError] = useState("");
  const [exporting, setExporting] = useState(false);

  const token = Cookies.get("authToken");
  
  // Date validation parameters
  const MIN_DATE = "0000-01-01";
  const today = dayjs().format("YYYY-MM-DD");

  const getData = async (page = 1, pageSize = resultsPerPage) => {
    try {
      setLoading(true);
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

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/utility-app/admin/mobile-transactions/`,
        {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 200) {
        setTransactions(response.data.data.transactions);
        setPagination(response.data.data.pagination);
      } else {
        toast.error(response.data.error || "Failed to fetch data");
      }
    } catch (e) {
      toast.error(e.response?.data?.error || "Internal server error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setResultsPerPage(value);
    getData(1, value);
  };

  const handlePageChange = (event, page) => {
    getData(page);
  };

  const validateForm = () => {
    let isValid = true;
    let dateErrorMsg = "";
    const todayObj = dayjs().startOf('day');
    const minDateObj = dayjs(MIN_DATE);

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

    // Mobile validation
    if (mobile && !/^\d{10}$/.test(mobile)) {
      setMobileError("Mobile must be 10 digits");
      isValid = false;
    } else {
      setMobileError("");
    }

    // Date validation
    if (startDate) {
      const start = dayjs(startDate);
      
      if (start.isBefore(minDateObj)) {
        dateErrorMsg = "Start date cannot be before 0000-01-01";
      } else if (start.isAfter(todayObj)) {
        dateErrorMsg = "Start date cannot be in the future";
      }
    }

    if (endDate && !dateErrorMsg) {
      const end = dayjs(endDate);
      
      if (end.isBefore(minDateObj)) {
        dateErrorMsg = "End date cannot be before 0000-01-01";
      } else if (end.isAfter(todayObj)) {
        dateErrorMsg = "End date cannot be in the future";
      }
    }

    if (startDate && endDate && !dateErrorMsg) {
      if (dayjs(startDate).isAfter(dayjs(endDate))) {
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
    setDateError("");
    setResetTrigger(true);
  };

  // New function to handle CSV export
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
          "ID", "Order ID", "Client Order ID", "Mobile Number", 
          "Operator Code", "Amount", "Status", "Recharge Type", 
          "UTR", "Created At", "User Name", "User Email", "User Phone"
        ];

        const rows = transactions.map(txn => [
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
          txn.user_details?.phone_number || ""
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
        link.download = `mobile_recharge_${timestamp}.csv`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        toast.error("Failed to fetch data for export");
      }
    } catch (error) {
      toast.error("Export failed: " + (error.response?.data?.error || "Internal server error"));
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

  useEffect(() => {
    if (token) getData();
  }, [token]);

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
                <h1 className="h2 mb-4 mb-sm-0 me-4">
                  Mobile Recharge Transaction
                </h1>
              </div>

              <div className="card shadow border-0">
                <div className="card-body">
                  <form onSubmit={handleFilterSubmit}>
                    <div className="row g-3 mb-4">
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
                            if (dateError) setDateError("");
                          }}
                          inputProps={{ 
                            min: MIN_DATE,
                            max: today
                          }}
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
                            if (dateError) setDateError("");
                          }}
                          inputProps={{ 
                            min: MIN_DATE,
                            max: today
                          }}
                          error={!!dateError}
                          helperText={dateError}
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
                          color="light"
                          onClick={resetFilters}
                          fullWidth
                        >
                          Reset
                        </Button>
                      </div>
                      {/* Export Button */}
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
                      <h6 className="text-center"> {getNoDataMessage()}</h6>
                    ) : (
                      <>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Date & Time</th>
                              <th>Operator Code</th>
                              <th>User Name</th>
                              <th>Email</th>
                              <th>Mobile No.</th>
                              <th>Status</th>
                              <th>Amount</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((v, i) => (
                              <tr key={i}>
                                <td>
                                  {(pagination.current_page - 1) *
                                    resultsPerPage +
                                    i +
                                    1}
                                </td>
                                <td>
                                  {dayjs(v.created_at).format(
                                    "DD/MM/YYYY hh:mm A"
                                  )}
                                </td>
                                <td>{v.operator_code}</td>
                                <td>{v.user_details?.full_name || "N/A"}</td>
                                <td>{v.user_details?.email || "N/A"}</td>
                                <td>{v.user_details?.phone_number || "N/A"}</td>
                                <td>
                                  <span
                                    className={`badge bg-${
                                      v.status === "1"
                                        ? "success"
                                        : "danger"
                                    }`}
                                  >
                                    {v.status === "1" ? "Success" : "Failed"}
                                  </span>
                                </td>
                                <td>$ {v.amount}</td>
                                <td>
                                  <Tooltip title="View">
                                    <IconButton
                                      color="info"
                                      onClick={() => handleOpenModal(v)}
                                    >
                                      <VisibilityRoundedIcon />
                                    </IconButton>
                                  </Tooltip>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="container-fluid mt-3 mb-3">
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
                                showFirstButton
                                showLastButton
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

              {/* Modal */}
              <Dialog
                open={open}
                onClose={handleCloseModal}
                maxWidth="md"
                fullWidth
              >
                <DialogTitle>Transaction Details</DialogTitle>
                <DialogContent style={{ maxHeight: "70vh", overflow: "auto" }}>
                  {selectedTransaction ? (
                    <Table>
                      <TableBody>
                        {/* User Details */}
                        {selectedTransaction.user_details && (
                          <>
                            <TableRow>
                              <TableCell>
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
                                {selectedTransaction.user_details.email ||
                                  "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <strong>Mobile</strong>
                              </TableCell>
                              <TableCell>
                                {selectedTransaction.user_details
                                  .phone_number || "N/A"}
                              </TableCell>
                            </TableRow>
                          </>
                        )}

                        {/* Transaction Details */}
                        <TableRow>
                          <TableCell>
                            <strong>Amount</strong>
                          </TableCell>
                          <TableCell>
                            {selectedTransaction.amount || "N/A"}
                          </TableCell>
                        </TableRow>
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
                            <strong>UTR</strong>
                          </TableCell>
                          <TableCell>
                            {selectedTransaction.utr || "N/A"}
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
                            {selectedTransaction.status === "1" ? "Success" : "Failed"}
                          </TableCell>
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

                        {/* Additional Fields */}
                        {Object.entries(selectedTransaction)
                          .filter(
                            ([key]) =>
                              ![
                                "user_details",
                                "amount",
                                "order_id",
                                "utr",
                                "operator_code",
                                "recharge_type",
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
                                {typeof value === "object"
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
      )}
    </>
  );
};

export default MobileRechargeTransaction;