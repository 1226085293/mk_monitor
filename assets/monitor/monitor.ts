module _monitor {
    /** 键类型 */
    export type type_key = string | number | symbol;
    /** on 函数类型 */
    export type type_on_callback<VT> = (value_: VT, old_value_?: VT) => void;
    /** off 函数类型 */
    export type type_off_callback = () => void;
    /** 监听数据类型 */
    export type type_monitor_data<VT> = {
        /** 监听回调 */
        on_callback_f: type_on_callback<VT>;
        /** 取消监听回调 */
        off_callback_f?: type_off_callback;
        /** 绑定对象 */
        target?: any;
        /** 单次监听状态 */
        once_b?: boolean;
        /** 禁用状态 （仅用于 on_callback_f） */
        disabled_b?: boolean;
    };

    /** 对象绑定监听数据 */
    export interface target_bind_monitor_data {
        /** 绑定监听 */
        monitor?: type_monitor_data<any>;
        /** 绑定对象 */
        target: any;
        /** 绑定键 */
        key: type_key;
    }
    /** 对象绑定数据 */
    export interface target_bind_data {
        /** 绑定监听 */
        monitor_as?: target_bind_monitor_data[];
        /** 禁用状态 （仅用于 on_callback_f） */
        disabled_b?: boolean;
    }
    /** 绑定数据 */
    export interface bind_data {
        /** 原始desc */
        desc: PropertyDescriptor;
        /** 绑定监听 */
        monitor_as?: type_monitor_data<any>[];
        /** 修改状态 */
        modify_b?: boolean;
        /** 禁用状态 （仅用于 on_callback_f） */
        disabled_b?: boolean;
    }
}

