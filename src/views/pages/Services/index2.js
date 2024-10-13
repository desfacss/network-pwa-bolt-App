import { Button, Card, notification, Table, Tag } from "antd";
import AvatarStatus from "components/shared-components/AvatarStatus";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteFilled } from "@ant-design/icons";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   deleteBrokerAccount,
//   getBrokerAccounts,
// } from "store/slices/brokerAccountsSlice";
// import BrokerForm from "components/common/forms/BrokerForm";
// import ConfirmWindow from "components/common/custom/ConfirmWindow";
import { Link } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { supabase } from "configs/SupabaseConfig";
// import DownloadMenu from "components/common/DownloadMenu";

const Services = () => {
  const componentRef = useRef(null);
  const [services, setServices] = useState();
  const [editItem, setEditItem] = useState();
  // const [visible, setVisible] = useState(false);
  // const [deleteItem, setDeleteItem] = useState({});
  // const dispatch = useDispatch();
  // const { brokerAccounts, getBrokerAccountsLoading } = useSelector(
  //   (state) => state?.brokerAccounts
  // );
  // const { userData } = useSelector((state) => state?.profile);
  // useEffect(() => {
  //   dispatch(getBrokerAccounts());
  // }, []);

  // useEffect(() => {
  //   console.log("Broker Accounts", brokerAccounts);
  // }, [brokerAccounts]);

  // const onEdit = (item) => {
  //   setEditItem(item);
  //   setOpen(true);
  // };
  useEffect(() => {
    const getServices = async () => {
      let { data, error } = await supabase.from('services').select('*')
      if (data) {
        console.log("Services", data)
        setServices(data)
      }
    }
    getServices()
  }, [])

  const columns = [
    {
      title: 'Service Name',
      dataIndex: ['details', 'service_name'],
      key: 'service_name',
    },
    {
      title: 'Cost',
      dataIndex: ['details', 'cost'],
      key: 'cost',
    },
    {
      title: 'Duration',
      dataIndex: ['details', 'duration'],
      key: 'duration',
    },
    {
      title: 'Equipment',
      dataIndex: ['details', 'equipment'],
      key: 'equipment',
      render: (equipment) => equipment.join(', '), // Display as a comma-separated list
    },
    {
      title: 'Materials',
      dataIndex: ['details', 'materials'],
      key: 'materials',
      render: (materials) => materials.join(', '), // Display as a comma-separated list
    },
    {
      title: 'Description',
      dataIndex: ['details', 'description'],
      key: 'description',
    },
    {
      title: 'Availability',
      dataIndex: ['details', 'availability'],
      key: 'availability',
      render: (availability) => availability.join(', '), // Display as a comma-separated list
    },
    {
      title: 'Target Areas',
      dataIndex: ['details', 'target_areas'],
      key: 'target_areas',
      render: (targetAreas) => targetAreas.join(', '), // Display as a comma-separated list
    },
    {
      title: 'Special Offers',
      dataIndex: ['details', 'special_offers'],
      key: 'special_offers',
      render: (specialOffers) => specialOffers.discount, // Display the discount detail
    },
  ];

  // const updatedBrokerAccounts = brokerAccounts?.map(row => ({
  //   ...row,
  //   key: row.id, // I added this line for table row key missing warning fix
  // }))

  // const confirmHandler = () => {
  //   dispatch(deleteBrokerAccount(deleteItem))
  //     .then(() => {
  //       notification.success({
  //         message: `Account: ${deleteItem?.account_number}-${deleteItem?.broker_config?.broker} Deleted successfully`,
  //       });
  //       setOpen(false);
  //     })
  //     .catch((errorData) => {
  //       notification.error({
  //         message: errorData?.error?.message || "Failed to Delete",
  //       });
  //     });
  //   setDeleteItem({});
  //   setVisible(false);
  // };

  // const tableColumns = [
  //   {
  //     title: "Broker",
  //     render: (_, record) => (
  //       <div className="d-flex">
  //         <AvatarStatus
  //           src={record.img}
  //           text={record?.broker_name?.[0]}
  //           name={record.broker_name}
  //           subTitle={`${record.account_number}`}
  //         />
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "Description",
  //     render: (_, record) => (
  //       <div className="d-flex">
  //         <p>{record.description}</p>
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "Status",
  //     render: (_, record) => (
  //       <Tag style={{ fontSize: '14px', padding: '3px' }} bordered={false}
  //         className="text-capitalize"
  //         color={record.broker_login_status === true ? "cyan" : "red"}
  //       >
  //         {record.broker_login_status === true && "Logged In"}
  //       </Tag>
  //     ),
  //   },
  //   {
  //     title: "Capital",
  //     render: (_, record) => <p>{record.capital}</p>,
  //   },
  //   {
  //     title: "Portfolio",
  //     render: (_, record) => (
  //       <Link to={`${APP_PREFIX_PATH}/pages/portfolio-list`}>
  //         <Button>3</Button>
  //       </Link>
  //     ),
  //     className: 'no-print',
  //   },
  //   {
  //     title: (
  //       <div className="text-right d-flex justify-content-end">
  //         {userData?.feature?.editBroker && ((userData?.role_type === "client" && updatedBrokerAccounts?.length > 0) ? false : true) && <Button
  //           type="primary"
  //           ghost
  //           className="mr-2"
  //           icon={<PlusOutlined />}
  //           size="small"
  //           onClick={() => setOpen(true)}
  //         />}
  //       </div>
  //     ),
  //     render: (_, record) => (
  //       <div className="text-right d-flex justify-content-end">
  //         {userData?.feature?.editBroker && <Button
  //           type="primary"
  //           ghost
  //           className="mr-2"
  //           icon={<EditFilled />}
  //           size="small"
  //           onClick={() => onEdit(record)}
  //         />}
  //         {userData?.feature?.editBroker && <Button
  //           ghost
  //           className="mr-2"
  //           icon={<DeleteFilled />}
  //           size="small"
  //           danger
  //           onClick={() => {
  //             setDeleteItem(record);
  //             setVisible(true);
  //           }}
  //         />}
  //       </div>
  //     ),
  //     className: 'no-print',
  //   },
  // ];

  // const dataSourceForExport = brokerAccounts?.map((data) => {
  //   return {
  //     'Broker': data?.account_number || '',
  //     'Description': data?.description || '',
  //     'Capital': data?.capital || '',
  //   }
  // }) || []

  return (
    <Card bodyStyle={{ padding: "0px" }}>
      {/* {userData?.feature?.editBroker && <div className={`float-right py-2 pr-2`}>
        <DownloadMenu dataSource={dataSourceForExport} printRef={componentRef} csvFileName="broker-list.csv" />
      </div>} */}
      <div className="table-responsive" ref={componentRef}>
        <Table
          columns={columns}
          dataSource={services}
          loading={!services}
          pagination={false}
        />
      </div>
      {/* <ConfirmWindow
        visible={visible}
        setVisible={setVisible}
        message={`Do you want to delete: ${deleteItem?.account_number}-${deleteItem?.broker_config?.broker}`}
        confirmHandler={confirmHandler}
      /> */}
      {/* <BrokerForm
        open={open}
        setOpen={setOpen}
        setEditItem={setEditItem}
        editItem={editItem}
      /> */}
    </Card>
  );
};

export default Services;
