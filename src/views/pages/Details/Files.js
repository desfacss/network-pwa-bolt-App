import React, { useState, useEffect } from 'react';
import { Upload, Button, Modal, Input, List, Space, message, Image } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import PublitioAPI from 'publitio_js_sdk';
import { supabase } from 'api/supabaseClient';

const FilesTab = ({ editItem, rawData }) => {
    // State for managing folders and files
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState({});
    const [visibleCreateFolder, setVisibleCreateFolder] = useState(false);
    const [folderName, setFolderName] = useState('');

    // Initialize Publitio API
    const publitio = new PublitioAPI('xr7tJHfDaqk5ov18TkJX', 'aApiZqz6Di1eacmemfof14xwN63lyJHG');

    useEffect(() => {
        // Find the project from rawData
        const project = rawData.find(item => item.id === editItem?.id);
        if (project && project.details) {
            setFolders(Object.keys(project.details.files || {}));
            setFiles(project.details.files || {});
        }
    }, [editItem?.id, rawData]);

    const handleCreateFolder = async () => {
        if (folderName) {
            const newFolders = [...folders, folderName];
            setFolders(newFolders);

            // Update Supabase with new folder
            await supabase
                .from('y_projects')
                .update({
                    details: {
                        ...(rawData.find(item => item.id === editItem?.id)?.details || {}),
                        files: {
                            ...(rawData.find(item => item.id === editItem?.id)?.details?.files || {}),
                            [folderName]: []
                        }
                    }
                })
                .eq('id', editItem?.id);
            setFolderName('');
            setVisibleCreateFolder(false);
        }
    };

    const handleFileUpload = async (info, folder) => {
        const { file, fileList } = info;
        if (file.status === 'done') {
            const newFile = {
                ...file.response,
                name: file.name,
                uploadedBy: 'Current User',
                uploadedAt: new Date(),
                version: '1.0',
                stage: 'Draft'
            };

            setFiles(prevFiles => ({
                ...prevFiles,
                [folder]: prevFiles[folder] ? [...prevFiles[folder], newFile] : [newFile]
            }));

            // Update Supabase with new file info
            const currentProject = rawData.find(item => item.id === editItem?.id);
            const updatedFiles = {
                ...(currentProject?.details?.files || {}),
                [folder]: files[folder] ? [...files[folder], newFile] : [newFile]
            };

            await supabase
                .from('y_projects')
                .update({
                    details: {
                        ...(currentProject?.details || {}),
                        files: updatedFiles
                    }
                })
                .eq('id', editItem?.id);
        } else if (file.status === 'error') {
            message.error(`${file.name} file upload failed.`);
        }
    };

    return (
        <div>
            <Button onClick={() => setVisibleCreateFolder(true)} icon={<PlusOutlined />}>Create Folder</Button>
            <Modal
                title="Create New Folder"
                visible={visibleCreateFolder}
                onOk={handleCreateFolder}
                onCancel={() => setVisibleCreateFolder(false)}
            >
                <Input value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="Folder Name" />
            </Modal>

            <List
                header={<div>Files</div>}
                bordered
                dataSource={folders}
                renderItem={folder => (
                    <List.Item>
                        <Space direction="vertical">
                            <h4>{folder}</h4>
                            <Upload
                                customRequest={async ({ file, onSuccess, onError }) => {
                                    try {
                                        const result = await publitio.uploadFile(file, 'file', { folder: folder });
                                        onSuccess(result);
                                    } catch (error) {
                                        console.error('Upload error:', error);
                                        onError(error);
                                    }
                                }}
                                onChange={(info) => handleFileUpload(info, folder)}
                                multiple
                            >
                                <Button icon={<PlusOutlined />}>Upload File</Button>
                            </Upload>
                            {files[folder] && files[folder].map(file => (
                                <div key={file.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    {file.type === 'image' ? (
                                        <Image
                                            width={100}
                                            src={file.url_preview}
                                            alt={file.name}
                                        />
                                    ) : (
                                        <span>{file.name}</span>
                                    )}
                                    <Space>
                                        <a href={file.url_download} download target="_blank" rel="noopener noreferrer">
                                            <Button icon={<DownloadOutlined />} size="small">Download</Button>
                                        </a>
                                        <span>
                                            - Uploaded by: {file.uploadedBy} - Version: {file.version} - Stage: {file.stage}
                                        </span>
                                    </Space>
                                </div>
                            ))}
                        </Space>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default FilesTab;