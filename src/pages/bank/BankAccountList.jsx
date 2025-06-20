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
  DialogContentText,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Button,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import SideNav from "../../components/SideNav";
import axios from "axios";
import Cookies from "js-cookie";
import Loader from "../../components/Loader";
import dayjs from "dayjs"; // Added dayjs for date handling

const BankAccountList = () => {
  // Define min and max allowed dates
  const minAllowedDate = "0000-01-01";
  const maxAllowedDate = dayjs().format("YYYY-MM-DD");
  
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [currency, setcurrency] = useState("");
  const [emailError, setEmailError] = useState("");
  const [startDateError, setStartDateError] = useState(""); // Split into separate errors
  const [endDateError, setEndDateError] = useState(""); // Split into separate errors

  const token = Cookies.get("authToken");

  const getData = async (page = 1, pageSize = resultsPerPage) => {
    setLoading(true);
    try {
      const params = {
        email: email || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        currency: currency || undefined,
        page,
        page_size: pageSize,
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
        const { accounts, pagination: pg } = res.data.data;
        setTransactions(accounts);
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
    setStartDate("");
    setEndDate("");
    setcurrency("");
    setEmailError("");
    setStartDateError("");
    setEndDateError("");
    setResetTrigger(true);
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
    if (!email && !startDate && !endDate && !currency) {
      return "No bank accounts found";
    }

    let message = "No bank accounts found";
    const filters = [];

    if (email) filters.push(`email: ${email}`);
    if (currency) filters.push(`currency: ${currency}`);
    if (startDate) filters.push(`from ${dayjs(startDate).format("DD/MM/YYYY")}`);
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
                <h1 className="h2 mb-4 mb-sm-0 me-4">Bank Account List</h1>
              </div>

              <div className="card shadow border-0">
                <div className="card-body">
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
                      <div className="col-md-3">
                        <FormControl fullWidth size="small">
                          <InputLabel id="currency-label">Currency</InputLabel>
                          <Select
                            labelId="currency-label"
                            id="currency-select"
                            value={currency}
                            label="Currency"
                            onChange={(e) => setcurrency(e.target.value)}
                          >
                            <MenuItem value="">All Currencies</MenuItem>
                            <MenuItem value="AED">AED</MenuItem>
                            <MenuItem value="USD">USD</MenuItem>
                            <MenuItem value="GBP">GBP</MenuItem>
                            <MenuItem value="EUR">EUR</MenuItem>
                          </Select>
                        </FormControl>
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
                    </div>
                  </form>
                </div>
              </div>

              <div className="card shadow border-0 mt-3">
                <div className="card-body">
                  <div className="overflow-auto">
                    {transactions.length === 0 ? (
                      <div className="text-center">
                        {getNoDataMessage()}
                      </div>
                    ) : (
                      <>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>User Name</th>
                              <th>User Email</th>
                              <th>A/C No.</th>
                              <th>Currency</th>
                              <th>Amount</th>
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
                                <td>{txn.user_details?.full_name || "N/A"}</td>
                                <td>{txn.user_details?.email || "N/A"}</td>
                                <td>{txn.account_number || "N/A"}</td>
                                <td>{txn.currency || "N/A"}</td>
                                <td>{txn.balance || "0.00"}</td>
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
                            ))}
                          </tbody>
                        </table>

                        <div className="container-fluid mb-3">
                          <div className="row">
                            <div className="col-3">
                              <FormControl variant="standard" fullWidth>
                                <InputLabel id="results-label">
                                  Results
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

                    <Dialog
                      open={open}
                      onClose={() => setOpen(false)}
                      maxWidth="md"
                      fullWidth
                    >
                      <DialogTitle>Bank Account Details</DialogTitle>
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
                                      <strong>User Name</strong>
                                    </TableCell>
                                    <TableCell>
                                      {selectedTransaction.user_details
                                        .full_name || "N/A"}
                                    </TableCell>
                                  </TableRow>
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
                                      <strong>User Phone</strong>
                                    </TableCell>
                                    <TableCell>
                                      {selectedTransaction.user_details
                                        .phone_number || "N/A"}
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
                                  {selectedTransaction.account_number || "N/A"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <strong>Currency</strong>
                                </TableCell>
                                <TableCell>
                                  {selectedTransaction.currency || "N/A"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <strong>Balance</strong>
                                </TableCell>
                                <TableCell>
                                  {selectedTransaction.balance || "0.00"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <strong>Bank Name</strong>
                                </TableCell>
                                <TableCell>
                                  {selectedTransaction.bank_name || "N/A"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <strong>Account Holder</strong>
                                </TableCell>
                                <TableCell>
                                  {selectedTransaction.account_holder_name ||
                                    "N/A"}
                                </TableCell>
                              </TableRow>

                              {/* Additional Fields */}
                              {Object.entries(selectedTransaction)
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
                          <DialogContentText>
                            No account details available
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

export default BankAccountList;