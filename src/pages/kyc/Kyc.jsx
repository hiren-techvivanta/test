import React, { useEffect, useState } from "react";
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
  Box,
  Modal,
  Typography,
} from "@mui/material";
import SideNav from "../../components/SideNav";
import TopNav from "../../components/TopNav";
import Loader from "../../components/Loader";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import FilterListIcon from "@mui/icons-material/FilterList";

const Kyc = () => {
  // State variables
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    page_size: 10,
    total_kyc_submissions: 0,
    has_next: false,
    has_previous: false,
    next_page: null,
    previous_page: null,
  });

  // Filter states
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [openFilter, setOpenFilter] = useState(false);

  // Error states
  const [emailError, setEmailError] = useState("");
  const [dateError, setDateError] = useState("");

  // Reset trigger
  const [resetTrigger, setResetTrigger] = useState(0);

  const token = Cookies.get("authToken");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Date constraints
  const today = dayjs().format("YYYY-MM-DD");
  const minDate = "0000-01-01";

  useEffect(() => {
    if (token) {
      getData();
    }
  }, [token]);

  // Handle reset trigger
  useEffect(() => {
    if (resetTrigger > 0) {
      getData(1);
      setResetTrigger(0);
    }
  }, [resetTrigger]);

  const handlePageSizeChange = (event) => {
    const newSize = event.target.value;
    setPagination((prev) => ({ ...prev, page_size: newSize }));
    getData(pagination.current_page, newSize);
  };

  const handlePageChange = (event, page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
    getData(page);
  };

  const validateFilters = () => {
    let isValid = true;

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

    // Date validation
    if (startDate || endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      const todayDate = dayjs();
      const minAllowedDate = dayjs(minDate);

      if (startDate && start.isAfter(todayDate)) {
        setDateError("Start date cannot be in the future");
        isValid = false;
      } else if (endDate && end.isAfter(todayDate)) {
        setDateError("End date cannot be in the future");
        isValid = false;
      } else if (startDate && endDate && start.isAfter(end)) {
        setDateError("End date cannot be before start date");
        isValid = false;
      } else if (startDate && start.isBefore(minAllowedDate)) {
        setDateError(`Start date must be after ${minDate}`);
        isValid = false;
      } else {
        setDateError("");
      }
    }

    return isValid;
  };

  const handleFilterSubmit = () => {
    if (validateFilters()) {
      setPagination((prev) => ({ ...prev, current_page: 1 }));
      getData(1);
      setOpenFilter(false);
    }
  };

  const resetFilters = () => {
    setEmail("");
    setStatus("");
    setStartDate("");
    setEndDate(today);
    setEmailError("");
    setDateError("");

    setPagination((prev) => ({
      ...prev,
      current_page: 1,
    }));

    setResetTrigger((prev) => prev + 1);
    setOpenFilter(false);
  };

  const getData = async (
    page = pagination.current_page,
    pageSize = pagination.page_size
  ) => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        ...(email && { email }),
        ...(status && { status }),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
      };

      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/admin/kyc`,
        {
          ...config,
          params,
        }
      );

      if (data.message === "KYC submissions retrieved successfully") {
        setKycSubmissions(data.data.kyc_submissions);
        setPagination({
          current_page: data.data.pagination.current_page,
          total_pages: data.data.pagination.total_pages,
          page_size: data.data.pagination.page_size,
          total_kyc_submissions: data.data.pagination.total_count,
          has_next: data.data.pagination.has_next,
          has_previous: data.data.pagination.has_previous,
        });
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Internal server error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id) => {
    setId(id);
    setModalShow(true);
  };

  // Modal component
  function StatusUpdateModal(props) {
    const [message, setMessage] = useState("");
    const [kycData, setKycData] = useState({});
    const [messageErr, setMessageErr] = useState("");
    const [loading, setLoading] = useState(false);

    const validation = () => {
      setMessageErr("");
      const pattern = /^[a-zA-Z0-9 ,.'"-]+$/;

      if (!message.trim()) {
        setMessageErr("Message is required");
        return false;
      } else if (!pattern.test(message.trim())) {
        setMessageErr(
          "Message should contain only letters, numbers, spaces, and basic punctuation"
        );
        return false;
      }
      return true;
    };

    const handleSubmit = async (e, status) => {
      e.preventDefault();

      if (!validation()) return;

      setLoading(true);

      try {
        const formData = {
          status,
          admin_message: message,
        };

        const { data } = await axios.patch(
          `${process.env.REACT_APP_BACKEND_URL}/api/auth/admin/kyc/${id}/update-status/`,
          formData,
          config
        );

        if (data.error === "") {
          setId("");
          getData(pagination.current_page);
          toast.success(data.message);
          props.onHide();
        }
      } catch (e) {
        toast.error(e.response?.data?.message || "Internal server error");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (props.show && id !== "") {
        const filteredData = kycSubmissions.filter((e) => e.id === id);
        setKycData(filteredData[0] || {});
      }
    }, [props.show, id]);

    return (
      <Dialog open={props.show} onClose={props.onHide} maxWidth="md" fullWidth>
        <DialogTitle>Update KYC Status</DialogTitle>
        <DialogContent style={{ maxHeight: "80vh", overflow: "auto" }}>
          <div className="container-fluid p-0">
            <div className="row g-3">
              <div className="col-12">
                <div className="overflow-auto">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <strong>Name</strong>
                        </TableCell>
                        <TableCell>
                          {kycData?.user_details?.full_name || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Email</strong>
                        </TableCell>
                        <TableCell>
                          {kycData?.user_details?.email || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>DOB</strong>
                        </TableCell>
                        <TableCell>{kycData?.date_of_birth || "N/A"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Mobile No.</strong>
                        </TableCell>
                        <TableCell>
                          {kycData?.user_details?.phone_number || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Address</strong>
                        </TableCell>
                        <TableCell>
                          {kycData?.residential_address
                            ? `${kycData.residential_address.line1}, 
                             ${kycData.residential_address.line2 || ""}, 
                             ${kycData.residential_address.street || ""}, 
                             ${kycData.residential_address.city}, 
                             ${kycData.residential_address.state}, 
                             ${kycData.residential_address.country} - 
                             ${kycData.residential_address.postal_code}`
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Document No.</strong>
                        </TableCell>
                        <TableCell>
                          {kycData?.document_number || "N/A"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="col-12">
                {kycData?.document_image && (
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${kycData.document_image}`}
                    className="img-fluid rounded"
                    alt="Document"
                    style={{ maxHeight: "300px" }}
                  />
                )}
              </div>

              {kycData?.document_back && (
                <div className="col-12">
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${kycData.document_back}`}
                    className="img-fluid rounded mt-2"
                    alt="Document Back"
                    style={{ maxHeight: "300px" }}
                  />
                </div>
              )}

              <div className="col-12">
                {kycData?.admin_message && (
                  <p className="text-muted">
                    <span className="text-dark fw-bold">Admin message: </span>
                    {kycData.admin_message}
                  </p>
                )}
              </div>

              <div className="col-12">
                {kycData?.status === "Pending" && (
                  <form>
                    <div className="row g-3">
                      <div className="col-12">
                        <label>Message</label>
                        <TextField
                          fullWidth
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          error={!!messageErr}
                          helperText={messageErr}
                          multiline
                          rows={3}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                        />
                      </div>
                      <div className="col-12 d-flex justify-content-around">
                        <Button
                          variant="contained"
                          color="success"
                          onClick={(e) => handleSubmit(e, "Approved")}
                          disabled={loading}
                          startIcon={
                            loading ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <AddRoundedIcon />
                            )
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={(e) => handleSubmit(e, "Rejected")}
                          disabled={loading}
                          startIcon={
                            loading ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <CloseRoundedIcon />
                            )
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getNoDataMessage = () => {
    if (!email && !status && !startDate && !endDate) {
      return "No KYC submissions found";
    }

    let message = "No submissions found";
    const filterLabels = [];

    if (email) filterLabels.push(`email: ${email}`);
    if (status) filterLabels.push(`status: ${status}`);
    if (startDate)
      filterLabels.push(`from ${dayjs(startDate).format("DD/MM/YYYY")}`);
    if (endDate) filterLabels.push(`to ${dayjs(endDate).format("DD/MM/YYYY")}`);

    if (filterLabels.length > 0) {
      message += ` with ${filterLabels.join(", ")}`;
    }

    return message;
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
                  <div className="all-members-list">Users KYC List</div>

                  <div className="frame-1597880735">
                    <div className="frame-15978807352">
                      <Button
                        variant="contained"
                        startIcon={<FilterListIcon />}
                        className="filter"
                        sx={{ padding: "0 16px", height: "48px" }}
                        disableElevation
                        onClick={() => setOpenFilter(true)}
                      >
                        Filter
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="card mw-100 mt-5 rounded-4 border-0">
                  <div className="card-body">
                    {loading ? (
                      <div className="text-center py-5">
                        <CircularProgress />
                      </div>
                    ) : (
                      <div className="overflow-auto">
                        <table className="table table-responsive">
                          <thead>
                            <tr
                              className="rounded-4"
                              style={{ backgroundColor: "#EEEEEE" }}
                            >
                              <th>#</th>
                              <th className="main-table">NAME</th>
                              <th className="main-table">EMAIL</th>
                              <th className="main-table">MOBILE</th>
                              <th className="main-table">STATUS</th>
                              <th className="main-table text-center">ACTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {kycSubmissions.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-center py-5">
                                  {getNoDataMessage()}
                                </td>
                              </tr>
                            ) : (
                              kycSubmissions.map((submission, index) => (
                                <tr key={submission.id}>
                                  <td>
                                    {index +
                                      1 +
                                      (pagination.current_page - 1) *
                                        pagination.page_size}
                                  </td>
                                  <td className="main-table">
                                    {submission.user_details?.full_name ||
                                      "N/A"}
                                  </td>
                                  <td className="main-table">
                                    {submission.user_details?.email || "N/A"}
                                  </td>
                                  <td className="main-table">
                                    {submission.user_details?.phone_number ||
                                      "N/A"}
                                  </td>
                                  <td className="main-table">
                                    <span
                                      className={`badge bg-${
                                        submission.status === "Approved"
                                          ? "success"
                                          : submission.status === "Pending"
                                          ? "warning"
                                          : "danger"
                                      } py-2`}
                                    >
                                      {submission.status}
                                    </span>
                                  </td>
                                  <td className="main-table">
                                    <div className="d-flex justify-content-around">
                                      <Tooltip title="View Details">
                                        <IconButton
                                          color="info"
                                          onClick={() =>
                                            handleViewDetails(submission.id)
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
                    )}

                    <div className="container-fluid mt-4 mb-3">
                      <div className="row align-items-center">
                        <div className="col-md-3">
                          <FormControl variant="standard" fullWidth>
                            <InputLabel>Results per page</InputLabel>
                            <Select
                              value={pagination.page_size}
                              onChange={handlePageSizeChange}
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
        onClose={() => setOpenFilter(false)}
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
                onChange={(e) => setEmail(e.target.value)}
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
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="col-md-6">
              <label className="form-label">Start Date</label>
              <TextField
                fullWidth
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!dateError}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#f5f5f5",
                  },
                }}
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
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!dateError}
                helperText={dateError}
                disabled={!startDate}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#f5f5f5",
                  },
                }}
                inputProps={{
                  min: startDate || minDate,
                  max: today,
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

      <StatusUpdateModal show={modalShow} onHide={() => setModalShow(false)} />
    </>
  );
};

export default Kyc;
