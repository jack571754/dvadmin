/**
 * 需要创建新的节点，统一在本js内进行配置
 */
import {getRandNodeId} from "../../../utils/ProcessUtil";
import {defineAsyncComponent} from "vue";

const Nodes = import.meta.glob('./node/*.vue')
const NodeConfigs = import.meta.glob('./config/*.vue')

//批量导出所有的component下面的表单组件
export const NodeComponents = {}
Object.keys(Nodes).forEach((key) => {
  const name = key.replace(/^.+\/([^/]+)\.vue$/, '$1')
  NodeComponents[name] = defineAsyncComponent(Nodes[key])
})

export const NodeComponentConfigs = {}
Object.keys(NodeConfigs).forEach((key) => {
  const name = key.replace(/^.+\/([^/]+)\.vue$/, '$1')
  NodeComponentConfigs[name] = defineAsyncComponent(NodeConfigs[key])
})

const createGateway = (type) => {
  return {
    id: getRandNodeId() + '_fork',
    type: 'Gateway',
    name: '网关节点',
    parentId: null,
    childId: null,
    props: {
      type: type,
      branch: [
        //默认创建俩分支
        branchNode[type].createSelf(1),
        branchNode[type].createSelf()
      ]
    },
    branch: [[], []] //默认要创建2个空分支
  }
}

//定义分支子节点
const branchNode = {
  Exclusive: {
    name: '分支条件',
    icon: 'Share',
    color: '#1BB782',
    //创建自身
    createSelf(i) {
      return {
        id: getRandNodeId(),
        type: 'Exclusive',
        name: i ? '条件' + i : '默认条件',
        parentId: null,
        childId: null,
        props: {
          logic: true, //组关系
          groups: [ //组条件
            {
              logic: true, //组内条件关系
              conditions: []
            }
          ]
        },
      }
    },
    create() {
      return createGateway('Exclusive')
    }
  },
  // Parallel: {
  //   name: '并行分支',
  //   icon: 'Operation',
  //   color: '#718dff',
  //   //创建自身
  //   createSelf(i) {
  //     return {
  //       id: getRandNodeId(),
  //       type: 'Parallel',
  //       name: '并行路径' + (i ? i: 2),
  //       parentId: null,
  //       childId: null,
  //       props: {},
  //     }
  //   },
  //   create() {
  //     return createGateway('Parallel')
  //   }
  // },
}

//开始节点
const Start = {
  create() {
    return {
      id: 'node_root',
      type: 'Start',
      name: '发起人',
      parentId: null,
      childId: null,
      props: {},
    }
  }
}
//审批节点
const Approval = {
  name: '审批人',
  icon: 'Stamp',
  color: '#EF994F',
  create() {
    return {
      id: getRandNodeId(),
      type: 'Approval',
      name: '审批人',
      parentId: null,
      childId: null,
      props: {
        mode: 'USER', //审批方式：人工处理、自动通过、自动拒绝
        ruleType: 'ASSIGN_USER', //规则类型，用哪种审批规则
        taskMode: { //审批模式
          type: 'OR',
          percentage: 100,
        },
        needSign: false,
        assignUser: [], //指定人员
        rootSelect: {
          multiple: false, //是否多选
        },
        leader: { //部门负责人
          level: 1,
          emptySkip: false
        },
        leaderTop: {
          level: 0, //级数
          toEnd: false, //直到终点还是指定级别数
          emptySkip: false
        },
        assignDept: {
          dept: [], //指定的部门
          type: 'LEADER' //部门主管
        },
        assignRole: [],
        noUserHandler: { //无人时的处理规则
          type: 'TO_NEXT',
          assigned: []
        },
        sameRoot: {
          type: 'TO_SELF',
          assigned: []
        },
        timeout: { //超时处理
          enable: false,
          time: 1,
          timeUnit: 'M',
          type: 'TO_PASS', //自动通过
        },
        customFunction:''
      },
    }
  }
}

//抄送节点
const Cc = {
  name: '抄送人',
  icon: 'Promotion',
  color: '#5994F3',
  create() {
    return {
      id: getRandNodeId(),
      type: 'Cc',
      name: '抄送人',
      parentId: null,
      childId: null,
      props: {
        ruleType: 'ASSIGN_USER', //规则类型，用哪种抄送规则
        assignUser: [], //指定人员
        rootSelect: {
          multiple: false, //是否多选
        },
        assignDept: {
          dept: [], //指定的部门
          type: 'LEADER' //部门主管
        },
        assignRole: [],
      },
    }
  }
}

// 结束节点
const End = {
  create() {
    return {
      id: 'end_root',
      type: 'End',
      name: '结束节点',
      parentId: null,
      childId: null,
      props: {},
    }
  }
}

export default {
  //审批节点
  Approval: Approval,
  Cc: Cc,
  Start: Start,
  End:End,
  //注入分支节点定义
  ...branchNode,
}


