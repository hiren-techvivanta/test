import React, { useState } from "react";
import SideNav from "../../components/SideNav";
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
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import TopNav from "../../components/TopNav";

const Subadmin = () => {
  const navigate = useNavigate();
  const [resultsPerPage, setResultsPerPage] = useState(10);

  const handleChange = (event) => {
    setResultsPerPage(event.target.value);
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
                  <div className="frame-1597880849">
                    <div className="all-members-list">Sub Admin</div>
                  </div>
                  <div className="card shadow border-0 mt-4">
                    <div className="card-body">
                      <div className="row g-3 g-xl-4">
                        <div className="col-12">
                          <div className="overflow-auto">
                            <p>Not functional</p>
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

      {/* <div className="container py-5 mb-lg-4 ">
      <div className="row pt-sm-2 pt-lg-0">
        <SideNav />

        <div className="col-lg-9 pt-4 pb-2 pb-sm-4">
          <div className="d-sm-flex align-items-center mb-4">
            <h1 className="h2 mb-4 mb-sm-0 me-4">Sub-Admin</h1>
          </div>

          <div className="card shadow border-0">
            <div className="card-body">
              <div className="row g-3 g-xl-4">
                <div className="col-12 text-end">
                  <button className="btn btn-secondary" onClick={() => navigate('/sub-admin/new')}>
                    <i className="ai-user-plus me-2"></i> Add
                  </button>
                </div>
                <div className="col-12">
                  <div className="overflow-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>Rohit</td>
                          <td>rohit1212@gmail.com</td>
                          <td>
                            <span className="badge bg-success fs-sm">Active</span>
                          </td>
                          <td>
                            <div className="d-flex justify-content-around">
                              <Tooltip title="Edit">
                                <IconButton color="success" onClick={() => navigate("/sub-admin/edit/1")}>
                                  <EditRoundedIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton color="error">
                                  <DeleteForeverRoundedIcon />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="container-fluid p-0">
                      <div className="row m-0">
                        <div className="col-3">
                          <FormControl variant="standard" fullWidth>
                            <InputLabel id="results-label">Results</InputLabel>
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
                          <Pagination count={11} defaultPage={1} color="primary" />
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
    </div> */}
    </>
  );
};

export default Subadmin;
