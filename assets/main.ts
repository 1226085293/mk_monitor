import * as cc from 'cc';
import { _decorator, Component, Node } from 'cc';
import data_method from './monitor/data_method';
import { resources_player } from './resources/player/resources_player';
const { ccclass, property } = _decorator;

@ccclass('main')
export class main extends Component {
    /* ------------------------------- 按钮事件 ------------------------------- */
    button_player(): void {
        resources_player.open();
    }
}
