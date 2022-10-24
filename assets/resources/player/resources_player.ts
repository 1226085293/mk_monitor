import * as cc from 'cc';
import { _decorator, Component, Node } from 'cc';
import global from '../global';
import monitor from '../../monitor/monitor';
import { resources_head_select } from '../head_select/resources_head_select';
const { ccclass, property } = _decorator;

@ccclass('resources_player')
export class resources_player extends Component {
    data = global.player;
    /* ------------------------------- static ------------------------------- */
    static async open(
        parent_ = cc.director.getScene()?.getComponentInChildren(cc.Canvas)?.node
    ): Promise<resources_player | null> {
        let prefab = await new Promise<cc.Prefab>((resolve_f) => {
            cc.resources.load('player/player', cc.Prefab, (err, res) => {
                resolve_f(res);
            });
        });
        if (!prefab || !parent_?.isValid) {
            prefab?.destroy();
            return null;
        }
        let node = cc.instantiate(prefab);
        parent_.addChild(node);
        return node.getComponent(resources_player);
    }
    /* ------------------------------- 按钮回调 ------------------------------- */
    button_close() {
        this.node.destroy();
    }

    button_head() {
        resources_head_select.open();
    }
}
