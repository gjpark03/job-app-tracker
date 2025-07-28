import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, BarChart3, Table, LogOut, TrendingUp, Calendar, Building2, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from './supabaseClient';

const JobAppsMain = ({ user, onLogout }) => {
    const [applications, setApplications] = useState([]);
    const [showChart, setShowChart] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load applications when user logs in
    useEffect(() => {
        if (user) {
            loadApplications();
        }
    }, [user]);

    const loadApplications = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('applications')
                .select('*')
                .order('date_applied', { ascending: false });

            if (error) throw error;

            // Convert date strings to proper format for input fields
            const formattedData = data.map(app => ({
                ...app,
                date_applied: app.date_applied || new Date().toISOString().split('T')[0]
            }));

            setApplications(formattedData || []);
        } catch (error) {
            console.error('Error loading applications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Application handlers
    const addApplication = async () => {
        const newApp = {
            user_id: user.id,
            company: '',
            position: '',
            status: 'Applied',
            date_applied: new Date().toISOString().split('T')[0],
            salary: null
        };

        try {
            setSaving(true);
            const { data, error } = await supabase
                .from('applications')
                .insert([newApp])
                .select()
                .single();

            if (error) throw error;

            setApplications([...applications, data]);
        } catch (error) {
            console.error('Error adding application:', error);
        } finally {
            setSaving(false);
        }
    };

    const updateApplication = async (id, field, value) => {
        // Update local state immediately for responsiveness
        setApplications(applications.map(app =>
            app.id === id ? { ...app, [field]: value } : app
        ));

        // Debounce the database update
        clearTimeout(window.updateTimeout);
        window.updateTimeout = setTimeout(async () => {
            try {
                const { error } = await supabase
                    .from('applications')
                    .update({ [field]: value || null })
                    .eq('id', id);

                if (error) throw error;
            } catch (error) {
                console.error('Error updating application:', error);
                // Reload applications to ensure consistency
                loadApplications();
            }
        }, 500);
    };

    const deleteApplication = async (id) => {
        try {
            const { error } = await supabase
                .from('applications')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setApplications(applications.filter(app => app.id !== id));
        } catch (error) {
            console.error('Error deleting application:', error);
        }
    };

    // Chart data preparation
    const statusData = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.entries(statusData).map(([status, count]) => ({
        name: status,
        value: count
    }));

    const timelineData = applications.reduce((acc, app) => {
        const month = new Date(app.date_applied).toLocaleDateString('default', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {});

    const lineData = Object.entries(timelineData).map(([month, count]) => ({
        month,
        applications: count
    }));

    const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Job Application Tracker</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">{user?.email}</span>
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex justify-between items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowChart(false)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${!showChart
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Table className="w-4 h-4" />
                            Spreadsheet
                        </button>
                        <button
                            onClick={() => setShowChart(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showChart
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            Analytics
                        </button>
                    </div>

                    {!showChart && (
                        <button
                            onClick={addApplication}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            disabled={saving}
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <PlusCircle className="w-4 h-4" />
                            )}
                            Add Application
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : !showChart ? (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {applications.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                No applications yet. Click "Add Application" to get started!
                                            </td>
                                        </tr>
                                    ) : (
                                        applications.map((app) => (
                                            <tr key={app.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="text"
                                                        value={app.company || ''}
                                                        onChange={(e) => updateApplication(app.id, 'company', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Company name"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="text"
                                                        value={app.position || ''}
                                                        onChange={(e) => updateApplication(app.id, 'position', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Position"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={app.status || 'Applied'}
                                                        onChange={(e) => updateApplication(app.id, 'status', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="Applied">Applied</option>
                                                        <option value="Interview">Interview</option>
                                                        <option value="Offer">Offer</option>
                                                        <option value="Rejected">Rejected</option>
                                                        <option value="Withdrawn">Withdrawn</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="date"
                                                        value={app.date_applied || ''}
                                                        onChange={(e) => updateApplication(app.id, 'date_applied', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={app.salary || ''}
                                                        onChange={(e) => updateApplication(app.id, 'salary', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Salary"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => deleteApplication(app.id)}
                                                        className="text-red-600 hover:text-red-900 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {applications.length === 0 ? (
                            <div className="bg-white p-12 rounded-lg shadow text-center">
                                <p className="text-gray-500">No data to display. Add some applications first!</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-lg shadow">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Building2 className="w-5 h-5 text-blue-600" />
                                            Application Status Distribution
                                        </h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="bg-white p-6 rounded-lg shadow">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-green-600" />
                                            Applications Over Time
                                        </h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={lineData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="applications"
                                                    stroke="#3b82f6"
                                                    strokeWidth={2}
                                                    dot={{ fill: '#3b82f6' }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-purple-600" />
                                        Summary Statistics
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
                                            <div className="text-sm text-gray-600">Total Applications</div>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                {applications.filter(app => app.status === 'Interview').length}
                                            </div>
                                            <div className="text-sm text-gray-600">Interviews</div>
                                        </div>
                                        <div className="bg-yellow-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-yellow-600">
                                                {applications.filter(app => app.status === 'Offer').length}
                                            </div>
                                            <div className="text-sm text-gray-600">Offers</div>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {applications.filter(app => app.status === 'Applied').length}
                                            </div>
                                            <div className="text-sm text-gray-600">Pending</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobAppsMain; 