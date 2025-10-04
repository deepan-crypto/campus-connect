import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'student',
    department: '',
    graduationYear: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name, value) => {
    console.log('Select changed:', name, 'to', value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Simulate form submission without authentication
      console.log('Form submitted:', formData);
      alert('Form submitted successfully! (No authentication)');
      navigate('/login'); // Navigate to login page after signup
    } catch (error) {
      setError('Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'alumni', label: 'Alumni' },
    { value: 'faculty', label: 'Faculty' }
  ];

  const departmentOptions = [
    { value: 'computer-science', label: 'Computer Science' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'business', label: 'Business' },
    { value: 'arts', label: 'Arts' },
    { value: 'science', label: 'Science' },
    { value: 'other', label: 'Other' }
  ];

  const graduationYearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear + 4; year >= currentYear - 10; year--) {
    graduationYearOptions.push({ value: year.toString(), label: year.toString() });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-lg p-8 shadow-elevation-2">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="GraduationCap" size={24} className="text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-card-foreground mb-2">Join Campus Connect</h1>
            <p className="text-muted-foreground">Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            <div>
              <Input
                type="text"
                name="fullName"
                placeholder="Full name"
                value={formData.fullName}
                onChange={handleInputChange}
                iconName="User"
                label="Full Name"
              />
            </div>

            <div>
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                iconName="Mail"
                label="Email"
              />
            </div>

            <div>
            <Select
                name="role"
                value={formData.role}
                onChange={(value) => handleSelectChange('role', value)}
                options={roleOptions}
                label="Role"
                key="role-select"
              />
            </div>

            <div>
            <Select
                name="department"
                value={formData.department}
                onChange={(value) => handleSelectChange('department', value)}
                options={departmentOptions}
                label="Department"
                key="department-select"
              />
            </div>

            <div>
            <Select
                name="graduationYear"
                value={formData.graduationYear}
                onChange={(value) => handleSelectChange('graduationYear', value)}
                options={graduationYearOptions}
                label="Graduation Year"
                key="graduationYear-select"
              />
            </div>

            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                iconName="Lock"
                label="Password"
              />
            </div>

            <div>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                iconName="Lock"
                label="Confirm Password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
              iconName={loading ? "Loader" : undefined}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;