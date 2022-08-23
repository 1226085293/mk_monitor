import * as cc from 'cc';
import { _decorator, Node } from 'cc';
import { EDITOR, PREVIEW } from 'cc/env';
import tool from '../tool';
import data_method from './data_method';
const { ccclass, property } = _decorator;

export module _monitor_trigger {
    @ccclass('monitor_trigger/event_param')
    export class event_param {}

    @ccclass('monitor_trigger/trigger')
    export class trigger {
        /* --------------- 属性 --------------- */
        @property({ visible: false })
        get editor_init() {
            this._init_editor();
            return true;
        }

        /** 数据类型 */
        @property
        private _type_n = 0;
        /** 数据类型 */
        @property({ displayName: '数据类型', type: cc.Enum({}) })
        get type_n() {
            return this._type_n;
        }
        set type_n(value_s_) {
            this._set_type_n(value_s_);
        }

        /** 事件名 */
        @property
        private _event_n = 0;
        /** 事件名 */
        @property({ displayName: '事件名', type: cc.Enum({}) })
        get event_n() {
            return this._event_n;
        }
        set event_n(value_s_) {
            this._set_event_n(value_s_);
        }

        /** 事件 */
        @property({ displayName: '事件参数', type: [_monitor_trigger.event_param] })
        event_param_as: any[] = [];
        /* --------------- static --------------- */
        /** 初始化状态 */
        private static init_b = false;
        /** 数据类型列表 */
        private static data_type_ss: string[];
        /** 事件名表 */
        static event_name_tab: { [k: string]: string[] };
        /** 数据类型枚举 */
        static data_type_enum: any;
        /* ------------------------------- get/set ------------------------------- */
        private _set_type_n(value_n_: number) {
            this._type_n = value_n_;

            // 重置事件名
            if (this._update_event_inspector()) {
                this.event_n = 0;
            }
        }

        private _set_event_n(value_n_: number) {
            this._event_n = value_n_;

            // 更新事件参数
            if (EDITOR) {
                /** 数据类型 */
                let data_type_s = trigger.data_type_enum?.[this._type_n];
                if (!data_type_s) {
                    return false;
                }
                /** 参数类型 */
                let ccclass =
                    data_method[data_type_s][trigger.event_name_tab[data_type_s][this._event_n]].ccclass_params;
                // 更新参数
                if (ccclass?.['__props__'].length) {
                    this.event_param_as = [new ccclass()];
                } else {
                    this.event_param_as = [];
                }
            }
        }
        /* ------------------------------- 功能 ------------------------------- */
        /** 初始化编辑器 */
        private _init_editor(): void {
            if (trigger.init_b) {
                this._update_type_inspector();
                this._update_event_inspector();
                return;
            }
            trigger.init_b = true;

            trigger.data_type_ss = Object.keys(data_method).filter((v_s) => data_method[v_s]);
            trigger.data_type_enum = tool.enum.array_to_enum(trigger.data_type_ss);
            trigger.event_name_tab = Object.create(null);

            // 初始化事件名表
            trigger.data_type_ss.forEach((v_s) => {
                trigger.event_name_tab[v_s] = Object.keys(data_method[v_s]);
            });

            // 初始化视图
            this._update_type_inspector();
            this._update_event_inspector();
        }

        /** 更新类型检查器 */
        private _update_type_inspector(): void {
            if (EDITOR) {
                cc.CCClass.Attr.setClassAttr(
                    this,
                    'type_n',
                    'enumList',
                    tool.enum.enum_to_cc_enum(trigger.data_type_enum)
                );
            }
        }

        /** 更新事件检查器 */
        private _update_event_inspector(): boolean {
            if (EDITOR) {
                /** 数据类型 */
                let data_type_s = trigger.data_type_enum?.[this._type_n];
                if (!data_type_s) {
                    return false;
                }

                // 更新事件名
                if (trigger.event_name_tab[data_type_s]?.length) {
                    cc.CCClass.Attr.setClassAttr(
                        this,
                        'event_n',
                        'enumList',
                        tool.enum.array_to_cc_enum(trigger.event_name_tab[data_type_s])
                    );
                    return true;
                }
            }
            return false;
        }
    }
}

@ccclass('monitor_trigger')
export class monitor_trigger extends cc.Component {
    /* --------------- 属性 --------------- */
    @property({ visible: false })
    get editor_init() {
        this._init_editor();
        return true;
    }

    /** 数据目标 */
    @property(cc.Node)
    private _data_target: cc.Node = null!;
    /** 数据目标 */
    @property({ displayName: '数据目标', type: cc.Node })
    get data_target() {
        return this._data_target;
    }
    set data_target(value_) {
        this._set_data_target(value_);
    }

