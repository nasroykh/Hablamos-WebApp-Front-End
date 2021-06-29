import classes from './App.module.scss';
import React, {useEffect, useState} from 'react';
import socketIOClient from "socket.io-client";
import {Switch, Route, Redirect, useHistory} from 'react-router-dom'
import { isMobile } from "react-device-detect";
import {useSelector, useDispatch} from 'react-redux';
// import LoadingPage from './containers/LoadingPage/LoadingPage';
import LandingPage from './containers/LandingPage/LandingPage';
import SignUpPage from './containers/SignUpPage/SignUpPage';
import SignInPage from './containers/SignInPage/SignInPage';
import MainPage from './containers/MainPage/MainPage';
import ChatPage from './containers/ChatPage/ChatPage';
import {checkAuth, logout} from './store/auth/auth-actions';
import {userActions} from './store/user/user-slice';
import DialogBox from './components/DialogBox/DialogBox';
import LoadingSpinner from './elements/LoadingSpinner/LoadingSpinner';
import BackDrop from './elements/BackDrop/BackDrop';
import axios from 'axios';

const ENDPOINT = axios.defaults.baseURL; 
export const socket = socketIOClient(ENDPOINT);

const App = () => {

	let isAuth = useSelector(state => state.auth.isAuth);
	let token = useSelector(state => state.auth.token);
	let isLoading = useSelector(state => state.user.isLoading);
	
	const dispatch = useDispatch();

	const history = useHistory();

	// const [pageLoaded, setPageLoaded] = useState(false);
	const [sdShow, setSdShow] = useState(false);
	const [bdShow, setBdShow] = useState(false);
	const [tabMenuShow, setTabMenuShow] = useState(false);
	const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('isDarkMode')==='false' ? false : true);
	
	useEffect(() => {
        socket.on('message:receive', (payload) => {
			if (payload.file) {
				dispatch(userActions.receiveFile({
					_id: payload.lastMessageId,
					sender: payload.sender,
					time: payload.time,
					file: true
				}));
				if (localStorage.getItem('userId') !== payload.sender) {
					socket.emit('message:seen', {
						_id: payload.lastMessageId,
						userId: localStorage.getItem('userId'),
						username: localStorage.getItem('username')
					})
				}

			} else {
				dispatch(userActions.receiveMessage({
					message: payload.message,
					sender: payload.sender,
					time: payload.time
				}));
				if (localStorage.getItem('userId') !== payload.sender) {
					socket.emit('message:seen', {
						_id: payload.lastMessageId,
						userId: localStorage.getItem('userId'),
						username: localStorage.getItem('username')
					})
				}
			}
        });

        socket.on('message:isseen', (payload) => {
			if (localStorage.getItem('userId') !== payload._id) {
				dispatch(userActions.messageSeen({_id: payload._id, username: payload.username}));
			}
		});

    }, [dispatch]);

	useEffect(() => {
		if (!isMobile) {
			window.location.href = 'https://hablamos.me';
		} 

		// window.addEventListener('load', pageLoadHandler);

		dispatch(checkAuth(localStorage.getItem('token')));

		socket.on("connection", () => {
			console.log('Connected to socket!');
		});
		
	}, [dispatch])

	// const pageLoadHandler = () => {
	// 	setPageLoaded(true);
	// }

    const sdToggleHandler = () => {
        setBdShow(!bdShow);
        setSdShow(!sdShow);
    }

	const bdClickHandler = () => {
		setSdShow(false);
		setBdShow(false);
		setTabMenuShow(false);
	}

	const tabMenuToggleHandler = () => {
		setBdShow(!bdShow);
		setTabMenuShow(!tabMenuShow)
	}

	const logoutHandler = (e) => {
        e.preventDefault();

        dispatch(logout(token));

        sdToggleHandler();

        history.push('/');
    }

	const switchDarkLightMode = () => {
		if (localStorage.getItem('isDarkMode') === 'false') {
			localStorage.setItem('isDarkMode', 'true');
			setIsDarkMode(true);
		} else {
			localStorage.setItem('isDarkMode', 'false');
			setIsDarkMode(false);
		}
	}

 	return (
		 <div className={classes.App}>
			<DialogBox/>
			{isLoading ? <LoadingSpinner/> : null}
			{isLoading ? <BackDrop loading/> : null}
			<Switch>

				<Route path='/chat'>
					{isAuth ? 
						<ChatPage
							sdShow={sdShow}
							bdShow={bdShow}
							sdToggleHandler={sdToggleHandler}
							logoutHandler={logoutHandler}
							isDarkMode={isDarkMode}/> : <Redirect to='/'/>}
				</Route>

				<Route path='/main'>
					{isAuth ? 
					<MainPage
						sdShow={sdShow}
						bdShow={bdShow}
						sdToggleHandler={sdToggleHandler}
						tabMenuToggleHandler={tabMenuToggleHandler}
						tabMenuShow={tabMenuShow}
						bdClickHandler={bdClickHandler}
						logoutHandler={logoutHandler}
						switchDarkLightMode={switchDarkLightMode}
						isDarkMode={isDarkMode}/> : <Redirect to='/'/>}
				</Route>

				<Route path='/signin'>
					{isAuth ? <Redirect to='/main/convs'/> : <SignInPage/>}
				</Route>

				<Route path='/signup'>
					<SignUpPage/>
					{/* {isAuth ? <Redirect to='/signup/picture'/> : <SignUpPage/>} */}
				</Route>

				<Route path='/'>
					{isAuth ? <Redirect to='/main/convs'/> : <LandingPage/>}
					{/* {pageLoaded ? (isAuth ? <Redirect to='/main/convs'/> : <LandingPage/>) : (<LoadingPage/>) } */}
				</Route>

			</Switch>
		</div>
  	);
}

export default App;
