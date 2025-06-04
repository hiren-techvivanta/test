import React from 'react'
import ani from '../../assets/json/Error.json'
import Lottie from "lottie-react";
import { Link } from 'react-router-dom';

const Error404 = () => {
  return (
   <main className="page-wrapper">
      <div className="container d-flex flex-column justify-content-center min-vh-100 py-5">
        <Lottie  animationData={ani} className="d-dark-mode-none mt-n5 bg-transparent"  speed="1" loop autoplay />
        {/* <lottie-player className="d-none d-dark-mode-block mt-n5" src="assets/json/animation-404-dark.json" background="transparent" speed="1" loop autoplay></lottie-player> */}
        <div className="text-center pt-4 mt-lg-1">
          <h1 className="display-5">Page not found</h1>
          <p className="fs-lg pb-2 pb-md-0 mb-4 mb-md-4">The page you are looking for was moved, removed or might never existed.</p>
          <Link className="btn btn-lg btn-primary" to="/dashboard">Go to Dashboard</Link>
        </div>
      </div>
    </main>
  )
}

export default Error404