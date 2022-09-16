import * as cc from 'cc';
import tool from '../../tool';
import monitor from '../monitor';
const { ccclass, property } = cc._decorator;

import { monitor_trigger_, _monitor_trigger } from '../monitor_trigger';

export function check_type(data_: any): boolean {
    return typeof data_ === 'string' || typeof data_ === 'number';
}

export namespace 默认 {
    @ccclass('data_method_string/默认')
    export class ccclass_params extends _monitor_trigger.event_param {
        @property({ displayName: '前缀' })
        head_s = '';

        @property({ displayName: '后缀' })
        tail_s = '';
    }

    export function on<VT, KT extends keyof VT>(target_: VT, key_: KT, node_: cc.Node, params_: ccclass_params): void {
        monitor
            .on(
                target_,
                key_,
                (value) => {
                    node_.label.string = params_.head_s + String(value) + params_.tail_s;
                },
                target_
            )
            ?.call(target_, target_[key_]);
    }
}

export namespace 多余省略 {
    @ccclass('data_method_string/多余省略')
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
                    const value_s = String(value);

                    node_.label.string =
                        value_s.length <= params_.max_n ? value_s : value_s.slice(0, params_.max_n) + params_.replace_s;
                },
                target_
            )
            ?.call(target_, target_[key_]);
    }
}

export namespace 远程图片 {
    export function on<VT, KT extends keyof VT>(target_: VT, key_: KT, node_: cc.Node): void {
        monitor
            .on(
                target_,
                key_,
                (value) => {
                    const value_s = String(value);
                    cc.assetManager.loadRemote<cc.ImageAsset>(value_s, { ext: '.png' }, function (err, image_asset) {
                        const sprite_frame = new cc.SpriteFrame();
                        const texture = new cc.Texture2D();
                        texture.image = image_asset;
                        sprite_frame.texture = texture;
                        node_.sprite.spriteFrame = sprite_frame;
                    });
                },
                target_
            )
            ?.call(target_, target_[key_]);
    }
}

export namespace 编辑框 {
    @ccclass('data_method_string/编辑框')
    export class ccclass_params extends _monitor_trigger.event_param {
        @property({ displayName: '同步修改' })
        sync_modify_b = true;
    }

    export function on<VT, KT extends keyof VT>(target_: VT, key_: KT, node_: cc.Node, params_: ccclass_params): void {
        const type_s = typeof target_[key_];

        monitor
            .on(
                target_,
                key_,
                (value) => {
                    const value_s = String(value);
                    node_.edit_box.string = value_s;
                },
                () => {
                    node_.edit_box.node.off(cc.EditBox.EventType.EDITING_DID_ENDED);
                },
                target_
            )
            ?.call(target_, target_[key_]);

        // 同步修改
        if (params_.sync_modify_b) {
            node_.edit_box.node.on(cc.EditBox.EventType.EDITING_DID_ENDED, () => {
                target_[key_] = (type_s === 'string' ? node_.edit_box.string : Number(node_.edit_box.string)) as any;
            });
        }
    }
}
