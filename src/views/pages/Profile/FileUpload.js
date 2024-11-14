import React, { useState, useEffect } from 'react';
import { Upload, Button, List, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import PublitioAPI from 'publitio_js_sdk';
// import Publitio from 'publitio_js_sdk/dist/publitio.js';
import Publitio from 'publitio_js_sdk';

// const publitio = new PublitioAPI('xr7tJHfDaqk5ov18TkJX', 'aApiZqz6Di1eacmemfof14xwN63lyJHG');
const publitio = new Publitio('xr7tJHfDaqk5ov18TkJX', 'aApiZqz6Di1eacmemfof14xwN63lyJHG');

const FileUpload = () => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);

    // Fetch existing files from Publitio
    useEffect(() => {
        fetchFiles();
    }, []);

    // Function to fetch uploaded files from Publitio using a REST API request
    const fetchFiles = async () => {

        // publitio.files.list({ page: 1, limit: 10 }) // Get the first 10 files
        //     .then(response => {
        //         console.log("RD", response);
        //     })
        //     .catch(error => {
        //         console.error('Error fetching files:', error);
        //     });

        const fileId = 'H4uyqg5n'; // Replace with your actual file ID
        publitio?.files?.retrieve(fileId)
            ?.then(response => {
                console.log(response);
            })
            .catch(error => {
                console.error('Error fetching file details:', error);
            });


        setLoadingFiles(true);
        try {
            const response = await fetch('https://api.publit.io/v1/files', {
                headers: {
                    Authorization: `Bearer xr7tJHfDaqk5ov18TkJX`
                }
            });
            const data = await response.json();
            if (data && data.files) {
                setFiles(data.files); // Set the list of files in the state
            } else {
                message.error('No files found');
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            message.error('Failed to load files');
        } finally {
            setLoadingFiles(false);
        }
    };

    // Handle file upload
    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await publitio.uploadFile(file);
            message.success('File uploaded successfully');
            fetchFiles(); // Refresh the file list
        } catch (error) {
            message.error('File upload failed');
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    // Ant Design Upload Props
    const uploadProps = {
        beforeUpload: (file) => {
            handleUpload(file);
            return false; // Prevent the default upload action
        },
        fileList: [],
    };

    return (
        <div>
            <h2>Upload File to Publitio</h2>

            {/* Ant Design Upload Button */}
            <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />} loading={uploading}>
                    {uploading ? 'Uploading' : 'Click to Upload'}
                </Button>
            </Upload>

            {/* Show list of uploaded files */}
            <h3>Uploaded Files</h3>
            <Spin spinning={uploading}>
                {/* <List
                    bordered
                    dataSource={files}
                    renderItem={(file) => (
                        <List.Item>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                                {file.filename}
                            </a>
                        </List.Item>
                    )}
                /> */}
            </Spin>
        </div>
    );
};

export default FileUpload;


// import React, { useState } from 'react';
// import PublitioAPI from 'publitio_js_sdk';

// // xr7tJHfDaqk5ov18TkJX
// // aApiZqz6Di1eacmemfof14xwN63lyJHG

// const publitio = new PublitioAPI('xr7tJHfDaqk5ov18TkJX', 'aApiZqz6Di1eacmemfof14xwN63lyJHG');

// const FileUpload = () => {
//     const [file, setFile] = useState(null);
//     const [uploadStatus, setUploadStatus] = useState('');

//     const handleFileChange = (event) => {
//         setFile(event.target.files[0]);
//     };

//     const handleUpload = () => {
//         if (!file) {
//             alert('Please select a file first');
//             return;
//         }

//         setUploadStatus('Uploading...');

//         publitio.uploadFile(file, 'file')
//             .then((response) => {
//                 setUploadStatus('Upload Successful!');
//                 console.log('File uploaded:', response);
//             })
//             .catch((error) => {
//                 setUploadStatus('Upload Failed');
//                 console.error('Upload error:', error);
//             });
//     };

//     return (
//         <div>
//             <input type="file" onChange={handleFileChange} />
//             <button onClick={handleUpload}>Upload to Publitio</button>
//             {uploadStatus && <p>{uploadStatus}</p>}
//         </div>
//     );
// };

// export default FileUpload;
