/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useQuery } from "@tanstack/react-query";

const SocketContext = createContext();

export const useSocket = () => {
	return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	useEffect(() => {
		let newSocket = null;

		if (authUser?._id) {
			const socketURL = window.location.hostname === "localhost" ? "http://localhost:5000" : "/";

			newSocket = io(socketURL, {
				query: {
					userId: authUser._id,
				},
				transports: ["websocket", "polling"],
			});

			newSocket.on("connect", () => {
				console.log("🟢 Connected to Socket.io server with ID:", newSocket.id);
			});

			newSocket.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});

			setSocket(newSocket);
		} else {
			setSocket((prevSocket) => {
				if (prevSocket) prevSocket.close();
				return null;
			});
		}

		return () => {
			if (newSocket) newSocket.close();
		};
	}, [authUser?._id]);

	return (
		<SocketContext.Provider value={{ socket, onlineUsers }}>
			{children}
		</SocketContext.Provider>
	);
};