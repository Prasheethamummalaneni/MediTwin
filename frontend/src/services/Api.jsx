const API_BASE_URL = "http://127.0.0.1:8000";

// =========================================
// PATIENT APIs
// =========================================

// Create Patient
export async function createPatient(patientData) {
  const response = await fetch(`${API_BASE_URL}/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patientData),
  });

  if (!response.ok) {
    throw new Error("Failed to create patient");
  }

  return response.json();
}

// Get Patients
export async function getPatients() {
  const response = await fetch(`${API_BASE_URL}/patients`);

  if (!response.ok) {
    throw new Error("Failed to fetch patients");
  }

  return response.json();
}

// Update Patient
export async function updatePatient(patientId, patientData) {
  const response = await fetch(
    `${API_BASE_URL}/patients/${patientId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update patient");
  }

  return response.json();
}

// =========================================
// MEDICAL RECORD APIs
// =========================================

// Get Medical Records
export async function getMedicalRecords(patientId) {
  const response = await fetch(
    `${API_BASE_URL}/records/${patientId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch medical records");
  }

  return response.json();
}

// Upload Medical Record
export async function uploadMedicalRecord(patientId, file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/upload/${patientId}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload medical record");
  }

  return response.json();
}

// Delete Medical Record
export async function deleteMedicalRecord(recordId) {
  const response = await fetch(
    `${API_BASE_URL}/records/${recordId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete medical record");
  }

  return response.json();
}

// View Medical Record
export function viewMedicalRecord(recordId) {
  return `${API_BASE_URL}/record/${recordId}/view`;
}

// Download Medical Record
export function downloadMedicalRecord(recordId) {
  return `${API_BASE_URL}/record/${recordId}/download`;
}

// =========================================
// HEALTH TIMELINE API
// =========================================

export async function getHealthTimeline(patientId) {
  const response = await fetch(
    `${API_BASE_URL}/timeline/${patientId}?t=${Date.now()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch health timeline");
  }

  return response.json();
}

// =========================================
// MEDICATION APIs
// =========================================

// Get Medications
export async function getMedications(patientId) {
  const response = await fetch(
    `${API_BASE_URL}/medications/${patientId}?t=${Date.now()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch medications");
  }

  return response.json();
}

// Create Medication
export async function createMedication(medicationData) {
  const response = await fetch(
    `${API_BASE_URL}/medications`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(medicationData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create medication");
  }

  return response.json();
}

// Delete Medication
export async function deleteMedication(medicationId) {
  const response = await fetch(
    `${API_BASE_URL}/medications/${medicationId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete medication");
  }

  return response.json();
}


export async function getAppointments(patientId) {
  const response = await fetch(
    `${API_BASE_URL}/appointments/${patientId}?t=${Date.now()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch appointments");
  }

  return response.json();
}

// =========================================
// APPOINTMENT APIs
// =========================================


// Create Appointment

export async function createAppointment(appointmentData) {
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(appointmentData),
  });

  if (!response.ok) {
    throw new Error("Failed to create appointment");
  }

  return response.json();
}
// Delete Appointment

export async function deleteAppointment(appointmentId) {
  const response = await fetch(
    `${API_BASE_URL}/appointments/${appointmentId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete appointment");
  }

  return response.json();
}

// ============================================================
// SECURE SHARING
// ============================================================

export async function createSecureShare(shareData) {
  const response = await fetch(`${API_BASE_URL}/sharing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(shareData),
  });

  if (!response.ok) {
    throw new Error("Failed to create secure share");
  }

  return response.json();
}


export async function getActiveShares(patientId) {
  const response = await fetch(
    `${API_BASE_URL}/sharing/${patientId}?t=${Date.now()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch active shares");
  }

  return response.json();
}


export async function revokeShare(shareId) {
  const response = await fetch(
    `${API_BASE_URL}/sharing/${shareId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to revoke sharing access");
  }

  return response.json();
}


export async function getSharingHistory(patientId) {
  const response = await fetch(
    `${API_BASE_URL}/sharing/history/${patientId}?t=${Date.now()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch sharing history");
  }

  return response.json();
}

// ==========================================
// HEALTH METRICS
// ==========================================

// HEALTH METRICS

export async function createHealthMetrics(metricData) {
  const response = await fetch(`${API_BASE_URL}/health-metrics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metricData),
  });

  if (!response.ok) {
    throw new Error("Failed to save health metrics");
  }

  return response.json();
}

export async function getHealthMetrics(patientId) {
  const response = await fetch(
    `${API_BASE_URL}/health-metrics/${patientId}?t=${Date.now()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch health metrics");
  }

  return response.json();
}

