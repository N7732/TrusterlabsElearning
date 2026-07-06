import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Search, Plus, Trash2, Edit } from 'lucide-react';

// Maps URL paths to API endpoints and configuration
const entityConfig = {
  learners: { endpoint: '/auth/api/learners/', title: 'Learners', singular: 'Learner' },
  instructors: { endpoint: '/auth/api/instructors/', title: 'Instructors', singular: 'Instructor' },
  courses: { endpoint: '/api/courses/', title: 'Courses', singular: 'Course' },
  modules: { endpoint: '/api/modules/', title: 'Modules', singular: 'Module' },
  lessons: { endpoint: '/api/lessons/', title: 'Lessons', singular: 'Lesson' },
  quizzes: { endpoint: '/api/quizes/', title: 'Quizzes', singular: 'Quiz' },
  quiz_questions: { endpoint: '/api/quiz_questions/', title: 'Quiz Questions', singular: 'Quiz Question' },
};

const AdminEntityList = () => {
  const location = useLocation();
  const entityKey = location.pathname.split('/').pop();
  const config = entityConfig[entityKey];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (config) {
      fetchData();
    }
  }, [entityKey]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.get(config.endpoint);
      // Handle Django Rest Framework pagination format if present
      setData(result.results || result || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Make sure you have permission and the server is running.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${config.singular}?`)) {
      try {
        await apiClient.delete(`${config.endpoint}${id}/`);
        fetchData(); // Refresh list
      } catch (err) {
        alert('Failed to delete item. It may be referenced by other records.');
      }
    }
  };

  if (!config) {
    return <div className="p-8 text-center text-slate-500">Entity not configured.</div>;
  }

  // Dynamically determine columns based on the first data object
  const getColumns = () => {
    if (data.length === 0) return [];
    
    const firstItem = data[0];
    const columns = [];
    
    // Always put ID first
    if ('id' in firstItem) columns.push('id');
    
    // Prioritize common name/title fields
    if ('title' in firstItem) columns.push('title');
    if ('name' in firstItem) columns.push('name');
    if ('username' in firstItem && !columns.includes('username')) columns.push('username');
    if ('email' in firstItem) columns.push('email');
    
    // Add a few other scalar fields
    Object.keys(firstItem).forEach(key => {
      if (columns.length < 6 && 
          !columns.includes(key) && 
          typeof firstItem[key] !== 'object' && 
          key !== 'password' &&
          key !== 'content') {
        columns.push(key);
      }
    });
    
    return columns;
  };

  const columns = getColumns();

  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item).some(val => 
      val && typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Select {config.singular} to change</h2>
        <Link to={`/admin/${entityKey}/new`}>
          <Button className="bg-[#3E8E41] hover:bg-[#317033]">
            <Plus size={18} className="mr-2" /> Add {config.singular}
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div className="relative w-full max-w-md">
              <input 
                type="text" 
                placeholder={`Search ${config.title.toLowerCase()}...`}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E41] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <div className="text-sm text-slate-500 font-medium">
              {filteredData.length} {filteredData.length === 1 ? config.singular : config.title}
            </div>
          </div>

          {error && (
            <div className="p-4 text-red-600 bg-red-50 border-b border-red-100 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3E8E41]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                    {columns.map(col => (
                      <th key={col} className="p-4 font-bold">{col.replace(/_/g, ' ')}</th>
                    ))}
                    <th className="p-4 font-bold text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="p-8 text-center text-slate-500">
                        No {config.title.toLowerCase()} found.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        {columns.map((col, idx) => (
                          <td key={col} className="p-4 whitespace-nowrap text-slate-800">
                            {idx === 0 || col === 'title' || col === 'name' || col === 'email' ? (
                              <Link to={`/admin/${entityKey}/${item.id}`} className="text-[#0A66C2] font-medium hover:underline">
                                {String(item[col] || '-')}
                              </Link>
                            ) : (
                              <span className="text-slate-600">
                                {typeof item[col] === 'boolean' 
                                  ? (item[col] ? 'Yes' : 'No') 
                                  : String(item[col]).substring(0, 50) || '-'}
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              to={`/admin/${entityKey}/${item.id}`}
                              className="p-1.5 text-slate-400 hover:text-[#0A66C2] rounded hover:bg-blue-50 transition-colors inline-block"
                            >
                              <Edit size={16} />
                            </Link>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEntityList;
