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

const WalletTransaction = () => {
  const [resultsPerPage, setResultsPerPage] = useState(10);

  const handleChange = (event) => {
    setResultsPerPage(event.target.value);
    // You can also trigger a data fetch here if needed
  };

  return (
    <div className="container py-5 mb-lg-4 ">
      <div className="row pt-sm-2 pt-lg-0">
        <SideNav />

        <div className="col-lg-9 pt-4 pb-2 pb-sm-4">
          <div className="d-sm-flex align-items-center mb-4">
            <h1 className="h2 mb-4 mb-sm-0 me-4">Wallet Transaction List</h1>
          </div>

          <div className="card shadow border-0">
            <div className="card-body">
              <div className="row g-3 g-xl-4">
                <div className="col-12">
                  <div className="overflow-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Date & Time</th>
                          <th>Transaction Id</th>
                          <th>User</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Balance</th>
                          <th>Remarks</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                       
                      </tbody>
                    </table>

                    <div className="container-fluid">
                      <div className="row">
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
                          <Pagination
                            count={11}
                            defaultPage={1}
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
  );
};

export default WalletTransaction;
