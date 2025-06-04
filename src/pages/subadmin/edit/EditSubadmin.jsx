import React, { useState } from "react";
import SideNav from "../../../components/SideNav";
import { useNavigate } from "react-router-dom";

const EditSubadmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accessLevel: "viewOnly", // Added access level state
    pageAccess: {
      allPages: true, // Added page access state
      profile: true,
      dashboard: true,
      subAdmin: true,
      userList: true,
      walletTransaction: true,
      moneyartTransaction: true,
      mobileRechargeTransaction: true,
      notification: true,
    },
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle access level change (View Only/Full Access)
  const handleAccessChange = (level) => {
    setFormData((prev) => ({
      ...prev,
      accessLevel: level,
    }));
  };

  // Handle "All Pages" checkbox change
  const handleAllPagesChange = (e) => {
    const isChecked = e.target.checked;
    const newPageAccess = { ...formData.pageAccess };
    
    if (isChecked) {
      // Check all pages when "All Pages" is checked
      Object.keys(newPageAccess).forEach((key) => {
        newPageAccess[key] = true;
      });
    } else {
      // Uncheck all pages except profile when "All Pages" is unchecked
      Object.keys(newPageAccess).forEach((key) => {
        newPageAccess[key] = key === "profile";
      });
    }

    setFormData((prev) => ({
      ...prev,
      pageAccess: newPageAccess,
    }));
  };

  // Handle individual page checkbox change
  const handlePageChange = (e) => {
    const { name, checked } = e.target;
    const newPageAccess = {
      ...formData.pageAccess,
      [name]: checked,
    };

    // Check if all pages are selected
    const allChecked = Object.keys(newPageAccess)
      .filter(key => key !== "allPages")
      .every(key => newPageAccess[key]);

    // Update "All Pages" based on individual selections
    newPageAccess.allPages = allChecked;

    setFormData((prev) => ({
      ...prev,
      pageAccess: newPageAccess,
    }));
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

    // Page access validation
    if (
      !formData.pageAccess.allPages &&
      !formData.pageAccess.profile
    ) {
      newErrors.pageAccess = "Profile must be selected when not using 'All Pages'";
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
              <h1 className="h2 mb-4 mb-sm-0 me-4">Edit Sub-Admin</h1>
            </div>

            <div className="card shadow border-0">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Name */}
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
                        <div className="invalid-feedback">
                          {errors.password}
                        </div>
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

                    {/* Access Level - View Only/Full Access */}
                    <label>Action access</label>
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="viewOnly"
                          checked={formData.accessLevel === "viewOnly"}
                          onChange={() => handleAccessChange("viewOnly")}
                        />
                        <label className="form-check-label" htmlFor="viewOnly">
                          View Only
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="fullAccess"
                          checked={formData.accessLevel === "fullAccess"}
                          onChange={() => handleAccessChange("fullAccess")}
                        />
                        <label className="form-check-label" htmlFor="fullAccess">
                          Full Access
                        </label>
                      </div>
                    </div>

                    {/* Page Access */}
                    <label>Page Access</label>
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="allPages"
                          name="allPages"
                          checked={formData.pageAccess.allPages}
                          onChange={handleAllPagesChange}
                        />
                        <label className="form-check-label" htmlFor="allPages">
                          All Pages
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="profile"
                          name="profile"
                          checked={formData.pageAccess.profile}
                          onChange={handlePageChange}
                          disabled={formData.pageAccess.allPages}
                        />
                        <label className="form-check-label" htmlFor="profile">
                          Profile
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="dashboard"
                          name="dashboard"
                          checked={formData.pageAccess.dashboard}
                          onChange={handlePageChange}
                          disabled={formData.pageAccess.allPages}
                        />
                        <label className="form-check-label" htmlFor="dashboard">
                          Dashboard
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="subAdmin"
                          name="subAdmin"
                          checked={formData.pageAccess.subAdmin}
                          onChange={handlePageChange}
                          disabled={formData.pageAccess.allPages}
                        />
                        <label className="form-check-label" htmlFor="subAdmin">
                          Sub-admin
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="userList"
                          name="userList"
                          checked={formData.pageAccess.userList}
                          onChange={handlePageChange}
                          disabled={formData.pageAccess.allPages}
                        />
                        <label className="form-check-label" htmlFor="userList">
                          User List
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="walletTransaction"
                          name="walletTransaction"
                          checked={formData.pageAccess.walletTransaction}
                          onChange={handlePageChange}
                          disabled={formData.pageAccess.allPages}
                        />
                        <label className="form-check-label" htmlFor="walletTransaction">
                          Wallet Transaction
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="moneyartTransaction"
                          name="moneyartTransaction"
                          checked={formData.pageAccess.moneyartTransaction}
                          onChange={handlePageChange}
                          disabled={formData.pageAccess.allPages}
                        />
                        <label className="form-check-label" htmlFor="moneyartTransaction">
                          Moneyart Transaction
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="mobileRechargeTransaction"
                          name="mobileRechargeTransaction"
                          checked={formData.pageAccess.mobileRechargeTransaction}
                          onChange={handlePageChange}
                          disabled={formData.pageAccess.allPages}
                        />
                        <label className="form-check-label" htmlFor="mobileRechargeTransaction">
                          Mobile Recharge Transaction
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="notification"
                          name="notification"
                          checked={formData.pageAccess.notification}
                          onChange={handlePageChange}
                          disabled={formData.pageAccess.allPages}
                        />
                        <label className="form-check-label" htmlFor="notification">
                          Notification
                        </label>
                      </div>
                      {errors.pageAccess && (
                        <div className="text-danger mt-2">{errors.pageAccess}</div>
                      )}
                    </div>

                    {/* Submit */}
                    <div className="mt-3">
                      <button type="submit" className="btn btn-primary me-2">
                        <i className="ai-edit me-2"></i> Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={() => navigate("/sub-admin")}
                      >
                        <i className="ai-trash me-2"></i> Cancel
                      </button>
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

export default EditSubadmin;