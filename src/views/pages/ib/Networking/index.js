import React, { useEffect, useState } from 'react'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import { Form, Radio, Button, Row, Col, Tooltip, Tag, Progress, Avatar, Menu, Card, Modal, Input, Select } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, PlusOutlined } from '@ant-design/icons';
import ProjectListData from './ProjectListData';
import {
	PaperClipOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	EyeOutlined,
	EditOutlined,
	DeleteOutlined
} from '@ant-design/icons';
import utils from 'utils';
import { COLORS } from 'constants/ChartConstant';
import Flex from 'components/shared-components/Flex';
import EllipsisDropdown from 'components/shared-components/EllipsisDropdown'
import { supabase } from 'configs/SupabaseConfig';
import PostList from './PostList';
import { useNavigate } from 'react-router-dom';
import ChatList from './ChatList';
import DynamicViews from '../../DynamicViews/index2';
import Interests from './Interests';
import CategorySelector from './Chat';
// import CategorySelector from './Interests';
// import CategorySelector from './Add';

const VIEW_LIST = 'LIST';
const VIEW_GRID = 'GRID';
const { Option } = Select;

const ItemAction = ({ id, removeId }) => (
	<EllipsisDropdown
		menu={
			<Menu>
				<Menu.Item key="0">
					<EyeOutlined />
					<span className="ml-2">View</span>
				</Menu.Item>
				<Menu.Item key="1">
					<EditOutlined />
					<span className="ml-2">Edit</span>
				</Menu.Item>
				<Menu.Divider />
				<Menu.Item key="2" onClick={() => removeId(id)}>
					<DeleteOutlined />
					<span className="ml-2">Delete Project</span>
				</Menu.Item>
			</Menu>
		}
	/>
)

const ItemHeader = ({ name, category }) => (
	<div>
		<h4 className="mb-0">{name}</h4>
		<span className="text-muted">{category}</span>
	</div>
)

const ItemInfo = ({ attachmentCount, completedTask, totalTask, statusColor, dayleft }) => (
	<Flex alignItems="center">
		<div className="mr-3">
			<Tooltip title="Attachment">
				<PaperClipOutlined className="text-muted font-size-md" />
				<span className="ml-1 text-muted">{attachmentCount}</span>
			</Tooltip>
		</div>
		<div className="mr-3">
			<Tooltip title="Task Completed">
				<CheckCircleOutlined className="text-muted font-size-md" />
				<span className="ml-1 text-muted">{completedTask}/{totalTask}</span>
			</Tooltip>
		</div>
		<div>
			<Tag color={statusColor !== "none" ? statusColor : ''}>
				<ClockCircleOutlined />
				<span className="ml-2 font-weight-semibold">{dayleft} days left</span>
			</Tag>
		</div>
	</Flex>
)

const ItemProgress = ({ progression }) => (
	<Progress percent={progression} strokeColor={getProgressStatusColor(progression)} size="small" />
)

const ItemMember = ({ member }) => (
	<>
		{member?.map((elm, i) => (
			i <= 2 ?
				<Tooltip title={elm?.name} key={`avatar-${i}`}>
					<Avatar size="small" className={`ml-1 cursor-pointer ant-avatar-${elm?.avatarColor}`} src={elm?.img} >
						{elm?.img ? '' : <span className="font-weight-semibold font-size-sm">{utils.getNameInitial(elm?.name)}</span>}
					</Avatar>
				</Tooltip>
				:
				null
		))}
		{member?.length > 3 ?
			<Tooltip title={`${member?.length - 3} More`}>
				<Avatar size={25} className="ml-1 cursor-pointer bg-white border font-size-sm">
					<span className="text-gray-light font-weight-semibold">+{member?.length - 3}</span>
				</Avatar>
			</Tooltip>
			:
			null
		}
	</>
)



