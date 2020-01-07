import * as socketio from 'socket.io-client'
import * as config from '../../server/config'
export class NetworkScene extends Phaser.Scene
{
    private socket: SocketIOClient.Socket

    public constructor(key: string | Phaser.Types.Scenes.SettingsConfig)
    {
        super(key)
        this.socket = socketio(`http://localhost:${config.default.server_port}/client`)
        
    } 

    public getSocket() : SocketIOClient.Socket
    {
        return this.socket
    }

}