import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { SocketContextProvider } from "./context/SocketContext.jsx"; // 👈 Sockets Provider

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
});

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<LanguageProvider>
					<ThemeProvider>
						<SocketContextProvider> {/* 👈 Wrapped here */}
							<App />
						</SocketContextProvider>
					</ThemeProvider>
				</LanguageProvider>
			</QueryClientProvider>
		</BrowserRouter>
	</React.StrictMode>
);