const ListItem = ({ data, removeId }) => (
	<Card>
		<Row align="middle">
			<Col xs={24} sm={24} md={8}>
				<ItemHeader name={data?.title} category={data?.details?.description} />
			</Col>
			<Col xs={24} sm={24} md={6}>
				<ItemInfo
					attachmentCount={data?.attachmentCount}
					completedTask={data?.completedTask}
					totalTask={data?.totalTask}
					statusColor={data?.statusColor}
					dayleft={data?.dayleft}
				/>
			</Col>
			<Col xs={24} sm={24} md={5}>
				<ItemProgress progression={data?.progression} />
			</Col>
			<Col xs={24} sm={24} md={3}>
				<div className="ml-0 ml-md-3">
					<ItemMember member={data?.member} />
				</div>
			</Col>
			<Col xs={24} sm={24} md={2}>
				<div className="text-right">
					<ItemAction id={data?.id} removeId={removeId} />
				</div>
			</Col>
		</Row>
	</Card>
)

const GridItem = ({ data, removeId }) => (
	<Card>
		<Flex alignItems="center" justifyContent="space-between">
			<ItemHeader name={data?.name} category={data?.category} />
			<ItemAction id={data?.id} removeId={removeId} />
		</Flex>
		<div className="mt-2">
			<ItemInfo
				attachmentCount={data?.attachmentCount}
				completedTask={data?.completedTask}
				totalTask={data?.totalTask}
				statusColor={data?.statusColor}
				dayleft={data?.dayleft}
			/>
		</div>
		<div className="mt-3">
			<ItemProgress progression={data?.progression} />
		</div>
		<div className="mt-2">
			<ItemMember member={data?.member} />
		</div>
	</Card>
)

const getProgressStatusColor = progress => {
	if (progress >= 80) {
		return COLORS[1]
	}
	if (progress < 60 && progress > 30) {
		return COLORS[3]
	}
	if (progress < 30) {
		return COLORS[2]
	}
	return COLORS[0]
}

