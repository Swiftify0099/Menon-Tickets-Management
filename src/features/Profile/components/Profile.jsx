import React from "react";
import { useProfile } from "../hooks/UseProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Building, MapPin, User, Mail, Phone, Home, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { t } = useTranslation();
  const {
    formData,
    selectedFile,
    isLoading,
    isError,
    updatePhotoMutation,
    handleFileChange,
    handlePhotoUpload,
  } = useProfile();



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-red-500 text-lg">{t('common.error')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-3 px-4">
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-1 text-orange-600 hover:text-orange-700 transition-colors"
          >
            <Home size={16} />
            <span>{t('common.home')}</span>
          </Link>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="text-gray-800 font-medium">{t('profile.my_profile')}</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{t('profile.my_profile')}</h1>
          <p className="text-gray-600 mt-2">{t('profile.view_account_info')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Avatar Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-center">
                <div className="relative inline-block">
                  <img
                    src={
                      selectedFile
                        ? URL.createObjectURL(selectedFile)
                        : formData.avatar || "/default-avatar.png"
                    }
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                  />
                  {updatePhotoMutation.isPending && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white mt-4">
                  {formData.first_name} {formData.last_name}
                </h2>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-black mt-2">
                  <User size={14} className="mr-1" />
                  {formData.role?.role_name || t('profile.user')}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full text-center block">
                  {t('profile.change_photo')}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                <button
                  onClick={handlePhotoUpload}
                  disabled={updatePhotoMutation.isPending || !selectedFile}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors w-full"
                >
                  {updatePhotoMutation.isPending ? t('profile.uploading') : t('profile.upload_photo')}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">{t('profile.profile_information')}</h2>
                <p className="text-orange-100 text-sm mt-1">{t('profile.personal_details')}</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                  
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">
                        {t('profile.first_name')}
                      </label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800">
                        {formData.first_name}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">
                        {t('profile.last_name')}
                      </label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800">
                        {formData.last_name}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">
                        {t('profile.email')}
                      </label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 flex items-center">
                        <Mail size={16} className="mr-2 text-orange-500" />
                        {formData.email}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">
                        {t('profile.phone')}
                      </label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 flex items-center">
                        <Phone size={16} className="mr-2 text-orange-500" />
                        {formData.phone || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                 
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">
                        {t('profile.role')}
                      </label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 flex items-center">
                        <User size={16} className="mr-2 text-orange-500" />
                        {formData.role?.role_name || t('profile.user')}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">
                        {t('profile.department')}
                      </label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 flex items-center">
                        <Building size={16} className="mr-2 text-orange-500" />
                        {formData.department?.department_name || "—"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">
                        {t('profile.division')}
                      </label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 flex items-center">
                        <MapPin size={16} className="mr-2 text-orange-500" />
                        {formData.division?.division_name || "—"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">
                        {t('profile.user_id')}
                      </label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800">
                        {formData.id}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;