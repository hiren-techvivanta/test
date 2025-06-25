import React, { useRef, useState } from "react";
import SideNav from "../../../components/SideNav";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const SendNotification = () => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    image: null,
    topic: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("authToken");
  const imageInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const clearImage = () => {
    setFormData({ ...formData, image: null });
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.message.trim()) newErrors.message = "Message is required.";
    if (!formData.topic || formData.topic === "")
      newErrors.topic = "Please select a valid topic.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.status === 200) {
        toast.success(data.message);
        setFormData({
          title: "",
          message: "",
          image: null,
          topic: "",
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || "Internal server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 mb-lg-4">
      <div className="row pt-sm-2 pt-lg-0">
        <SideNav />
        <div className="col-lg-9 pt-4 pb-2 pb-sm-4">
          <div className="d-sm-flex align-items-center mb-4">
            <h1 className="h2 mb-4 mb-sm-0 me-4">Send Notification</h1>
          </div>

          <div className="card shadow border-0">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className={`form-control ${
                      errors.title ? "is-invalid" : ""
                    }`}
                    value={formData.title}
                    onChange={handleChange}
                  />
                  {errors.title && (
                    <div className="invalid-feedback">{errors.title}</div>
                  )}
                </div>

                {/* Message */}
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">
                    Message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows="4"
                    className={`form-control ${
                      errors.message ? "is-invalid" : ""
                    }`}
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                  {errors.message && (
                    <div className="invalid-feedback">{errors.message}</div>
                  )}
                </div>

                {/* Topic */}
                <div className="mb-3">
                  <label htmlFor="topic" className="form-label">
                    Topic
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    className={`form-select ${
                      errors.topic ? "is-invalid" : ""
                    }`}
                    value={formData.topic}
                    onChange={handleChange}
                  >
                    <option value="">Select Type</option>
                    <option value="all">All</option>
                    <option value="user">User</option>
                    <option value="android">Android</option>
                    <option value="ios">Ios</option>
                  </select>
                  {errors.topic && (
                    <div className="invalid-feedback">{errors.topic}</div>
                  )}
                </div>

                {/* Submit */}
                <div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Notification"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendNotification;
