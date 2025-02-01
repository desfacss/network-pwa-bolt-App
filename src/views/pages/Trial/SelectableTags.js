import React, { useState } from 'react';
import { Tag } from 'antd'; // Import Ant Design components
import { CheckOutlined } from '@ant-design/icons';
export const SelectableTags = ({ maxItems = 3 }) => {
    const options = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5']
    const [selectedTags, setSelectedTags] = useState([]);

    const handleTagClick = (tag) => {
        const isSelected = selectedTags.includes(tag);

        if (isSelected) {
            setSelectedTags(selectedTags.filter((t) => t !== tag));
        } else if (selectedTags.length < maxItems) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    return (
        <div>
            <label>Select Max {maxItems}</label><br /> {/* Label for the tag group */}
            <div>
                {options.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                        <Tag
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            style={{ margin: '5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}  // Styling for better appearance
                            className={isSelected ? 'selected-tag' : ''} // Conditional class for styling
                        >
                            {<CheckOutlined style={{ marginRight: '2px', color: 'green', visibility: 'hidden' }} />} {/* Green checkmark */}
                            {tag}
                            {<CheckOutlined style={{ marginLeft: '2px', color: 'green', visibility: !isSelected && 'hidden' }} />} {/* Green checkmark */}
                        </Tag>
                    );
                })}
            </div>

            <style jsx>{`
          .selected-tag {
            border-color: #1890ff; /* Example: Change border color on selection */
            background-color: #e6f7ff; /* Example: Change background color on selection */
          }
        `}</style> {/* Example of using styled-jsx for local styling */}
        </div>
    );
};