const Networking = () => {

	const [view, setView] = useState(VIEW_LIST);
	const [chats, setChats] = useState();
	const [modal, setModal] = useState(false);
	const [form] = Form.useForm();
	const [enums, setEnums] = useState([]);
	const [type, setType] = useState('imlookingfor');
	const [sectorOptions, setSectorOptions] = useState([]);

	const [modalVisible, setModalVisible] = useState(false);
	const [editChatId, setEditChatId] = useState(null);
	const [callFetch, setCallFetch] = useState(null);

	const openModal = (item) => {
		if (item) {
			console.log(item)
			// form.setFieldsValue({
			//     title: item.title,
			//     description: item.description,
			//     type: item.type
			// });
		}
		setEditChatId(item?.id || null);
		setModalVisible(true);
	};

	const openModalForEdit = (id) => {
		setEditChatId(id);
		setModalVisible(true);
	};

	const navigate = useNavigate();
	const handleChatClick = (chatId) => {
		navigate(`/app/networking/${chatId}`);
	};

	useEffect(() => {
		const getEnums = async () => {
			let { data, error } = await supabase.from('enums').select('*');
			console.log("Enums", data?.find(item => item?.name === type))
			if (data) {
				setEnums(data?.find(item => item?.name === type)?.options);
			}
		};
		getEnums();
	}, [type]);
	useEffect(() => {
		const getChats = async () => {
			let { data, error } = await supabase.from('ib_posts').select('*');
			console.log("Chats", data)
			if (data) {
				setChats(data);
			}
		};
		getChats();
	}, []);

	const deleteItem = id => {
		const data = chats?.filter(elm => elm.id !== id)
		setChats(data)
	}

	const handleTypeChange = (value) => {
		if (value === 'icanoffer') {
			const offerOptions = enums.filter(item => item.name === 'icanoffer');
			setSectorOptions(offerOptions);
		} else {
			setSectorOptions([]);
		}
		form.resetFields(['sector']); // Reset sector field when type changes
	};

	const showModal = () => {
		setModal(true);
	};

	const handleCancel = () => {
		setModal(false);
	};

	const handleSubmit = async (values) => {
		console.log('Form values:', values);

		try {
			const { data, error } = await supabase
				.from('ib_posts')
				.insert([
					{
						name: values.title, // Insert the title into the `name` column
						users: [], // Default empty array for the `users` column
						details: { description: values.description, type: values.type }, // JSON data for the `details` column
					},
				]);

			if (error) {
				console.error('Error inserting data:', error);
				Modal.error({
					title: 'Submission Failed',
					content: error.message,
				});
			} else {
				console.log('Data inserted successfully:', data);
				Modal.success({
					title: 'Submission Successful',
					content: 'Your post has been created successfully.',
				});
			}
		} catch (error) {
			console.error('Unexpected error:', error);
			Modal.error({
				title: 'Unexpected Error',
				content: 'Something went wrong. Please try again later.',
			});
		}

		setModal(false); // Close the modal after submission
	};


	return (
		<>
			<Interests />
			{modalVisible && <CategorySelector
				visible={modalVisible}
				onClose={() => { setModalVisible(false); setEditChatId(); callFetch() }}
				chatId={editChatId}
			/>}
			<Modal
				title="Create New Post"
				open={modal}
				onCancel={handleCancel}
				footer={null}
			>
				<Form form={form} layout="vertical" onFinish={handleSubmit}>
					<Form.Item
						name="type"
						label="Type"
						rules={[{ required: true, message: 'Please select a type' }]}
					>
						<Select onChange={(e) => setType(e)} value={type} defaultValue={"imlookingfor"}>
							<Option value="imlookingfor">I'm Looking For</Option>
							<Option value="icanoffer">I Can Offer</Option>
						</Select>
					</Form.Item>

					<Form.Item
						name="title"
						label="Title"
						rules={[{ required: true, message: 'Please input a title' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						name="description"
						label="Description"
						rules={[{ required: true, message: 'Please input a description' }]}
					>
						<Input.TextArea rows={4} />
					</Form.Item>

					<Form.Item>
						<Button type="primary" htmlType="submit">
							Submit
						</Button>
					</Form.Item>
				</Form>
			</Modal>
			{/* <PageHeaderAlt className="border-bottom">
				<div className="container-fluid">
					<Flex justifyContent="space-between" alignItems="center" className="py-4">
						<h2>Posts</h2>
						<div>
							<Radio.Group defaultValue={VIEW_LIST} onChange={e => onChangeProjectView(e)}>
								<Radio.Button value={VIEW_GRID}><AppstoreOutlined /></Radio.Button>
								<Radio.Button value={VIEW_LIST}><UnorderedListOutlined /></Radio.Button>
							</Radio.Group>
							<Button type="primary" className="ml-2" onClick={() => setModal(true)}>
								<PlusOutlined />
								<span>New</span>
							</Button>
						</div>
					</Flex>
				</div>
			</PageHeaderAlt> */}
			<div className={`my-4 ${view === VIEW_LIST ? 'container' : 'container-fluid'}`}>
				{/* {
					view === VIEW_LIST ?
						chats?.map(elm =>
						(
							<div
								key={elm.id}
								onClick={() => handleChatClick(elm.id)} // Navigate on click
								style={{ cursor: 'pointer' }}
							>
								<ListItem data={elm} removeId={id => deleteItem(id)} key={elm.id} />
							</div>
						)

						)
						:
						<Row gutter={16}>
							{chats?.map(elm => (
								<Col xs={24} sm={24} lg={8} xl={8} xxl={6} key={elm.id}>
									<GridItem data={elm} removeId={id => deleteItem(id)} />
								</Col>
							))}
						</Row>
				} */}
				<DynamicViews entityType={'ib_posts'} addEditFunction={openModal} setCallFetch={setCallFetch} />
				{/* <ChatList addEditFunction={openModal} /> */}
			</div>
		</>
	)
}

export default Networking
