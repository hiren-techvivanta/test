import React, { useRef, useState } from "react";
import SideNav from "../../../components/SideNav";

const SendNotification = () => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
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
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      console.log("Form submitted:", formData);
      // You can add API call here
    }
  };

  return (
    <div className="container py-5 mb-lg-4 ">
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
                  <label htmlFor="title" className="form-label">Title</label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className={`form-control ${errors.title ? "is-invalid" : ""}`}
                    value={formData.title}
                    onChange={handleChange}
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>

                {/* Message */}
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea
                    name="message"
                    id="message"
                    rows="4"
                    className={`form-control ${errors.message ? "is-invalid" : ""}`}
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                  {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                </div>

                {/* Image Upload */}
                <div className="mb-3">
                  <label htmlFor="image" className="form-label">Image (optional)</label>
                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="file"
                      name="image"
                      id="image"
                      className="form-control"
                      ref={imageInputRef}
                      onChange={handleChange}
                      accept="image/*"
                    />
                    {formData.image && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={clearImage}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <button type="submit" className="btn btn-primary">
                    Send Notification
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
