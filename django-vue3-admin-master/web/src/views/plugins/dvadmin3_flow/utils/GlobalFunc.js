import {getRandNodeId} from "./ProcessUtil";

export function generateStr(len) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


export function deepCopy(obj){
  return JSON.parse(JSON.stringify(obj))
}

export function delField(cols, i){
  cols.splice(i, 1)
}

export function copyField(cols, i){
  const col = deepCopy(cols[i])
  col.id = getRandNodeId()
  col.key = col.type + '_' + generateStr(8)
  cols.push(col)
}

export default {
  deepCopy
}
