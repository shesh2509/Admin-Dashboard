import React, { useState, useEffect } from 'react';
import './App.css';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';

function App() {
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isHeaderCheckboxChecked, setIsHeaderCheckboxChecked] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetch(
      `https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json`
    )
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  }, []);

  const totalPages = Math.ceil(
    users.length / itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber - 1);
    setSelectedRows([]);
    setIsHeaderCheckboxChecked(false);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={currentPage === i - 1 ? 'active' : ''}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  const jumpToPage = (pageNumber) => {
    setCurrentPage(pageNumber - 1);
  };

  const handleFirstPage = () => {
    jumpToPage(1);
  };

  const handleLastPage = () => {
    jumpToPage(totalPages);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      jumpToPage(currentPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      jumpToPage(currentPage + 2);
    }
  };

  const deleteUser = (selectedUser) => {
    let userAfterDeletion = users.filter((user) => {
      return user.id !== selectedUser;
    });
    setUsers(userAfterDeletion);
    setSelectedRows([]);
    setIsHeaderCheckboxChecked(false);
  };

  const toggleEdit = (id) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, editing: !user.editing } : user
      )
    );
  };

  const handleEditInputChange = (id, property, value) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, [property]: value } : user
      )
    );
  };

  const saveUserDetails = (id) => {
    toggleEdit(id);
  };

  const handleSelectAll = () => {
    if (selectedRows.length === itemsPerPage) {
      setSelectedRows([]);
      setIsHeaderCheckboxChecked(false);
    } else {
      setSelectedRows(
        users
          .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
          .map((user) => user.id)
      );
      setIsHeaderCheckboxChecked(true);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
    setIsHeaderCheckboxChecked(false);
  };

  const handleDeleteSelected = () => {
    const updatedUsers = users.filter((user) => !selectedRows.includes(user.id));
    setUsers(updatedUsers);
    setSelectedRows([]);
    setIsHeaderCheckboxChecked(false);
  };

  const handleSearch = () => {
    const filteredUsers = users.filter((user) => {
      return Object.values(user).some((value) =>
        String(value).toLowerCase().includes(searchUser.toLowerCase())
      );
    });
    setUsers(filteredUsers);
    setSelectedRows([]); 
    setIsHeaderCheckboxChecked(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container">
      <br />
      <div className="search-bar">
        <input
          type="text"
          name="name"
          placeholder="Search"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="search-icon" onClick={handleSearch}>
          <SearchIcon />
        </button>
        <div className="delete-selected-button" onClick={handleDeleteSelected}>
          <DeleteIcon />
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={isHeaderCheckboxChecked}
                onChange={handleSelectAll}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users
            .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
            .map((user) => (
              <tr key={user.id} className={`${selectedRows.includes(user.id) ? 'selected-row' : ''}`}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(user.id)}
                    onChange={() => handleSelectRow(user.id)}
                  />
                </td>
                <td>
                  {user.editing ? (
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => handleEditInputChange(user.id, 'name', e.target.value)}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {user.editing ? (
                    <input
                      type="text"
                      value={user.email}
                      onChange={(e) => handleEditInputChange(user.id, 'email', e.target.value)}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {user.editing ? (
                    <input
                      type="text"
                      value={user.role}
                      onChange={(e) => handleEditInputChange(user.id, 'role', e.target.value)}
                    />
                  ) : (
                    user.role
                  )}
                </td>
                <td className="btn">
                  {user.editing ? (
                    <button className="save" onClick={() => saveUserDetails(user.id)}>
                      <SaveIcon />
                    </button>
                  ) : (
                    <button className="edit" onClick={() => toggleEdit(user.id)}>
                      <EditIcon />
                    </button>
                  )}
                  <button className="delete" onClick={() => deleteUser(user.id)}>
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <div className="jump-to-page">
        <button className="first-page" onClick={handleFirstPage}>First</button>
        <button className="previous-page" onClick={handlePreviousPage}>Previous</button>
        {renderPageNumbers()}
        <button className="next-page" onClick={handleNextPage}>Next</button>
        <button className="last-page" onClick={handleLastPage}>Last</button>
      </div>
    </div>
  );
}

export default App;
