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
                  <div className="frame-1597880849">
                    <div className="all-members-list">Notification List</div>
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
    </>
  );
};

export default NotificationList;
