import * as cc from 'cc';
import monitor from '../monitor';
const { ccclass, property } = cc._decorator;
import { monitor_trigger_ } from '../monitor_trigger';

export module 默认 {
    /** 初始化数据 */
    class array_init_config {
        constructor(init_?: array_init_config) {
            Object.assign(this, init_);
        }
        root!: cc.Node;
        item!: cc.Node;
        /** item 更新函数 */
        item_update_f?: (
            /** item 节点 */
            node: cc.Node,
            /** item 对应数据 */
            data: any
        ) => void;
        /** 回收 item */
        recycle_b? = true;
    }

    class array_extend<T> extends Array<T> {
        private _init_data!: array_init_config;
        /**任务数组 */
        private _task_fs: (() => void)[] = [];
        /**任务执行状态 */
        private _task_run_b = false;
        /* ------------------------------- 功能 ------------------------------- */
        /**添加任务 */
        private async _add_task(task_f_: () => void): Promise<void> {
            if (!this._init_data) {
                console.error('初始化未完成');
                return;
            }
            this._task_fs.push(task_f_);
            if (!this._task_run_b) {
                this._task_run_b = true;
                while (this._task_fs.length) {
                    await this._task_fs.shift()!();
                }
                this._task_run_b = false;
            }
        }

        /**绑定 */
        private _bind(start_n_: number, end_n_: number): void {
            if (this.length < end_n_) {
                console.error('参数错误');
                return;
            }
            for (let k_n = start_n_; k_n < end_n_; ++k_n) {
                // 下标监听修改
                monitor.on(this, k_n, (value) => {
                    this._add_task(async () => {
                        this._init_data.item_update_f?.(this._init_data.root.children[k_n], value);
                    });
                });
            }
        }

        /**解绑 */
        private _unbind(start_n_: number, end_n_: number): void {
            if (this.length < end_n_) {
                console.error('参数错误');
                return;
            }
            for (let k_n = start_n_; k_n < end_n_; ++k_n) {
                monitor.off(this, k_n);
            }
        }

        /**初始化 */
        init(init_: array_init_config): void {
            this._init_data = new array_init_config(init_);
        }

        /**销毁 */
        destroy(): PromiseLike<void> {
            this._task_fs = [];
            return new Promise<void>((resolve_f) => {
                this._add_task(() => {
                    this._init_data.root.destroyAllChildren();
                    this._init_data.root.removeAllChildren();
                    resolve_f();
                });
            });
        }

        push(...args_as_: any[]): number {
            let result_n: number = super.push(...args_as_);
            this._bind(result_n - args_as_.length, result_n);
            /** 备份数据 */
            let backup_as: any[] = args_as_.slice();
            this._add_task(async () => {
                let node: cc.Node;
                backup_as.forEach((v) => {
                    node = cc.instantiate(this._init_data.item);
                    this._init_data.root.addChild(node);
                    // 初始化视图
                    this._init_data.item_update_f?.(node, v);
                });
            });
            return result_n;
        }

        pop() {
            this._unbind(this.length - 1, this.length);
            this._add_task(async () => {
                let node = this._init_data.root.children[this._init_data.root.children.length - 1];
                node.destroy();
                node.removeFromParent();
            });
            return super.pop();
        }

        shift() {
            this._unbind(0, 1);
            this._add_task(async () => {
                let node = this._init_data.root.children[0];
                node.destroy();
                node.removeFromParent();
            });
            return super.shift();
        }

        unshift(...args_as_: any[]): number {
            let result_n: number = super.unshift(...args_as_);
            this._bind(0, args_as_.length);
            /** 备份数据 */
            let backup_as: any[] = args_as_.slice();
            this._add_task(async () => {
                let node: cc.Node;
                for (let k_n = backup_as.length; k_n--; ) {
                    node = cc.instantiate(this._init_data.item);
                    this._init_data.root.addChild(node);
                    node.setSiblingIndex(0);
                    // 初始化视图
                    this._init_data.item_update_f?.(node, backup_as[k_n]);
                }
            });
            return result_n;
        }

        sort(compare_f_: (va: any, vb: any) => number): any {
            let temp_as = (this as any[]).reduce((pre, curr, k_n) => {
                pre.push({ index_n: k_n, data: curr });
                return pre;
            }, []);
            temp_as.sort((va: typeof temp_as[0], vb: typeof temp_as[0]) => compare_f_(va.data, vb.data));
            this._add_task(() => {
                let old_children_as = this._init_data.root.children.slice();
                temp_as.forEach((v, k_n) => {
                    old_children_as[v.index_n].setSiblingIndex(k_n);
                });
            });
            return super.sort(compare_f_);
        }

        splice(start_n_: number, count_n_?: number, ...args_as_: any[]) {
            let count_n = count_n_ ?? 0;
            this._unbind(start_n_, start_n_ + count_n);
            /** 备份数据 */
            let backup_as: any[];
            let result_as: any[];
            if (args_as_?.length) {
                result_as = super.splice(start_n_, count_n_!, ...args_as_);
                this._bind(start_n_, args_as_.length);
                backup_as = args_as_.slice();
            }
            this._add_task(async () => {
                // 删除
                {
                    let remove_as = this._init_data.root.children.slice(start_n_, start_n_ + count_n);
                    for (let v of remove_as) {
                        v.destroy();
                        v.removeFromParent();
                    }
                }
                // 添加
                if (backup_as) {
                    let node: cc.Node;
                    for (let k_n = 0; k_n < backup_as.length; ++k_n) {
                        node = cc.instantiate(this._init_data.item);
                        this._init_data.root.addChild(node);
                        node.setSiblingIndex(start_n_ + k_n);
                        // 初始化视图
                        this._init_data.item_update_f?.(node, backup_as[k_n]);
                    }
                }
            });
            return result_as!;
        }
    }

    @ccclass('data_method_array_common')
    export class ccclass_params extends monitor_trigger_.event_param {
        @property({ displayName: '回收 item' })
        recycle_b = true;

        @property({ displayName: '子节点更新事件', type: cc.EventHandler })
        event_child_update: cc.EventHandler = null!;
    }

    export function on<VT, KT extends keyof VT>(target_: VT, key_: KT, node_: cc.Node, params_: ccclass_params): void {
        if (!node_.children.length!) {
            console.error('不存在子节点');
            return;
        }
        /** 原数组 */
        let old_array_as = target_[key_];
        /** 当前数组 */
        let array_as = new array_extend<any>();
        /** item节点 */
        let item_node = node_.children[0]!;

        // 初始化
        {
            // 初始化数据
            target_[key_] = array_as as any;
            array_as.init({
                root: node_,
                item: item_node,
                item_update_f: (node, data) => {
                    params_.event_child_update.emit([node, data]);
                },
                recycle_b: params_.recycle_b
            });
            // 初始化视图
            item_node.removeFromParent();
        }
        // 监听
        monitor
            .on(
                target_,
                key_,
                (value: any) => {
                    array_as.splice(0, array_as.length, ...value);
                },
                async () => {
                    // 还原数组
                    target_[key_] = [...(target_[key_] as any)] as any;
                    // 还原子节点
                    await array_as.destroy();
                    node_.addChild(item_node);
                },
                target_
            )
            ?.call(target_, old_array_as);
    }
}
