import React, { useEffect, useState } from 'react';

import { Panel, Div,
	Avatar, Title,
	Button, Separator,
	List, Cell,
	ButtonGroup,PanelHeader,
	PanelHeaderButton,ScreenSpinner,
	Alert } from '@vkontakte/vkui';

import './Multiplayer.css';
import { Icon20Sync, Icon20QrCodeOutline, Icon24Cancel,Icon20DoorArrowRightOutline, Icon16Spinner, Icon24Play } from '@vkontakte/icons';

import bridge from '@vkontakte/vk-bridge';

import { connectRoom, createRoom, joinRoom, leaveRoom, startGame } from '../../sockets/game';
import { client } from '../../sockets/receiver';
import axios from 'axios';
import { useUserId } from '../../hooks/useUserId';
import { qsSign } from '../../hooks/qs-sign'; 

const Multiplayer = ({ 
	id,
	go,
	fetchedUser, 
	setActiveModal, 
	setGameInfo, gameInfo, 
	playersId,
	joinCode, setJoinCode,
	firstStart, setFirstStart,
	playersList,
	setActivePanel, activePanel,
	setAnswersInfo,
	setTaskInfo,
	connectType,setConnectType,
	setPopout,
	haveHash,
	themeColors,
	setPanelsHistory,
	panelsHistory,
	itAgain,
	notAdd
	
 }) => {

	const userId = useUserId()
	const [complexity, setComplexity] = useState("easy")


	const [notUserRoom, setNotUserRoom] = useState(false)


	var clickTime = 0


	client.gameStarted = ({ answers, task, id }) => {
		setTaskInfo(task)
		setAnswersInfo(answers)
		async function lol(){
			setGameInfo({ ...gameInfo, taskId: id})
		}
		lol()
		setNotUserRoom(false)
		setActivePanel('multiplayerGame')
	};

	client.roomCreated = ({ roomId }) => {
		joinRoom(roomId, userId)
		setJoinCode(roomId)
		setNotUserRoom(false)
	};

	

	function joinToYourRoom(i){
		
			
		axios.post(`https://showtime.app-dich.com/api/plus-plus/room${qsSign}`)
		.then(async function (response) {
			await setJoinCode(response.data.data)
			
			await setGameInfo({ ...gameInfo, roomId: response.data.data})
			if(firstStart){
				await connectRoom(qsSign, response.data.data, userId);
			}else{
				await joinRoom(response.data.data, userId);
				setNotUserRoom(false)

			}
			
			setFirstStart(false)
			
		})
		.catch(function (error) {
		});

		

		


	}


	useEffect(() => {
		if(notAdd === false){
			window.history.pushState({activePanel: 'mp'}, 'mp');  
		}

		
		if(haveHash){
			axios.post(`https://showtime.app-dich.com/api/plus-plus/room${qsSign}`)
			.then(async function (response) {
				await setJoinCode(response.data.data)
				
				await setGameInfo({ ...gameInfo, roomId: response.data.data})
					if(window.location.hash.slice(1) === response.data.data){
						setPopout(
							<Alert
							  actions={[
								{
								  title: "??????????",
								  mode: "destructive",
								  autoclose: true,
								  action: () => {
									setConnectType('host')
									joinToYourRoom()
									leaveRoom(fetchedUser.id)
								  },
								},
							  ]}
							  actionsLayout="vertical"
							  onClose={()=>{
								setPopout(null)
							  }}
							  header="????????????????"
							  text="???? ???? ???????????? ???????????????????????? ?? ???????????? ?????????? ?????? ??????????"
							/>
						  );
					}else{
						setJoinCode(window.location.hash.slice(1))
						connectRoom(qsSign, window.location.hash.slice(1), userId);
						setNotUserRoom(true)
					}
				
				setFirstStart(false)
				
			})
			.catch(function (error) {
		});
			

		}else if(itAgain){
			
			setGameInfo({ ...gameInfo, roomId: joinCode})
		}
		else{
			joinToYourRoom()
		}
		

	}, []); 

	client.gameStarted = ({ answers, task, id }) => {
		setTaskInfo(task)
		setAnswersInfo(answers)
		async function lol(){
			await setGameInfo({taskId: id, roomId: joinCode})
		}
		lol()
		setActivePanel('multiplayerGame')
	};





	useEffect(()=>{
		if(connectType === 'join' &&playersList.length===1 && notUserRoom){
			setPopout(
				<Alert
				  actions={[
					{
					  title: "??????????",
					  mode: "destructive",
					  autoclose: true,
					  action: () => {
						setConnectType('host')
						joinToYourRoom()
						leaveRoom(fetchedUser.id)
					  },
					},
				  ]}
				  actionsLayout="vertical"
				  onClose={()=>{
					setPopout(null)
				  }}
				  header="????????????????"
				  text="?????????? ???? ???????????????????? ?????? ???????? ??????????????"
				/>
			  );
		}
	}, [playersList])
	


	return (
		<Panel id={id}>

		

			{connectType === 'join' &&
			<PanelHeader
			style={{backgroundColor: 'transparent' }}
				before={
					<PanelHeaderButton onClick={()=>{
						setConnectType('host')
						joinToYourRoom()
						leaveRoom(fetchedUser.id)
					}} >
					<Icon20DoorArrowRightOutline fill='#1A84FF' style={{marginLeft:25}}/>
					</PanelHeaderButton>
				}
				transparent={true}
				shadow={false}
				separator={false}
				>
			</PanelHeader>
			}


			{connectType === 'host' &&
			<PanelHeader
			style={{backgroundColor: 'transparent' }}
				transparent={true}
				shadow={false}
				separator={false} 
				>
			</PanelHeader>
			}

	
			<Div className='multiplayer-div' >

				
			
				<div style={{ paddingLeft: 'auto', paddingRight: 'auto' }}>
					<Title
						className='multiplayer-title'
						style={{ textAlign: 'center' }}>
							{connectType === 'host'?'???????????????????? ???????????? ?? ??????????':'?????????? ??????????'}
					</Title>

					
					<div style={{ height: 30 }} className='multiplayer-title-div'>


						<Title
							className='multiplayer-title-code'
							style={{
								display: 'inline-block',
								paddingLeft: 5
							}}
							onMouseDown={()=>{
								clickTime = Date.now()
							}}
							onMouseUp={()=>{
								if(Date.now() - clickTime >499){
									navigator.clipboard.writeText(joinCode)
									.then(() => { alert(`Copied!`) })
									.catch((error) => {  })
								}
							}} >
								{joinCode}
						</Title>

						{connectType === 'host' &&<Icon20Sync className='multiplayer-title-return'
							fill='#1A84FF'
							onClick={async function(){
								await setPopout(<ScreenSpinner size='large' />)
								await createRoom(joinCode)
								
								
							}}
							style={{
								display: 'inline-block',
								paddingLeft: 5,
								verticalAlign: 'middle'
						}} />
}
						

					</div>
					<div className='multiplayer-qr-button-div'>
						<Button
							className='multiplayer-qr-button'
							style={{backgroundColor:themeColors==='dark'?'#293950':'#F4F9FF',
							color:'#1984FF'}}
							onClick={()=>{
								setActiveModal('inputCodeQR')
							}}
							before={<Icon20QrCodeOutline />}
							mode='secondary'>???????????????????? QR</Button>
					</div>

					{connectType === 'host' && <div>
					<div className='multiplayer-separator-div'>
						<div className='separator-left'>
							<Separator />
						</div>

						<div style={{ marginTop: -8 }}>
							<Title className='title-or'>??????</Title>
						</div>

						<div className='separator-right'>
							<Separator />
						</div>
					</div>

					<div className='multiplayer-qr-button-div'>
						<Button
							className='multiplayer-code-button'
							style={{backgroundColor:themeColors==='dark'?'#293950':'#F4F9FF',
							color:'#1984FF'}}
							onClick={()=>{
								setActiveModal('inputCode')
							}} 
							mode='secondary'>???????????????????????????? ???? ????????</Button>
					</div>
						</div>}

				</div>

				


				<List style={{ marginTop: 16, marginBottom: 16 }}>
					{fetchedUser && [0,1,2,3].map((item, index) => (
						<Cell
							key={index} 
							before={playersList[index]?<Avatar src={playersList[index].avatar} />:<div style={{borderColor:themeColors === 'light'?'#E3E3E6':'#38383B'}} className='noneUser' />  }
							disabled={index === 0 ? true : false || playersList[index]?false:true}
						>
							{playersList[index]? <Title level="3" weight="2" className='player-name-on'>{playersList[index].name}</Title> : <Title level="3" weight="3" className='player-name-off'>??????????</Title>}
						</Cell>
					))}
				</List>

				<div className='multiplayer-play-group'>

					{connectType === 'host' &&<Div>
						<ButtonGroup stretched className='multiplayer-complexity-div' align='center' mode="horizontal" gap="space">
							<Button
								size="s"
								appearance="accent"
								mode="tertiary"
								gap='m'
								stretched
								style={{color:complexity === 'easy' ?'#1984FF':'#99A2AD'}}
								className={complexity === 'easy' ? themeColors === 'light'? 'complexity-button-on-light':'complexity-button-on-dark' : 'complexity-button-off'}
								onClick={() => {
									setComplexity("easy")
								}}
							>
								??????????
							</Button>
							<Button
								size="s"
								appearance="accent"
								mode="tertiary"
								gap='m'
								stretched
								style={{color:complexity === 'mid' ?'#1984FF':'#99A2AD'}}
								className={complexity === 'mid' ? themeColors === 'light'? 'complexity-button-on-light':'complexity-button-on-dark' : 'complexity-button-off'}
								onClick={() => {
									setComplexity("mid")
								}}
							>
								????????????
							</Button>
							<Button
								appearance="accent"
								mode="tertiary"
								gap='m'
								stretched
								style={{color:complexity === 'hard' ?'#1984FF':'#99A2AD'}}
								className={complexity === 'hard' ? themeColors === 'light'? 'complexity-button-on-light':'complexity-button-on-dark' : 'complexity-button-off'}
								onClick={() => {
									setComplexity("hard")
								}}
							>????????????
							</Button>
						</ButtonGroup>
					</Div>}
					<ButtonGroup gap="space" style={{ marginTop: 10 }} className='multiplayer-play-div'>
						<Button size="l" 
						className='multiplayer-play-button' appearance="accent"
						disabled={connectType==='host'?false:true} 
						style={{background:'#1A84FF', color: '#fff'}}
						before={connectType==='host'?<Icon24Play />:<div  className='loaderIcon'>
							<Icon16Spinner/>
						</div>}
						stretched
						onClick={()=>{
							startGame(joinCode, complexity, playersId)

						}}>{connectType==='host'?'????????????':'????????????????'}</Button>
					</ButtonGroup>
				</div>




			</Div>


		</Panel>
	)

	
}



export default Multiplayer;
