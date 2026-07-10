import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card, { CardContent } from '../../components/common/Card';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    new_password: '',
    re_new_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.new_password !== formData.re_new_password) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // NOTE: Update this endpoint based on your backend API configuration
      await apiClient.post('/auth/api/auth/password/reset/confirm/', { 
        uid, 
        token, 
        new_password: formData.new_password,
        re_new_password: formData.re_new_password
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link might be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Set a new password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="overflow-hidden">
          <CardContent className="pt-8">
            {success ? (
              <div className="text-center">
                <div className="bg-emerald-50 text-emerald-600 text-sm p-4 rounded-lg border border-emerald-100 mb-6">
                  Your password has been successfully reset. Redirecting you to login...
                </div>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 mb-6">
                    {error}
                  </div>
                )}
                
                <Input
                  label="New Password"
                  id="new_password"
                  type="password"
                  required
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                />
                
                <Input
                  label="Confirm New Password"
                  id="re_new_password"
                  type="password"
                  required
                  value={formData.re_new_password}
                  onChange={(e) => setFormData({ ...formData, re_new_password: e.target.value })}
                />

                <Button type="submit" fullWidth disabled={loading} className="!bg-[#FFD700] hover:!bg-[#F0C800] !text-black font-bold">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
