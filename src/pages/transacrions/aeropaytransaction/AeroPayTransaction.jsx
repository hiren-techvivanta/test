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
  const [endDate, setEndDate] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false);

  const token = Cookies.get("authToken");

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

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    getData(1);
  };

  const resetFilters = () => {
    setEmail("");
    setMobile("");
    setStartDate("");
    setEndDate("");
    setResetTrigger(true);
  };

  const handleViewDetails = (txn) => {
    setSelectedTransaction(txn);
    setOpen(true);
  };

  return (
    <>
      {loading === true ? (
        <>
          <Loader />
        </>
      ) : (
        <>
          <div className="container py-5 mb-lg-4">
            <div className="row pt-sm-2 pt-lg-0">
              <SideNav />
              <div className="col-lg-9 pt-4 pb-2 pb-sm-4">
                <div className="d-sm-flex align-items-center mb-4">
                  <h1 className="h2 mb-4 mb-sm-0 me-4">AeroPay Card List</h1>
                </div>

                {/* Filter Form */}
                <form onSubmit={handleFilterSubmit} className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <TextField
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </div>
                    <div className="col-md-3">
                      <TextField
                        label="Mobile Number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
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
                        onChange={(e) => setStartDate(e.target.value)}
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
                        onChange={(e) => setEndDate(e.target.value)}
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
                        onClick={resetFilters}
                        fullWidth
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Table */}
                <div className="card shadow border-0">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table">
                        <thead className="">
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
                          {loading ? (
                            <tr>
                              <td colSpan="6" align="center">
                                Loading...
                              </td>
                            </tr>
                          ) : transactions.length === 0 ? (
                            <tr>
                              <td colSpan="6" align="center">
                                No data found
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
                                <td>{txn.user_details?.email || "N/A"}</td>
                                <td>{txn.masked_pan || "N/A"}</td>
                                <td>
                                  <span
                                    className={`badge bg-${
                                      txn.status === "ACTIVE"
                                        ? "success"
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
                                    >
                                      <VisibilityRoundedIcon />
                                    </IconButton>
                                  </Tooltip>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="container-fluid mt-3">
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
                          />
                        </div>
                      </div>
                    </div>

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
                              {Object.entries(selectedTransaction).map(
                                ([key, value]) => (
                                  <TableRow key={key}>
                                    <TableCell>{key}</TableCell>
                                    <TableCell>
                                      {typeof value === "object"
                                        ? JSON.stringify(value, null, 2)
                                        : value}
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        ) : (
                          <DialogContentText>
                            No data available
                          </DialogContentText>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AeroPayTransaction;
