import React, { useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';

const Auth = ({ onSignIn, onSignUp, loading, authError }) => {
    const [authMode, setAuthMode] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (authMode === 'signin') {
            onSignIn(email, password);
        } else {
            onSignUp(email, password, confirmPassword);
        }
    };

    const switchMode = () => {
        setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Job Tracker</h1>
                    <p className="text-gray-600 mt-2">Track your job applications efficiently</p>
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setAuthMode('signin')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${authMode === 'signin'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setAuthMode('signup')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${authMode === 'signup'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                {authError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {authError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="your@email.com"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                                disabled={loading}
                                required
                            />
                        </div>

                        {authMode === 'signup' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="••••••••"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            authMode === 'signin' ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    {authMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={switchMode}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        {authMode === 'signin' ? 'Sign up' : 'Sign in'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth; 