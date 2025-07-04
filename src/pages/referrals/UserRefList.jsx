import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Modal,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import SideNav from "../../components/SideNav";
import Loader from "../../components/Loader";
import axios from "axios";
import TopNav from "../../components/TopNav";

const UserRefList = () => {

   const today = dayjs().format("YYYY-MM-DD");
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [referralList, setReferralList] = useState([]);
  const [summaryStats, setSummaryStats] = useState({});
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(today);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [dateError, setDateError] = useState("");
  const [resetTrigger, setResetTrigger] = useState(false);
  const [openFilter, setOpenFilter] = useState(false); 

  const token = Cookies.get("authToken");
  const minDate = "0000-01-01";

  // Fetch referral data
  const getReferralData = async (page = 1, pageSize = resultsPerPage) => {
    setLoading(true);
    try {
      const params = {
        email: email || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page,
        page_size: pageSize,
      };

      // Remove undefined parameters
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/admin/referrals/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (response.data.status === 200) {
        setReferralList(response.data.data.referral_list || []);
        setSummaryStats(response.data.data.summary_stats || {});
        setPagination({
          current_page: response.data.data.pagination.current_page || 1,
          total_pages: response.data.data.pagination.total_pages || 1,
        });
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (token) getReferralData();
  }, [token]);

  // Handle reset trigger
  useEffect(() => {
    if (resetTrigger) {
      getReferralData(1);
      setResetTrigger(false);
    }
  }, [resetTrigger]);

  // Validate form inputs
  const validateForm = () => {
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

  // Handle filter submission
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      getReferralData(1);
      setOpenFilter(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setEmail("");
    setStartDate("");
    setEndDate(today);
    setEmailError("");
    setDateError("");
    setResetTrigger(true);
  };

  // Handle pagination change
  const handlePageChange = (event, page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
    getReferralData(page);
  };

  // Handle results per page change
  const handleChangeResultsPerPage = (event) => {
    const value = event.target.value;
    setResultsPerPage(value);
    getReferralData(1, value);
  };

  // Get no data message
  const getNoDataMessage = () => {
    if (!email && !startDate && !endDate) {
      return "No referrals found";
    }

    let message = "No referrals found";
    const filters = [];

    if (email) filters.push(`email: ${email}`);
    if (startDate)
      filters.push(`from ${dayjs(startDate).format("DD/MM/YYYY")}`);
    if (startDate && endDate) filters.push(`to ${dayjs(endDate).format("DD/MM/YYYY")}`);

    if (filters.length > 0) {
      message += ` with ${filters.join(" and ")}`;
    }

    return message;
  };

  // Format country string
  const formatCountry = (countryString) => {
    if (!countryString) return "N/A";

    const match = countryString.match(/name: ([^)]+)\)/);
    return match ? match[1] : countryString;
  };

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  return (
    <>
      {loading ? (
        <Loader />
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
                      <div className="all-members-list">
                        Users Referrals List
                      </div>

                      <div className="frame-1597880735">
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

                    <div className="card shadow border-0 mt-4">
                      <div className="card-body">
                        {referralList.length === 0 ? (
                          <h6 className="text-center">{getNoDataMessage()}</h6>
                        ) : (
                          <>
                            <div
                              className="accordion accordion-alt accordion-orders"
                              id="orders"
                            >
                              {referralList.map((referral, index) => (
                                <div
                                  className="accordion-item border-top border-bottom mb-0"
                                  key={index}
                                >
                                  <div className="accordion-header">
                                    <a
                                      className="accordion-button d-flex fs-4 fw-normal text-decoration-none py-3 collapsed"
                                      href={`#order-${index}`}
                                      data-bs-toggle="collapse"
                                      aria-expanded="false"
                                      aria-controls={`order-${index}`}
                                    >
                                      <div
                                        className="d-flex justify-content-around w-100 overflow-auto"
                                        style={{ maxWidth: "100%" }}
                                      >
                                       <div className="me-1 me-sm-1">
                                        <div className="fs-sm text-body-secondary mb-2">
                                            
                                          </div>
                                          <div className="fs-sm fw-medium text-dark">
                                           {(pagination.current_page - 1) *
                                            resultsPerPage +
                                            index +
                                            1}
                                          </div>
                                       </div>
                                        <div className="me-3 me-sm-4">
                                          <div className="fs-sm text-body-secondary mb-2">
                                            Email
                                          </div>
                                          <div className="fs-sm fw-medium text-dark">
                                            {referral.email}
                                          </div>
                                        </div>
                                        <div className="me-3 me-sm-4">
                                          <div className="fs-sm text-body-secondary mb-2">
                                            Full Name
                                          </div>
                                          <div className="fs-sm fw-medium text-dark">
                                            {referral.full_name}
                                          </div>
                                        </div>
                                        <div className="me-3 me-sm-4">
                                          <div className="fs-sm text-body-secondary mb-2">
                                            Phone Number
                                          </div>
                                          <div className="fs-sm fw-medium text-dark">
                                            {referral.phone_number}
                                          </div>
                                        </div>
                                        <div className="me-3 me-sm-4">
                                          <div className="fs-sm text-body-secondary mb-2">
                                            Referral Code
                                          </div>
                                          <div className="fs-sm fw-medium text-dark">
                                            {referral.my_referral_code}
                                          </div>
                                        </div>
                                        <div className="me-3 me-sm-4">
                                          <div className="fs-sm text-body-secondary mb-2">
                                            Total Referrals
                                          </div>
                                          <div className="fs-sm fw-medium text-dark">
                                            {referral.total_referrals}
                                          </div>
                                        </div>
                                      </div>
                                    </a>
                                  </div>
                                  <div
                                    className="accordion-collapse collapse"
                                    id={`order-${index}`}
                                    data-bs-parent="#orders"
                                  >
                                    <div className="accordion-body">
                                      <hr />
                                      <div className="table-responsive bg-transparent pt-1">
                                        <table
                                          className="table align-middle w-100"
                                          style={{ minWidth: "450px" }}
                                        >
                                          <tbody>
                                            <tr>
                                              <td className="border-0 py-1 pe-0 ps-3 ps-sm-4">
                                                <div className="fs-sm text-body-secondary mb-2">
                                                  Total Bonus Earned
                                                </div>
                                                <div className="fs-sm fw-medium text-dark">
                                                  $
                                                  {
                                                    referral.all_total_bonus_earned
                                                  }
                                                </div>
                                              </td>
                                              <td className="border-0 py-1 pe-0 ps-3 ps-sm-4">
                                                <div className="fs-sm text-body-secondary mb-2">
                                                  Total Commission
                                                </div>
                                                <div className="fs-sm fw-medium text-dark">
                                                  ${referral.total_commission}
                                                </div>
                                              </td>
                                              <td className="border-0 py-1 pe-0 ps-3 ps-sm-4">
                                                <div className="fs-sm text-body-secondary mb-2">
                                                  Country
                                                </div>
                                                <div className="fs-sm fw-medium text-dark">
                                                  {formatCountry(
                                                    referral.country
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                      <hr />
                                      <h5 className="text-center mt-4">
                                        Referred Users
                                      </h5>
                                      <div className="card-body" style={{backgroundColor : "#f5faff"}}>
                                        {referral.referred_users.length > 0 ? (
                                          <div
                                            className="accordion accordion-alt accordion-orders"
                                            id={`orders-${index}`}
                                          >
                                            {referral.referred_users.map(
                                              (user, userIndex) => (
                                                <div
                                                  className="accordion-item pt-2 border-top border-bottom mb-0"
                                                  key={userIndex}
                                                >
                                                  <div className="accordion-header">
                                                    <a
                                                      className="accordion-button d-flex fs-4 fw-normal text-decoration-none py-3 collapsed"
                                                      href={`#order-${index}-${userIndex}`}
                                                      data-bs-toggle="collapse"
                                                      aria-expanded="false"
                                                      aria-controls={`order-${index}-${userIndex}`}
                                                    >
                                                      <div
                                                        className="d-flex justify-content-between w-100 overflow-auto"
                                                        style={{
                                                          maxWidth: "100%",
                                                        }}
                                                      >
                                                        <div className="me-3 me-sm-4">
                                                          <div className="fs-sm text-body-secondary mb-2">
                                                            Email
                                                          </div>
                                                          <div className="fs-sm fw-medium text-dark">
                                                            {user.email}
                                                          </div>
                                                        </div>
                                                        <div className="me-3 me-sm-4">
                                                          <div className="fs-sm text-body-secondary mb-2">
                                                            Full Name
                                                          </div>
                                                          <div className="fs-sm fw-medium text-dark">
                                                            {user.full_name}
                                                          </div>
                                                        </div>
                                                        <div className="me-3 me-sm-4">
                                                          <div className="fs-sm text-body-secondary mb-2">
                                                            Phone Number
                                                          </div>
                                                          <div className="fs-sm fw-medium text-dark">
                                                            {user.phone_number}
                                                          </div>
                                                        </div>
                                                        <div className="me-3 me-sm-4">
                                                          <div className="fs-sm text-body-secondary mb-2">
                                                            Registration Date
                                                          </div>
                                                          <div className="fs-sm fw-medium text-dark">
                                                            {dayjs(
                                                              user.registration_date
                                                            ).format(
                                                              "DD/MM/YYYY"
                                                            )}
                                                          </div>
                                                        </div>
                                                        <div className="me-3 me-sm-4">
                                                          <div className="fs-sm text-body-secondary mb-2">
                                                            Country
                                                          </div>
                                                          <div className="fs-sm fw-medium text-dark">
                                                            {formatCountry(
                                                              user.country
                                                            )}
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </a>
                                                  </div>
                                                  <div
                                                    className="accordion-collapse collapse"
                                                    id={`order-${index}-${userIndex}`}
                                                    data-bs-parent={`#orders-${index}`}
                                                  >
                                                    <div className="accordion-body">
                                                      <div className="bg-secondary rounded-1 p-4 my-2">
                                                        <div className="d-flex flex-wrap justify-content-around">
                                                          <div className="me-4 mb-3">
                                                            <div className="fs-sm text-body-secondary">
                                                              Total Bonus Earned
                                                            </div>
                                                            <div className="fs-sm fw-medium">
                                                              $
                                                              {
                                                                user.total_bonus_earned
                                                              }
                                                            </div>
                                                          </div>
                                                          <div className="me-4 mb-3">
                                                            <div className="fs-sm text-body-secondary">
                                                              Registration Date
                                                            </div>
                                                            <div className="fs-sm fw-medium">
                                                              {dayjs(
                                                                user.registration_date
                                                              ).format(
                                                                "DD/MM/YYYY hh:mm A"
                                                              )}
                                                            </div>
                                                          </div>
                                                        </div>

                                                        {/* Bonus Details Table */}
                                                        {user.bonus_details
                                                          .length > 0 && (
                                                          <div className="mt-3">
                                                            <h6>
                                                              Bonus Details
                                                            </h6>
                                                            <div className="table-responsive">
                                                              <table className="table ">
                                                                <thead>
                                                                  <tr>
                                                                    <th>
                                                                      Referred
                                                                      User Email
                                                                    </th>
                                                                    <th>
                                                                      Amount
                                                                    </th>
                                                                    <th>
                                                                      Details
                                                                    </th>
                                                                  </tr>
                                                                </thead>
                                                                <tbody>
                                                                  {user.bonus_details.map(
                                                                    (
                                                                      detail,
                                                                      detailIndex
                                                                    ) => (
                                                                      <tr
                                                                        key={
                                                                          detailIndex
                                                                        }
                                                                      >
                                                                        <td>
                                                                          {
                                                                            detail.referred_user_email
                                                                          }
                                                                        </td>
                                                                        <td>
                                                                          $
                                                                          {
                                                                            detail.total_amount
                                                                          }
                                                                        </td>
                                                                        <td>
                                                                          {
                                                                            detail.reward_details
                                                                          }
                                                                        </td>
                                                                      </tr>
                                                                    )
                                                                  )}
                                                                </tbody>
                                                              </table>
                                                            </div>
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          <p className="text-center">
                                            No referred users
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Pagination Controls */}
                            <div className="container-fluid mt-3 mb-3">
                              <div className="row m-0">
                                <div className="col-3">
                                  <FormControl variant="standard" fullWidth>
                                    <InputLabel>Results</InputLabel>
                                    <Select
                                      value={resultsPerPage}
                                      onChange={handleChangeResultsPerPage}
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
                                    disabled={referralList.length === 0}
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

              <form onSubmit={handleFilterSubmit}>
                <div className="row g-3 mt-3">
                  <div className="col-md-12">
                    <label className="form-label">Email</label>
                    <TextField
                      fullWidth
                      value={email}
                      type="email"
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
                    <label className="form-label">Start Date</label>
                    <TextField
                      fullWidth
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      error={!!dateError}
                      helperText={dateError ? dateError : ""}
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
                      helperText={dateError ? "" : " "} // Maintain space for consistent layout
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
                      disabled={!startDate}
                    />
                  </div>
                  <div className="col-6">
                    <Button
                      type="submit"
                      variant="contained"
                      className="me-2 w-100"
                      sx={{ height: "45px" }}
                      // onClick={() => setOpenFilter(false)}
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
              </form>
            </Box>
          </Modal>
        </>
      )}
    </>
  );
};

export default UserRefList;
