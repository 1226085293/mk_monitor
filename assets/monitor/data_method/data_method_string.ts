import * as cc from 'cc';
import monitor from '../monitor';
const { ccclass, property } = cc._decorator;
import { monitor_trigger_, _monitor_trigger } from '../monitor_trigger';

export module 默认 {
    @ccclass('data_method_string/默认')
    export class ccclass_params extends _monitor_trigger.event_param {}

    export function on<VT, KT extends keyof VT>(target_: VT, key_: KT, node_: cc.Node, params_: ccclass_params): void {
        monitor
            .on(
                target_,
                key_,
                (value) => {
                    node_.label.string = String(value);
                },
                target_
            )
            ?.call(target_, target_[key_]);
    }
}

export module 多余省略 {
    @ccclass('data_method_string_omit')
    export class ccclass_params extends _monitor_trigger.event_param {
        @property({ displayName: '最大字符数量' })
        max_n = 5;

        @property({ displayName: '超出替换字符' })
        replace_s = '...';
    }

    export function on<VT, KT extends keyof VT>(target_: VT, key_: KT, node_: cc.Node, params_: ccclass_params): void {
        monitor
            .on(
                target_,
                key_,
                (value) => {
                    let value_s = String(value);
                    node_.label.string =
                        value_s.length <= params_.max_n ? value_s : value_s.slice(0, params_.max_n) + params_.replace_s;
                },
                target_
            )
            ?.call(target_, target_[key_]);
    }
}
