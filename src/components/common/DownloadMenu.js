import React from 'react';
import { MoreOutlined, MenuOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Space } from 'antd';
// import { CSVLink } from "react-csv";
import { useReactToPrint } from 'react-to-print';


const DownloadMenu = ({ dataSource, printRef, csvFileName = 'export-to-csv.csv' }) => {

  const handlePrint = useReactToPrint({
    // content: () => printRef?.current,
    contentRef: printRef
  });

  const items = [
    // {
    //   key: '1',
    //   label: (
    //     // <CSVLink
    //     //   filename={csvFileName}
    //     //   data={dataSource || ''}
    //     //   className="px-2 py-2"
    //     // >
    //     //   Export to CSV
    //     // </CSVLink>
    //     <></>
    //   ),
    //   disabled: !(dataSource?.length > 0),
    // },
    {
      key: '2',
      label: (
        <a
          onClick={handlePrint}
          className="px-2 py-2">
          {" "}
          Export to PDF{" "}
        </a>
      ),
      // disabled: !(dataSource?.length > 0),
    },
  ];

  // if no data, we don't show dropdown menu
  // if (!(dataSource?.length > 0)) {
  //   return null
  // }

  return (
    <div className={`d-flex align-items-center justify-content-end pr-2`}>

      <Dropdown menu={{ items }}>
        <a onClick={(e) => e.preventDefault()}>
          <Space>
            <MenuOutlined />
          </Space>
        </a>
      </Dropdown>
    </div>
  )
};

export default DownloadMenu;


// const handleButtonClick = (e) => {
//   console.log('click left button', e);
// }

// const handleMenuClick = (e) => {
//   console.log('click', e);
// }

// const menu = () => (
//   <Menu onClick={handleMenuClick}>
//     <Menu.Item key="1">
//       <CSVLink
//         filename={"Expense_Table.csv"}
//         data={dataSource}
//         className="px-2 py-2"
//       >
//         Export to CSV
//       </CSVLink>
//     </Menu.Item>
//     <Menu.Item key="2">
//       <a onClick={handlePrint} className="px-2 py-2">
//         {" "}
//         Export to PDF{" "}
//       </a>
//     </Menu.Item>
//     <Menu.Item key="3" icon={<UserOutlined />}>
//       3rd menu item</Menu.Item>
//   </Menu>
// );

{/* <Dropdown.Button
          onClick={handleButtonClick}
          placement="bottomLeft"
          overlay={menu}
        >
          Export
        </Dropdown.Button> */}
