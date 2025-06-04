import { Avatar } from "@mui/material";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import i1 from '../assets/logo/logo.png'
// import second from 'first'

const SideNav = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="col-lg-3 pe-lg-4 pe-xl-5 mt-n3">
      <div className="position-lg-sticky top-0">
        <img src={i1} className="img-fluid w-50" alt="logo" />
        <div className="d-none d-lg-block" style={{ paddingTop: "30px" }}></div>
        <div className="offcanvas-lg offcanvas-start" id="sidebarAccount">
          <button
            className="btn-close position-absolute top-0 end-0 mt-3 me-3 d-lg-none"
            type="button"
            data-bs-dismiss="offcanvas"
            data-bs-target="#sidebarAccount"
            aria-label="Close"
          ></button>
          <div className="offcanvas-body">
            <div className="pb-2 pb-lg-0 mb-4 mb-lg-5">
              <div className="text-center">
                <Avatar
                  alt="Isabella"
                  src="/static/images/avatar/1.jpg"
                  sx={{ width: 80, height: 80, fontSize: 40 }}
                />
              </div>
              <h3 className="h5 mb-1">Isabella Bocouse</h3>
              <p className="fs-sm text-body-secondary mb-0">
                bocouse@example.com
              </p>
            </div>

            <nav className="nav flex-column pb-2 pb-lg-4 mb-1">
              <h4 className="fs-xs fw-medium text-body-secondary text-uppercase pb-1 mb-2">
                Dashboard
              </h4>
              <Link
                className={`nav-link fw-semibold py-2 px-0 ${
                  isActive("/") ? "active" : ""
                }`}
                to="/"
              >
                <i className="ai-chart fs-5 opacity-60 me-2"></i>
                Dashboard
              </Link>
              <Link
                className={`nav-link fw-semibold py-2 px-0 ${
                  isActive("/sub-admin") ? "active" : ""
                }`}
                to="/sub-admin"
              >
                <i className="ai-user-group fs-5 opacity-60 me-2"></i>
                Sub-Admin
              </Link>
              <Link
                className={`nav-link fw-semibold py-2 px-0 ${
                  isActive("/users") ? "active" : ""
                }`}
                to="/users"
              >
                <i className="ai-user fs-5 opacity-60 me-2"></i>
                User List
                {/* <span className="badge bg-danger ms-auto">4</span> */}
              </Link>
              <Link
                className={`nav-link fw-semibold py-2 px-0 ${
                  isActive("/wallet/transaction") ? "active" : ""
                }`}
                to="/wallet/transaction"
              >
                <i className="ai-wallet fs-5 opacity-60 me-2"></i>
                Wallet Transaction
              </Link>
              <Link
                className={`nav-link fw-semibold py-2 px-0 ${
                  isActive("/moneyart/transaction") ? "active" : ""
                }`}
                to="/moneyart/transaction"
              >
                <i className="ai-list fs-5 opacity-60 me-2"></i>
                Moneyart Transaction
              </Link>
              <Link
                className={`nav-link fw-semibold py-2 px-0 ${
                  isActive("/mobile/recharge/transaction") ? "active" : ""
                }`}
                to="/mobile/recharge/transaction"
              >
                <i className="ai-mobile fs-5 opacity-60 me-2"></i>
                Mobile Recharge Transaction
              </Link>
              <Link
                className={`nav-link fw-semibold py-2 px-0 ${
                  isActive("/notification/send") ? "active" : ""
                }`}
                to="/notification/send"
              >
                <i className="ai-bell-plus fs-5 opacity-60 me-2"></i>
                Send Notification
              </Link>
              <Link
                className={`nav-link fw-semibold py-2 px-0 ${
                  isActive("/notification/list") ? "active" : ""
                }`}
                to="/notification/list"
              >
                <i className="ai-bell fs-5 opacity-60 me-2"></i>
                Notification List
              </Link>
              <Link
                className={`nav-link fw-semibold py-2 px-0 ${
                  isActive("/Kyc") ? "active" : ""
                }`}
                to="/kyc"
              >
                <i className=" ai-circle-check fs-5 opacity-60 me-2"></i>
                Kyc List
              </Link>
            </nav>

            <nav className="nav flex-column pb-2 pb-lg-4 mb-3">
              <h4 className="fs-xs fw-medium text-body-secondary text-uppercase pb-1 mb-2">
                Account
              </h4>
              <Link
                className={`nav-link fw-semibold py-2 px-0 ${
                  isActive("/profile") ? "active" : ""
                }`}
                to="/profile"
              >
                <i className="ai-user-check fs-5 opacity-60 me-2"></i>
                Profile
              </Link>
            </nav>

            <nav className="nav flex-column">
              <Link
                className={`nav-link fw-semibold py-2 px-0 ${
                  isActive("/login") ? "active" : ""
                }`}
                to="/login"
              >
                <i className="ai-logout fs-5 opacity-60 me-2"></i>
                Sign out
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideNav;
