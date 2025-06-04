import React from "react";
import SideNav from "../../components/SideNav";
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Profile = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="container py-5 mb-lg-4 ">
        <div className="row pt-sm-2 pt-lg-0">
          <SideNav />

          <div className="col-lg-9 pt-4 pb-2 pb-sm-4">
            <div className="d-sm-flex align-items-center mb-4">
              <h1 className="h2 mb-4 mb-sm-0 me-4">Profile</h1>
            </div>

            <div className="card shadow border-0">
              <div className="card-body">
                <div class="d-flex align-items-center mt-sm-n1 pb-4 mb-0 mb-lg-1 mb-xl-3">
                  <i class="ai-user text-primary lead pe-1 me-2"></i>
                  <h2 class="h4 mb-0">Basic info</h2>
                  <button
                    class="btn btn-secondary ms-auto"
                    onClick={() => navigate("/profile/edit")}
                  >
                    <i class="ai-edit ms-n1 me-2"></i>
                    Edit info
                  </button>
                </div>
                <div class="d-md-flex align-items-center">
                  <div class="d-sm-flex align-items-center">
                    <Avatar
                      alt="Isabella"
                      src="/static/images/avatar/1.jpg"
                      sx={{ width: 80, height: 80, fontSize: 40 }}
                    />
                    <div class="pt-3 pt-sm-0 ps-sm-3">
                      <h3 class="h5 mb-2">
                        Isabella Bocouse
                        <i class="ai-circle-check-filled fs-base text-success ms-2"></i>
                      </h3>
                      <div class="text-body-secondary fw-medium d-flex flex-wrap flex-sm-nowrap align-iteems-center">
                        <div class="d-flex align-items-center me-3">
                          <i class="ai-mail me-1"></i>
                          email@example.com
                        </div>
                        <div class="d-flex align-items-center text-nowrap">
                          <i class="ai-map-pin me-1"></i>
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
      </div>
    </>
  );
};

export default Profile;