    /** 数据键 */
    @property
    private _data_key_s = '';
    /** 数据目标 */
    @property({ displayName: '数据键' })
    get data_key_s() {
        return this._data_key_s;
    }
    set data_key_s(value_s_) {
        this._set_data_key_s(value_s_);
    }

    /** 触发事件 */
    @property({ displayName: '触发事件', type: _monitor_trigger.trigger })
    event = new _monitor_trigger.trigger();
    /* --------------- private --------------- */
    /** 调用时间表 */
    private _call_time_tab: { [k: string]: number } = Object.create(null);
    /** 用户组件 */
    private _user_comp?: cc.Component;
    /** 上个数据键 */
    private _pre_data_key_s = '';
    /** 提示字符 */
    private _prompt_text_ss: string[] = [];
    /* ------------------------------- get/set ------------------------------- */
    private _set_data_key_s(value_s_: string) {
        if (this._call_time_tab['data_key_s'] && Date.now() - this._call_time_tab['data_key_s'] < 500) {
            return;
        }
        this._call_time_tab['data_key_s'] = Date.now();
        this._data_key_s = value_s_;
        if (!this._user_comp) {
            return;
        }
        /** 当前数据键头 */
        let key_head_s: string;
        // 初始化数据键头 | 尾
        {
            let last_point_n = this._data_key_s.lastIndexOf('.');
            key_head_s = this._data_key_s.slice(0, last_point_n !== -1 ? last_point_n : this._data_key_s.length);
        }
        // 更新提示文本
        if (key_head_s !== this._pre_data_key_s) {
            this._pre_data_key_s = key_head_s;
            /** 数据路径 */
            let data_path_ss = key_head_s.split('.');
            /** 数据目标 */
            let data_target = this._get_data_from_path(this._user_comp, data_path_ss);
            // 更新文本提示
            this._prompt_text_ss = Object.keys(data_target).map(
                (v_s) => (this._pre_data_key_s ? `${this._pre_data_key_s}.` : '') + v_s
            );
        }
        // 更新文本
        this._data_key_s = tool.string.fuzzy_match(this._prompt_text_ss, this._data_key_s) || this._pre_data_key_s;
    }

    private _set_data_target(value_: cc.Node) {
        this._data_target = value_;
        this._update_user_comp();
        this.data_key_s = '';
    }
    /* ------------------------------- 生命周期 ------------------------------- */
    onLoad() {
        let data = this._update_user_comp();
        let data_key_s: string;
        if (!data) {
            console.error('不存在用户组件');
            return;
        }
        // 获取数据和数据键
        {
            let last_point_n = this._data_key_s.lastIndexOf('.');
            let key_head_s = this._data_key_s.slice(0, last_point_n !== -1 ? last_point_n : this._data_key_s.length);
            data_key_s = last_point_n === -1 ? this._data_key_s : this._data_key_s.slice(last_point_n + 1);
            data = this._get_data_from_path(data, key_head_s.split('.'))!;
            if (!data) {
                console.error('数据获取错误', key_head_s);
                return;
            }
        }

        this.event.editor_init;
        let data_type_s = _monitor_trigger.trigger.data_type_enum[this.event.type_n];
        let event_s = _monitor_trigger.trigger.event_name_tab[data_type_s][this.event.event_n];
        let event = data_method[data_type_s]?.[event_s];
        if (!event) {
            console.error('触发事件错误', this.event.type_n, this.event.event_n);
            return;
        }
        event.on(data, data_key_s, this.node, this.event.event_param_as[0]);
    }
    /* ------------------------------- 功能 ------------------------------- */
    /** 初始化编辑器 */
    private _init_editor(): void {
        this._update_user_comp();
    }

    /** 更新用户组件 */
    private _update_user_comp(): cc.Component | undefined {
        this._user_comp = !this._data_target
            ? undefined
            : this._data_target.components.find((v) => !cc.js.getClassName(v).startsWith('cc.'));
        return this._user_comp;
    }

    /** 根据路径获取数据 */
    private _get_data_from_path(data_: any, path_ss_: string[]): any {
        let temp: any;
        for (let k_n = 0, len_n = path_ss_.length; k_n < len_n; ++k_n) {
            temp = data_[path_ss_[k_n]];
            if (typeof temp !== 'object') {
                this._pre_data_key_s = path_ss_.slice(0, k_n).join('.');
                break;
            }
            data_ = temp;
        }
        return data_;
    }
}

export module monitor_trigger_ {
    /** 事件参数 */
    @ccclass('monitor_trigger/event_param2')
    export class event_param extends _monitor_trigger.event_param {}
}
