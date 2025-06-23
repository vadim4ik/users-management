import { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [message, setMessage] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    setUsers(await res.json());
  };

  const saveUser = async () => {
    if (!name.trim() || !email.trim()) {
      setMessage("Name and Email are required fields");
      return;
    }
    const payload = {
      name,
      email,
      createdAt: createdAt || null,
    };
    try {
      if (editId) {
        await fetch(`/api/users/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setMessage("User updated");
      } else {
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setMessage("User created");
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      setMessage("Error during save user");
    }
  };

  const deleteUser = async (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDeleteUser = async () => {
    await fetch(`/api/users/${confirmDeleteId}`, { method: "DELETE" });
    setConfirmDeleteId(null);
    fetchUsers();
  };

  const deleteAll = () => {
    setConfirmDeleteAll(true);
  };

  const confirmDeleteAllUsers = async () => {
    await fetch("/api/users", { method: "DELETE" });
    setConfirmDeleteAll(false);
    fetchUsers();
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFile = async (e) => {
    try {
      console.log('handleFile called');
      const file = e.target.files[0];
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      console.log('Parsed rows:', sheet.length);
      await fetch("/api/users/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sheet),
      });
      fetchUsers();
    } catch (err) {
      console.error('Error in handleFile:', err);
    }
  };

  const openModal = (user = null) => {
    setShowModal(true);
    setMessage("");
    if (user) {
      setEditId(user.id);
      setName(user.name);
      setEmail(user.email);
      if (user.createdAt) {
        const d = new Date(user.createdAt);
        const dateOnly = d.toISOString().slice(0, 10); // YYYY-MM-DD
        setCreatedAt(dateOnly);
      } else {
        setCreatedAt("");
      }
    } else {
      setEditId(null);
      setName("");
      setEmail("");
      setCreatedAt("");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setName("");
    setEmail("");
    setCreatedAt("");
    setMessage("");
  };

  return (
      <div style={{ padding: 40 }}>
        <h1>Users</h1>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 20 }}>
          <button onClick={() => openModal()}>➕ Create new</button>

          <button type="button" onClick={handleClickUpload}>📥 Upload XLSX</button>
          <input
              type="file"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              onChange={handleFile}
              style={{ display: 'none' }}
          />

          <button onClick={deleteAll}>🧹 Delete All</button>
        </div>

        <table border={1} cellPadding="8" style={{ marginTop: 20, borderCollapse: "collapse" }}>
          <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ""}</td>
                <td>
                  <button onClick={() => openModal(u)}>✏️ Edit</button>{" "}
                  <button onClick={() => deleteUser(u.id)}>🗑️ Delete</button>
                </td>
              </tr>
          ))}
          </tbody>
        </table>

        {showModal && (
            <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                }}
            >
              <div
                  style={{
                    background: "white",
                    padding: 20,
                    borderRadius: 8,
                    width: 320,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
              >
                <h2>{editId ? "Edit user" : "New User"}</h2>
                <input
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: "100%", marginBottom: 10 }}
                />
                <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", marginBottom: 10 }}
                />
                <label htmlFor="createdAt">Date created</label>
                <input
                    type="date"
                    id="createdAt"
                    value={createdAt}
                    onChange={(e) => setCreatedAt(e.target.value)}
                    style={{ width: "100%", marginBottom: 10 }}
                />
                {message && <p style={{ color: "red" }}>{message}</p>}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={saveUser}>{editId ? "Save" : "Create"}</button>
                  <button onClick={closeModal} style={{ marginLeft: 10 }}>
                    No
                  </button>
                </div>
              </div>
            </div>
        )}

        {confirmDeleteId !== null && (
            <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                }}
            >
              <div
                  style={{
                    background: "white",
                    padding: 20,
                    borderRadius: 8,
                    width: 300,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
              >
                <p>Are you really wantt to delete this user?</p>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={confirmDeleteUser}>Yes</button>
                  <button onClick={() => setConfirmDeleteId(null)} style={{ marginLeft: 10 }}>
                    No
                  </button>
                </div>
              </div>
            </div>
        )}

        {confirmDeleteAll && (
            <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                }}
            >
              <div
                  style={{
                    background: "white",
                    padding: 20,
                    borderRadius: 8,
                    width: 300,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
              >
                <p>Do you really want delete ALL users?</p>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={confirmDeleteAllUsers}>Yes</button>
                  <button onClick={() => setConfirmDeleteAll(false)} style={{ marginLeft: 10 }}>
                    No
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}
