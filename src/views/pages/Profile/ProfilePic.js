import React, { useState, useEffect } from 'react';
import { Upload, message, Spin, Image } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import Publitio from 'publitio_js_sdk';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';

// Configuration JSON (you can store this in a separate file if you prefer)
const uploadConfig = {
    maxFileSize: 5, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'], // Example image types
    maxFileNameLength: 100, // Example
};

const publitio = new Publitio('xr7tJHfDaqk5ov18TkJX', 'aApiZqz6Di1eacmemfof14xwN63lyJHG');

const ProfilePic = () => {
    const { session } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [profilePic, setProfilePic] = useState(session?.user?.details?.profile_pic);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        if (profilePic) {
            setFileList([{
                uid: '-1',
                name: 'profile.jpg',
                status: 'done',
                url: profilePic,
            }]);
        } else {
            setFileList([]);
        }
    }, [profilePic]);

    const beforeUpload = (file) => {
        const isLtMaxSize = file.size / 1024 / 1024 < uploadConfig.maxFileSize;
        if (!isLtMaxSize) {
            message.error(`File must be smaller than ${uploadConfig.maxFileSize}MB!`);
        }

        const isImageType = uploadConfig.allowedTypes.includes(file.type);
        if (!isImageType) {
            message.error(`You can only upload ${uploadConfig.allowedTypes.join(', ')} files!`);
        }

        if (file.name.length > uploadConfig.maxFileNameLength) {
            message.error(`File name is too long. Maximum length is ${uploadConfig.maxFileNameLength} characters.`);
        }

        return isLtMaxSize && isImageType && file.name.length <= uploadConfig.maxFileNameLength; // Return false to prevent upload if conditions not met
    };


    const handleUpload = async (file) => {
        setLoading(true);
        try {
            const response = await publitio.uploadFile(file);
            const publicUrl = response?.url_preview;

            const { error: supabaseError } = await supabase
                .from('users')
                .update({ details: { ...session?.user?.details, profile_pic: publicUrl } })
                .eq('id', session?.user?.id);

            if (supabaseError) {
                console.error("Supabase update error:", supabaseError);
                message.error(`Supabase update failed: ${supabaseError.message}`);
            } else {
                setProfilePic(publicUrl);
                message.success('Profile picture updated successfully!');
            }
        } catch (error) {
            console.error("Publitio upload error:", error);
            message.error('File upload to Publitio failed.');
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
    };

    const getBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        if (newFileList.length > 0 && newFileList[0].originFileObj) {
            handleUpload(newFileList[0].originFileObj);
        } else if (newFileList.length === 0) {
            handleDelete();
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const { error: supabaseError } = await supabase
                .from('users')
                .update({ details: { ...session?.user?.details, profile_pic: null } })
                .eq('id', session?.user?.id);

            if (supabaseError) {
                console.error("Supabase delete error:", supabaseError);
                message.error('Failed to delete profile picture.');
            } else {
                setProfilePic(null);
                message.success('Profile picture deleted successfully!');
            }
        } catch (error) {
            console.error("Error deleting profile picture:", error);
            message.error('Failed to delete profile picture.');
        } finally {
            setLoading(false);
        }
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>{session?.user?.user_name?.split(' ')[0]}</div>
        </div>
    );

    return (
        <div>
            <Spin spinning={loading}>
                <Upload
                    listType="picture-circle"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    beforeUpload={beforeUpload} // Add beforeUpload prop
                >
                    {fileList.length >= 1 ? null : uploadButton}
                </Upload>
                <Image
                    style={{ display: 'none' }}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                />
            </Spin>
        </div>
    );
};

export default ProfilePic;