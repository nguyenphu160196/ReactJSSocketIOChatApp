const express = require("express");
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
const server = require("http").Server(app);
const io = require("socket.io")(server);
server.listen(8080);

const UserName = [];
const name = [];
const Mess = [];
const privateMess = [];
console.log("Server running...");
io.on("connection", (socket)=>{
	socket.on("client-send-name", (data)=>{
		socket.name = data.uname;
		socket.peerid = data.peerid;
		socket.join(socket.peerid);
		if(name.indexOf(data.uname)>=0){
			socket.emit("fails","Tên này đã có người đăng ký!!!");
		}else{
			name.push(data.uname);
			UserName.push(data);
			socket.emit("true","Đăng ký thành công!!!");
			socket.broadcast.emit("joined",socket.name+" joined");
			io.sockets.emit("Username",UserName);
			//io.to().emit('server-send-messange', privateMess);
		}
		console.log(socket.name+" is online");
	});
	socket.on("onfocus", (data)=>{
		socket.broadcast.emit("typing", data);
	});
	socket.on("outoffocus", (data)=>{
		socket.broadcast.emit("none", data);
	});
	// socket.on("client-send-messange", (data)=>{
	// 	const json = {un:socket.name,nd:data};
	// 	Mess.push(json);
	// 	io.sockets.emit("server-send-messange",Mess);
	// 	socket.emit("chat-name",socket.name);
	// });
	socket.on("want_to_video_call", (data)=>{
		io.sockets.emit("send_peer", data);
	});
	socket.on("private-chat", (data)=>{
		console.log("private-chat"+ data);
		socket.join(data);
		io.sockets.emit("send-pri-chat", data);
	});
	socket.on("private-messange", (data)=>{
		console.log("private-messange"+data);
		const jason = {un:socket.name,nd:data.tn};
		privateMess.push(jason);
		io.to(data.pid).emit('server-send-messange', privateMess);
		socket.emit("chat-name",socket.name);
	});
	socket.on("disconnect", ()=>{
		console.log(socket.name+" is offline");
		UserName.splice(name.indexOf(socket.name),1);
		name.splice(name.indexOf(socket.name),1);
		io.sockets.emit("Username",UserName);
		socket.broadcast.emit("none", "");
		socket.broadcast.emit("left",socket.name+" left");
	});
});

app.get("/", (req, res)=>{
	res.render("trangchu");
})
