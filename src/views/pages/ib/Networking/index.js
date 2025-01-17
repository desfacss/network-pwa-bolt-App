import React, { useState } from 'react'
import DynamicViews from '../../DynamicViews/index2';
import Interests from './Interests';
import CategorySelector from './CategorySelector';

const Networking = () => {

	const [modalVisible, setModalVisible] = useState(false);
	const [editChatId, setEditChatId] = useState(null);
	const [callFetch, setCallFetch] = useState(null);

	const openModal = (item) => {
		if (item) {
			console.log(item)
		}
		setEditChatId(item?.id || null);
		setModalVisible(true);
	};

	return (
		<>
			<Interests />
			<DynamicViews entityType={'ib_posts'} addEditFunction={openModal} setCallFetch={setCallFetch} />
			{modalVisible && <CategorySelector visible={modalVisible} chatId={editChatId}
				onClose={() => { setModalVisible(false); setEditChatId(); callFetch() }}
			/>}
		</>
	)
}

export default Networking
