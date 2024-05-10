export const isValidString = (s) => {
  return typeof s === 'string' && s.length > 0
}

export const isPositiveInter = (s) => {
  // 判断一个数是不是大于等于零的正整数
  return typeof s === 'number' && s >= 0 && s % 1 === 0
}

export const isUndefined = s => typeof s === 'undefined'