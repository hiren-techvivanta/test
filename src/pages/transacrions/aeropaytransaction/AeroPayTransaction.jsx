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
  CircularProgress,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import SideNav from "../../../components/SideNav";
import Loader from "../../../components/Loader";

const AeroPayTransaction = () => {
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [startDate, setStartDate] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [dateError, setDateError] = useState("");
  const [exporting, setExporting] = useState(false);

  const token = Cookies.get("authToken");

  // Define date constraints
  const today = dayjs().format("YYYY-MM-DD");
  const minDate = "0000-01-01";

   const [endDate, setEndDate] = useState(today);

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
        `${process.env.REACT_APP_BACKEND_URL}/api/card/admin/cards/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (res.data.status === 200) {
        setTransactions(res.data.data.cards || []);
        setPagination({
          current_page: res.data.data.pagination.current_page || 1,
          total_pages: res.data.data.pagination.total_pages || 1,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
    getData(page);
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
    } else if (
      startDate &&
      (new Date(startDate) < new Date(minDate) ||
        new Date(startDate) > new Date(today))
    ) {
      setDateError(
        `Start date must be between ${dayjs(minDate).format(
          "DD/MM/YYYY"
        )} and today`
      );
      isValid = false;
    } else if (
      endDate &&
      (new Date(endDate) < new Date(minDate) ||
        new Date(endDate) > new Date(today))
    ) {
      setDateError(
        `End date must be between ${dayjs(minDate).format(
          "DD/MM/YYYY"
        )} and today`
      );
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
    setEndDate(today);
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
      return "No cards found";
    }

    let message = "No cards found";
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

  const fetchExportData = async () => {
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

      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/card/admin/cards/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (res.data.status === 200) {
        const { cards } = res.data.data;
        if (!cards || cards.length === 0) {
          alert("No data to export");
          return;
        }

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `aeropay_cards_${timestamp}`;
        
        // Flatten cards for CSV
        const flattenedCards = cards.map((card) => ({
          id: card.id,
          card_id: card.card_id,
          name: card.name,
          masked_pan: card.masked_pan,
          expiry: card.expiry,
          status: card.status,
          type: card.type,
          issuer: card.issuer,
          currency: card.currency,
          brand: card.brand,
          amount: card.amount,
          created_at: card.created_at,
          user_email: card.user_details?.email || "",
          user_phone: card.user_details?.phone_number || "",
          user_full_name: card.user_details?.full_name || "",
        }));

        // Define CSV columns
        const columns = [
          { id: "id", title: "ID" },
          { id: "card_id", title: "Card ID" },
          { id: "name", title: "Cardholder Name" },
          { id: "masked_pan", title: "Masked PAN" },
          { id: "expiry", title: "Expiry" },
          { id: "status", title: "Status" },
          { id: "type", title: "Type" },
          { id: "issuer", title: "Issuer" },
          { id: "currency", title: "Currency" },
          { id: "brand", title: "Brand" },
          { id: "amount", title: "Amount" },
          { id: "created_at", title: "Created At" },
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
        const headerRow = columns.map(col => escapeField(col.title)).join(",");
        const dataRows = flattenedCards.map(card => 
          columns.map(col => escapeField(card[col.id])).join(",")
        );
        
        const csvContent = [headerRow, ...dataRows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        
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
                <h1 className="h2 mb-4 mb-sm-0 me-4">AeroPay Card List</h1>
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
                            max: today,
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
                            min: startDate || minDate,
                            max: today,
                          }}
                          disabled={!startDate}
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
                          onClick={resetFilters}
                          fullWidth
                          color="light"
                        >
                          Reset
                        </Button>
                      </div>
                      <div className="col-md-2 d-flex align-items-end">
                        <Button
                          variant="contained"
                          color="success"
                          className="w-100"
                          onClick={fetchExportData}
                          disabled={exporting}
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
                  {transactions.length === 0 ? (
                    <h6 className="text-center">{getNoDataMessage()}</h6>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Email</th>
                              <th>Card Number</th>
                              <th>Status</th>
                              <th>Created At</th>
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
                                <td>{txn.user_details?.email || "N/A"}</td>
                                <td>{txn.masked_pan || "N/A"}</td>
                                <td>
                                  <span
                                    className={`badge bg-${
                                      txn.status === "ACTIVE"
                                        ? "success"
                                        : txn.status === "DISABLED"
                                        ? "danger"
                                        : "secondary"
                                    }`}
                                  >
                                    {txn.status}
                                  </span>
                                </td>
                                <td>
                                  {dayjs(txn.created_at).format(
                                    "DD/MM/YYYY hh:mm A"
                                  )}
                                </td>
                                <td>
                                  <Tooltip title="View Details">
                                    <IconButton
                                      onClick={() => handleViewDetails(txn)}
                                      color="info"
                                    >
                                      <VisibilityRoundedIcon />
                                    </IconButton>
                                  </Tooltip>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* Pagination Controls */}
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
                              disabled={transactions.length === 0}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* View Details Modal */}
                  <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                    maxWidth="md"
                    fullWidth
                  >
                    <DialogTitle>Card Details</DialogTitle>
                    <DialogContent
                      style={{ maxHeight: "80vh", overflow: "auto" }}
                    >
                      {selectedTransaction ? (
                        <Table>
                          <TableBody>
                            {/* Special handling for user_details */}
                            {selectedTransaction.user_details && (
                              <>
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
                                    <strong>User Phone Number</strong>
                                  </TableCell>
                                  <TableCell>
                                    {selectedTransaction.user_details
                                      .phone_number || "N/A"}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>
                                    <strong>User Full Name</strong>
                                  </TableCell>
                                  <TableCell>
                                    {selectedTransaction.user_details
                                      .full_name || "N/A"}
                                  </TableCell>
                                </TableRow>
                              </>
                            )}

                            {/* Handle other properties */}
                            {Object.entries(selectedTransaction)
                              .filter(([key]) => key !== "user_details")
                              .map(([key, value]) => (
                                <TableRow key={key}>
                                  <TableCell>
                                    <strong>{formatKey(key)}</strong>
                                  </TableCell>
                                  <TableCell>
                                    {key.includes("date") || key.includes("_at")
                                      ? dayjs(value).format(
                                          "DD/MM/YYYY hh:mm A"
                                        )
                                      : typeof value === "object"
                                      ? JSON.stringify(value, null, 2)
                                      : value}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <DialogContentText>
                          No card details available
                        </DialogContentText>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AeroPayTransaction;
