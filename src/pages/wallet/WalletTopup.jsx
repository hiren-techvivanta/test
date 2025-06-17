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
import SideNav from "../../components/SideNav";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import Loader from "../../components/Loader";

const WalletTopup = () => {
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
        status: mobile || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page,
        page_size: pageSize,
      };

      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/wallet/admin/wallet-topups/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (res.data.status === 200) {
        const { topups, pagination: pg } = res.data.data;
        setTransactions(topups);
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

  console.log(transactions);

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
                  <h1 className="h2 mb-4 mb-sm-0 me-4">Wallet Topup</h1>
                </div>

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
                      <Select
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        displayEmpty
                        className="w-100"
                        size="small"
                        inputProps={{ "aria-label": "Without label" }}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value={"initiated"}>Initiated</MenuItem>
                        <MenuItem value={"completed"}>Completed</MenuItem>
                      </Select>
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

                <div className="card shadow border-0">
                  <div className="card-body">
                    <div className="overflow-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>User Name</th>
                            <th>User Email</th>
                            <th>Currency</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Transaction Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan="10" align="center">
                                Loading...
                              </td>
                            </tr>
                          ) : transactions.length === 0 ? (
                            <tr>
                              <td colSpan="10" align="center">
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
                                <td>{txn?.user_full_name}</td>
                                <td>{txn?.user_email}</td>
                                <td>{txn.currency}</td>
                                <td>{txn.amount}</td>
                                <td>
                                  <span
                                    className={
                                      txn.status === "completed"
                                        ? "badge bg-success"
                                        : txn.status === "initiated"
                                        ? "badge bg-warning"
                                        : "badge bg-danger"
                                    }
                                  >
                                    {" "}
                                    {txn.status}
                                  </span>
                                </td>
                                <td>
                                  {dayjs(txn.created_at).format(
                                    "DD/MM/YYYY hh:mm A"
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>

                      <div className="container-fluid">
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
                                {Object.entries(selectedTransaction).map(
                                  ([key, value]) => (
                                    <TableRow key={key}>
                                      <TableCell>{key}</TableCell>
                                      <TableCell>
                                        {typeof value === "object"
                                          ? JSON.stringify(value)
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
          </div>
        </>
      )}
    </>
  );
};

export default WalletTopup;
