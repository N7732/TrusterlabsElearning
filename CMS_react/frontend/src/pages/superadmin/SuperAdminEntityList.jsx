import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminConfig } from '../../config/adminConfig';
import { apiClient } from '../../api/apiClient';
import Button from '../../components/common/Button';
import Card, { CardContent } from '../../components/common/Card';
import { Plus, Edit, Trash2 } from 'lucide-react';

const SuperAdminEntityList = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = adminConfig[entityId];

  useEffect(() => {
    if (config) {
      fetchData();
    }
  }, [entityId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(config.endpoint);
      setData(res.results || res || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await apiClient.delete(`${config.endpoint}${id}/`);
        fetchData();
      } catch (err) {
        console.error('Failed to delete', err);
        alert('Failed to delete item.');
      }
    }
  };

    const handleCustomAction = async (item, actionConfig) => {
    if (actionConfig.actionType === 'api') {
      try {
        const endpoint = actionConfig.apiEndpoint(item.id);
        if (actionConfig.method === 'POST') {
          await apiClient.post(endpoint);
        } else {
          await apiClient.get(endpoint);
        }
        fetchData(); // refresh list
      } catch (err) {
        console.error('Custom action failed', err);
        alert('Action failed.');
      }
    }
  };

  if (!config) {
    return <div>Entity not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{config.label} Management</h1>
          <p className="text-slate-500 mt-2">Manage your {config.label.toLowerCase()} across the platform.</p>
        </div>
        {config.canCreate && (
          <Button 
            onClick={() => navigate(`/superadmin/entity/${entityId}/new`)}
            className="flex items-center bg-[#0A66C2] hover:bg-blue-700"
          >
            <Plus size={18} className="mr-2" />
            Add {config.label}
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {config.columns.map((col) => (
                    <th key={col.field} className="py-4 px-6 font-bold text-slate-700 text-sm uppercase tracking-wider">
                      {col.label}
                    </th>
                  ))}
                  <th className="py-4 px-6 font-bold text-slate-700 text-sm uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={config.columns.length + 1} className="py-8 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={config.columns.length + 1} className="py-8 text-center text-slate-500">
                      No {config.label.toLowerCase()} found.
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      {config.columns.map((col) => {
                        const val = item[col.field];
                        let displayVal = val;
                        if (typeof val === 'boolean') {
                          displayVal = val ? 'Yes' : 'No';
                        } else if (val && typeof val === 'object') {
                          displayVal = JSON.stringify(val);
                        }
                        return (
                          <td key={col.field} className="py-4 px-6 text-sm text-slate-700">
                            {displayVal}
                          </td>
                        );
                      })}
                      <td className="py-4 px-6 text-right space-x-3">
                        {config.customActions && config.customActions.map((actionCfg, idx) => {
                          if (actionCfg.showIf && !actionCfg.showIf(item)) return null;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleCustomAction(item, actionCfg)}
                              className="text-sm font-medium text-[#3E8E41] hover:text-green-800 transition-colors"
                            >
                              {actionCfg.label}
                            </button>
                          );
                        })}
                        {config.canEdit && (
                          <button 
                            onClick={() => navigate(`/superadmin/entity/${entityId}/${item.id}`)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {config.canDelete && (
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminEntityList;
