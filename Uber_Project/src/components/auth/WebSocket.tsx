let socket: WebSocket | null = null;

export const connectWebSocket = () => {

  const token = localStorage.getItem("access_token");
  const WebSocketUrl = import.meta.env.VITE_WEBSOCKET_BASE_URL;
  // if (!token) {
  //   console.warn("❌ No access token found in localStorage");
  //   return null;
  // }

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.log("🟢 Creating new WebSocket connection...");
    socket = new WebSocket(
      `${WebSocketUrl}/ws/trip_updates/?token=${token}`
    );
  }

  return socket;
};

export const getWebSocket = () => socket;
