
class NetworkManager {
    constructor() {
        this.peer = null;
        this.connection = null;
        this.isHost = false;
        this.roomId = null;
        this.prefix = "survivor101-"; // Prevent conflicts on public PeerJS server

        // Callbacks
        this.onConnected = () => { };
        this.onDataReceived = (data) => { };
        this.onDisconnected = () => { };
        this.onError = (err) => { };
    }

    // Call this specifically from Main.html to generate a completely new room
    static generateRoomId() {
        return Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit code
    }

    initHost(roomId) {
        this.isHost = true;
        this.roomId = roomId;
        const peerId = this.prefix + roomId;

        console.log(`[Network] Initializing Host... Room ID: ${roomId} (PeerID: ${peerId})`);
        this.peer = new Peer(peerId);

        this.peer.on('open', (id) => {
            console.log('[Network] Host PeerJS opened with ID:', id);
        });

        this.peer.on('connection', (conn) => {
            console.log('[Network] A Guest connected!');
            this.connection = conn;
            this.setupConnection();
        });

        this.peer.on('error', (err) => {
            console.error('[Network] Host Error:', err);
            this.onError(err);
        });
    }

    initJoin(roomId) {
        this.isHost = false;
        this.roomId = roomId;
        const hostPeerId = this.prefix + roomId;

        console.log(`[Network] Initializing Guest... Connecting to Room ID: ${roomId} (PeerID: ${hostPeerId})`);
        this.peer = new Peer();

        this.peer.on('open', (id) => {
            console.log('[Network] Guest PeerJS opened with ID:', id);

            this.connection = this.peer.connect(hostPeerId, { reliable: false });
            this.setupConnection();
        });

        this.peer.on('error', (err) => {
            console.error('[Network] Guest Error:', err);
            this.onError(err);
        });
    }

    setupConnection() {
        if (!this.connection) return;

        this.connection.on('open', () => {
            console.log('[Network] Data connection is OPEN');
            this.onConnected();
        });

        this.connection.on('data', (data) => {
            this.onDataReceived(data);
        });

        this.connection.on('close', () => {
            console.log('[Network] Connection closed');
            this.onDisconnected();
        });
    }

    sendData(data) {
        if (this.connection && this.connection.open) {
            this.connection.send(data);
        }
    }

    getMode() {
        return this.isHost ? 'host' : 'join';
    }

    destroy() {
        if (this.connection) {
            this.connection.close();
        }
        if (this.peer) {
            this.peer.disconnect();
            this.peer.destroy();
        }
    }
}


const network = new NetworkManager();
