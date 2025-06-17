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

  const token = Cookies.get("authToken");

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
                  <h1 className="h2 mb-4 mb-sm-0 me-4">
                    Mobile Recharge Transaction
                  </h1>
                </div>

                <form onSubmit={handleFilterSubmit}>
                  <div className="row g-3 mb-4">
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
                        color="light"
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
                    <div className="overflow-auto">
                      <table className="table table-striped">
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
                          {loading ? (
                            <tr>
                              <td colSpan="9" align="center">
                                Loading...
                              </td>
                            </tr>
                          ) : transactions.length === 0 ? (
                            <tr>
                              <td colSpan="9" align="center">
                                No data found
                              </td>
                            </tr>
                          ) : (
                            transactions.map((v, i) => (
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
                                <td>{v.user_details?.full_name}</td>
                                <td>{v.user_details?.email}</td>
                                <td>{v.user_details?.phone_number}</td>
                                <td>
                                  <span
                                    className={`badge bg-${
                                      v.status === "success"
                                        ? "success"
                                        : "danger"
                                    }`}
                                  >
                                    {v.status}
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
                            ))
                          )}
                        </tbody>
                      </table>

                      {/* Pagination */}
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
                              showFirstButton
                              showLastButton
                            />
                          </div>
                        </div>
                      </div>
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
                  <DialogContent
                    style={{ maxHeight: "70vh", overflow: "auto" }}
                  >
                    {selectedTransaction && (
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <strong>User Name</strong>
                            </TableCell>
                            <TableCell>
                              {selectedTransaction.user_details.full_name}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Email</strong>
                            </TableCell>
                            <TableCell>
                              {selectedTransaction.user_details.email}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Mobile</strong>
                            </TableCell>
                            <TableCell>
                              {selectedTransaction.user_details.phone_number}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Amount</strong>
                            </TableCell>
                            <TableCell>{selectedTransaction.amount}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Order ID</strong>
                            </TableCell>
                            <TableCell>
                              {selectedTransaction.order_id}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>UTR</strong>
                            </TableCell>
                            <TableCell>{selectedTransaction.utr}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Recharge Type</strong>
                            </TableCell>
                            <TableCell>
                              {selectedTransaction.recharge_type}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Status</strong>
                            </TableCell>
                            <TableCell>{selectedTransaction.status}</TableCell>
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
                        </TableBody>
                      </Table>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileRechargeTransaction;
