import { useState } from 'react';
import PropTypes from "prop-types";
import './CSVModal.css';

const CSVUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);

  const handleSubmit = async () => {
    if (!file) {
      setStatus('Please select a CSV file.');
      return;
    }

    setStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await onUpload(formData);
      setStatus(`Upload complete!\nSuccess: ${res.successful}, Failed: ${res.failed}`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Upload failed:", err.response?.data || err.message);
      setStatus('Upload failed. Please check console for details.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="csv-modal-backdrop">
      <div className="csv-modal">
        <h2 className="csv-modal-title">Upload Users via CSV</h2>

        <label className="custom-file-upload upload-button">
          Choose CSV File
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        {file && <span className="file-name">{file.name}</span>}

        <div className="csv-modal-actions">
          <button className="btn btn-primary" onClick={handleSubmit}>Submit Upload</button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>

        {status && <p className="csv-status">{status}</p>}
      </div>
    </div>
  );
};

CSVUploadModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
};

export default CSVUploadModal;
