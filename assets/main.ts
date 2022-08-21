import * as cc from 'cc';
import { _decorator, Component, Node } from 'cc';
import data_method from './monitor/data_method';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    /* --------------- 属性 --------------- */
    @property({ displayName: '测试文本', type: data_method.string.common.ccclass_params })
    test_label = null!;
    @property({ displayName: '测试文本2', type: data_method.string.omit.ccclass_params })
    test_label2 = null!;
    @property({ displayName: '测试容器', type: data_method.array.common.ccclass_params })
    test_list = null!;
    /* --------------- public --------------- */
    /** 对象 key */
    key: { [k in keyof this]: k } = new Proxy({}, { get: (target, key) => key }) as any;

    test_label_s = '111';
    test_label2_s = '222';
    test_list_ss = ['5', '4', '6'];
    /* ------------------------------- 生命周期 ------------------------------- */
    onLoad() {
        self['Main'] = this;
        data_method.string.common.on(this, this.key.test_label_s, this.test_label);
        data_method.string.omit.on(this, this.key.test_label2_s, this.test_label2);
        data_method.array.common.on(this, this.key.test_list_ss, this.test_list);
        // Main.test_label_s = "1";
        // Main.test_label2_s = "123";
        // Main.test_label2_s = "123456";
        // Main.test_list_ss.push("1");
        // Main.test_list_ss.shift();
        // Main.test_list_ss.sort((va, vb)=> Number(va) - Number(vb));
    }
    /* ------------------------------- 自定义事件 ------------------------------- */
    event_child_update(node_: cc.Node, data_s_: string): void {
        node_.label.string = data_s_;
    }
}
