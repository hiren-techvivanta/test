import React, { useState } from "react";
import SideNav from "../../../components/SideNav";
import {
  IconButton,
  Pagination,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import TopNav from "../../../components/TopNav";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

const NotificationList = () => {
  const [resultsPerPage, setResultsPerPage] = useState(10);

  const handleChange = (event) => {
    setResultsPerPage(event.target.value);
    // You can also trigger a data fetch here if needed
  };

  return (
    <>
      <div className="container-fluid p-0 m-0">
        <TopNav />
        <div className="row m-0">
          <div
            className="col-3 p-0"
            style={{ maxHeight: "100%", overflowY: "auto" }}
          >
            <SideNav />
          </div>
          <div className="col-9">
            <div className="container-fluid p-0">
              <div className="row m-0">
                <div
                  className="col-12 py-3"
                  style={{ background: "#EEEEEE", minHeight: "93vh" }}
                >
                  <div className="alert alert-info">
                    <span>
                      <i className="ai-circle-alert me-2"></i>
                    </span>
                    This page have dummy data, Api not added yet.
                  </div>
                  <div className="frame-1597880849">
                    <div className="all-members-list">Notification List</div>
                  </div>
                  <div className="card shadow border-0 mt-4">
                    <div className="card-body">
                      <div className="row g-3 g-xl-4">
                        <div className="col-12">
                          <div className="overflow-auto">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>NOTIFICATION ID</th>
                                  <th>NOTIFICATION DATE</th>
                                  <th>TITLE</th>
                                  <th>ACTION</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>1</td>
                                  <td>342312</td>
                                  <td>01-01-2025 3:20pm</td>
                                  <td>Test Notification</td>
                                  <td>
                                    <Tooltip title="Resend notification">
                                      <IconButton color="info">
                                        <ReplayRoundedIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </td>
                                </tr>
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
                                    value={10}
                                    // onChange={handleChange}
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
                                  count={10}
                                  page={1}
                                  // onChange={handlePageChange}
                                  color="primary"
                                  // disabled={transactions.length === 0}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationList;
