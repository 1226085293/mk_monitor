import * as cc from 'cc';
import monitor from '../monitor';
const { ccclass, property } = cc._decorator;

/** 通用 */
export module common {
    @ccclass('data_method_string_common')
    export class ccclass_params {
        @property({ displayName: '目标', type: cc.Label })
        target: cc.Label = null!;
    }

    export function on<VT, KT extends keyof VT>(target_: VT, key_: KT, params_: ccclass_params): void {
        monitor
            .on(
                target_,
                key_,
                (value) => {
                    params_.target.string = String(value);
                },
                target_
            )
            ?.call(target_, target_[key_]);
    }
}

/** 多余省略 */
export module omit {
    @ccclass('data_method_string_omit')
    export class ccclass_params {
        @property({ displayName: '目标', type: cc.Label })
        target: cc.Label = null!;

        @property({ displayName: '最大字符数量' })
        max_n = 5;

        @property({ displayName: '超出替换字符' })
        replace_s = '...';
    }

    export function on<VT, KT extends keyof VT>(target_: VT, key_: KT, params_: ccclass_params): void {
        monitor
            .on(
                target_,
                key_,
                (value) => {
                    let value_s = String(value);
                    params_.target.string =
                        value_s.length <= params_.max_n ? value_s : value_s.slice(0, params_.max_n) + params_.replace_s;
                },
                target_
            )
            ?.call(target_, target_[key_]);
    }
}
