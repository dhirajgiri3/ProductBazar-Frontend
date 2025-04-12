"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiSearch, FiChevronDown, FiChevronUp, FiEdit,
  FiSave, FiX, FiCheck, FiAlertTriangle, FiFilter,
  FiChevronLeft, FiChevronRight, FiUserPlus, FiUserCheck,
  FiMail, FiPhone, FiUser
} from 'react-icons/fi';

import api from '../../Utils/api';
import { useAuth } from '../../Contexts/Auth/AuthContext';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import debounce from 'lodash.debounce';

const RoleManagement = () => {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedSecondaryRoles, setSelectedSecondaryRoles] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const roles = [
    { id: '', label: 'All Roles' },
    { id: 'user', label: 'Regular User' },
    { id: 'startupOwner', label: 'Startup Owner' },
    { id: 'investor', label: 'Investor' },
    { id: 'agency', label: 'Agency' },
    { id: 'freelancer', label: 'Freelancer' },
    { id: 'jobseeker', label: 'Job Seeker' },
    { id: 'maker', label: 'Maker' },
    { id: 'admin', label: 'Admin' }
  ];

  const secondaryRoleOptions = [
    { id: 'startupOwner', label: 'Startup Owner' },
    { id: 'investor', label: 'Investor' },
    { id: 'agency', label: 'Agency' },
    { id: 'freelancer', label: 'Freelancer' },
    { id: 'jobseeker', label: 'Job Seeker' },
    { id: 'maker', label: 'Maker' }
  ];

  // Fetch all users at once
  const fetchAllUsers = useCallback(async () => {
    if (!user || user.role !== 'admin') return;

    setIsLoading(true);
    setError(''); // Clear any previous errors

    try {
      // Fetch all users without pagination
      const response = await api.get('/admin/users/all');

      if (response.data.status === 'success') {
        const users = response.data.data.users;
        setAllUsers(users);
        setFilteredUsers(users);
        setError(''); // Explicitly clear error state on success
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Filter users based on search query and role filter
  const filterUsers = useCallback(
    debounce((query = '', role = '') => {
      setIsSearching(true);

      try {
        // Clear any previous errors when filtering starts
        setError('');

        // Filter users based on search query and role
        let filtered = [...allUsers];

        if (query) {
          const searchTerms = query.toLowerCase().trim().split(/\s+/);

          filtered = filtered.filter(user => {
            // Check if user matches all search terms
            return searchTerms.every(term => {
              const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
              const email = (user.email || '').toLowerCase();
              const phone = (user.phone || '').toLowerCase();
              const role = (user.role || '').toLowerCase();
              const company = (user.companyName || '').toLowerCase();
              const city = (user.address?.city || '').toLowerCase();
              const country = (user.address?.country || '').toLowerCase();

              return (
                fullName.includes(term) ||
                email.includes(term) ||
                phone.includes(term) ||
                role.includes(term) ||
                company.includes(term) ||
                city.includes(term) ||
                country.includes(term)
              );
            });
          });
        }

        if (role) {
          filtered = filtered.filter(user => user.role === role);
        }

        setFilteredUsers(filtered);

        // Generate suggestions based on the same filter
        if (query && query.length >= 2) {
          const suggestionResults = filtered.slice(0, 5).map(user => ({
            _id: user._id,
            name: user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.email || user.phone || 'Unnamed User',
            email: user.email,
            phone: user.phone,
            profilePicture: user.profilePicture?.url || null,
            role: user.role
          }));

          setSuggestions(suggestionResults);
          setShowSuggestions(suggestionResults.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        console.error('Error filtering users:', err);
        // Don't set error state for filtering issues to avoid confusing the user
        // since the main data is already loaded
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [allUsers]
  );

  // Handle input change for search with suggestions
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterUsers(query, roleFilter);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    // Find the user from allUsers that matches the suggestion
    const selectedUser = allUsers.find(u => u._id === suggestion._id);
    if (selectedUser) {
      setSearchQuery(suggestion.name);
      setSuggestions([]);
      setShowSuggestions(false);

      // Filter to show only this user
      setFilteredUsers([selectedUser]);

      // Also select the user for editing
      handleUserSelect(selectedUser);
    }
  };

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    // Only handle keys when suggestions are shown
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prevIndex =>
          prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prevIndex =>
          prevIndex > 0 ? prevIndex - 1 : 0
        );
        break;
      case 'Enter':
        // If a suggestion is active and Enter is pressed, select it
        if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
          e.preventDefault();
          handleSelectSuggestion(suggestions[activeSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  // Reset active suggestion index when suggestions change
  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [suggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initial fetch of all users
  useEffect(() => {
    fetchAllUsers();

    // Clear any error messages when component mounts
    setError('');
  }, [fetchAllUsers]);

  // Clear error message when users are successfully loaded
  useEffect(() => {
    if (allUsers.length > 0) {
      setError('');
    }
  }, [allUsers]);

  // Auto-clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    filterUsers(searchQuery, roleFilter);
  };

  // Handle user selection
  const handleUserSelect = (selectedUser) => {
    setSelectedUser(selectedUser);
    setSelectedRole(selectedUser.role);
    setSelectedSecondaryRoles(selectedUser.secondaryRoles || []);
    setEditMode(false);
  };

  // Handle role change
  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.put(`/admin/users/${selectedUser._id}/role`, {
        role: selectedRole
      });

      if (response.data.status === 'success') {
        // Update the user in both lists
        const updatedUser = { ...selectedUser, role: selectedRole };

        setAllUsers(prevUsers =>
          prevUsers.map(u => u._id === selectedUser._id ? updatedUser : u)
        );

        setFilteredUsers(prevUsers =>
          prevUsers.map(u => u._id === selectedUser._id ? updatedUser : u)
        );

        // Update selected user
        setSelectedUser(updatedUser);

        setSuccessMessage('User role updated successfully');
        toast.success('User role updated successfully');
        setEditMode(false);

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to update role');
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle secondary roles change
  const handleSecondaryRolesChange = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.put(`/admin/users/${selectedUser._id}/secondary-roles`, {
        secondaryRoles: selectedSecondaryRoles
      });

      if (response.data.status === 'success') {
        // Update the user in both lists
        const updatedUser = { ...selectedUser, secondaryRoles: selectedSecondaryRoles };

        setAllUsers(prevUsers =>
          prevUsers.map(u => u._id === selectedUser._id ? updatedUser : u)
        );

        setFilteredUsers(prevUsers =>
          prevUsers.map(u => u._id === selectedUser._id ? updatedUser : u)
        );

        // Update selected user
        setSelectedUser(updatedUser);

        setSuccessMessage('Secondary roles updated successfully');
        toast.success('Secondary roles updated successfully');
        setEditMode(false);

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to update secondary roles');
      }
    } catch (err) {
      console.error('Error updating secondary roles:', err);
      setError(err.response?.data?.message || 'Failed to update secondary roles');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle secondary role selection
  const toggleSecondaryRole = (roleId) => {
    if (selectedSecondaryRoles.includes(roleId)) {
      setSelectedSecondaryRoles(prev => prev.filter(r => r !== roleId));
    } else {
      setSelectedSecondaryRoles(prev => [...prev, roleId]);
    }
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="bg-amber-50 text-amber-800 p-4 rounded-lg">
        <div className="flex items-center">
          <FiAlertTriangle className="mr-2" />
          <span>Only administrators can access this feature.</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">User Role Management</h2>

      <AnimatePresence>
        {error && (
          <motion.div
            key="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center">
              <FiAlertTriangle className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-2 text-red-500 hover:text-red-700 transition-colors"
              aria-label="Dismiss error"
            >
              <FiX className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            key="success-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center">
              <FiCheck className="mr-2 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="ml-2 text-green-500 hover:text-green-700 transition-colors"
              aria-label="Dismiss message"
            >
              <FiX className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="lg:col-span-1 bg-gray-50 rounded-xl p-4">
          <div className="mb-4">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <div className="relative flex-grow">
                {isSearching ? (
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-pulse delay-200"></div>
                  </div>
                ) : (
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                )}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search users by name, email, role..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                  aria-autocomplete="list"
                  aria-controls="user-suggestions"
                  aria-expanded={showSuggestions}
                />

                {/* Clear search button */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                      filterUsers('', roleFilter);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      ref={suggestionsRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      id="user-suggestions"
                      role="listbox"
                      className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
                    >
                      {isSearching ? (
                        <div className="p-3 text-center text-gray-500 text-sm">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-pulse w-4 h-4 bg-violet-200 rounded-full"></div>
                            <div className="animate-pulse w-4 h-4 bg-violet-300 rounded-full delay-100"></div>
                            <div className="animate-pulse w-4 h-4 bg-violet-400 rounded-full delay-200"></div>
                          </div>
                        </div>
                      ) : suggestions.length === 0 ? (
                        <div className="p-3 text-center text-gray-500 text-sm">
                          No users found
                        </div>
                      ) : (
                        suggestions.map((suggestion, index) => (
                          <motion.div
                            key={suggestion._id}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            onMouseEnter={() => setActiveSuggestionIndex(index)}
                            className={`p-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${index === activeSuggestionIndex ? 'bg-violet-50' : 'hover:bg-violet-50'}`}
                            whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                            role="option"
                            aria-selected={index === activeSuggestionIndex}
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                                {suggestion.profilePicture ? (
                                  <Image
                                    src={suggestion.profilePicture}
                                    alt={suggestion.name}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <FiUser className="w-4 h-4" />
                                )}
                              </div>
                              <div className="ml-2 flex-grow">
                                <div className="font-medium text-gray-800 text-sm">{suggestion.name}</div>
                                <div className="flex items-center text-xs text-gray-500">
                                  {suggestion.email && (
                                    <div className="flex items-center mr-2">
                                      <FiMail className="w-3 h-3 mr-1" />
                                      <span className="truncate max-w-[150px]">{suggestion.email}</span>
                                    </div>
                                  )}
                                  {suggestion.role && (
                                    <div className="flex items-center">
                                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${suggestion.role === 'admin' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                      <span>{roles.find(r => r.id === suggestion.role)?.label || suggestion.role}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                type="submit"
                className="p-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
              >
                <FiSearch />
              </button>
            </form>
          </div>

          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-500" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  const newRoleFilter = e.target.value;
                  setRoleFilter(newRoleFilter);

                  // Apply filtering with the new role filter
                  filterUsers(searchQuery, newRoleFilter);
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search results count */}
          {!isLoading && (
            <div className="mb-3 text-sm text-gray-600 flex items-center justify-between">
              <span>
                {filteredUsers.length > 0 ? (
                  <>
                    <span className="font-medium">{filteredUsers.length}</span> {filteredUsers.length === 1 ? 'user' : 'users'}
                    {searchQuery && <span>found</span>}
                    {roleFilter && <span> in <span className="font-medium">{roles.find(r => r.id === roleFilter)?.label || roleFilter}</span> role</span>}
                  </>
                ) : (
                  'No users found'
                )}
              </span>
              {allUsers.length > 0 && filteredUsers.length !== allUsers.length && (
                <span className="text-xs text-gray-500">
                  Showing {filteredUsers.length} of {allUsers.length} total users
                </span>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex flex-col items-center">
                <div className="flex space-x-2 mb-2">
                  <div className="w-2 h-2 bg-violet-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-violet-700 rounded-full animate-bounce delay-200"></div>
                </div>
                <p className="text-violet-600 text-sm">Loading users...</p>
              </div>
            </div>
          ) : isSearching ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex flex-col items-center">
                <div className="flex space-x-2 mb-2">
                  <div className="w-2 h-2 bg-violet-300 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-violet-700 rounded-full animate-pulse delay-200"></div>
                </div>
                <p className="text-violet-600 text-sm">Filtering users...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center">
              <FiUsers className="w-10 h-10 text-gray-300 mb-2" />
              <p>No users found</p>
              {searchQuery && (
                <p className="text-sm text-gray-400 mt-1">
                  Try different search terms or filters
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filteredUsers.map(user => (
                <motion.div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-3 rounded-lg cursor-pointer flex items-center ${
                    selectedUser && selectedUser._id === user._id
                      ? 'bg-violet-100 border border-violet-300'
                      : 'bg-white hover:bg-gray-100 border border-gray-100'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden relative">
                    {user.profilePicture?.url ? (
                      <Image
                        src={user.profilePicture.url}
                        alt={`${user.firstName} ${user.lastName}`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-violet-100 text-violet-600">
                        {user.firstName?.charAt(0) || user.email?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>

                  <div className="ml-3 flex-grow">
                    <div className="font-medium text-gray-800">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email || user.phone || 'Unnamed User'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        user.role === 'admin' ? 'bg-red-500' : 'bg-green-500'
                      }`}></span>
                      {roles.find(r => r.id === user.role)?.label || user.role}
                    </div>
                  </div>

                  <FiEdit className="text-gray-400" />
                </motion.div>
              ))}
            </div>
          )}

          {/* Show load more button if there are many users */}
          {filteredUsers.length > 20 && (
            <div className="flex justify-center items-center mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  // Scroll to top of user list
                  const userListElement = document.querySelector('.max-h-\\[60vh\\]');
                  if (userListElement) {
                    userListElement.scrollTop = 0;
                  }
                }}
                className="px-4 py-2 text-sm text-violet-600 hover:bg-violet-50 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <FiChevronUp className="mr-1" />
                  <span>Back to top</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* User Details */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden relative">
                    {selectedUser.profilePicture?.url ? (
                      <Image
                        src={selectedUser.profilePicture.url}
                        alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-violet-100 text-violet-600 text-xl">
                        {selectedUser.firstName?.charAt(0) || selectedUser.email?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {selectedUser.firstName && selectedUser.lastName
                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                        : 'Unnamed User'}
                    </h2>

                    <div className="text-gray-500 text-sm">
                      {selectedUser.email && (
                        <div className="flex items-center">
                          <span className="mr-1">Email:</span>
                          <span className="font-medium">{selectedUser.email}</span>
                          {selectedUser.isEmailVerified && (
                            <span className="ml-1 text-green-500 text-xs">(Verified)</span>
                          )}
                        </div>
                      )}

                      {selectedUser.phone && (
                        <div className="flex items-center">
                          <span className="mr-1">Phone:</span>
                          <span className="font-medium">{selectedUser.phone}</span>
                          {selectedUser.isPhoneVerified && (
                            <span className="ml-1 text-green-500 text-xs">(Verified)</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center">
                        <span className="mr-1">Profile Status:</span>
                        <span className={`font-medium ${selectedUser.isProfileCompleted ? 'text-green-600' : 'text-amber-600'}`}>
                          {selectedUser.isProfileCompleted ? 'Completed' : 'Incomplete'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Role Management */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Primary Role</h3>

                  {!editMode && (
                    <motion.button
                      onClick={() => setEditMode(true)}
                      className="text-violet-600 hover:text-violet-700 flex items-center text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiEdit className="mr-1" />
                      Edit Roles
                    </motion.button>
                  )}
                </div>

                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-violet-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">Current Role:</span>

                  {editMode ? (
                    <div className="ml-2 flex-grow">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                        disabled={isSubmitting}
                      >
                        {roles.filter(r => r.id !== '').map(role => (
                          <option key={role.id} value={role.id}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="ml-2 p-2 bg-violet-50 rounded text-violet-800">
                      {roles.find(r => r.id === selectedUser.role)?.label || selectedUser.role}
                    </div>
                  )}
                </div>

                {/* Secondary Roles */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Secondary Roles</h4>

                  {editMode ? (
                    <div className="space-y-2">
                      {secondaryRoleOptions.map(role => (
                        <label key={role.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                          <input
                            type="checkbox"
                            checked={selectedSecondaryRoles.includes(role.id)}
                            onChange={() => toggleSecondaryRole(role.id)}
                            className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                            disabled={isSubmitting}
                          />
                          <span className="ml-2 text-sm text-gray-700">{role.label}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.secondaryRoles && selectedUser.secondaryRoles.length > 0 ? (
                        selectedUser.secondaryRoles.map(role => (
                          <span key={role} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                            {roles.find(r => r.id === role)?.label || role}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No secondary roles assigned</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Role Capabilities */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Role Capabilities</h4>

                  {selectedUser.roleCapabilities ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(selectedUser.roleCapabilities).map(([capability, enabled]) => (
                        <div key={capability} className={`p-2 rounded-md ${enabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                          {capability.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          {enabled ? ' ✓' : ' ✗'}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No role capabilities information available</p>
                  )}
                </div>

                {/* Action Buttons */}
                {editMode && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <motion.button
                      onClick={() => {
                        setEditMode(false);
                        setSelectedRole(selectedUser.role);
                        setSelectedSecondaryRoles(selectedUser.secondaryRoles || []);
                      }}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                    >
                      <FiX className="mr-1" />
                      Cancel
                    </motion.button>

                    <motion.button
                      onClick={handleRoleChange}
                      className="px-3 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors flex items-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting || selectedRole === selectedUser.role}
                    >
                      {isSubmitting ? (
                        <span>Updating...</span>
                      ) : (
                        <FiUserCheck className="mr-1" />
                      )}
                      Update Primary Role
                    </motion.button>

                    <motion.button
                      onClick={handleSecondaryRolesChange}
                      className="px-3 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors flex items-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span>Updating...</span>
                      ) : (
                        <FiUserPlus className="mr-1" />
                      )}
                      Update Secondary Roles
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
              <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No User Selected</h3>
              <p className="text-gray-500">Select a user from the list to view and manage their roles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
