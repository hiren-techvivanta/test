import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Cookies from "js-cookie";
import { Avatar } from "@mui/material";
import {
  HomeRounded,
  PeopleRounded,
  PersonRounded,
  PersonAddRounded,
  AttachMoneyRounded,
  AccountBalanceWalletRounded,
  ListRounded,
  CreditCardRounded,
  SmartphoneRounded,
  SyncAltRounded,
  DescriptionRounded,
  WalletRounded,
  AddAlertRounded,
  NotificationsRounded,
  CheckCircleRounded,
  PersonOutlineRounded,
  ExitToAppRounded,
  BarChartRounded,
  GroupRounded,
  AccountBalanceRounded,
  CreditCard,
  Smartphone,
  SwapCallsRounded,
  NoteRounded,
  NotificationsActiveRounded,
  CheckCircleOutlineRounded,
} from "@mui/icons-material";

const Nav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminData, setAdminData] = useState({
    name: "Isabella Bocouse",
    email: "bocouse@example.com",
  });

  // Handle authentication
  useEffect(() => {
    const auth = Cookies.get("authToken");
    if (!auth) {
      navigate("/login");
    }
  }, []);


  // Define navigation items
  const navItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: <BarChartRounded />,
    },
    {
      path: "/sub-admin",
      label: "Sub-Admin",
      icon: <GroupRounded />,
    },
    {
      path: "/users",
      label: "User List",
      icon: <PersonRounded />,
    },
    {
      path: "/user/referrals",
      label: "User Referrals",
      icon: <PersonAddRounded />,
    },
    {
      path: "/wallet/mangement",
      label: "Wallet Management",
      icon: <AccountBalanceRounded />,
    },
    {
      path: "/wallet/transaction",
      label: "Wallet Transaction",
      icon: <AccountBalanceWalletRounded />,
    },
    {
      path: "/moneyart/transaction",
      label: "Moneyart Bill Transaction",
      icon: <ListRounded />,
    },
    {
      path: "/card/list",
      label: "Aeropay Card List",
      icon: <CreditCard />,
    },
    {
      path: "/mobile/recharge/transaction",
      label: "Mobile Recharge Transaction",
      icon: <Smartphone />,
    },
    {
      path: "/cripto/transaction",
      label: "Crypto Transaction",
      icon: <SwapCallsRounded />,
    },
    {
      path: "/bank-accounts",
      label: "Bank Account List",
      icon: <NoteRounded />,
    },
    {
      path: "/wallet-topup/transaction",
      label: "Wallet Topup",
      icon: <WalletRounded />,
    },
    {
      path: "/notification/send",
      label: "Send Notification",
      icon: <AddAlertRounded />,
    },
    {
      path: "/notification/list",
      label: "Notification List",
      icon: <NotificationsActiveRounded />,
    },
    {
      path: "/kyc",
      label: "Kyc List",
      icon: <CheckCircleOutlineRounded />,
    },
    {
      path: "/profile",
      label: "Profile",
      icon: <PersonOutlineRounded />,
    },
  ];

  const handleNavigation = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <div
      className="nav-container border-end d-flex flex-column"
      style={{
        // height: "auto",
        // overflowY: "auto",
        backgroundColor:"#fff",
        padding: "20px 0",
      }}
    >
      {/* Admin Profile */}
      <div className="d-flex flex-column align-items-center mb-3">
        <Avatar
          alt={adminData.name}
          src="/static/images/avatar/1.jpg"
          sx={{
            width: 80,
            height: 80,
            fontSize: 40,
            marginBottom: "15px",
            border: "3px solid #e0e0e0",
          }}
        />
        <h3 className="h5 mb-1 text-center fw-bold">{adminData.name}</h3>
        <p className="fs-sm text-muted text-center mb-0">{adminData.email}</p>
      </div>

      {/* Navigation Items */}
      <div className="container-fluid p-0">
        <div className="row g-3 mt-4 mx-0">
          {navItems.map((item, ind) => (
            <div className="col-12" key={ind}>
              <div
                className={`side-nav d-flex align-items-center gap-2 ${
                  location.pathname === item.path ? "active-nav" : ""
                }`}
                onClick={(e) => handleNavigation(e, item.path)}
                style={{ cursor: "pointer" }}
              >
                {item.icon}
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Nav;
