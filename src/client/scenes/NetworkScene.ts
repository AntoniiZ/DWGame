import * as socketio from 'socket.io-client'
import * as config from '../../server/config'

export class NetworkScene extends Phaser.Scene
{
    private socket: SocketIOClient.Socket

    public constructor(key: string | Phaser.Types.Scenes.SettingsConfig)
    {
        super(key)
        this.socket = socketio(`http://${config.default.server_ip}:${config.default.server_port}/client`)
    } 

    public getSocket() : SocketIOClient.Socket
    {
        return this.socket
    }

    public initSocket() : void
    {
        this.socket = socketio(`http://${config.default.server_ip}:${config.default.server_port}/client`)
    }

}