/** 数据监听器 */
class monitor {
    private constructor() {}
    /** 绑定数据 */
    private _bind_data_map: Map<any, Map<_monitor.type_key, _monitor.bind_data>> = new Map();
    /** 对象绑定数据 */
    private _target_bind_data: Map<any, _monitor.target_bind_data> = new Map();
    /* ------------------------------- static ------------------------------- */
    static get instance(): monitor {
        return (<any>this)._instance || ((this as any)._instance = new this());
    }
    /* ------------------------------- 功能 ------------------------------- */
    /** 获取绑定数据（没有则创建） */
    private _get_bind_data<VT, KT extends keyof VT>(value_: VT, key_: KT): _monitor.bind_data | null {
        /** 绑定数据表 */
        let bind_data_map = this._bind_data_map.get(value_);
        if (!bind_data_map) {
            this._bind_data_map.set(value_, (bind_data_map = new Map()));
        }
        /** 绑定数据 */
        let bind_data = bind_data_map.get(key_);
        if (!bind_data) {
            // 添加数据
            {
                let desc = Object.getOwnPropertyDescriptor(value_, key_);
                if (!desc) {
                    return null;
                }
                bind_data_map.set(key_, (bind_data = Object.create(null) as _monitor.bind_data));
                bind_data.desc = desc;
            }
            // 监听数据
            {
                let value = value_[key_];
                Object.defineProperty(value_, key_, {
                    get: () => (bind_data!.desc.get ? bind_data!.desc.get.call(value_) : value),
                    set: (new_value) => {
                        // 安检
                        {
                            if (!bind_data) {
                                return;
                            }
                            if (bind_data.desc.get) {
                                value = bind_data.desc.get.call(value_);
                            }
                            // 递归修改数据且数据相同时终止
                            if (bind_data.modify_b && value === new_value) {
                                return;
                            }
                        }
                        // 更新状态
                        bind_data.modify_b = true;
                        // 更新数据
                        if (value !== new_value) {
                            let old_value = value;
                            // 更新值
                            {
                                bind_data.desc.set?.call(value_, new_value);
                                value = new_value;
                            }
                            if (!bind_data.disabled_b && bind_data.monitor_as) {
                                let target_bind_data: _monitor.target_bind_data | undefined;
                                for (
                                    let k_n = 0, v: _monitor.type_monitor_data<any>;
                                    k_n < bind_data.monitor_as.length;
                                    ++k_n
                                ) {
                                    v = bind_data.monitor_as[k_n];
                                    target_bind_data = !v.target ? undefined : this._target_bind_data.get(v.target);
                                    // 安检（禁用状态）
                                    if (v.disabled_b || target_bind_data?.disabled_b) {
                                        continue;
                                    }
                                    v.on_callback_f.call(v.target, value, old_value);
                                    // 单次执行
                                    if (v.once_b) {
                                        bind_data!.monitor_as!.splice(k_n--, 1);
                                        // 删除对象绑定数据
                                        if (v.target) {
                                            this._del_target_bind_data(v.target, {
                                                monitor: v,
                                                target: value_,
                                                key: key_
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
        return bind_data;
    }

    /** 添加对象绑定数据 */
    private _add_target_bind_data(target_: any, bind_data_: _monitor.target_bind_monitor_data): void {
        // 安检
        if (!target_ || !bind_data_) {
            return;
        }
        /** 对象绑定数据 */
        let target_bind_data = this._target_bind_data.get(target_);
        if (!target_bind_data) {
            this._target_bind_data.set(target_, (target_bind_data = Object.create(null) as _monitor.target_bind_data));
        }
        // 添加绑定监听
        if (bind_data_.monitor) {
            if (!target_bind_data.monitor_as) {
                target_bind_data.monitor_as = [bind_data_];
            } else {
                target_bind_data.monitor_as.push(bind_data_);
            }
        }
    }

    /** 删除对象绑定数据 */
    private _del_target_bind_data(target_: any, bind_data_: _monitor.target_bind_monitor_data): void {
        // 安检
        if (!target_ || !bind_data_) {
            return;
        }
        /** 对象绑定数据 */
        let target_bind_data = this._target_bind_data.get(target_);
        if (!target_bind_data) {
            return;
        }
        // 删除绑定监听
        if (bind_data_.monitor && target_bind_data.monitor_as) {
            let index_n = target_bind_data!.monitor_as!.findIndex((v) => {
                return v.target === bind_data_.target && v.key === bind_data_.key && v.monitor === bind_data_.monitor;
            });
            if (index_n !== -1) {
                target_bind_data!.monitor_as!.splice(index_n, 1)[0].monitor?.off_callback_f?.();
            }
        }
    }

    /** 监听数据更新 */
    private _on<VT, KT extends keyof VT>(
        value_: VT,
        key_: KT,
        data_: _monitor.type_monitor_data<VT[KT]>
    ): _monitor.type_on_callback<VT[KT]> | null {
        /** 绑定数据 */
        let bind_data = this._get_bind_data(value_, key_);
        if (!bind_data) {
            console.log('获取绑定数据错误');
            return null;
        }
        // 添加回调
        {
            if (!bind_data.monitor_as) {
                bind_data.monitor_as = [];
            }
            bind_data.monitor_as?.push(data_);
        }
        // 添加对象绑定数据
        if (data_.target) {
            this._add_target_bind_data(data_.target, {
                monitor: data_,
                target: value_,
                key: key_
            });
        }
        return data_.on_callback_f;
    }

    /** 启用监听事件 */
    private _set_listener_state(state_b_: boolean, target_: any): void;
    private _set_listener_state<VT, KT extends keyof VT>(state_b_: boolean, value_: VT, key_: KT, target_?: any): void;
    private _set_listener_state<VT, KT extends keyof VT>(
        state_b_: boolean,
        value_: VT,
        key_: KT,
        callback_f_: _monitor.type_on_callback<VT[KT]>,
        target_?: any
    ): void;
    private _set_listener_state<VT, KT extends keyof VT>(
        state_b_: boolean,
        args_: VT,
        key_?: KT,
        args3_?: any,
        target_?: any
    ): void {
        let target = target_;
        let value: VT | undefined;
        let callback_f: _monitor.type_on_callback<VT[KT]> | undefined;
        // 参数转换
        {
            // target
            if (target === undefined) {
                if (key_ === undefined) {
                    target = args_;
                } else if (typeof args3_ !== 'function') {
                    target = args3_;
                }
            }
            // value
            if (key_ !== undefined) {
                value = args_;
            }
            // callback_f_
            if (typeof args3_ === 'function') {
                callback_f = args3_;
            }
        }

        if (value) {
            let bind_data = this._get_bind_data(value, key_!);
            if (!bind_data) {
                return;
            }
            // 更新指定回调
            if (callback_f) {
                if (!bind_data.monitor_as) {
                    return;
                }
                let index_n: number;
                if (target) {
                    index_n = bind_data.monitor_as.findIndex(
                        (v) => v.target === target && v.on_callback_f === callback_f
                    );
                } else {
                    index_n = bind_data.monitor_as.findIndex((v) => v.on_callback_f === callback_f);
                }
                if (index_n !== -1) {
                    bind_data.monitor_as[index_n].disabled_b = !state_b_;
                }
            }
            // 更新指定对象
            else if (target) {
                if (!bind_data.monitor_as) {
                    return;
                }
                let index_n = bind_data.monitor_as.findIndex((v) => v.target === target);
                while (index_n !== -1) {
                    bind_data.monitor_as[index_n].disabled_b = !state_b_;
                    index_n = bind_data.monitor_as.findIndex((v) => v.target === target);
                }
            }
            // 更新所有回调
            else {
                bind_data.disabled_b = !state_b_;
            }
        } else if (target_) {
            let target_bind_data = this._target_bind_data.get(target_);
            if (!target_bind_data) {
                return;
            }
            target_bind_data.disabled_b = !state_b_;
        }
    }

    /**
     * 监听数据更新
     * @param value_ 监听对象
     * @param key_ 监听键
     * @param on_callback_f_ on 触发回调
     * @param target_ 绑定对象
     */
    on<VT, KT extends keyof VT>(
        value_: VT,
        key_: KT,
        on_callback_f_: _monitor.type_on_callback<VT[KT]>,
        target_?: any
    ): _monitor.type_on_callback<VT[KT]> | null;
    /**
     * 监听数据更新
     * @param value_ 监听对象
     * @param key_ 监听键
     * @param on_callback_f_ on 触发回调
     * @param off_callback_f_ off 触发回调
     * @param target_ 绑定对象
     */
    on<VT, KT extends keyof VT>(
        value_: VT,
        key_: KT,
        on_callback_f_: _monitor.type_on_callback<VT[KT]>,
        off_callback_f_: _monitor.type_off_callback,
        target_?: any
    ): _monitor.type_on_callback<VT[KT]> | null;
    on<VT, KT extends keyof VT>(
        value_: VT,
        key_: KT,
        on_callback_f_: _monitor.type_on_callback<VT[KT]>,
        off_callback_f_?: _monitor.type_off_callback,
        target_?: any
    ): _monitor.type_on_callback<VT[KT]> | null {
        let off_callback_f = typeof off_callback_f_ === 'function' ? off_callback_f_ : undefined;
        let target = target_ || (off_callback_f ? null : off_callback_f_);
        return this._on(value_, key_, {
            on_callback_f: on_callback_f_,
            off_callback_f: off_callback_f,
            target: target
        });
    }

    /**
     * 监听单次数据更新
     * @param value_ 监听对象
     * @param key_ 监听键
     * @param on_callback_f_ on 触发回调
     * @param target_ 绑定对象
     */
    once<VT, KT extends keyof VT>(
        value_: VT,
        key_: KT,
        on_callback_f_: _monitor.type_on_callback<VT[KT]>,
        target_?: any
    ): _monitor.type_on_callback<VT[KT]> | null;
    /**
     * 监听单次数据更新
     * @param value_ 监听对象
     * @param key_ 监听键
     * @param on_callback_f_ on 触发回调
     * @param off_callback_f_ off 触发回调
     * @param target_ 绑定对象
     */
    once<VT, KT extends keyof VT>(
        value_: VT,
        key_: KT,
        on_callback_f_: _monitor.type_on_callback<VT[KT]>,
        off_callback_f_: _monitor.type_off_callback,
        target_?: any
    ): _monitor.type_on_callback<VT[KT]> | null;
    once<VT, KT extends keyof VT>(
        value_: VT,
        key_: KT,
        on_callback_f_: _monitor.type_on_callback<VT[KT]>,
        off_callback_f_?: _monitor.type_off_callback,
        target_?: any
    ): _monitor.type_on_callback<VT[KT]> | null {
        let off_callback_f = typeof off_callback_f_ === 'function' ? off_callback_f_ : undefined;
        let target = target_ || (off_callback_f ? null : off_callback_f_);
        return this._on(value_, key_, {
            on_callback_f: on_callback_f_,
            off_callback_f: off_callback_f,
            target: target,
            once_b: true
        });
    }

    /**
     * 取消监听数据更新
     * @param value_ 监听对象
     * @param key_ 监听键
     * @param target_ 绑定目标
     */
    off<VT, KT extends keyof VT>(value_: VT, key_: KT, target_?: any): void;
    /**
     * 取消监听数据更新
     * @param value_ 监听对象
     * @param key_ 监听键
     * @param on_callback_f_ on 触发回调
     * @param target_ 绑定目标
     */
    off<VT, KT extends keyof VT>(
        value_: VT,
        key_: KT,
        on_callback_f_: _monitor.type_on_callback<VT[KT]>,
        target_?: any
    ): void;
    off<VT, KT extends keyof VT>(value_: VT, key_: KT, args_?: any, target_?: any): void {
        let target = target_;
        let callback_f: _monitor.type_on_callback<VT[KT]> | undefined;

        // 参数转换
        if (typeof args_ === 'function') {
            callback_f = args_;
        } else if (!target) {
            target = args_;
        }

        // 参数安检
        if (!target && !callback_f) {
            return;
        }
        let bind_data = this._get_bind_data(value_, key_);
        if (!bind_data || !bind_data.monitor_as) {
            return;
        }

        // 取消监听
        {
            if (target && callback_f) {
                let index_n: number;
                let del_as: _monitor.type_monitor_data<any>[];
                while (true) {
                    index_n = bind_data.monitor_as.findIndex(
                        (v2) => v2.on_callback_f === callback_f && v2.target === target
                    );
                    if (index_n === -1) {
                        return;
                    }
                    del_as = bind_data.monitor_as.splice(index_n, 1);
                    // 删除对象绑定数据
                    this._del_target_bind_data(target, {
                        monitor: del_as[0],
                        target: value_,
                        key: key_
                    });
                }
            } else if (target) {
                let index_n: number;
                let del_as: _monitor.type_monitor_data<any>[];
                while (true) {
                    index_n = bind_data.monitor_as.findIndex((v2) => v2.target === target);
                    if (index_n === -1) {
                        return;
                    }
                    del_as = bind_data.monitor_as.splice(index_n, 1);
                    // 删除对象绑定数据
                    this._del_target_bind_data(target, {
                        monitor: del_as[0],
                        target: value_,
                        key: key_
                    });
                }
            } else if (callback_f) {
                let index_n: number;
                while (true) {
                    index_n = bind_data.monitor_as.findIndex((v2) => v2.on_callback_f === callback_f);
                    if (index_n === -1) {
                        return;
                    }
                    bind_data.monitor_as.splice(index_n, 1);
                }
            }
        }
    }

    /**
     * 清理对象绑定的数据
     * @param target_ 绑定对象
     * @returns
     */
    clear(target_: any): void {
        let target_bind_data = this._target_bind_data.get(target_);
        // 安检
        if (!target_ || !target_bind_data) {
            return;
        }
        // 清理监听数据
        if (target_bind_data.monitor_as) {
            let v: _monitor.target_bind_monitor_data;
            while (target_bind_data.monitor_as.length) {
                v = target_bind_data.monitor_as[0];
                this.off(v.target, v.key, v.monitor!.on_callback_f, v.monitor!.target);
            }
        }
    }

    /**
     * 启用 on 事件
     * @param target_ 绑定对象
     */
    enable(target_: any): void;
    /**
     * 启用 on 事件
     * @param value_ 监听对象
     * @param key_ 监听键
     * @param target_ 绑定对象
     */
    enable<VT, KT extends keyof VT>(value_: VT, key_: KT, target_?: any): void;
    /**
     * 启用 on 事件
     * @param value_ 监听对象
     * @param key_ 监听键
     * @param callback_f_ on 触发回调
     * @param target_ 绑定对象
     */
    enable<VT, KT extends keyof VT>(
        value_: VT,
        key_: KT,
        callback_f_: _monitor.type_on_callback<VT[KT]>,
        target_?: any
    ): void;
    enable<VT, KT extends keyof VT>(args_: VT, key_?: KT, args3_?: any, target_?: any): void {
        this._set_listener_state(true, args_, key_!, args3_, target_);
    }

    /**
     * 禁用 on 事件
     * @param target_ 绑定对象
     */
    disable(target_: any): void;
    /**
     * 禁用 on 事件
     * @param value_ 监听对象
     * @param key_ 监听键
     * @param target_ 绑定对象
     */
    disable<VT, KT extends keyof VT>(value_: VT, key_: KT, target_?: any): void;
    /**
     * 禁用 on 事件
     * @param value_ 监听对象
     * @param key_ 监听键
     * @param callback_f_ on 触发回调
     * @param target_ 绑定对象
     */
    disable<VT, KT extends keyof VT>(
        value_: VT,
        key_: KT,
        callback_f_: _monitor.type_on_callback<VT[KT]>,
        target_?: any
    ): void;
    disable<VT, KT extends keyof VT>(args_: VT, key_?: KT, args3_?: any, target_?: any): void {
        this._set_listener_state(true, args_, key_!, args3_, target_);
    }
}

export module monitor_ {
    /** 数据监听单元 */
    export class unit<DT> {
        /**
         * @param data_ 监听的数据
         * @param target_ 绑定对象，用于 clear 操作
         */
        constructor(data_: DT, target_?: any) {
            this._data = data_;
            this._target = target_ || this._target;
        }
        /** 监听的数据 */
        protected _data: DT;
        /** 绑定对象 */
        protected _target: any;
        /* ------------------------------- 功能 ------------------------------- */
        /**
         * 监听单次数据更新
         * @param key_ 数据键
         * @param callback_f_ 触发回调
         * @returns callback_f_ | null
         */
        on<KT extends keyof DT>(
            key_: KT,
            callback_f_: _monitor.type_on_callback<DT[KT]>
        ): _monitor.type_on_callback<DT[KT]> | null {
            return monitor.instance.on(this._data, key_, callback_f_, this._target);
        }

        /**
         * 监听单次数据更新
         * @param key_ 数据键
         * @param callback_f_ 触发回调
         * @returns callback_f_ | null
         */
        once<KT extends keyof DT>(
            key_: KT,
            callback_f_: _monitor.type_on_callback<DT[KT]>
        ): _monitor.type_on_callback<DT[KT]> | null {
            return monitor.instance.once(this._data, key_, callback_f_, this._target);
        }

        /**
         * 关闭监听数据更新
         * @param key_ 数据键
         * @param callback_f_ 触发回调
         */
        off<KT extends keyof DT>(key_: KT, callback_f_?: _monitor.type_on_callback<DT[KT]>): void {
            if (callback_f_) {
                monitor.instance.off(this._data, key_, callback_f_, this._target);
            } else {
                monitor.instance.off(this._data, key_, this._target);
            }
        }

        /**
         * 启用 on 事件
         * @param key_ 数据键
         * @param callback_f_ on 触发回调
         */
        enable<KT extends keyof DT>(key_: KT, callback_f_?: _monitor.type_on_callback<DT[KT]>): void {
            if (callback_f_) {
                monitor.instance.enable(this._data, key_, callback_f_, this._target);
            } else {
                monitor.instance.enable(this._data, key_, this._target);
            }
        }

        /**
         * 禁用 on 事件
         * @param key_ 数据键
         * @param callback_f_ on 触发回调
         */
        disable<KT extends keyof DT>(key_: KT, callback_f_?: _monitor.type_on_callback<DT[KT]>): void {
            if (callback_f_) {
                monitor.instance.disable(this._data, key_, callback_f_, this._target);
            } else {
                monitor.instance.disable(this._data, key_, this._target);
            }
        }

        /** 清理对象监听的所有数据 */
        clear(): void {
            monitor.instance.clear(this._target);
        }
    }
}

export default monitor.instance;
