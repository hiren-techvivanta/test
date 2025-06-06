import React, { useEffect, useState } from "react";
import {
  IconButton,
  Pagination,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import SideNav from "../../components/SideNav";
import AddTaskIcon from "@mui/icons-material/AddTask";
import { toast } from "react-toastify";
import axios from "axios";
import { Modal } from "react-bootstrap";
import Loader from "../../components/Loader";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const config = {
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ5NDc3MjAzLCJpYXQiOjE3NDg4NzI0MDMsImp0aSI6IjA1MTUxNDk1NWRiZTQ0ZjdhMDZmYzQwZWIyYzU2MTRjIiwidXNlcl9pZCI6M30.q24JK72r3Ps-pUsSt9SzUPxPWo5YL5ph1gFyqdkABU8`,
  },
};

const Kyc = () => {
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [userData, setUserData] = useState([]);
  const [modalShow, setModalShow] = React.useState(false);
  const [id, setid] = useState("");
  const [loading, setloading] = useState(false);

  const handleChange = (event) => {
    setResultsPerPage(event.target.value);
    // You can also trigger a data fetch here if needed
  };

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setloading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/admin/kyc`,
        config
      );

      if (data.message === "KYC submissions retrieved successfully") {
        setUserData(data.data.kyc_submissions);
        setloading(false);
      }
    } catch (e) {
      toast.error(e.response.data.message || "Internal server error");
      setloading(false);
    }
  };

  const handleUpdateStatus = (e, id) => {
    e.preventDefault();
    setid(id);
    setModalShow(true);
  };

  // approve reaject modal
  function MyVerticallyCenteredModal(props) {
    const [message, setmessage] = useState("");
    const [filterData, setFilterData] = useState({});

    const handleSubmit = async (e, status) => {
      e.preventDefault();

      try {
        const formData = {
          status,
          admin_message: message,
        };
        const { data } = await axios.patch(
          `${process.env.REACT_APP_BACKEND_URL}/api/auth/admin/kyc/${id}/update-status/`,
          formData,
          config
        );

        if (data.error === "") {
          setid("");
          getData();
          toast.success(data.message);
          setModalShow(false);
        }
      } catch (e) {
        toast.error(e.response.data.message || "Internal server error");
      }
    };

    useEffect(() => {
      if (modalShow === true && id !== "") {
        const filteredData = userData.filter((e) => e.id === id);
        setFilterData(filteredData[0]);
      }
    }, [modalShow, id]);

    return (
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Update Status
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-2">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <table className="table">
                  <tbody>
                    <tr>
                      <th>Name</th>
                      <td>{`${filterData?.first_name} ${filterData?.last_name}`}</td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>{filterData?.email}</td>
                    </tr>
                    <tr>
                      <th>DOB</th>
                      <td>{filterData?.dob}</td>
                    </tr>
                    <tr>
                      <th>Mobile No.</th>
                      <td>{filterData?.phone_number}</td>
                    </tr>
                    <tr>
                      <th>Address</th>
                      <td>
                        {`${filterData?.residential_address?.line1}, ${filterData?.residential_address?.line2}, ${filterData?.residential_address?.street}, ${filterData?.residential_address?.city}, ${filterData?.residential_address?.state}, ${filterData?.residential_address?.country} - ${filterData?.residential_address?.postalCode}`}
                      </td>
                    </tr>
                    <tr>
                      <th>Document No.</th>
                      <td>{filterData?.id_document_number}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-12">
                <img
                  src={filterData?.document_image_url}
                  className="img-fluid"
                  alt={filterData?.first_name}
                />
              </div>
            </div>
            {filterData?.status === "Pending" && (
              <form>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Message</label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={(e) => setmessage(e.target.value)}
                    />
                  </div>
                  <div className="col-12 d-flex justify-content-around">
                    <button
                      className="btn btn-success"
                      onClick={(e) => handleSubmit(e, "Approve")}
                    >
                      <AddRoundedIcon /> Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={(e) => handleSubmit(e, "Reject")}
                    >
                      <CloseRoundedIcon /> Reject
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <>
      {loading === true ? (
        <>
          <Loader />
        </>
      ) : (
        <>
          <div className="container py-5 mb-lg-4 ">
            <div className="row pt-sm-2 pt-lg-0">
              <SideNav />

              <div className="col-lg-9 pt-4 pb-2 pb-sm-4">
                <div className="d-sm-flex align-items-center mb-4">
                  <h1 className="h2 mb-4 mb-sm-0 me-4">Users KYC List</h1>
                </div>

                <div className="card shadow border-0">
                  <div className="card-body">
                    <div className="row g-3 g-xl-4">
                      <div className="col-12">
                        <div className="overflow-auto">
                          {userData.length === 0 ? (
                            <>
                              <h5 className="text-center">No Data Found</h5>
                            </>
                          ) : (
                            <>
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th className="text-center">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {userData?.map((val, ind) => (
                                    <tr key={ind}>
                                      <td>{ind + 1}</td>
                                      <td>{`${val.first_name} ${val.last_name}`}</td>
                                      <td>{val.email}</td>
                                      <td>
                                        <span
                                          className={
                                            val.status === "Pending"
                                              ? "badge bg-warning fs-sm"
                                              : val.status === "Approved"
                                              ? "badge bg-success fs-sm"
                                              : "badge bg-danger fs-sm"
                                          }
                                        >
                                          {val.status}
                                        </span>
                                      </td>
                                      <td>
                                        <div className="d-flex justify-content-around">
                                          <Tooltip title="View Details">
                                            <IconButton
                                              color="info"
                                              onClick={(e) =>
                                                handleUpdateStatus(e, val.id)
                                              }
                                            >
                                              <VisibilityRoundedIcon />
                                            </IconButton>
                                          </Tooltip>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
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
                                      count={11}
                                      defaultPage={1}
                                      color="primary"
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
          </div>
          <MyVerticallyCenteredModal
            show={modalShow}
            onHide={() => setModalShow(false)}
          />
        </>
      )}
    </>
  );
};

export default Kyc;
