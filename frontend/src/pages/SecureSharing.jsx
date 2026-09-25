import { useEffect, useState } from "react";

import {
  getMedicalRecords,
  createSecureShare,
  getActiveShares,
  revokeShare,
  getSharingHistory,
} from "../services/Api";


function SecureSharing() {

  // ============================================================
  // PATIENT
  // ============================================================

  const patientId = 1;


  // ============================================================
  // AVAILABLE MEDICAL RECORDS
  // ============================================================

  const [records, setRecords] = useState([]);

  const [loadingRecords, setLoadingRecords] = useState(true);


  // ============================================================
  // FORM STATES
  // ============================================================

  const [shareDuration, setShareDuration] = useState("24 Hours");

  const [recipient, setRecipient] = useState({
    name: "",
    organization: "",
    contact: "",
  });


  const [permissions, setPermissions] = useState({
    viewRecords: true,
    downloadRecords: false,
    viewTimeline: false,
    viewMedications: false,
  });


  // ============================================================
  // SHARE STATES
  // ============================================================

  const [showPreview, setShowPreview] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const [generatedLink, setGeneratedLink] = useState("");

  const [selectedShare, setSelectedShare] = useState(null);


  // ============================================================
  // ACTIVE SHARES
  // ============================================================

  const [activeShares, setActiveShares] = useState([]);

  const [loadingShares, setLoadingShares] = useState(true);


  // ============================================================
  // SHARING HISTORY
  // ============================================================

  const [sharingHistory, setSharingHistory] = useState([]);

  const [loadingHistory, setLoadingHistory] = useState(true);


  // ============================================================
  // LOAD MEDICAL RECORDS
  // ============================================================

  useEffect(() => {

    loadRecords();

  }, []);


  const loadRecords = async () => {

    try {

      setLoadingRecords(true);

      const data = await getMedicalRecords(patientId);

      const formattedRecords = data.map((record) => {

  return {
    id: record[0],
    name: record[2],
    type: record[3],
    date: record[4],
    selected: false,
  };

});

      setRecords(formattedRecords);

    } catch (error) {

      console.error("Error loading medical records:", error);

      alert("Unable to load medical records.");

    } finally {

      setLoadingRecords(false);

    }

  };


  // ============================================================
  // LOAD ACTIVE SHARES
  // ============================================================

  useEffect(() => {

    loadActiveShares();

  }, []);


  const loadActiveShares = async () => {

    try {

      setLoadingShares(true);

      const data = await getActiveShares(patientId);

      const formattedShares = data.map((share) => {

        const permissionList = [];

        if (share.view_records) {
          permissionList.push("View Records");
        }

        if (share.download_records) {
          permissionList.push("Download Records");
        }

        if (share.view_timeline) {
          permissionList.push("View Timeline");
        }

        if (share.view_medications) {
          permissionList.push("View Medications");
        }

        return {
          id: share.id,
          recipient: share.recipient_name,
          organization: share.recipient_organization,
          contact: share.recipient_contact,
          records: share.record_ids.length,
          duration: share.duration,
          expires: formatExpiry(share.expires_at),
          permissions: permissionList,
          created: formatCreatedDate(share.created_at),
          icon: "🩺",
          link: share.share_link,
          status: share.status,
        };

      });

      setActiveShares(formattedShares);

    } catch (error) {

      console.error("Error loading active shares:", error);

    } finally {

      setLoadingShares(false);

    }

  };


  // ============================================================
  // LOAD SHARING HISTORY
  // ============================================================

  useEffect(() => {

    loadSharingHistory();

  }, []);


  const loadSharingHistory = async () => {

    try {

      setLoadingHistory(true);

      const data = await getSharingHistory(patientId);

      const formattedHistory = data.map((item) => {

        let icon = "🔗";

        if (item.action === "Access Revoked") {
          icon = "🚫";
        }

        if (item.action === "Share Created") {
          icon = "🔗";
        }

        return {
          id: item.id,
          icon: icon,
          title:
            item.action === "Share Created"
              ? `Secure link created for ${item.recipient_name}`
              : `Secure sharing access revoked for ${item.recipient_name}`,
          time: formatCreatedDate(item.activity_time),
          records:
            item.record_count === 1
              ? "1 Record"
              : `${item.record_count} Records`,
        };

      });

      setSharingHistory(formattedHistory);

    } catch (error) {

      console.error("Error loading sharing history:", error);

    } finally {

      setLoadingHistory(false);

    }

  };


  // ============================================================
  // FORMAT EXPIRY
  // ============================================================

  const formatExpiry = (expiryDate) => {

    if (!expiryDate) {
      return "Unknown";
    }

    const expiry = new Date(
      expiryDate.replace(" ", "T")
    );

    const now = new Date();

    const difference = expiry - now;

    if (difference <= 0) {
      return "Expired";
    }

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    if (hours < 24) {

      return `${hours} hour${hours !== 1 ? "s" : ""}`;

    }

    const days = Math.floor(
      hours / 24
    );

    return `${days} day${days !== 1 ? "s" : ""}`;

  };


  // ============================================================
  // FORMAT CREATED DATE
  // ============================================================

  const formatCreatedDate = (dateString) => {

    if (!dateString) {
      return "";
    }

    const date = new Date(
      dateString.replace(" ", "T")
    );

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };


  // ============================================================
  // SELECT / UNSELECT RECORD
  // ============================================================

  const handleRecordChange = (recordId) => {

    setRecords(
      records.map((record) =>
        record.id === recordId
          ? {
              ...record,
              selected: !record.selected,
            }
          : record
      )
    );

  };


  // ============================================================
  // PERMISSION CHANGE
  // ============================================================

  const handlePermissionChange = (permission) => {

    setPermissions({
      ...permissions,
      [permission]: !permissions[permission],
    });

  };


  // ============================================================
  // RECIPIENT CHANGE
  // ============================================================

  const handleRecipientChange = (event) => {

    setRecipient({
      ...recipient,
      [event.target.name]: event.target.value,
    });

  };


  // ============================================================
  // OPEN SHARE PREVIEW
  // ============================================================

  const handleCreateShare = () => {

    const selectedRecords = records.filter(
      (record) => record.selected
    );


    if (selectedRecords.length === 0) {

      alert(
        "Please select at least one medical record."
      );

      return;

    }


    if (!recipient.name.trim()) {

      alert(
        "Please enter the recipient name."
      );

      return;

    }


    if (!recipient.organization.trim()) {

      alert(
        "Please enter the hospital or organization name."
      );

      return;

    }


    if (
      !permissions.viewRecords &&
      !permissions.downloadRecords &&
      !permissions.viewTimeline &&
      !permissions.viewMedications
    ) {

      alert(
        "Please select at least one access permission."
      );

      return;

    }


    setShowPreview(true);

  };


  // ============================================================
  // CONVERT FRONTEND DURATION TO BACKEND DURATION
  // ============================================================

  const getBackendDuration = () => {

    if (shareDuration === "1 Hour") {

      return "1 day";

    }

    if (shareDuration === "24 Hours") {

      return "1 day";

    }

    if (shareDuration === "3 Days") {

      return "3 days";

    }

    if (shareDuration === "7 Days") {

      return "7 days";

    }

    return "7 days";

  };


  // ============================================================
  // CONFIRM SHARE
  // ============================================================

  const confirmCreateShare = async () => {

    const selectedRecords = records.filter(
      (record) => record.selected
    );


    try {

      const shareData = {

        patient_id: patientId,

        record_ids: selectedRecords.map(
          (record) => record.id
        ),

        recipient_name: recipient.name,

        recipient_organization:
          recipient.organization,

        recipient_contact:
          recipient.contact,

        duration: getBackendDuration(),

        view_records:
          permissions.viewRecords,

        download_records:
          permissions.downloadRecords,

        view_timeline:
          permissions.viewTimeline,

        view_medications:
          permissions.viewMedications,

      };


      const response =
        await createSecureShare(shareData);


      setGeneratedLink(
        response.share_link
      );


      setShowPreview(false);

      setShowSuccess(true);
      alert("SUCCESS STATE REACHED");


      await loadActiveShares();

      await loadSharingHistory();


      setTimeout(() => {

        setShowSuccess(false);

      }, 5000);


      // Reset recipient

      setRecipient({
        name: "",
        organization: "",
        contact: "",
      });


      // Reset selected records

      setRecords(
        records.map((record) => ({
          ...record,
          selected: false,
        }))
      );


    } catch (error) {

      console.error(
        "Error creating secure share:",
        error
      );

      alert(
        "Unable to create secure sharing link."
      );

    }

  };


  // ============================================================
  // COPY LINK
  // ============================================================

  const handleCopyLink = async (link) => {

    try {

      await navigator.clipboard.writeText(link);

      alert("Secure link copied! 🔗");

    } catch (error) {

      console.error(
        "Failed to copy link:",
        error
      );

      alert(
        "Unable to copy the link."
      );

    }

  };


  // ============================================================
  // REVOKE SHARE
  // ============================================================

  const handleRevoke = async (shareId) => {

    const confirmRevoke =
      window.confirm(
        "Are you sure you want to revoke access to this share?"
      );


    if (!confirmRevoke) {
      return;
    }


    try {

      await revokeShare(shareId);


      setSelectedShare(null);


      await loadActiveShares();

      await loadSharingHistory();


      alert(
        "Sharing access revoked successfully."
      );

    } catch (error) {

      console.error(
        "Error revoking share:",
        error
      );

      alert(
        "Unable to revoke sharing access."
      );

    }

  };


  // ============================================================
  // SELECTED RECORDS
  // ============================================================

  const selectedRecords = records.filter(
    (record) => record.selected
  );


  // ============================================================
  // TOTAL ACTIVE SHARES
  // ============================================================

  const activeShareCount =
    activeShares.length;


  return (

    <div className="secure-sharing-page">


      {/* ================================= */}
      {/* PAGE HEADER */}
      {/* ================================= */}

      <section className="sharing-page-header">

        <div>

          <h1>
            Secure Sharing
          </h1>

          <p>
            Safely share your medical records with
            doctors and healthcare providers.
          </p>

        </div>

      </section>


      {/* ================================= */}
      {/* SECURITY INFORMATION */}
      {/* ================================= */}

      <section className="sharing-security glass-card">

        <div className="security-icon">
          🔐
        </div>

        <div>

          <h2>
            Your Health Data is Protected
          </h2>

          <p>
            You control what information is shared,
            who can access it, and how long access
            remains available.
          </p>

          <div className="security-points">

            <span>
              ✓ Temporary access
            </span>

            <span>
              ✓ Patient controlled
            </span>

            <span>
              ✓ Automatic expiry
            </span>

            <span>
              ✓ Revoke anytime
            </span>

          </div>

        </div>

      </section>


      {/* ================================= */}
      {/* CREATE SECURE SHARE */}
      {/* ================================= */}

      <section className="create-sharing glass-card">

        <div className="sharing-section-header">

          <div>

            <h2>
              Create Secure Share
            </h2>

            <p>
              Choose exactly what information you
              want to share.
            </p>

          </div>

          <span className="sharing-header-icon">
            🔗
          </span>

        </div>


        <div className="sharing-form">


          {/* SELECT RECORDS */}

          <div className="sharing-field sharing-records-field">

            <label>
              Select Records
            </label>

            <p className="field-description">
              Select only the medical records required
              by the recipient.
            </p>


            <div className="sharing-record-list">

              {loadingRecords ? (

                <p>
                  Loading medical records...
                </p>

              ) : records.length > 0 ? (

                records.map((record) => (

                  <label
                    className="sharing-record-item"
                    key={record.id}
                  >

                    <input
                      type="checkbox"
                      checked={record.selected}
                      onChange={() =>
                        handleRecordChange(
                          record.id
                        )
                      }
                    />


                    <div className="record-checkbox-content">

                      <strong>
                        📄 {record.name}
                      </strong>

                      <span>
                        {record.type} · {record.date}
                      </span>

                    </div>

                  </label>

                ))

              ) : (

                <p>
                  No medical records available.
                </p>

              )}

            </div>


            <div className="selected-record-count">

              {selectedRecords.length} record
              {selectedRecords.length !== 1
                ? "s"
                : ""}{" "}
              selected

            </div>

          </div>


          {/* ACCESS DURATION */}

          <div className="sharing-field">

            <label>
              Access Duration
            </label>

            <p className="field-description">
              Access will automatically expire after
              this period.
            </p>


            <select
              value={shareDuration}
              onChange={(event) =>
                setShareDuration(
                  event.target.value
                )
              }
            >

              <option>
                1 Hour
              </option>

              <option>
                24 Hours
              </option>

              <option>
                3 Days
              </option>

              <option>
                7 Days
              </option>

            </select>

          </div>


          {/* RECIPIENT */}

          <div className="sharing-field">

            <label>
              Recipient
            </label>

            <p className="field-description">
              Enter who will receive access to your
              records.
            </p>


            <input
              type="text"
              name="name"
              placeholder="Doctor name"
              value={recipient.name}
              onChange={handleRecipientChange}
            />


            <input
              type="text"
              name="organization"
              placeholder="Hospital / Clinic name"
              value={recipient.organization}
              onChange={handleRecipientChange}
            />


            <input
              type="text"
              name="contact"
              placeholder="Email or phone (optional)"
              value={recipient.contact}
              onChange={handleRecipientChange}
            />

          </div>


          {/* PERMISSIONS */}

          <div className="sharing-field">

            <label>
              Access Permissions
            </label>

            <p className="field-description">
              Control what the recipient can access.
            </p>


            <div className="permission-list">


              <label className="permission-item">

                <input
                  type="checkbox"
                  checked={permissions.viewRecords}
                  onChange={() =>
                    handlePermissionChange(
                      "viewRecords"
                    )
                  }
                />

                <div>

                  <strong>
                    View Medical Records
                  </strong>

                  <span>
                    Allow the recipient to view
                    selected records.
                  </span>

                </div>

              </label>


              <label className="permission-item">

                <input
                  type="checkbox"
                  checked={
                    permissions.downloadRecords
                  }
                  onChange={() =>
                    handlePermissionChange(
                      "downloadRecords"
                    )
                  }
                />

                <div>

                  <strong>
                    Download Records
                  </strong>

                  <span>
                    Allow the recipient to download
                    shared files.
                  </span>

                </div>

              </label>


              <label className="permission-item">

                <input
                  type="checkbox"
                  checked={
                    permissions.viewTimeline
                  }
                  onChange={() =>
                    handlePermissionChange(
                      "viewTimeline"
                    )
                  }
                />

                <div>

                  <strong>
                    View Health Timeline
                  </strong>

                  <span>
                    Allow access to your health
                    timeline.
                  </span>

                </div>

              </label>


              <label className="permission-item">

                <input
                  type="checkbox"
                  checked={
                    permissions.viewMedications
                  }
                  onChange={() =>
                    handlePermissionChange(
                      "viewMedications"
                    )
                  }
                />

                <div>

                  <strong>
                    View Medications
                  </strong>

                  <span>
                    Allow access to medication
                    information.
                  </span>

                </div>

              </label>


            </div>

          </div>

        </div>


        {/* CREATE BUTTON */}

        <button
          className="create-share-btn"
          onClick={handleCreateShare}
        >
          🔗 Review & Create Secure Link
        </button>


        {/* SUCCESS MESSAGE */}

        {showSuccess && (

          <div className="share-success">

            <div>
              ✅ Secure sharing link created successfully!
            </div>


            <div className="generated-link-box">

              <span>
                {generatedLink}
              </span>


              <button
                onClick={() =>
                  handleCopyLink(
                    generatedLink
                  )
                }
              >
                Copy Link
              </button>

            </div>

          </div>

        )}

      </section>


      {/* ================================= */}
      {/* ACTIVE SHARES */}
      {/* ================================= */}

      <section className="active-sharing-section">

        <div className="sharing-list-header">

          <div>

            <h2>
              Active Shares
            </h2>

            <p>
              Manage medical records that are
              currently being shared.
            </p>

          </div>


          <span className="active-share-count">

            {activeShareCount} Active

          </span>

        </div>


        <div className="active-shares-list">

          {loadingShares ? (

            <div className="no-sharing-records glass-card">

              <p>
                Loading active shares...
              </p>

            </div>

          ) : activeShares.length > 0 ? (

            activeShares.map((share) => (

              <div
                className="active-share-card glass-card"
                key={share.id}
              >

                <div className="share-main">

                  <div className="share-icon">
                    {share.icon}
                  </div>


                  <div>

                    <h3>
                      {share.recipient}
                    </h3>

                    <p>
                      {share.organization}
                    </p>


                    <div className="share-meta">

                      <span>
                        📄 {share.records} Record
                        {share.records !== 1
                          ? "s"
                          : ""}
                      </span>


                      <span>
                        ⏰ Expires in {share.expires}
                      </span>

                    </div>

                  </div>

                </div>


                <div className="share-status">

                  <span>
                    {share.status}
                  </span>

                </div>


                <div className="share-actions">

                  <button
                    className="share-view-btn"
                    onClick={() =>
                      setSelectedShare(
                        share
                      )
                    }
                  >
                    View
                  </button>


                  <button
                    className="revoke-btn"
                    onClick={() =>
                      handleRevoke(
                        share.id
                      )
                    }
                  >
                    Revoke
                  </button>

                </div>

              </div>

            ))

          ) : (

            <div className="no-sharing-records glass-card">

              <div className="empty-share-icon">
                🔐
              </div>

              <h3>
                No Active Shares
              </h3>

              <p>
                Your medical records are not currently
                shared with anyone.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* ================================= */}
      {/* SHARING HISTORY */}
      {/* ================================= */}

      <section className="sharing-history glass-card">

        <div className="sharing-list-header">

          <div>

            <h2>
              Sharing History
            </h2>

            <p>
              Recent activity related to your shared
              medical information.
            </p>

          </div>

        </div>


        <div className="history-list">

          {loadingHistory ? (

            <p>
              Loading sharing history...
            </p>

          ) : sharingHistory.length > 0 ? (

            sharingHistory.map((item) => (

              <div
                className="history-item"
                key={item.id}
              >

                <div className="history-icon">
                  {item.icon}
                </div>


                <div className="history-content">

                  <strong>
                    {item.title}
                  </strong>

                  <span>
                    {item.time}
                  </span>

                </div>


                <small>
                  {item.records}
                </small>

              </div>

            ))

          ) : (

            <p>
              No sharing history yet.
            </p>

          )}

        </div>

      </section>


      {/* ================================= */}
      {/* SHARE DETAILS POPUP */}
      {/* ================================= */}

      {selectedShare && (

        <div
          className="share-modal-overlay"
          onClick={() =>
            setSelectedShare(null)
          }
        >

          <div
            className="share-modal glass-card"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            <div className="share-modal-header">

              <div>

                <h2>
                  Share Details
                </h2>

                <p>
                  Review the access currently
                  provided.
                </p>

              </div>


              <button
                className="share-modal-close"
                onClick={() =>
                  setSelectedShare(null)
                }
              >
                ✕
              </button>

            </div>


            <div className="share-modal-recipient">

              <div className="share-modal-icon">
                {selectedShare.icon}
              </div>


              <div>

                <h3>
                  {selectedShare.recipient}
                </h3>

                <p>
                  {selectedShare.organization}
                </p>

              </div>

            </div>


            <div className="share-details-grid">


              <div className="share-detail-box">

                <span>
                  Records Shared
                </span>

                <strong>
                  {selectedShare.records}
                </strong>

              </div>


              <div className="share-detail-box">

                <span>
                  Access Duration
                </span>

                <strong>
                  {selectedShare.duration}
                </strong>

              </div>


              <div className="share-detail-box">

                <span>
                  Expires
                </span>

                <strong>
                  {selectedShare.expires}
                </strong>

              </div>


              <div className="share-detail-box">

                <span>
                  Created
                </span>

                <strong>
                  {selectedShare.created}
                </strong>

              </div>


            </div>


            <div className="share-permission-summary">

              <h4>
                Access Permissions
              </h4>


              <div className="permission-summary-list">

                {selectedShare.permissions.map(
                  (permission, index) => (

                    <span key={index}>
                      ✓ {permission}
                    </span>

                  )
                )}

              </div>

            </div>


            {selectedShare.link && (

              <div className="share-link-section">

                <label>
                  Secure Access Link
                </label>


                <div className="share-link-box">

                  <span>
                    {selectedShare.link}
                  </span>


                  <button
                    onClick={() =>
                      handleCopyLink(
                        selectedShare.link
                      )
                    }
                  >
                    Copy
                  </button>

                </div>

              </div>

            )}


            <div className="share-modal-footer">

              <button
                className="close-share-btn"
                onClick={() =>
                  setSelectedShare(null)
                }
              >
                Close
              </button>


              <button
                className="revoke-modal-btn"
                onClick={() =>
                  handleRevoke(
                    selectedShare.id
                  )
                }
              >
                🚫 Revoke Access
              </button>

            </div>


          </div>

        </div>

      )}


      {/* ================================= */}
      {/* SHARE PREVIEW POPUP */}
      {/* ================================= */}

      {showPreview && (

        <div
          className="share-modal-overlay"
          onClick={() =>
            setShowPreview(false)
          }
        >

          <div
            className="share-preview-modal glass-card"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            <div className="share-modal-header">

              <div>

                <h2>
                  Review Secure Share
                </h2>

                <p>
                  Check the information before
                  creating the secure link.
                </p>

              </div>


              <button
                className="share-modal-close"
                onClick={() =>
                  setShowPreview(false)
                }
              >
                ✕
              </button>

            </div>


            <div className="preview-section">

              <h4>
                Recipient
              </h4>


              <p>
                <strong>
                  {recipient.name}
                </strong>
              </p>


              <p>
                {recipient.organization}
              </p>


              {recipient.contact && (

                <p>
                  {recipient.contact}
                </p>

              )}

            </div>


            <div className="preview-section">

              <h4>
                Records to be Shared
              </h4>


              <div className="preview-record-list">

                {selectedRecords.map(
                  (record) => (

                    <span key={record.id}>
                      📄 {record.name}
                    </span>

                  )
                )}

              </div>

            </div>


            <div className="preview-section">

              <h4>
                Access Duration
              </h4>


              <p>
                ⏰ {shareDuration}
              </p>

            </div>


            <div className="preview-section">

              <h4>
                Permissions
              </h4>


              <div className="preview-permissions">

                {permissions.viewRecords && (
                  <span>
                    ✓ View Records
                  </span>
                )}

                {permissions.downloadRecords && (
                  <span>
                    ✓ Download Records
                  </span>
                )}

                {permissions.viewTimeline && (
                  <span>
                    ✓ View Timeline
                  </span>
                )}

                {permissions.viewMedications && (
                  <span>
                    ✓ View Medications
                  </span>
                )}

              </div>

            </div>


            <div className="preview-warning">

              🔐 The recipient will only receive
              the permissions shown above.

            </div>


            <div className="share-modal-footer">

              <button
                className="close-share-btn"
                onClick={() =>
                  setShowPreview(false)
                }
              >
                Go Back
              </button>


              <button
                className="confirm-share-btn"
                onClick={
                  confirmCreateShare
                }
              >
                🔗 Create Secure Link
              </button>

            </div>


          </div>

        </div>

      )}

    </div>

  );

}


export default SecureSharing;