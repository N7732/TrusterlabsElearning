import { apiClient } from '../api/apiClient';

export const submitEnquiry = async (enquiryData) => {
  return await apiClient.post('/enquiry/', enquiryData);
};

export const getEnquiries = async () => {
  return await apiClient.get('/enquiry/');
};

export const getEnquiry = async (id) => {
  return await apiClient.get(`/enquiry/${id}/`);
};

export const deleteEnquiry = async (id) => {
  return await apiClient.delete(`/enquiry/${id}/`);
};
