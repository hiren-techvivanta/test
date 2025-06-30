import React, { useState } from "react";
import TopNav from "../../components/TopNav";
import SideNav from "../../components/SideNav";
import {
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Tooltip,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";

const FlightBooking = () => {
  const [exporting, setexporting] = useState(false)
  return (
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
                  <div className="all-members-list">Flight Booking</div>

                  <div className="frame-1597880735">
                    <div className="frame-1597880734">
                      <Button
                        variant="contained"
                        className="excel"
                        sx={{ padding: "0 16px", height: "48px", boxShadow:"none" }}
                        // onClick={fetchExportData}
                        // disabled={exporting}
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
                        // onClick={handleOpenFilter}
                      >
                        Filter
                      </Button>
                    </div>
                  </div>
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
                                <th className="main-table">NAME</th>
                                <th className="main-table">EMAIL</th>
                                <th className="main-table">MOBILE NO.</th>
                                <th className="main-table">ARILINCE NAME</th>
                                <th className="main-table">FLIGHT CODE</th>
                                <th className="main-table">CHACK IN</th>
                                <th className="main-table">CHACK OUT</th>
                                <th className="main-table">
                                  CHACK IN DATE AND TIME
                                </th>
                                <th className="main-table">
                                  CHACK OUT DATE AND TIME
                                </th>
                                <th className="main-table">BOOKING STATUS</th>
                                <th className="main-table">AMOUNT</th>
                                <th className="main-table">ACTION</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>1</td>
                                <td className="main-table">Hiren</td>
                                <td className="main-table">hiren@gmail.com</td>
                                <td className="main-table">9876543210</td>
                                <td className="main-table">indigo</td>
                                <td className="main-table">ind3040</td>
                                <td className="main-table">
                                  Surat internatial airpot
                                </td>
                                <td className="main-table">
                                  Dubai internatial airport
                                </td>
                                <td className="main-table">
                                  01-01-2025 02:40 pm
                                </td>
                                <td className="main-table">
                                  01-01-2025 07:10 pm
                                </td>
                                <td className="main-table">
                                  <span className="badge bg-success">
                                    Success
                                  </span>
                                </td>
                                <td className="main-table">$100</td>
                                <td>
                                  <Tooltip title="View Details">
                                    <IconButton color="info">
                                      <VisibilityRoundedIcon />
                                    </IconButton>
                                  </Tooltip>
                                </td>
                              </tr>
                              <tr>
                                <td>2</td>
                                <td className="main-table">Hiren</td>
                                <td className="main-table">hiren@gmail.com</td>
                                <td className="main-table">9876543210</td>
                                <td className="main-table">air india</td>
                                <td className="main-table">ind3040</td>
                                <td className="main-table">
                                  Surat internatial airpot
                                </td>
                                <td className="main-table">
                                  Dubai internatial airport
                                </td>
                                <td className="main-table">
                                  01-01-2025 02:40 pm
                                </td>
                                <td className="main-table">
                                  01-01-2025 07:10 pm
                                </td>
                                <td className="main-table">
                                  <span className="badge bg-success">
                                    Success
                                  </span>
                                </td>
                                <td className="main-table">$100</td>
                                <td>
                                  <Tooltip title="View Details">
                                    <IconButton color="info">
                                      <VisibilityRoundedIcon />
                                    </IconButton>
                                  </Tooltip>
                                </td>
                              </tr>
                              <tr>
                                <td>3</td>
                                <td className="main-table">Hiren</td>
                                <td className="main-table">hiren@gmail.com</td>
                                <td className="main-table">9876543210</td>
                                <td className="main-table">king fisher</td>
                                <td className="main-table">ind3040</td>
                                <td className="main-table">
                                  Surat internatial airpot
                                </td>
                                <td className="main-table">
                                  Dubai internatial airport
                                </td>
                                <td className="main-table">
                                  01-01-2025 02:40 pm
                                </td>
                                <td className="main-table">
                                  01-01-2025 07:10 pm
                                </td>
                                <td className="main-table">
                                  <span className="badge bg-success">
                                    Success
                                  </span>
                                </td>
                                <td className="main-table">$100</td>
                                <td>
                                  <Tooltip title="View Details">
                                    <IconButton color="info">
                                      <VisibilityRoundedIcon />
                                    </IconButton>
                                  </Tooltip>
                                </td>
                              </tr>
                              <tr>
                                <td>4</td>
                                <td className="main-table">Hiren</td>
                                <td className="main-table">hiren@gmail.com</td>
                                <td className="main-table">9876543210</td>
                                <td className="main-table">air canada</td>
                                <td className="main-table">ind3040</td>
                                <td className="main-table">
                                  Surat internatial airpot
                                </td>
                                <td className="main-table">
                                  Toronto internatial airport
                                </td>
                                <td className="main-table">
                                  01-01-2025 02:40 pm
                                </td>
                                <td className="main-table">
                                  01-01-2025 07:10 pm
                                </td>
                                <td className="main-table">
                                  <span className="badge bg-success">
                                    Success
                                  </span>
                                </td>
                                <td className="main-table">$100</td>
                                <td>
                                  <Tooltip title="View Details">
                                    <IconButton color="info">
                                      <VisibilityRoundedIcon />
                                    </IconButton>
                                  </Tooltip>
                                </td>
                              </tr>
                              <tr>
                                <td>5</td>
                                <td className="main-table">Hiren</td>
                                <td className="main-table">hiren@gmail.com</td>
                                <td className="main-table">9876543210</td>
                                <td className="main-table">indigo</td>
                                <td className="main-table">ind3040</td>
                                <td className="main-table">
                                  Surat internatial airpot
                                </td>
                                <td className="main-table">
                                  Dubai internatial airport
                                </td>
                                <td className="main-table">
                                  01-01-2025 02:40 pm
                                </td>
                                <td className="main-table">
                                  01-01-2025 07:10 pm
                                </td>
                                <td className="main-table">
                                  <span className="badge bg-success">
                                    Success
                                  </span>
                                </td>
                                <td className="main-table">$100</td>
                                <td>
                                  <Tooltip title="View Details">
                                    <IconButton color="info">
                                      <VisibilityRoundedIcon />
                                    </IconButton>
                                  </Tooltip>
                                </td>
                              </tr>
                              <tr>
                                <td>6</td>
                                <td className="main-table">Hiren</td>
                                <td className="main-table">hiren@gmail.com</td>
                                <td className="main-table">9876543210</td>
                                <td className="main-table">indigo</td>
                                <td className="main-table">ind3040</td>
                                <td className="main-table">
                                  Surat internatial airpot
                                </td>
                                <td className="main-table">
                                  Dubai internatial airport
                                </td>
                                <td className="main-table">
                                  01-01-2025 02:40 pm
                                </td>
                                <td className="main-table">
                                  01-01-2025 07:10 pm
                                </td>
                                <td className="main-table">
                                  <span className="badge bg-success">
                                    Success
                                  </span>
                                </td>
                                <td className="main-table">$100</td>
                                <td>
                                  <Tooltip title="View Details">
                                    <IconButton color="info">
                                      <VisibilityRoundedIcon />
                                    </IconButton>
                                  </Tooltip>
                                </td>
                              </tr>
                              <tr>
                                <td>7</td>
                                <td className="main-table">Hiren</td>
                                <td className="main-table">hiren@gmail.com</td>
                                <td className="main-table">9876543210</td>
                                <td className="main-table">indigo</td>
                                <td className="main-table">ind3040</td>
                                <td className="main-table">
                                  Surat internatial airpot
                                </td>
                                <td className="main-table">
                                  Dubai internatial airport
                                </td>
                                <td className="main-table">
                                  01-01-2025 02:40 pm
                                </td>
                                <td className="main-table">
                                  01-01-2025 07:10 pm
                                </td>
                                <td className="main-table">
                                  <span className="badge bg-success">
                                    Success
                                  </span>
                                </td>
                                <td className="main-table">$100</td>
                                <td>
                                  <Tooltip title="View Details">
                                    <IconButton color="info">
                                      <VisibilityRoundedIcon />
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
                                  // onChange={handleResultsPerPageChange}
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
  );
};

export default FlightBooking;
