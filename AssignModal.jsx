import { useState } from "react";
import { apiRequest } from "../api/client";

export default function AssignModal({ open, onClose, endpoint, recordId, users = [], onDone }) {
  const [assignedTo, setAssignedTo] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleAssign() {
    try {
      setError("");
      await apiRequest(`${endpoint}/${recordId}/assign`, {
        method: "POST",
        body: { assigned_to: assignedTo }
      });
      onDone?.();
      onClose?.();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card small-modal">
        <div className="modal-header">
          <h3>Assign Record</h3>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>

        <div className="modal-body">
          <label>User</label>
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>

          {error ? <div className="error-box">{error}</div> : null}

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={handleAssign}>Assign</button>
          </div>
        </div>
      </div>
    </div>
  );
}