import React, { useEffect } from 'react'
import Card from 'components/shared-components/Card';
import { useDispatch, useSelector } from "react-redux";
import { getTvBots } from 'store/slices/tvBotsSlice';
import PnlChart from './PnlChart';
import { Button, Col, Row, Tag } from 'antd';

const BotsWidget = ({ setFile }) => {
	const dispatch = useDispatch();
	const { tvBots, getTvBotsLoading } = useSelector(
		(state) => state?.tvBots
	);

	useEffect(() => {
		dispatch(getTvBots())
	}, [])

	useEffect(() => {
		console.log("TV Bots", tvBots)
	}, [tvBots])

	return (
		<Row gutter={16}>
			{tvBots?.map((bot) =>
				<Col span={8}>
					<Card
					// loading={getTvBotsLoading}
					>
						<h4 >{bot.display_name}</h4 >
						<Row gutter={16} onClick={() => setFile(bot)}>
							<Col span={15}>
								<p>{bot.description}</p>
							</Col>
							<Col span={9}>
								{<h4 ><PnlChart file={bot.data_name} /></h4>}
							</Col>
						</Row>
						<Row >
							<Col span={17}>
								<Tag >
									<span className="font-weight-semibold">Min Margin:{bot.margin}</span>
								</Tag>
								<Tag>
									<span className="font-weight-semibold">Free-Trail</span>
								</Tag>
							</Col>
							<Col span={7}>
								{bot.display_name === 'Options Buying - HMA' ? <h4>Subscribed</h4> : <Button type='primary' disabled={true}>Subscribe</Button>}
							</Col>
						</Row>
					</Card>
				</Col>
			)}
		</Row>
	)
}


export default BotsWidget