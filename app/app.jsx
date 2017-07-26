import io from 'socket.io-client'
let socket = io('http://localhost:8080')
// let socket = io('http://arcane-taiga-43097.herokuapp.com');
import React from "react";
import ReactDOM from "react-dom";
import Peer from 'peerjs';
const peer = new Peer({key: '74pu89sk3ce4s4i'});
// const peer = new Peer({key: 'peerjs', host: 'arcane-taiga-43097.herokuapp.com', secure: true, port: 443});

class Stream extends React.Component{
	constructor(props){
		super(props);
	}
	componentDidMount(){

	}
	render(){
		return(
			<div className="sotrym">
				<video id="remoteStream" width="520" controls></video>
				<video id="localStream" width="220" controls></video>
			</div>
		);
	}
}

class ChildComponent extends React.Component{
	constructor(props) {
		    super(props);
		    this.peerconnect = this.peerconnect.bind(this);
		    this.openStream = this.openStream.bind(this);
		    this.playStream = this.playStream.bind(this);
		    this.privatemess = this.privatemess.bind(this);
		}
	componentDidMount(){
		socket.on("send_peer", (data)=>{
			ReactDOM.render(
			<div>
				<Stream/>
			</div>
			, document.getElementById("root"));
		});
		peer.on('call', call=>{
			this.openStream().then(stream=>{
				call.answer(stream);
				this.playStream('localStream', stream);
				call.on('stream', remoteStream=> this.playStream('remoteStream', remoteStream));
			});
		});
	}
	openStream(){
		const config = {audio: false, video: true};
		return navigator.mediaDevices.getUserMedia(config);
	};
	playStream(idVideoTag, stream){
		const video = document.getElementById(idVideoTag); 
		video.srcObject = stream;
		video.play();
	};
	peerconnect(){
		socket.emit("want_to_video_call", this.props.peer);
		ReactDOM.render(
		<div>
			<Stream/>
		</div>
		, document.getElementById("root"));
		this.openStream().then(stream=>{
			this.playStream('localStream',stream);
			const call = peer.call(this.props.peer, stream);
			call.on('stream', remoteStream=> this.playStream('remoteStream',remoteStream));
		});
	}
	privatemess(){
		socket.emit("private-chat", this.props.peer);
		console.log("click-success");
	}
	render(){
		return(
			<div onClick={this.privatemess} onDoubleClick={this.peerconnect} className='namelist '>{this.props.children}</div>
		);
	}
}

class MessengeContent extends React.Component{
	constructor(props){
		super(props);
		this.state={name: ""};
	}
	componentDidMount(){
		socket.on("chat-name",(data)=>{
			this.setState({name: data});
		});

	}
	render(){
		if(this.props.style!=this.state.name){
			return(
				<div className='content' style={{color:"#000000", backgroundColor:"#e8e8e8"}}>{this.props.children}</div>
			);
		}else{
			return(
				<div className='content' style={{color:"#ffffff", backgroundColor:"#4286f4"}}>{this.props.children}</div>
			);
		}
	}
}
class Typing extends React.Component{
	constructor(props){
		super(props);
	}
	render(){
		return(
			<div className='typing'>{this.props.children}</div>
		)
	}
}
class Messenger extends React.Component {
		constructor(props) {
		    super(props);
		    this.state = {child: [], mess: [], sid: ""};
		    this.handleKeyPress = this.handleKeyPress.bind(this);
		}
		componentDidMount(){
			socket.on("Username", (data)=>{
				this.setState({child: data});		
			});
			socket.on("server-send-messange", (data)=>{
				this.setState({mess: data})
			});
			socket.on("typing", (data)=>{
				this.setState({typing: data});
			});
			socket.on("none", (data)=>{
				this.setState({typing: data});
			});
			socket.on("send-pri-chat", (data)=>{
				this.setState({sid: data});
			});
		}
		handleKeyPress(e){
			if (e.charCode == 13) {
				if(this.textarea.value !=""){
					// socket.emit("client-send-messange", this.textarea.value);
					socket.emit("private-messange", {pid: this.state.sid,tn:this.textarea.value});
					this.textarea.value="";
					e.preventDefault();
				}
				e.preventDefault();
		    }
	    }
	    onFocus(){
	    	socket.emit("onfocus", "Someone is typing...");
	    }
	    outOfFocus(){
	    	socket.emit("outoffocus", "");
	    }
		render(){
			const messenge = this.state.mess.map((messes,i)=>{
				return <MessengeContent key={i} style={messes.un}>{messes.un} : {messes.nd}</MessengeContent>
					}
				);
			const namelist = this.state.child.map(name=>{
				return <ChildComponent peer={name.peerid} key={name.uname}>{name.uname}</ChildComponent>;
								}							
							);
			return(
				<div className="mess">
					<div className="user-online">
						<div className="user-online-top">
							<div className='online'><strong>Người đang online</strong></div>
						</div>
						<div className="user-online-bot">
							{namelist}
						</div>
					</div>
					<div className="chat">
						<div className="chat-screen">
							{messenge}
							<Typing>{this.state.typing}</Typing>
						</div>
						<div className="chat-field">
							<textarea onKeyPress={this.handleKeyPress} onFocus={this.onFocus} onBlur={this.outOfFocus} ref={(textarea) => this.textarea = textarea}></textarea>
						</div>
					</div>
				</div>
			);
		}
	};

class Register extends React.Component{
	constructor(props) {
	    super(props);
	    this.handleKeyPress = this.handleKeyPress.bind(this);
	    this.state = {peerID: ""};
	}
	componentDidMount(){
		this.input.focus();
		peer.on('open', (id)=>{
			this.setState({peerID: id});
		});
	}
	handleKeyPress(e){
		if (e.charCode == 13) {
			if(this.input.value !=""){
				socket.emit("client-send-name", {peerid: this.state.peerID,uname: this.input.value});
				socket.on("fails", (err)=>{
					alert(err);
				});
				socket.on("true", (tr)=>{
					alert(tr);
					ReactDOM.render(
					<div>
						<Messenger/>
					</div>
					, document.getElementById("root"));
				});
			}
	    }
    }
	render(){
		return(
			<div className='regis'>
				<label className='dk'>What's your name?</label>
				<hr/>
				<input className='dk' type="text" onKeyPress={this.handleKeyPress} ref={(input) => this.input = input}/>
			</div>
		);
	}
};


ReactDOM.render(
	<div>
		<Register/>
	</div>
	, document.getElementById("root"));

