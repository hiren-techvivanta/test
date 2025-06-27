import { Button } from "@mui/material";
import React from "react";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import logo from "../assets/logo/logo.png";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const TopNav = () => {
  const navigate = useNavigate();

  const handleLogOut = (e) => {
    e.preventDefault();
    Cookies.remove("authToken");
    navigate("/login");
  };
  return (
    <>
      <div className="row m-0 bg-white py-3 border-bottom">
        <div className="col-3 p-0 d-flex justify-content-center gap-3 align-items-center border-end">
          <img src={logo} className="img-fluid" alt="" />
          <h3 className="fw-bold m-0">Admin</h3>
        </div>
        <div className="col-9 p-0">
          <div className="text-end">
            <Button
              sx={{
                height: "40px",
              }}
              className="rounded-1 me-3"
              variant="contained"
              startIcon={<LogoutRoundedIcon />}
              onClick={(e) => handleLogOut(e)}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopNav;
