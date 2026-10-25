//获取随机节点id
export function getRandNodeId(){
  //前缀node_ + 时间戳 + 4位随机数
  return `node_${new Date().getTime()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
}

//重载所有的节点id
export function reloadNodeId(nodes){
  if(Array.isArray(nodes)){
    nodes.forEach(node => {
      if (node.type === 'GATEWAY'){
        //递归网关，网关id加上一个后缀
        node.id = getRandNodeId() + '_fork'
        //分支头部节点
        reloadNodeId(node.props.branch)
        //分支
        reloadNodeId(node.branch)
      }else {
        node.id = getRandNodeId()
      }
    })
  }else {
    nodes.id = getRandNodeId()
  }
}

