// FilesTab.js
import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const FilesTab = () => {
    const props = {
        name: 'file',
        action: 'https://www.mocky.io/v2/5e1c349d2f0000590099c222', // Mock upload URL
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    return (
        <Upload.Dragger {...props}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined />
            </p>
            <p className="ant-upload-text">Drag & drop a file to this area, or <span>Click</span> to browse</p>
            <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                confidential files
            </p>
        </Upload.Dragger>
    );
};

export default FilesTab;