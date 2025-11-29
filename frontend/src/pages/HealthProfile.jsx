import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Heart, Activity, Users, FileText, Save, ArrowRight } from 'lucide-react';

const HealthProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        demographics: {
            age: '',
            gender: '',
            location: '',
            bloodGroup: ''
        },
        lifestyle: {
            smoking: '',
            alcohol: '',
            diet: '',
            activityLevel: ''
        },
        hereditary: {
            familyHistory: [],
            notes: ''
        },
        medicalHistory: {
            conditions: [],
            medications: [],
            allergies: []
        }
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('https://aarogya-ai-personal.onrender.com/profile/me', config);
            if (data) {
                setProfile(data);
            }
        } catch (error) {
            console.log("No existing profile, starting fresh");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put('https://aarogya-ai-personal.onrender.com/patient/profile', profile, config);
            alert('Profile updated successfully!');
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const addArrayItem = (section, field, value) => {
        if (value.trim()) {
            setProfile(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: [...prev[section][field], value.trim()]
                }
            }));
        }
    };

    const removeArrayItem = (section, field, index) => {
        setProfile(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: prev[section][field].filter((_, i) => i !== index)
            }
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Health Profile</h1>
                    <p className="text-gray-600">Help us understand your health better for accurate analysis</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Demographics */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-lg p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Demographics</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                                <input
                                    type="number"
                                    value={profile.demographics.age}
                                    onChange={(e) => setProfile(prev => ({
                                        ...prev,
                                        demographics: { ...prev.demographics, age: e.target.value }
                                    }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                <select
                                    value={profile.demographics.gender}
                                    onChange={(e) => setProfile(prev => ({
                                        ...prev,
                                        demographics: { ...prev.demographics, gender: e.target.value }
                                    }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <input
                                    type="text"
                                    value={profile.demographics.location}
                                    onChange={(e) => setProfile(prev => ({
                                        ...prev,
                                        demographics: { ...prev.demographics, location: e.target.value }
                                    }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                                <select
                                    value={profile.demographics.bloodGroup}
                                    onChange={(e) => setProfile(prev => ({
                                        ...prev,
                                        demographics: { ...prev.demographics, bloodGroup: e.target.value }
                                    }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select...</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Lifestyle */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-lg p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Activity className="h-6 w-6 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Lifestyle</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Smoking Status</label>
                                <select
                                    value={profile.lifestyle.smoking}
                                    onChange={(e) => setProfile(prev => ({
                                        ...prev,
                                        lifestyle: { ...prev.lifestyle, smoking: e.target.value }
                                    }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select...</option>
                                    <option value="Never">Never</option>
                                    <option value="Occasional">Occasional</option>
                                    <option value="Regular">Regular</option>
                                    <option value="Heavy">Heavy</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alcohol Consumption</label>
                                <select
                                    value={profile.lifestyle.alcohol}
                                    onChange={(e) => setProfile(prev => ({
                                        ...prev,
                                        lifestyle: { ...prev.lifestyle, alcohol: e.target.value }
                                    }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select...</option>
                                    <option value="Never">Never</option>
                                    <option value="Occasional">Occasional</option>
                                    <option value="Regular">Regular</option>
                                    <option value="Heavy">Heavy</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Diet</label>
                                <select
                                    value={profile.lifestyle.diet}
                                    onChange={(e) => setProfile(prev => ({
                                        ...prev,
                                        lifestyle: { ...prev.lifestyle, diet: e.target.value }
                                    }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select...</option>
                                    <option value="Vegetarian">Vegetarian</option>
                                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                                    <option value="Vegan">Vegan</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Physical Activity</label>
                                <select
                                    value={profile.lifestyle.activityLevel}
                                    onChange={(e) => setProfile(prev => ({
                                        ...prev,
                                        lifestyle: { ...prev.lifestyle, activityLevel: e.target.value }
                                    }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select...</option>
                                    <option value="Sedentary">Sedentary</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Active">Active</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Hereditary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-lg p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Family History</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Family Medical History</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        id="familyHistoryInput"
                                        placeholder="e.g., Breast Cancer, Diabetes"
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addArrayItem('hereditary', 'familyHistory', e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const input = document.getElementById('familyHistoryInput');
                                            addArrayItem('hereditary', 'familyHistory', input.value);
                                            input.value = '';
                                        }}
                                        className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.hereditary.familyHistory.map((item, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                        >
                                            {item}
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('hereditary', 'familyHistory', index)}
                                                className="hover:text-purple-900"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                                <textarea
                                    value={profile.hereditary.notes}
                                    onChange={(e) => setProfile(prev => ({
                                        ...prev,
                                        hereditary: { ...prev.hereditary, notes: e.target.value }
                                    }))}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Any additional family medical history details..."
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Questionnaire Data (Read-Only) */}
                    {profile.questionnaireData && profile.questionnaireData.lastUpdated && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="bg-white rounded-2xl shadow-lg p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-teal-100 rounded-lg">
                                    <FileText className="h-6 w-6 text-teal-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Latest Questionnaire</h2>
                                    <p className="text-sm text-gray-500">
                                        Last updated: {new Date(profile.questionnaireData.lastUpdated).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Smoker</p>
                                    <p className="font-semibold text-gray-900">
                                        {profile.questionnaireData.isSmoker ? 'Yes' : 'No'}
                                    </p>
                                    {profile.questionnaireData.smokingDuration && (
                                        <p className="text-sm text-gray-600 mt-1">{profile.questionnaireData.smokingDuration}</p>
                                    )}
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Coughing Blood</p>
                                    <p className="font-semibold text-gray-900">
                                        {profile.questionnaireData.coughingBlood ? 'Yes' : 'No'}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Family History of Cancer</p>
                                    <p className="font-semibold text-gray-900">
                                        {profile.questionnaireData.familyHistory ? 'Yes' : 'No'}
                                    </p>
                                </div>
                                {profile.questionnaireData.otherSymptoms && (
                                    <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                                        <p className="text-sm text-gray-600 mb-1">Other Symptoms</p>
                                        <p className="font-semibold text-gray-900">{profile.questionnaireData.otherSymptoms}</p>
                                    </div>
                                )}
                                {profile.questionnaireData.additionalNotes && (
                                    <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                                        <p className="text-sm text-gray-600 mb-1">Additional Notes</p>
                                        <p className="font-semibold text-gray-900">{profile.questionnaireData.additionalNotes}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-end gap-4"
                    >
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <Save className="h-5 w-5" />
                                    Save Profile
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </motion.div>
                </form>
            </div>
        </div>
    );
};

export default HealthProfile;
