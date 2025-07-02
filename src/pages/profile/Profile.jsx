import React from "react";
import SideNav from "../../components/SideNav";
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TopNav from "../../components/TopNav";

const Profile = () => {
  const navigate = useNavigate();
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
                    <div className="all-members-list">Profile</div>
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
              <h1 className="h2 mb-4 mb-sm-0 me-4">Profile</h1>
            </div>

            <div className="card shadow border-0">
              <div className="card-body">
                <div className="d-flex align-items-center mt-sm-n1 pb-4 mb-0 mb-lg-1 mb-xl-3">
                  <i className="ai-user text-primary lead pe-1 me-2"></i>
                  <h2 className="h4 mb-0">Basic info</h2>
                  <button
                    className="btn btn-secondary ms-auto"
                    onClick={() => navigate("/profile/edit")}
                  >
                    <i className="ai-edit ms-n1 me-2"></i>
                    Edit info
                  </button>
                </div>
                <div className="d-md-flex align-items-center">
                  <div className="d-sm-flex align-items-center">
                    <Avatar
                      alt="Isabella"
                      src="/static/images/avatar/1.jpg"
                      sx={{ width: 80, height: 80, fontSize: 40 }}
                    />
                    <div className="pt-3 pt-sm-0 ps-sm-3">
                      <h3 className="h5 mb-2">
                        Isabella Bocouse
                        <i className="ai-circle-check-filled fs-base text-success ms-2"></i>
                      </h3>
                      <div className="text-body-secondary fw-medium d-flex flex-wrap flex-sm-nowrap align-iteems-center">
                        <div className="d-flex align-items-center me-3">
                          <i className="ai-mail me-1"></i>
                          email@example.com
                        </div>
                        <div className="d-flex align-items-center text-nowrap">
                          <i className="ai-map-pin me-1"></i>
                          USA, $
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 text-end">
                  <button className="btn btn-secondary  me-2">
                    <i className="ai-logout me-2"></i> Log Out
                  </button>
                  <button className="btn btn-danger" onClick={() => toast.success("Account Deleted Successfully")}>
                    <i className="ai-trash me-2"></i> Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default Profile;
