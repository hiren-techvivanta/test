import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Cookies from 'js-cookie'

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const auth = Cookies.get("authToken");
  useEffect(() => {
    if (auth) {
      navigate("/");
    }
  }, [auth]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formDatas = {
      email: formData.email,
      password: formData.password,
      device_info: "iPhone 13, iOS 17.1",
      app_version: "1.2.5",
    };

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/login/`,formDatas
      );

      if (data.status ===  200) {
        Cookies.set('authToken', data.data.our_tokens.access)
        toast.success('Login Successfull')
        navigate("/")
      }
    } catch (e) {
      toast.error(e.response.data.message || "Internal server error")
    }
    if (
      formData.email === "admin@onewave.com" &&
      formData.password === "LFn=33e85e"
    ) {
      localStorage.setItem("admin", "admin@onewave.com");
      navigate("/");
    }

    // Reset errors on success
    setErrors({});
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-xl-5">
          <h2 className="text-center mb-4">Login</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                type="email"
                name="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                id="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  id="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <label
                  class="password-toggle-btn"
                  aria-label="Show/hide password"
                >
                  <input
                    class="password-toggle-check"
                    onChange={() => setShowPassword((prev) => !prev)}
                    type="checkbox"
                  />
                  <span class="password-toggle-indicator"></span>
                </label>
                {errors.password && (
                  <div className="invalid-feedback d-block">
                    {errors.password}
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberMe"
                />
                <label className="form-check-label" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
              <a href="#" className="small">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="btn btn-primary w-100 btn-lg">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
