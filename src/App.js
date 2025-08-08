import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import createCustomTheme from "./theme";

import "./App.scss";
import "bootstrap/dist/js/bootstrap.min.js";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Subadmin from "./pages/subadmin/Subadmin.jsx";
import UserList from "./pages/users/UserList.jsx";
import WalletTransaction from "./pages/transacrions/wallet/WalletTransaction.jsx";
import MoneyArtTransaction from "./pages/transacrions/moneyart/MoneyArtTransaction.jsx";
import MobileRechargeTransaction from "./pages/transacrions/mobilerecharge/MobileRechargeTransaction.jsx";
import NotificationList from "./pages/notification/list/NotificationList.jsx";
import SendNotification from "./pages/notification/send/SendNotification.jsx";
import AddSubAdminForm from "./pages/subadmin/add/NewSubAdmin.jsx";
import Error404 from "./pages/error/Error.jsx";
import EditSubadmin from "./pages/subadmin/edit/EditSubadmin.jsx";
import Profile from "./pages/profile/Profile.jsx";
import EditProfile from "./pages/profile/edit/EditProfile.jsx";
import Kyc from "./pages/kyc/Kyc.jsx";
import WalletMangement from "./pages/wallet/WalletMangement.jsx";
import AeroPayTransaction from "./pages/transacrions/aeropaytransaction/AeroPayTransaction.jsx";
import CryptoTransaction from "./pages/transacrions/cryptotransactions/CryptoTransaction.jsx";
import BankAccountList from "./pages/bank/BankAccountList.jsx";
import WalletTopup from "./pages/wallet/WalletTopup.jsx";
import UserRefList from "./pages/referrals/UserRefList.jsx";
import FlightBooking from "./pages/flightBooking/FlightBooking.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import PayoutTransaction from "./pages/transacrions/payout/PayoutTransaction.jsx";

function App() {
  return (
    <ThemeProvider theme={createCustomTheme}>
      <BrowserRouter>
      <ScrollToTop />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sub-admin" element={<Subadmin />} />
          <Route path="/sub-admin/new" element={<AddSubAdminForm />} />
          <Route path="/sub-admin/edit/:id" element={<EditSubadmin />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/wallet/transaction" element={<WalletTransaction />} />
          <Route
            path="/moneyart/transaction"
            element={<MoneyArtTransaction />}
          />
          <Route
            path="/mobile/recharge/transaction"
            element={<MobileRechargeTransaction />}
          />
          <Route path="/notification/send" element={<SendNotification />} />
          <Route path="/notification/list" element={<NotificationList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/kyc" element={<Kyc />} />
          <Route path="/wallet/mangement" element={<WalletMangement />} />
          <Route path="/card/list" element={<AeroPayTransaction />} />
          <Route path="/cripto/transaction" element={<CryptoTransaction />} />
          <Route path="/bank-accounts" element={<BankAccountList />} />
          <Route path="/wallet-topup/transaction" element={<WalletTopup />} />
          <Route path="/user/referrals" element={<UserRefList />} />
          <Route path="/flight/booking" element={<FlightBooking />} />
           <Route path="/pay-out" element={<PayoutTransaction />} />

          <Route path="*" element={<Error404 />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
