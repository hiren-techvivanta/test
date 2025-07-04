import React from "react";
import ani from "../../assets/json/Error.json";
import Lottie from "lottie-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const Error404 = () => {
  const navigate = useNavigate();
  return (
    <main className="page-wrapper bg-white">
      <div className="container d-flex flex-column justify-content-center min-vh-100 py-5">
        <Lottie
          animationData={ani}
          className="d-dark-mode-none mt-n5 bg-transparent"
          speed="1"
          loop
          autoplay
        />

        <div className="text-center pt-4 mt-lg-1">
          <h1 className="display-5">Page not found</h1>
          <p className="fs-lg pb-2 pb-md-0 mb-4 mb-md-4">
            The page you are looking for was moved, removed or might never
            existed.
          </p>
          <Button
            variant="contained"
            sx={{ height: "55px", borderRadius: "12px" }}
            onClick={() => navigate("/")}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Error404;
