import React from 'react';

const AdminAccountsSection = ({
  accounts,
  accountsLoading,
  search,
  setSearch,
  handleApproveDoctor,
  handleHideDoctor,
  handleDelete
}) => (
  <div className="w-full max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold mb-4 text-center text-red-600">Manage Accounts</h1>
    <div className="flex justify-end mb-4">
      <input
        type="text"
        placeholder="Search by name or email..."
        className="border rounded px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#000000]"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    </div>
    {accountsLoading ? (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#56c3c3]"></div>
      </div>
    ) : (
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-[#041212] text-white">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts
              .filter(acc =>
                acc.firstName.toLowerCase().includes(search.toLowerCase()) ||
                acc.lastName.toLowerCase().includes(search.toLowerCase()) ||
                acc.email.toLowerCase().includes(search.toLowerCase())
              )
              .map((acc, idx) => (
                <tr key={acc.type + '-' + acc.id} className={idx % 2 === 0 ? 'bg-[#e6f6f6]' : ''}>
                  <td className="border px-4 py-2">{acc.id}</td>
                  <td className="border px-4 py-2">{acc.firstName} {acc.lastName}</td>
                  <td className="border px-4 py-2">{acc.email}</td>
                  <td className="border px-4 py-2">{acc.role}</td>
                  <td className="border px-4 py-2">{acc.type}</td>
                  <td className="border px-4 py-2 space-x-2 flex items-center justify-center">
                    {acc.type === 'doctor' && (
                      <div className="flex space-x-2">
                        {acc.status !== 'approved' && (
                          <button
                            className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md transition duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg group"
                            onClick={() => handleApproveDoctor(acc.id)}
                            title="Approve Doctor"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Approve
                          </button>
                        )}
                        {acc.status !== 'hidden' && (
                          <button
                            className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md transition duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg group"
                            onClick={() => handleHideDoctor(acc.id)}
                            title="Hide Doctor"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                            Hide
                          </button>
                        )}
                      </div>
                    )}
                    <button
                      className="flex items-center justify-center bg-[#3a1a89] hover:bg-[#3ba7a7] text-white px-3 py-1.5 rounded-md transition duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg group"
                      onClick={() => handleDelete(acc.type, acc.id)}
                      title="Delete Account"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default AdminAccountsSection;
