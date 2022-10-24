import * as cc from 'cc';
import { _decorator, Component, Node } from 'cc';
import global from '../global';
import { resources_head_select_item } from './item/resources_head_select_item';
const { ccclass, property } = _decorator;

@ccclass('resources_head_select')
export class resources_head_select extends Component {
    data = global.head_lib_ss;
    /* ------------------------------- static ------------------------------- */
    static async open(
        parent_ = cc.director.getScene()?.getComponentInChildren(cc.Canvas)?.node
    ): Promise<resources_head_select | null> {
        let prefab = await new Promise<cc.Prefab>((resolve_f) => {
            cc.resources.load('head_select/head_select', cc.Prefab, (err, res) => {
                resolve_f(res);
            });
        });
        if (!prefab || !parent_?.isValid) {
            prefab?.destroy();
            return null;
        }
        let node = cc.instantiate(prefab);
        parent_.addChild(node);
        return node.getComponent(resources_head_select);
    }
    /* ------------------------------- 按钮回调 ------------------------------- */
    button_head(event_: cc.EventTouch) {
        global.player.head_s = this.data[(event_.target as cc.Node).getSiblingIndex()];

        this.node.destroy();
    }
    /* ------------------------------- 自定义事件 ------------------------------- */
    event_item_update(node_: cc.Node, value_s_: string): void {
        node_.getComponent(resources_head_select_item)!.data = value_s_;
    }
}
