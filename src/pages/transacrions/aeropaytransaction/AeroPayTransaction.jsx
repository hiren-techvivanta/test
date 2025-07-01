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
  Box,
  Modal,
  Typography,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import SideNav from "../../../components/SideNav";
import TopNav from "../../../components/TopNav";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import axios from "axios";
import Loader from "../../../components/Loader";

const AeroPayCardList = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [dateError, setDateError] = useState("");
  const [openFilter, setOpenFilter] = useState(false);

  const token = Cookies.get("authToken");
  const today = dayjs().format("YYYY-MM-DD");
  const minDate = "0000-01-01";

  const fetchCards = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: resultsPerPage,
        email: appliedFilters.email || undefined,
        mobile_number: appliedFilters.mobile_number || undefined,
        start_date: appliedFilters.start_date || undefined,
        end_date: appliedFilters.end_date || undefined,
      };

      // Remove undefined params
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/card/admin/cards/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (response.data.status === 200) {
        setCards(response.data.data.cards || []);
        setTotalPages(response.data.data.pagination.total_pages || 1);
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCards();
  }, [currentPage, resultsPerPage, token, appliedFilters]);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleResultsPerPageChange = (event) => {
    setResultsPerPage(event.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));

    if (name === "email") setEmailError("");
    if (name === "mobile_number") setMobileError("");
    if (name === "start_date" || name === "end_date") setDateError("");
  };

  const validateForm = () => {
    let isValid = true;
    const trimmedEmail = filters.email.trim();

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
      setCurrentPage(1);
    }
  };

  const resetFilters = () => {
    const resetValues = {
      email: "",
      mobile_number: "",
      start_date: "",
      end_date: "",
    };

    setFilters(resetValues);
    setAppliedFilters(resetValues);
    setEmailError("");
    setMobileError("");
    setDateError("");
    setCurrentPage(1);
  };

  const handleViewDetails = (card) => {
    setSelectedCard(card);
    setOpen(true);
  };

  const formatKey = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getNoDataMessage = () => {
    if (
      !appliedFilters.email &&
      !appliedFilters.mobile_number &&
      !appliedFilters.start_date &&
      !appliedFilters.end_date
    ) {
      return "No cards found";
    }

    let message = "No cards found";
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
        email: appliedFilters.email || undefined,
        mobile_number: appliedFilters.mobile_number || undefined,
        start_date: appliedFilters.start_date || undefined,
        end_date: appliedFilters.end_date || undefined,
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
        const headerRow = columns
          .map((col) => escapeField(col.title))
          .join(",");
        const dataRows = flattenedCards.map((card) =>
          columns.map((col) => escapeField(card[col.id])).join(",")
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
      }
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const getStatusBadge = (status) => {
    const colorMap = {
      ACTIVE: "success",
      DISABLED: "error",
      PENDING: "warning",
      EXPIRED: "secondary",
    };

    return (
      <Chip label={status} color={colorMap[status] || "default"} size="small" />
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
                      <div className="all-members-list">AeroPay Card List</div>

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
                        {cards.length === 0 ? (
                          <>
                            <h5 className="text-center">{getNoDataMessage()}</h5>
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
                                    <th className="main-table">CARD HOLDER</th>
                                    <th className="main-table">
                                      CARD HOLDER EMAIL
                                    </th>
                                    <th className="main-table">
                                      CARD HOLDER PHONE
                                    </th>
                                    <th className="main-table">CARD NUMBER</th>
                                    <th className="main-table">STATUS</th>
                                    <th className="main-table">TYPE</th>
                                    <th className="main-table">CREATED AT</th>
                                    <th className="main-table text-center">
                                      ACTION
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {loading ? (
                                    <tr>
                                      <td
                                        colSpan={7}
                                        className="text-center py-5"
                                      >
                                        <CircularProgress />
                                      </td>
                                    </tr>
                                  ) : cards.length === 0 ? (
                                    <tr>
                                      <td
                                        colSpan={7}
                                        className="text-center py-5"
                                      >
                                        {getNoDataMessage()}
                                      </td>
                                    </tr>
                                  ) : (
                                    cards.map((card, index) => (
                                      <tr key={card.id}>
                                        <td>
                                          {(currentPage - 1) * resultsPerPage +
                                            index +
                                            1}
                                        </td>
                                        <td className="main-table">
                                          {card.user_details?.full_name ||
                                            "N/A"}
                                        </td>
                                        <td className="main-table">
                                          {card.user_details?.email || "N/A"}
                                        </td>
                                        <td className="main-table">
                                          {card.user_details?.phone_number ||
                                            "N/A"}
                                        </td>
                                        <td className="main-table">
                                          {card.masked_pan || "N/A"}
                                        </td>
                                        <td className="main-table">
                                          {getStatusBadge(card.status)}
                                        </td>
                                        <td className="main-table">
                                          {card.type}
                                        </td>
                                        <td className="main-table">
                                          {dayjs(card.created_at).format(
                                            "DD/MM/YYYY hh:mm A"
                                          )}
                                        </td>
                                        <td className="main-table">
                                          <div className="d-flex justify-content-around">
                                            <Tooltip title="View Details">
                                              <IconButton
                                                color="info"
                                                onClick={() =>
                                                  handleViewDetails(card)
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
                      min: filters.start_date || minDate,
                      max: today,
                    }}
                  />
                </div>

                <div className="col-6">
                  <Button
                    variant="contained"
                    onClick={() => {
                      setOpenFilter(false);
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

          {/* Card Details Dialog */}
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Card Details</DialogTitle>
            <DialogContent style={{ maxHeight: "80vh", overflow: "auto" }}>
              {selectedCard ? (
                <Table>
                  <TableBody>
                    {/* Special handling for user_details */}
                    {selectedCard.user_details && (
                      <>
                        <TableRow>
                          <TableCell style={{ width: "30%" }}>
                            <strong>User Email</strong>
                          </TableCell>
                          <TableCell>
                            {selectedCard.user_details.email || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>User Phone Number</strong>
                          </TableCell>
                          <TableCell>
                            {selectedCard.user_details.phone_number || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>User Full Name</strong>
                          </TableCell>
                          <TableCell>
                            {selectedCard.user_details.full_name || "N/A"}
                          </TableCell>
                        </TableRow>
                      </>
                    )}

                    {/* Handle other properties */}
                    {Object.entries(selectedCard)
                      .filter(([key]) => key !== "user_details")
                      .map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell style={{ width: "30%" }}>
                            <strong>{formatKey(key)}</strong>
                          </TableCell>
                          <TableCell>
                            {key.includes("date") || key.includes("_at")
                              ? dayjs(value).format("DD/MM/YYYY hh:mm A")
                              : typeof value === "object"
                              ? JSON.stringify(value, null, 2)
                              : value}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4">No card details available</p>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};

export default AeroPayCardList;
