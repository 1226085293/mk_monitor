const global = {
    /** 头像库 */
    head_lib_ss: [
        'https://img1.baidu.com/it/u=3107752453,3630844014&fm=253&fmt=auto&app=120&f=JPEG?w=200&h=200',
        'https://img1.baidu.com/it/u=3750785065,4010327991&fm=253&fmt=auto&app=138&f=JPEG?w=300&h=300'
    ],
    player: {
        nick_s: '默认昵称',
        head_s: 'https://img0.baidu.com/it/u=1356523179,1772235027&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
        gold_n: 100
    }
};

// 调试接口
(self as any)['mk_global'] = global;
export default global;
