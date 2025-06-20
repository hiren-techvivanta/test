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
  Typography,
  TextField,
  Button,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import SideNav from "../../../components/SideNav";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import Loader from "../../../components/Loader";

const MoneyArtTransaction = () => {
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
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

  // Validation states
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [dateError, setDateError] = useState("");

  const token = Cookies.get("authToken");

  // Get today's date in YYYY-MM-DD format
  const today = dayjs().format("YYYY-MM-DD");
  
  // Minimum allowed date (0000-01-01)
  const minDate = "0000-01-01";

  const getData = async (page = 1, pageSize = resultsPerPage) => {
    setLoading(true);
    try {
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

    // Mobile validation
    if (mobile && !/^\d{10}$/.test(mobile)) {
      setMobileError("Mobile must be 10 digits");
      isValid = false;
    } else {
      setMobileError("");
    }

    // Date validation
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setDateError("End date must be after start date");
      isValid = false;
    } else if (startDate && (new Date(startDate) < new Date(minDate) || new Date(startDate) > new Date(today))) {
      setDateError(`Start date must be between ${dayjs(minDate).format("DD/MM/YYYY")} and today`);
      isValid = false;
    } else if (endDate && (new Date(endDate) < new Date(minDate) || new Date(endDate) > new Date(today))) {
      setDateError(`End date must be between ${dayjs(minDate).format("DD/MM/YYYY")} and today`);
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
      {loading === true ? (
        <Loader />
      ) : (
        <div className="container py-5 mb-lg-4">
          <div className="row pt-sm-2 pt-lg-0">
            <SideNav />

            <div className="col-lg-9 pt-4 pb-2 pb-sm-4">
              <div className="d-sm-flex align-items-center mb-4">
                <h1 className="h2 mb-4 mb-sm-0 me-4">
                  Moneyart Bill Transaction List
                </h1>
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
                          fullWidth
                          size="small"
                          inputProps={{ 
                            min: minDate, 
                            max: today 
                          }}
                          helperText={``}
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
                          error={!!dateError}
                          helperText={dateError}
                          fullWidth
                          size="small"
                          inputProps={{ 
                            min: minDate, 
                            max: today 
                          }}
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
                    </div>
                  </form>
                </div>
              </div>

              <div className="card shadow border-0 mt-3">
                <div className="card-body">
                  <div className="overflow-auto">
                    {transactions.length === 0 ? (
                      <h6 className="text-center">{getNoDataMessage()}</h6>
                    ) : (
                      <>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Date & Time</th>
                              <th>Order Id</th>
                              <th>Bill Ref No</th>
                              <th>User</th>
                              <th>Mobile No.</th>
                              <th>Status</th>
                              <th>Amount</th>
                              <th>Message</th>
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
                                <td>
                                  {dayjs(txn.created_at).format(
                                    "DD/MM/YYYY hh:mm A"
                                  )}
                                </td>
                                <td>{txn.order_id}</td>
                                <td>{txn.bill_ref_no}</td>
                                <td>{txn.user_details?.full_name}</td>
                                <td>{txn.user_details?.phone_number}</td>
                                <td>
                                  <span
                                    className={`badge bg-${
                                      txn.status === "success"
                                        ? "success"
                                        : txn.status === "failed" ? "danger":"warning"
                                    }`}
                                  >
                                    {txn.status}
                                  </span>
                                </td>
                                <td>$ {txn.amount}</td>
                                <td>{txn.message}</td>
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
                      <DialogContent
                        style={{ maxHeight: "80vh", overflow: "auto" }}
                      >
                        {selectedTransaction ? (
                          <Table>
                            <TableBody>
                              {/* Special handling for user_details */}
                              <TableRow>
                                <TableCell>
                                  <strong>User Email</strong>
                                </TableCell>
                                <TableCell>
                                  {selectedTransaction.user_details?.email ||
                                    "N/A"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <strong>User Phone Number</strong>
                                </TableCell>
                                <TableCell>
                                  {selectedTransaction.user_details
                                    ?.phone_number || "N/A"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <strong>User Full Name</strong>
                                </TableCell>
                                <TableCell>
                                  {selectedTransaction.user_details
                                    ?.full_name || "N/A"}
                                </TableCell>
                              </TableRow>

                              {/* Handle other properties */}
                              {Object.entries(selectedTransaction)
                                .filter(([key]) => key !== "user_details")
                                .map(([key, value]) => (
                                  <TableRow key={key}>
                                    <TableCell>
                                      <strong>{formatKey(key)}</strong>
                                    </TableCell>
                                    <TableCell>
                                      {key.includes("date") ||
                                      key.includes("_at")
                                        ? dayjs(value).format(
                                            "DD/MM/YYYY hh:mm A"
                                          )
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MoneyArtTransaction;