import { useState } from 'react';

export default function RoleSelector({ currentRole, onRoleChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const roles = [
    { value: 'JOB_SEEKER', label: 'Job Seeker', color: 'bg-green-100 text-green-800' },
    { value: 'RECRUITER', label: 'Recruiter', color: 'bg-blue-100 text-blue-800' },
    { value: 'ADMIN', label: 'Admin', color: 'bg-purple-100 text-purple-800' }
  ];

  const currentRoleObj = roles.find(r => r.value === currentRole) || roles[0];

  const handleRoleSelect = (role) => {
    setIsOpen(false);
    if (role !== currentRole) {
      onRoleChange(role);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentRoleObj.color} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
        }`}
      >
        {currentRoleObj.label}
        {!disabled && (
          <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => handleRoleSelect(role.value)}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    role.value === currentRole ? 'bg-gray-50 font-medium' : ''
                  }`}
                  role="menuitem"
                >
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${role.color}`}>
                    {role.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}