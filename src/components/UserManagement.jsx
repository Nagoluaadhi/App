import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: '', client_id: '' });
  const [inventoryForm, setInventoryForm] = useState({ item_name: '', remark: '' });
  const [clientForm, setClientForm] = useState({ client_name: '', address: '' });
  const [inventory, setInventory] = useState([]);

const loadInventory = async () => {
  const res = await axios.get('/api/inventory');
  setInventory(res.data);
};

  const [clients, setClients] = useState([]);

  const loadUsers = async () => {
    const res = await axios.get('/api/users');
    setUsers(res.data);
  };

  const loadClients = async () => {
    const res = await axios.get('/api/clients');
    setClients(res.data);
  };

  useEffect(() => {
    loadUsers();
    loadClients();
    loadInventory();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.username || !form.password || !form.role) {
    alert('Please fill in all fields (username, password, role)');
    return;
  }

  try {
      await axios.post('/api/users', form);
      alert('User created successfully');
      setForm({ username: '', password: '', role: '', client_id: '' });
    } catch (err) {
      alert('Failed to create user');
    }
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/inventory', inventoryForm);
    setInventoryForm({ item_name: '', remark: '' });
    loadInventory();
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/clients', clientForm);
    setClientForm({ client_name: '', address: '' });
    loadClients();
  };

  const deleteUser = async (id) => {
  if (!window.confirm('Are you sure you want to delete this user?')) return;

  try {
    await axios.delete(`/api/users/${id}`);
    alert('User deleted successfully');
    loadUsers();
  } catch (err) {
    if (err.response?.status === 409) {
      // Show confirm dialog if user is in use
      const forceDelete = window.confirm('This user is in use. Do you want to force delete?');
      if (forceDelete) {
        try {
          await axios.delete(`/api/users/${id}?force=true`);
          alert('User and associated data deleted');
          loadUsers();
        } catch (e) {
          alert('Force delete failed.');
        }
      }
    } else {
      alert('Delete failed.');
    }
  }
};


const deleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await axios.delete(`/api/clients/${id}`);
      alert('Client deleted successfully');
      loadClients();
    } catch (err) {
      if (err.response?.status === 409) {
        const force = window.confirm('This client is in use. Do you want to force delete?');
        if (force) {
          try {
            await axios.delete(`/api/clients/${id}?force=true`);
            alert('Client and associated data deleted');
            loadClients();
          } catch {
            alert('Force delete failed.');
          }
        }
      } else {
        alert('Delete failed.');
      }
    }
  };

  const deleteInventory = async (id) => {
  if (!window.confirm('Are you sure you want to delete this inventory item?')) return;

  try {
    await axios.delete(`/api/inventory/${id}`);
    alert('Inventory deleted successfully');
    loadInventory();
  } catch (err) {
    if (err.response?.status === 409) {
      const force = window.confirm('This item is in use. Do you want to force delete?');
      if (force) {
        try {
          await axios.delete(`/api/inventory/${id}?force=true`);
          alert('Item and related data deleted');
          loadInventory();
        } catch {
          alert('Force delete failed.');
        }
      }
    } else {
      alert('Delete failed.');
    }
  }
};




   return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">User Management</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="p-2 border rounded"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value, client_id: '' })}
          className="p-2 border rounded"
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="branch-office">Branch Office</option>
          <option value="user">User</option>
        </select>

        {form.role === 'branch-office' && (
          <select
            value={form.client_id}
            onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            className="p-2 border rounded"
            required
          >
            <option value="">Select Client</option>
            {clients.map(cli => (
              <option key={cli.id} value={cli.id}>
                {cli.client_name}
              </option>
            ))}
          </select>
        )}

        <button type="submit" className="p-2 bg-blue-600 text-white rounded col-span-1 md:col-span-3">
          Create User
        </button>
      </form>

      <h3 className="text-md font-semibold mb-2">Users</h3>
      <table className="w-full text-sm border mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Username</th>
            <th className="border px-2 py-1">Role</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="border px-2 py-1">{user.id}</td>
              <td className="border px-2 py-1">{user.username}</td>
              <td className="border px-2 py-1">{user.role}</td>
              <td className="border px-2 py-1">
                <button onClick={() => deleteUser(user.id)} className="bg-red-600 text-white px-2 py-1 text-xs rounded cursor-pointer">Delete</button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-md font-semibold mb-2">Create Items</h3>
      <form onSubmit={handleInventorySubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Item Name"
          value={inventoryForm.item_name}
          onChange={(e) => setInventoryForm({ ...inventoryForm, item_name: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Remark"
          value={inventoryForm.remark}
          onChange={(e) => setInventoryForm({ ...inventoryForm, remark: e.target.value })}
          className="p-2 border rounded"
        />
        <div className="md:col-span-3 flex justify-left">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded w-auto"
        >Create Items</button>
        </div>
      </form>
      <h3 className="text-md font-semibold mb-2">Existing Items</h3>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Item Name</th>
            <th className="border px-2 py-1">Remark</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(inventory => (
            <tr key={inventory.id}>
              <td className="border px-2 py-1">{inventory.id}</td>
              <td className="border px-2 py-1">{inventory.item_name}</td>
              <td className="border px-2 py-1">{inventory.remark}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => deleteInventory(inventory.id)}
                  className="bg-red-600 text-white px-2 py-1 text-xs rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
<br></br>
      <h3 className="text-md font-semibold mb-2">Create Client</h3>
      <form onSubmit={handleClientSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Client Name"
          value={clientForm.client_name}
          onChange={(e) => setClientForm({ ...clientForm, client_name: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Address"
          value={clientForm.address}
          onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
          className="p-2 border rounded"
        />
        <div className="md:col-span-3 flex justify-left">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded w-auto"
        >
          Add Client
        </button>
        </div>
      </form>

      <h3 className="text-md font-semibold mb-2">Existing Clients</h3>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Client Name</th>
            <th className="border px-2 py-1">Address</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td className="border px-2 py-1">{client.id}</td>
              <td className="border px-2 py-1">{client.client_name}</td>
              <td className="border px-2 py-1">{client.address}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => deleteClient(client.id)}
                  className="bg-red-600 text-white px-2 py-1 text-xs rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
