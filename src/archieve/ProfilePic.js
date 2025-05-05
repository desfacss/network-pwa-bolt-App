import React, { useState, useEffect } from 'react';
import { Upload, message, Spin, Image, Modal } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import Publitio from 'publitio_js_sdk';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Configuration JSON
const uploadConfig = {
    maxFileSize: 5, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFileNameLength: 100,
};

const publitio = new Publitio('xr7tJHfDaqk5ov18TkJX', 'aApiZqz6Di1eacmemfof14xwN63lyJHG');

const ProfilePic = ({ imageUrl }) => {
    const { session } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [profilePic, setProfilePic] = useState(imageUrl || session?.user?.details?.profile_pic);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState([]);
    const [cropModalVisible, setCropModalVisible] = useState(false);
    const [crop, setCrop] = useState({ unit: '%', width: 50, aspect: 1 / 1 });
    const [imageSrc, setImageSrc] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [imageRef, setImageRef] = useState(null);

    useEffect(() => {
        if (profilePic) {
            setFileList([
                {
                    uid: '-1',
                    name: 'profile.jpg',
                    status: 'done',
                    url: profilePic,
                },
            ]);
        } else {
            setFileList([]);
        }
    }, [profilePic]);

    const beforeUpload = (file) => {
        const isLtMaxSize = file.size / 1024 / 1024 < uploadConfig.maxFileSize;
        if (!isLtMaxSize) {
            message.error(`File must be smaller than ${uploadConfig.maxFileSize}MB!`);
            return false;
        }

        const isImageType = uploadConfig.allowedTypes.includes(file.type);
        if (!isImageType) {
            message.error(`You can only upload ${uploadConfig.allowedTypes.join(', ')} files!`);
            return false;
        }

        if (file.name.length > uploadConfig.maxFileNameLength) {
            message.error(`File name is too long. Maximum length is ${uploadConfig.maxFileNameLength} characters.`);
            return false;
        }

        // Open crop modal instead of uploading directly
        getBase64(file).then((base64) => {
            setImageSrc(base64);
            setCropModalVisible(true);
        });
        return false; // Prevent default upload
    };

    // Function to get base64 of file
    const getBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    // Function to compress and resize image
    const compressAndResizeImage = (file, maxWidth = 200) => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = (e) => {
                img.src = e.target.result;
            };

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate new dimensions while maintaining aspect ratio
                const aspectRatio = img.height / img.width;
                const newWidth = maxWidth;
                const newHeight = maxWidth * aspectRatio;

                canvas.width = newWidth;
                canvas.height = newHeight;

                // Draw and compress image
                ctx.drawImage(img, 0, 0, newWidth, newHeight);

                // Convert to blob with compression (quality: 0.7)
                canvas.toBlob(
                    (blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    file.type,
                    0.7 // Compression quality (0 to 1)
                );
            };

            img.onerror = (error) => reject(error);
            reader.onerror = (error) => reject(error);
        });
    };

    // Function to get cropped image
    const getCroppedImage = () => {
        if (!imageRef || !crop.width || !crop.height) {
            message.error('Please select a crop area.');
            return;
        }

        const canvas = document.createElement('canvas');
        const scaleX = imageRef.naturalWidth / imageRef.width;
        const scaleY = imageRef.naturalHeight / imageRef.height;
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            imageRef,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                const croppedFile = new File([blob], 'cropped_profile.jpg', {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                resolve(croppedFile);
            }, 'image/jpeg', 0.7);
        });
    };

    const handleCropConfirm = async () => {
        try {
            const croppedFile = await getCroppedImage();
            setCroppedImage(croppedFile);
            setCropModalVisible(false);
            handleUpload(croppedFile); // Proceed with upload
        } catch (error) {
            console.error('Error cropping image:', error);
            message.error('Failed to crop image.');
        }
    };

    const handleUpload = async (file) => {
        setLoading(true);
        try {
            // Compress and resize the image before uploading
            const compressedFile = await compressAndResizeImage(file, 200);
            const response = await publitio.uploadFile(compressedFile);
            const publicUrl = response?.url_preview;

            const { error: supabaseError } = await supabase
                .from('users')
                .update({ details: { ...session?.user?.details, profile_pic: publicUrl } })
                .eq('id', session?.user?.id);

            if (supabaseError) {
                console.error('Supabase update error:', supabaseError);
                message.error(`Supabase update failed: ${supabaseError.message}`);
            } else {
                setProfilePic(publicUrl);
                message.success('Profile picture updated successfully!');
            }
        } catch (error) {
            console.error('Error during upload:', error);
            message.error('File upload failed.');
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

    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        if (newFileList.length === 0) {
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
                console.error('Supabase delete error:', supabaseError);
                message.error('Failed to delete profile picture.');
            } else {
                setProfilePic(null);
                message.success('Profile picture deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting profile picture:', error);
            message.error('Failed to delete profile picture.');
        } finally {
            setLoading(false);
        }
    };

    const uploadButton = (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
                loading="lazy"
                src="/img/ibcn/profile.png"
                alt="Upload profile"
                style={{
                    width: '100%',
                    height: '100%',
                    publicationFit: 'cover',
                    opacity: 0.5,
                    borderRadius: '50%',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '30%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'blue',
                    fontSize: '24px',
                }}
            >
                <PlusOutlined />
            </div>
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
                    beforeUpload={beforeUpload}
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
            <Modal
                title="Crop Image"
                visible={cropModalVisible}
                onOk={handleCropConfirm}
                onCancel={() => setCropModalVisible(false)}
                okText="Confirm"
                cancelText="Cancel"
            >
                {imageSrc && (
                    <ReactCrop
                        crop={crop}
                        onChange={(newCrop) => setCrop(newCrop)}
                        aspect={1 / 1}
                        ruleOfThirds
                    >
                        <img
                            src={imageSrc}
                            alt="Crop"
                            onLoad={(e) => setImageRef(e.currentTarget)}
                            style={{ maxWidth: '100%' }}
                        />
                    </ReactCrop>
                )}
            </Modal>
        </div>
    );
};

export default ProfilePic;