import * as cc from 'cc';
import * as env from 'cc/env';

/**枚举扩展 */
class enum_extend {
    /**转换对象为枚举 */
    obj_to_enum(value_: any): any {
        let result: any = {};
        if (!value_) {
            return result;
        }
        Object.keys(value_).forEach((v_s, k_n) => {
            result[k_n] = v_s;
            result[v_s] = k_n;
        });
        return result;
    }

    /** 数组到枚举 */
    array_to_enum(value_as_: any[]): any {
        let result: any = {};
        if (!value_as_) {
            return result;
        }
        value_as_.forEach((v_s, k_n) => {
            result[k_n] = v_s;
            result[v_s] = k_n;
        });
        return result;
    }

    /** 数组到编辑器枚举 */
    array_to_cc_enum(value_as_: any[]): any {
        let result_as: {
            name: any;
            value: any;
        }[] = [];
        if (!value_as_) {
            return result_as;
        }
        value_as_.forEach((v_s, k_n) => {
            result_as.push({ name: v_s, value: k_n });
        });
        return result_as;
    }

    /**转换枚举编辑器枚举
     * - 用于 setClassAttr
     */
    enum_to_cc_enum(value_: any): {
        name: any;
        value: any;
    }[] {
        let result_as: {
            name: any;
            value: any;
        }[] = [];
        if (value_) {
            let cc_enum = cc.Enum(value_);
            Object.keys(cc_enum).forEach((v_s) => {
                result_as.push({ name: v_s, value: cc_enum[v_s] });
            });
        }
        return result_as;
    }
}

export default new enum_extend();
