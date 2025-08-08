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
  FlightTakeoffRounded,
} from "@mui/icons-material";

import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';

const Nav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState({});
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

  const routeMapping = {
    "manage-users": {
      "All User": "/users",
      "User Referrals": "/user/referrals",
    },
    wallet: {
      "Wallet Mangement": "/wallet/mangement",
      "Wallet Transaction": "/wallet/transaction",
    },
    bank: {
      "Bank Account List": "/bank-accounts",
      "Aeropay Card List": "/card/list",
    },
    transaction: {
      "Moneyart Bill Transaction": "/moneyart/transaction",
      "Crypto Transaction": "/cripto/transaction",
      "Wallet Topup": "/wallet-topup/transaction",
      "Mobile Recharge Trancaction": "/mobile/recharge/transaction",
      "Flight Booking Transaction": "/flight/booking",
    },
    notification: {
      "Send NoTification": "/notification/send",
      "Notification List": "/notification/list",
    },
  };

  const dropdownOptions = {
    "manage-users": ["All User", "User Referrals"],
    wallet: ["Wallet Mangement", "Wallet Transaction"],
    bank: ["Bank Account List", "Aeropay Card List"],
    transaction: [
      "Moneyart Bill Transaction",
      "Crypto Transaction",
      "Wallet Topup",
      "Mobile Recharge Trancaction",
      "Flight Booking Transaction",
    ],
    notification: ["Send NoTification", "Notification List"],
  };

  // Get current active option based on current route
  const getCurrentActiveOption = (dropdownKey) => {
    const routes = routeMapping[dropdownKey];
    if (!routes) return null;

    for (const [option, route] of Object.entries(routes)) {
      if (location.pathname === route) {
        return option;
      }
    }
    return null; // Return null if no route matches
  };

  // Initialize active options based on current route
  const [activeOptions, setActiveOptions] = useState(() => {
    const initialOptions = {};
    Object.keys(dropdownOptions).forEach((key) => {
      initialOptions[key] = getCurrentActiveOption(key);
    });
    return initialOptions;
  });

  // Check if current route belongs to a dropdown section
  const isDropdownActive = (dropdownKey) => {
    const routes = routeMapping[dropdownKey];
    if (!routes) return false;

    // Check if current pathname matches any route in this dropdown
    return Object.values(routes).includes(location.pathname);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideAnyDropdown = Object.keys(openDropdowns).some(
        (key) => {
          const element = document.querySelector(`[data-dropdown="${key}"]`);
          return element && element.contains(event.target);
        }
      );

      if (!isClickInsideAnyDropdown) {
        setOpenDropdowns({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdowns]);

  // Update active options when route changes
  useEffect(() => {
    const newActiveOptions = {};
    Object.keys(dropdownOptions).forEach((key) => {
      newActiveOptions[key] = getCurrentActiveOption(key);
    });
    setActiveOptions(newActiveOptions);
  }, [location.pathname]);

  const toggleDropdown = (dropdownKey, e) => {
    e.stopPropagation();

    // Close other dropdowns and toggle current one
    setOpenDropdowns((prev) => {
      const newState = {};
      // Close all other dropdowns
      Object.keys(prev).forEach((key) => {
        if (key !== dropdownKey) {
          newState[key] = false;
        }
      });
      // Toggle current dropdown
      newState[dropdownKey] = !prev[dropdownKey];
      return newState;
    });
  };

  const handleOptionSelect = (dropdownKey, option, e) => {
    e.stopPropagation();

    // Navigate to the corresponding route
    const route = routeMapping[dropdownKey]?.[option];
    if (route) {
      navigate(route);
    }

    // Update active option
    setActiveOptions((prev) => ({
      ...prev,
      [dropdownKey]: option,
    }));

    // Close dropdown
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdownKey]: false,
    }));
  };

  const handleDashboardClick = () => {
    navigate("/");
  };

  const renderDropdown = (key, title, options, icon) => (
    <div className="col-12" key={key}>
      <div className="dropdown-wrapper" data-dropdown={key}>
        {/* Dropdown Header */}
        <div
          className={`dropdown-header ${
            isDropdownActive(key) || openDropdowns[key] ? "active-dropdown" : ""
          }`}
          onClick={(e) => toggleDropdown(key, e)}
        >
          <div className="dropdown-header-content">
            {icon}
            {/* <PeopleRoundedIcon className="users-icon" /> */}
            <span className="manage-users-text">{title}</span>
          </div>
          {openDropdowns[key] ? (
            <KeyboardArrowUpRoundedIcon className="chevron-icon" />
          ) : (
            <KeyboardArrowDownRoundedIcon className="chevron-icon" />
          )}
        </div>

        {/* Dropdown Menu with Animation */}
        {openDropdowns[key] && (
          <div className="dropdown-menu dropdown-menu-open">
            {options.map((option, index) => (
              <div
                key={option}
                className={`dropdown-item ${
                  activeOptions[key] === option ? "active" : ""
                } ${index === options.length - 1 ? "last-item" : ""}`}
                onClick={(e) => handleOptionSelect(key, option, e)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

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
      path: "/flight/booking",
      label: "Flight Booking List",
      icon: <FlightTakeoffRounded />,
    },
    {
      path: "/pay-out",
      label: "Payout Transaction",
      icon: <RequestQuoteRoundedIcon />,
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
        height: "auto",
        // overflowY: "auto",
        backgroundColor: "#fff",
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
        <div className="row g-3 mt-4 mx-0 position-relative h-auto">
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
          {/* {renderDropdown(
            "manage-users",
            "Manage Users",
            dropdownOptions["manage-users"],
            <PersonRounded className="users-icon" />
          )}
          {renderDropdown(
            "wallet",
            "Wallet",
            dropdownOptions["wallet"],
            <WalletRounded className="users-icon" />
          )}
          {renderDropdown(
            "bank",
            "Bank",
            dropdownOptions["bank"],
            <AccountBalanceRounded className="users-icon" />
          )}
          {renderDropdown(
            "transaction",
            "Transaction",
            dropdownOptions["transaction"],
            <ListRounded className="users-icon" />
          )}
          {renderDropdown(
            "notification",
            "Notification",
            dropdownOptions["notification"],
            <NotificationsActiveRounded className="users-icon" />
          )} */}
        </div>
      </div>
    </div>
  );
};

export default Nav;
