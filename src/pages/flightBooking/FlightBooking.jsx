import React from "react";
import TopNav from "../../components/TopNav";
import SideNav from "../../components/SideNav";
import { IconButton, Tooltip } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

const FlightBooking = () => {
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
                <div className="frame-1597880849">
                  <div className="all-members-list">Flight Booking</div>
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
                                <th className="main-table">CHACK IN DATE AND TIME</th>
                                <th className="main-table">CHACK OUT DATE AND TIME</th>
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
                                <td className="main-table">Surat internatial airpot</td>
                                <td className="main-table">Dubai internatial airport</td>
                                <td className="main-table">01-01-2025 02:40 pm</td>
                                <td className="main-table">01-01-2025 07:10 pm</td>
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
