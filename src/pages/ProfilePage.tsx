import { useState } from 'react';
import { CreditCard as Edit2, Plus, X, ThumbsUp, Briefcase, GraduationCap, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  if (!profile || !editedProfile) return null;

  const handleSave = async () => {
    await updateProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const newSkillObj = {
        id: Math.random().toString(36).substr(2, 9),
        skillName: newSkill.trim(),
        endorsements: 0,
      };
      setEditedProfile({
        ...editedProfile,
        skills: [...editedProfile.skills, newSkillObj],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillId: string) => {
    setEditedProfile({
      ...editedProfile,
      skills: editedProfile.skills.filter((s) => s.id !== skillId),
    });
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setEditedProfile({
        ...editedProfile,
        interests: [...editedProfile.interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setEditedProfile({
      ...editedProfile,
      interests: editedProfile.interests.filter((i) => i !== interest),
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
            <div className="flex items-end space-x-4">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </div>
              )}
            </div>

            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="mt-4 sm:mt-0 flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Edit2 size={18} />
              <span>{isEditing ? 'Save Profile' : 'Edit Profile'}</span>
            </button>
          </div>

          <div className="mb-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editedProfile.firstName}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, firstName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editedProfile.lastName}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, lastName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-lg text-gray-600">{profile.department}</p>
              </>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="flex items-center space-x-3 text-gray-600">
              {profile.currentEmployer ? (
                <>
                  <Briefcase size={20} />
                  <span>{profile.currentEmployer}</span>
                </>
              ) : (
                profile.graduationYear && (
                  <>
                    <GraduationCap size={20} />
                    <span>Class of {profile.graduationYear}</span>
                  </>
                )
              )}
            </div>

            <div className="flex items-center space-x-3 text-gray-600">
              <Globe size={20} />
              <select
                value={editedProfile.profileVisibility}
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    profileVisibility: e.target.value as any,
                  })
                }
                disabled={!isEditing}
                className={`${
                  isEditing
                    ? 'px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                    : 'bg-transparent'
                }`}
              >
                <option value="public">Public Profile</option>
                <option value="connections">Connections Only</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
            {isEditing ? (
              <textarea
                value={editedProfile.bio || ''}
                onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                placeholder="Tell others about yourself..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">
                {profile.bio || 'No bio added yet.'}
              </p>
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Skills</h2>
            </div>

            <div className="space-y-3">
              {editedProfile.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">{skill.skillName}</span>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <ThumbsUp size={16} />
                      <span className="text-sm">{skill.endorsements}</span>
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}

              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="Add a skill..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Interests</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {editedProfile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full flex items-center space-x-2"
                >
                  <span>{interest}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeInterest(interest)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  )}
                </span>
              ))}

              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    placeholder="Add an interest..."
                    className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addInterest}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
