import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card, { CardContent } from '../../components/common/Card';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // NOTE: You may need to update this endpoint based on your backend API configuration
      await apiClient.post('/auth/api/auth/password/reset/', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="overflow-hidden">
          <CardContent className="pt-8">
            {success ? (
              <div className="text-center">
                <div className="bg-emerald-50 text-emerald-600 text-sm p-4 rounded-lg border border-emerald-100 mb-6">
                  Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
                </div>
                <Link to="/login">
                  <Button fullWidth className="!bg-[#FFD700] hover:!bg-[#F0C800] !text-black font-bold">
                    Return to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 mb-6">
                    {error}
                  </div>
                )}
                
                <Input
                  label="Email address"
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Button type="submit" fullWidth disabled={loading} className="!bg-[#FFD700] hover:!bg-[#F0C800] !text-black font-bold">
                  {loading ? 'Sending link...' : 'Send reset link'}
                </Button>
                
                <div className="text-center mt-4">
                  <Link to="/login" className="text-sm font-medium text-[#273B76] hover:text-[#1a2850]">
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
