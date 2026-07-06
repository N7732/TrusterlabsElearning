import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card, { CardContent } from '../../components/common/Card';

const RegisterLearner = () => {
  const [formData, setFormData] = useState({
    username: '', // Some Django setups require username
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerLearner } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Pass required fields to API
      await registerLearner({
        username: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/');
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-[#0855A2] transition-colors">
            Log in instead
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-danger text-sm p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  id="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                />
                <Input
                  label="Last Name"
                  id="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Email address"
                id="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
              />

              <Input
                label="Password"
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
              
              <Input
                label="Confirm Password"
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />

              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterLearner;
