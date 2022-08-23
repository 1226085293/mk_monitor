import * as cc from 'cc';
import { _decorator, Component, Node } from 'cc';
import data_method from './monitor/data_method';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    /* --------------- 属性 --------------- */
    /* --------------- public --------------- */
    /** 对象 key */
    key: { [k in keyof this]: k } = new Proxy({}, { get: (target, key) => key }) as any;

    test_label_s = '111';
    test = {
        label2_s: '222',
        test_list_ss: ['5', '4', '6']
    };
    /* ------------------------------- 生命周期 ------------------------------- */
    onLoad() {
        self['Main'] = this;
    }
    /* ------------------------------- 自定义事件 ------------------------------- */
    event_child_update(node_: cc.Node, data_s_: string): void {
        node_.label.string = data_s_;
    }
}
