import React, { useEffect, useState } from 'react'
import DynamicViews from '../../DynamicViews/index2';
import Interests from './Interests';
import CategorySelector from './CategorySelector';
import { Card, Switch, Tabs } from 'antd';
import { supabase } from 'api/supabaseClient';
import { useSelector } from 'react-redux';

const Networking = () => {

	const [modalVisible, setModalVisible] = useState(false);
	const [editChatId, setEditChatId] = useState(null);
	const [callFetch, setCallFetch] = useState(null);
	const [showMyInterests, setShowMyInterests] = useState(false); // Default: "My Interests"
	const [memberData, setMemberData] = useState(null);
	const [filters, setFilters] = useState({ lookingFor: [], offering: [] });

	const { session } = useSelector((state) => state.auth);

	// Handle Toggle Change
	const onToggleChange = (checked) => {
		setShowMyInterests(checked);
		// onToggle(checked); // Notify parent component about toggle state
	};

	useEffect(() => {
		// Fetch member data when component mounts or when user id changes
		const fetchMemberData = async () => {
			try {
				const { data, error } = await supabase
					.from('ib_members')
					.select('*')
					.eq('user_id', session?.user?.id); // Assuming session.user.id is available globally or passed down as prop

				if (error) throw error;
				if (data && data.length > 0) {
					setMemberData(data[0]);
				}
			} catch (error) {
				console.error('Error fetching member data:', error.message);
			}
		};
		fetchMemberData();
	}, [session?.user?.id]);

	useEffect(() => {
		if (memberData && memberData.networking) {
			const lookingFor = showMyInterests ?
				[{
					column: "details_tags",
					value: memberData.networking['1d231aaf-bd55-4502-b4a1-102d5948bbb2'] || []
				}] : [];

			const offering = showMyInterests ?
				[{
					column: "details_tags",
					value: memberData.networking['cbc79eb6-20a1-42d3-8876-5a3ecf4909da'] || []
				}] : [];

			setFilters({ lookingFor, offering });
		}
	}, [memberData, showMyInterests]);

	const openModal = (item) => {
		if (item) {
			console.log(item)
		}
		setEditChatId(item?.id || null);
		setModalVisible(true);
	};

	const filters1 = [{ column: 'details.category_id', value: "1d231aaf-bd55-4502-b4a1-102d5948bbb2" }]
	const filters2 = [{ column: 'details.category_id', value: "cbc79eb6-20a1-42d3-8876-5a3ecf4909da" }]

	return (
		<>
			{/* <YStateComponent /> */}
			{modalVisible && <CategorySelector visible={modalVisible} chatId={editChatId}
				onClose={() => { setModalVisible(false); setEditChatId(); callFetch() }}
			/>}
			{/* <DynamicViews entityType={'ib_posts'} addEditFunction={openModal} setCallFetch={setCallFetch} /> */}
			<Tabs defaultActiveKey="looking" //onChange={onTabChange}
				tabBarExtraContent={
					<>
						{/* <Switch className={'mr-2'}
							checked={showMyInterests}
							onChange={onToggleChange}
							checkedChildren="My Interests"
							unCheckedChildren="All Posts"
						/> */}
						<Interests />
					</>
				}
			>
				<Tabs.TabPane tab="I am looking for" key="looking">
					<DynamicViews entityType={'ib_posts'} addEditFunction={openModal} setCallFetch={setCallFetch} fetchFilters={filters1} uiFilters={filters?.lookingFor} />
				</Tabs.TabPane>
				<Tabs.TabPane tab="I can offer" key="offering">
					<DynamicViews entityType={'ib_posts'} addEditFunction={openModal} setCallFetch={setCallFetch} fetchFilters={filters2} uiFilters={filters?.offering} />
				</Tabs.TabPane>
			</Tabs>
		</>
	)
}

export default Networking
