import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideNav from "../../../components/SideNav";

const EditProfile = () => {
    const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm Password is required.";
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      console.log("Form submitted", formData);
      // Add API or state logic here
    }
  };

  return (
    <>
      <div className="container py-5 mb-lg-4 ">
        <div className="row pt-sm-2 pt-lg-0">
          <SideNav />

          <div className="col-lg-9 pt-4 pb-2 pb-sm-4">
            <div className="d-sm-flex align-items-center mb-4">
              <h1 className="h2 mb-4 mb-sm-0 me-4">Edit Profile</h1>
            </div>

            <div className="card shadow border-0">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Name */}
                  <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label" htmlFor="name">
                      Name
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="col-6">
                    <label className="form-label" htmlFor="email">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-control ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  {/* Password */}
                  <div className="col-6">
                    <label className="form-label" htmlFor="password">
                      Password
                    </label>
                    <div className="password-toggle">
                      <input
                        className={`form-control ${
                          errors.password ? "is-invalid" : ""
                        }`}
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <label
                        className="password-toggle-btn"
                        aria-label="Show/hide password"
                      >
                        <input
                          className="password-toggle-check"
                          type="checkbox"
                          checked={showPassword}
                          onChange={() => setShowPassword(!showPassword)}
                        />
                        <span className="password-toggle-indicator"></span>
                      </label>
                    </div>
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="col-6">
                    <label className="form-label" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <div className="password-toggle">
                      <input
                        className={`form-control ${
                          errors.confirmPassword ? "is-invalid" : ""
                        }`}
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <label
                        className="password-toggle-btn"
                        aria-label="Show/hide confirm password"
                      >
                        <input
                          className="password-toggle-check"
                          type="checkbox"
                          checked={showConfirmPassword}
                          onChange={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        />
                        <span className="password-toggle-indicator"></span>
                      </label>
                    </div>
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="mt-3">
                    <button type="submit" className="btn btn-primary me-2">
                     <i className="ai-edit me-2"></i> Edit
                    </button>
                    <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/profile')}> <i className="ai-trash me-2"></i> Cancle</button>
                  </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
