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
} from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import SideNav from "../../components/SideNav";
import AddTaskIcon from "@mui/icons-material/AddTask";
import { toast } from "react-toastify";
import axios from "axios";
import { Modal } from "react-bootstrap";
import Loader from "../../components/Loader";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Cookies from "js-cookie";

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
  const [endDate, setEndDate] = useState("");

  // Error states
  const [emailError, setEmailError] = useState("");
  const [dateError, setDateError] = useState("");

  // Reset trigger
  const [resetTrigger, setResetTrigger] = useState(0);

  const token = Cookies.get("authToken");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Date constraints
  const today = new Date().toISOString().split("T")[0];
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

    // Date validation
    if (startDate || endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const todayDate = new Date();
      const minAllowedDate = new Date(minDate);

      if (startDate && start > todayDate) {
        setDateError("Start date cannot be in the future");
        isValid = false;
      } else if (endDate && end > todayDate) {
        setDateError("End date cannot be in the future");
        isValid = false;
      } else if (startDate && endDate && start > end) {
        setDateError("End date cannot be before start date");
        isValid = false;
      } else if (startDate && start < minAllowedDate) {
        setDateError(`Start date must be after ${minDate}`);
        isValid = false;
      } else {
        setDateError("");
      }
    }

    return isValid;
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();

    if (validateFilters()) {
      // Reset to first page when applying new filters
      setPagination((prev) => ({ ...prev, current_page: 1 }));
      getData(1);
    }
  };

  const resetFilters = () => {
    setEmail("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setEmailError("");
    setDateError("");

    // Reset pagination to first page
    setPagination((prev) => ({
      ...prev,
      current_page: 1,
    }));

    // Trigger reset effect
    setResetTrigger((prev) => prev + 1);
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
        setPagination((prev) => ({
          ...prev,
          ...data.data.pagination,
        }));
        setLoading(false);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Internal server error");
      setLoading(false);
    }
  };

  const handleUpdateStatus = (e, id) => {
    e.preventDefault();
    setId(id);
    setModalShow(true);
  };

  // Modal component

  function MyVerticallyCenteredModal(props) {

    const [message, setMessage] = useState("");
    const [filterData, setFilterData] = useState({});
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
          "Message should contain only letters, numbers, spaces, and basic punctuation (, . ' \" -)"
        );
        return false;
      }

      return true;
    };

    const handleSubmit = async (e, status) => {
      e.preventDefault();

      if (!validation()) {
        return ;
      }

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
          setModalShow(false);
        }
      } catch (e) {
        toast.error(e.response?.data?.message || "Internal server error");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (modalShow === true && id !== "") {
        const filteredData = kycSubmissions.filter((e) => e.id === id);
        setFilterData(filteredData[0]);
      }
    }, [modalShow, id, kycSubmissions]);

    console.log(messageErr);
    

    return (
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Update Status
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-2">
          <div className="container-fluid">
            <div className="row g-3">
              <div className="col-12">
                <div className="overflow-auto">
                  <table className="table">
                    <tbody>
                      <tr>
                        <th>Name</th>
                        <td>{filterData?.user_details?.full_name || "N/A"}</td>
                      </tr>
                      <tr>
                        <th>Email</th>
                        <td>{filterData?.user_details?.email || "N/A"}</td>
                      </tr>
                      <tr>
                        <th>DOB</th>
                        <td>{filterData?.date_of_birth || "N/A"}</td>
                      </tr>
                      <tr>
                        <th>Mobile No.</th>
                        <td>
                          {filterData?.user_details?.phone_number || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <th>Address</th>
                        <td>
                          {filterData?.residential_address
                            ? `${filterData.residential_address.line1}, 
                             ${filterData.residential_address.line2 || ""}, 
                             ${filterData.residential_address.street || ""}, 
                             ${filterData.residential_address.city}, 
                             ${filterData.residential_address.state}, 
                             ${filterData.residential_address.country} - 
                             ${filterData.residential_address.postal_code}`
                            : "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <th>Document No.</th>
                        <td>{filterData?.document_number || "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-12">
                {filterData?.document_image && (
                  <img
                    src={`https://uatwavemoney.onewave.app${filterData.document_image}`}
                    className="img-fluid"
                    alt="Document"
                  />
                )}
              </div>

              {filterData?.document_back && (
                <div className="col-12">
                  <img
                    src={`https://uatwavemoney.onewave.app${filterData.document_back}`}
                    className="img-fluid mt-2"
                    alt="Document Back"
                  />
                </div>
              )}

              <div className="col-12">
                {filterData?.admin_message && (
                  <p className="text-black-50 m-0">
                    <span className="text-black">Admin message : </span>
                    {filterData.admin_message}
                  </p>
                )}
              </div>

              <div className="col-12">
                {filterData?.status === "Pending" && (
                  <form>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Message</label>
                        <input
                          type="text"
                          className={`form-control ${
                            messageErr ? "is-invalid" : ""
                          }`}
                          placeholder="Enter Your Message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        {messageErr && (
                          <div className="invalid-feedback">{messageErr}</div>
                        )}
                      </div>
                      <div className="col-12 d-flex justify-content-around">
                        <button
                          className="btn btn-success"
                          onClick={(e) => handleSubmit(e, "Approved")}
                          disabled={loading}
                        >
                          {loading ? (
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            />
                          ) : (
                            <AddRoundedIcon className="me-1" />
                          )}
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={(e) => handleSubmit(e, "Rejected")}
                          disabled={loading}
                        >
                          {loading ? (
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            />
                          ) : (
                            <CloseRoundedIcon className="me-1" />
                          )}
                          Reject
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="container py-5 mb-lg-4 ">
            <div className="row pt-sm-2 pt-lg-0">
              <SideNav />

              <div className="col-lg-9 pt-4 pb-2 pb-sm-4">
                <div className="d-sm-flex align-items-center mb-4">
                  <h1 className="h2 mb-4 mb-sm-0 me-4">Users KYC List</h1>
                </div>

                {/* Filter Card */}
                <div className="card shadow border-0">
                  <div className="card-body">
                    <form onSubmit={handleFilterSubmit} className="">
                      <div className="row g-3">
                        {/* Email Filter */}
                        <div className="col-md-3">
                          <TextField
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={!!emailError}
                            helperText={emailError}
                            fullWidth
                            size="small"
                          />
                        </div>

                        {/* Status Filter */}
                        <div className="col-md-3">
                          <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                              value={status}
                              onChange={(e) => setStatus(e.target.value)}
                              label="Status"
                            >
                              <MenuItem value="">All</MenuItem>
                              <MenuItem value="Pending">Pending</MenuItem>
                              <MenuItem value="Approved">Approved</MenuItem>
                              <MenuItem value="Rejected">Rejected</MenuItem>
                            </Select>
                          </FormControl>
                        </div>

                        {/* Start Date Filter */}
                        <div className="col-md-3">
                          <TextField
                            label="Start Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            fullWidth
                            size="small"
                            inputProps={{
                              min: minDate,
                              max: today,
                            }}
                          />
                        </div>

                        {/* End Date Filter */}
                        <div className="col-md-3">
                          <TextField
                            label="End Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
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

                        {/* Action Buttons */}
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

                {/* Data Table Card */}
                <div className="card shadow border-0 mt-3">
                  <div className="card-body">
                    <div className="row g-3 g-xl-4">
                      <div className="col-12">
                        <div className="overflow-auto">
                          {kycSubmissions.length === 0 ? (
                            <h5 className="text-center">No Data Found</h5>
                          ) : (
                            <>
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                    <th>Status</th>
                                    <th className="text-center">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {kycSubmissions.map((val, index) => (
                                    <tr key={val.id}>
                                      <td>
                                        {index +
                                          1 +
                                          (pagination.current_page - 1) *
                                            pagination.page_size}
                                      </td>
                                      <td>
                                        {val.user_details?.full_name || "N/A"}
                                      </td>
                                      <td>
                                        {val.user_details?.email || "N/A"}
                                      </td>
                                      <td>
                                        {val.user_details?.phone_number ||
                                          "N/A"}
                                      </td>
                                      <td>
                                        <span
                                          className={
                                            val.status === "Pending"
                                              ? "badge bg-warning fs-sm"
                                              : val.status === "Approved"
                                              ? "badge bg-success fs-sm"
                                              : "badge bg-danger fs-sm"
                                          }
                                        >
                                          {val.status}
                                        </span>
                                      </td>
                                      <td>
                                        <div className="d-flex justify-content-center">
                                          <Tooltip title="View Details">
                                            <IconButton
                                              color="info"
                                              onClick={(e) =>
                                                handleUpdateStatus(e, val.id)
                                              }
                                            >
                                              <VisibilityRoundedIcon />
                                            </IconButton>
                                          </Tooltip>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              {/* Pagination */}
                              <div className="container-fluid mt-3">
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
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <MyVerticallyCenteredModal
            show={modalShow}
            onHide={() => setModalShow(false)}
          />
        </>
      )}
    </>
  );
};

export default Kyc;
