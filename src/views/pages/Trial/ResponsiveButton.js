import { useState, useEffect } from 'react';
import { Button, FloatButton } from "antd";
import * as Icons from '@ant-design/icons';

export const ResponsiveButton = ({ groupButtons = [], ...props }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // If we're in mobile view and there are grouped buttons
    if (isMobile && groupButtons.length > 0) {
        return (
            <FloatButton.Group shape="circle" style={{ right: 24, bottom: 24 }}>
                {groupButtons.map((button, index) => {
                    const IconComponent = Icons[button.floatIcon || 'FileOutlined'];
                    return (
                        <FloatButton
                            key={index}
                            {...button}
                            icon={<IconComponent />}
                            tooltip={button.children || button.tooltip || 'Action'}
                            onClick={button.onClick}
                        />
                    );
                })}
            </FloatButton.Group>
        );
    }

    // For a single button or non-mobile view
    const IconComponent = Icons[props.floatIcon || 'FileOutlined'];
    if (isMobile) {
        return (
            <FloatButton.Group shape="circle" style={{ right: 24, bottom: 24 }}>

                <FloatButton
                    {...props}
                    icon={<IconComponent />}
                    tooltip={props.children || props.tooltip || 'Action'}
                />
            </FloatButton.Group>
        );
    }

    return <Button {...props} />;
}


// import { useState, useEffect } from 'react';
// import { Button, FloatButton } from "antd";
// import * as Icons from '@ant-design/icons';

// export const ResponsiveButton = ({ ...props }) => {
//     const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

//     useEffect(() => {
//         const handleResize = () => {
//             setIsMobile(window.innerWidth < 768);
//         };

//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     const IconComponent = Icons[props.floatIcon || 'FileOutlined'];
//     if (isMobile) {
//         return (
//             <FloatButton
//                 {...props}
//                 icon={<IconComponent />}
//                 tooltip={props.children || 'Action'}
//             />
//         );
//     }

//     return <Button {...props} />;
// }