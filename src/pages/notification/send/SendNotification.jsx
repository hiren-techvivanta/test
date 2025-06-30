import React, { useState } from "react";
import SideNav from "../../../components/SideNav";
import TopNav from "../../../components/TopNav";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Button, TextField, MenuItem } from "@mui/material";

const SendNotification = () => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    topic: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const token = Cookies.get("authToken");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    if (!formData.topic || formData.topic === "")
      newErrors.topic = "Please select a topic";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        topic: formData.topic,
        title: formData.title,
        body: formData.message,
      };

      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/topic-notification/`,
        payload,
        config
      );

      if (data.status === 200) {
        toast.success(data.message);
        setFormData({
          title: "",
          message: "",
          topic: "",
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || "Internal server error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      message: "",
      topic: "",
    });
    setErrors({});
  };

  return (
    <>
      <div className="container-fluid p-0 m-0">
        <TopNav />
        <div className="row m-0">
          <div
            className="col-3 p-0"
            style={{ maxHeight: "100%", overflowY: "auto" }}
          >
            <SideNav />
          </div>
          <div className="col-9 p-0">
            <div className="container-fluid p-0">
              <div className="row m-0">
                <div
                  className="col-12 py-3"
                  style={{ background: "#EEEEEE", minHeight: "93vh" }}
                >
                  <div className="frame-1597880849">
                    <div className="all-members-list">Send Notification</div>
                  </div>

                  <div className="card shadow border-0 mt-4">
                    <div className="card-body">
                      <form onSubmit={handleSubmit}>
                        <div className="row m-0">
                          {/* Title */}
                          <div className="col-12 mb-4">
                            <label className="form-label">Title</label>
                            <TextField
                              fullWidth
                              name="title"
                              value={formData.title}
                              onChange={handleChange}
                              error={!!errors.title}
                              helperText={errors.title}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "12px",
                                  backgroundColor: "#f5f5f5",
                                },
                              }}
                            />
                          </div>

                          {/* Message */}
                          <div className="col-12 mb-4">
                            <label className="form-label">Message</label>
                            <TextField
                              fullWidth
                              name="message"
                              multiline
                              rows={4}
                              value={formData.message}
                              onChange={handleChange}
                              error={!!errors.message}
                              helperText={errors.message}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "12px",
                                  backgroundColor: "#f5f5f5",
                                },
                              }}
                            />
                          </div>

                          {/* Topic */}
                          <div className="col-12 mb-4">
                            <label className="form-label">Topic</label>
                            <TextField
                              select
                              fullWidth
                              name="topic"
                              value={formData.topic}
                              onChange={handleChange}
                              error={!!errors.topic}
                              helperText={errors.topic}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "12px",
                                  backgroundColor: "#f5f5f5",
                                },
                              }}
                            >
                              <MenuItem value="">Select Type</MenuItem>
                              <MenuItem value="all">All</MenuItem>
                              <MenuItem value="user">User</MenuItem>
                              <MenuItem value="android">Android</MenuItem>
                              <MenuItem value="ios">iOS</MenuItem>
                            </TextField>
                          </div>

                          {/* Action Buttons */}
                          <div className="col-12 d-flex gap-2">
                            <Button
                              variant="contained"
                              type="submit"
                              disabled={loading}
                              sx={{ height: "55px" }}
                            >
                              {loading ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                  Sending...
                                </>
                              ) : (
                                "Send Notification"
                              )}
                            </Button>
                            <Button
                              variant="outlined"
                              color="dark"
                              onClick={handleReset}
                              sx={{ height: "55px" }}
                            >
                              Reset
                            </Button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SendNotification;
