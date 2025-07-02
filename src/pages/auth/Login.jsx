import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import {
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Button,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "", // Changed from username to email
    password: "",
  });
  const [loading, setloading] = useState(false);
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
    // Clear error when user types
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
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
    setloading(true);

    const formDatas = {
      email: formData.email,
      password: formData.password,
      device_info: "iPhone 13, iOS 17.1",
      app_version: "1.2.5",
    };

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/login/`,
        formDatas
      );

      if (data.status === 200) {
        Cookies.set("authToken", data.data.our_tokens.access);
        toast.success("Login Successful");
        navigate("/");
      }
    } catch (e) {
      const errorMessage = e.response?.data?.error || "Internal server error";
      toast.error(errorMessage);
    } finally {
      setloading(false);
    }
  };

  return (
    <div className="main-box d-flex justify-content-center align-items-center">
      <div
        className="card border-0 rounded-4 shadow"
        style={{ width: "30%", minWidth: "350px" }}
      >
        <div className="card-body p-0">
          <div className="p-4 border-bottom">
            <h4 className="fw-bold">Admin Login</h4>
            <p className="text-secondary" style={{ fontWeight: "500" }}>
              This portal is only accessible by admins
            </p>
          </div>

          <div className="p-4">
            <form autoComplete="off" onSubmit={handleSubmit}>
              <div className="row m-0">
                {/* Email Field - Fixed */}
                <div className="col-12 mb-4 p-0">
                  <label className="form-label fw-semibold text-secondary">
                    Email
                  </label>
                  <TextField
                    name="email" // Changed from username to email
                    variant="outlined"
                    fullWidth
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  />
                </div>

                {/* Password Field */}
                <div className="col-12 mb-4 p-0">
                  <label className="form-label fw-semibold text-secondary">
                    Password
                  </label>
                  <TextField
                    name="password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    fullWidth
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                {/* Submit Button */}
                <div className="col-12 mt-2 p-0">
                  <Button
                    variant="contained"
                    color="primary"
                    className=" w-100 rounded-1 fs-6"
                    type="submit"
                    style={{ height: "45px" }}
                    disabled={loading}
                  >
                    {loading ? (
                     <> <CircularProgress size={24} color="inherit" className="me-2" /> Loading...</>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
