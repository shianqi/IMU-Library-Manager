const request = require('request')
const baseUrl = 'http://202.207.7.180:8081/ClientWeb/pro/ajax'
const loginUrl = `${baseUrl}/login.aspx`
const resvUrl = `${baseUrl}/reserve.aspx`
// const deviceUrl = `${baseUrl}/device.aspx`
const jar = request.jar()
const headers = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Mobile Safari/537.36'
}

Date.prototype.Format = function (fmt) {
  var o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    'S': this.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (var k in o) { if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
  return fmt
}

/**
 * 登录
 * @param username
 * @param password
 * @returns {Promise}
 */
const login = function (username, password) {
  const option = {
    url: loginUrl,
    headers,
    jar,
    form: {
      act: 'login',
      id: username,
      pwd: password,
      role: '512',
      _nocache: new Date().valueOf()
    }
  }
  return new Promise((resolve, reject) => {
    request.get(option, (error, response, _data) => {
      const data = JSON.parse(_data)
      if (!error && response.statusCode === 200) {
        if (data.msg === 'ok') {
          console.log(new Date().toLocaleString(), '登录成功')
          resolve(data.data)
        } else {
          reject(new Error(`登录失败: ${data.msg}`))
        }
      } else {
        reject(error)
      }
    })
  })
}

/**
 * 注销
 * @returns {Promise}
 */
const logout = function () {
  const option = {
    url: loginUrl,
    headers,
    jar,
    form: {
      act: 'logout',
      _nocache: new Date().valueOf()
    }
  }
  return new Promise((resolve, reject) => {
    request.get(option, (error, response, _data) => {
      const data = JSON.parse(_data)
      if (!error && response.statusCode === 200) {
        if (data.msg === '操作成功！') {
          console.log(new Date().toLocaleString(), '注销成功')
          resolve(data)
        } else {
          reject(new Error(`注销失败: ${data.msg}`))
        }
      } else {
        reject(error)
      }
    })
  })
}

const checkResv = function () {
  const option = {
    url: resvUrl,
    headers,
    jar,
    form: {
      stat_flag: '9',
      act: 'get_my_resv',
      _nocache: new Date().valueOf()
    }
  }
  return new Promise((resolve, reject) => {
    request.get(option, (error, response, _data) => {
      const data = JSON.parse(_data)
      if (!error && response.statusCode === 200) {
        if (data.msg === 'ok') {
          console.log(new Date().toLocaleString(), '查询成功')
          resolve(data.data)
        } else {
          reject(new Error(`查询失败: ${data.msg}`))
        }
      } else {
        reject(error)
      }
    })
  })
}

/**
 * 预约座位
 * @returns {Promise}
 */
const setResv = function (dev_id, lab_id, _start, _end) {
  const start = _start.Format('yyyy-MM-dd hh:mm')
  const end = _end.Format('yyyy-MM-dd hh:mm')

  const option = {
    url: resvUrl,
    headers,
    jar,
    form: {
      dev_id,
      lab_id,
      start,
      end,
      room_id: '',
      kind_id: '100485579',
      type: 'dev',
      prop: '',
      test_id: '',
      resv_id: '',
      term: '',
      min_user: '',
      max_user: '',
      mb_list: '',
      test_name: '',
      memo: '',
      act: 'set_resv',
      _nocache: new Date().valueOf()
    }
  }

  return new Promise((resolve, reject) => {
    request.get(option, (error, response, _data) => {
      if (!error && response.statusCode === 200) {
        const data = JSON.parse(_data)
        if (data.msg === '操作成功！') {
          console.log(new Date().toLocaleString(), '预约成功', start, end)
          resolve(data)
        } else {
          reject(new Error(`预约失败: (${start} - ${end})${data.msg}`))
        }
      } else {
        reject(error)
      }
    })
  })
}

/**
 * 签到操作
 * @param dev_id
 * @param lab_id
 * @param resv_id
 * @returns {Promise}
 */
const signInResv = function (dev_id, lab_id, resv_id) {
  const option = {
    url: resvUrl,
    headers,
    jar,
    form: {
      act: 'resv_checkin',
      dev_id,
      lab_id,
      resv_id
    }
  }
  return new Promise((resolve, reject) => {
    request.get(option, (error, response, _data) => {
      if (!error && response.statusCode === 200) {
        const data = JSON.parse(_data)
        if (data.ret === 1 || data.msg === '您已签到，无需重复签到') {
          console.log(new Date().toLocaleString(), '签到成功')
          resolve(data.msg)
        } else {
          reject(data.msg)
        }
      } else {
        reject(error)
      }
    })
  })
}

/**
 * 签退操作
 * @param resv_id
 * @returns {Promise}
 */
const signOutResv = function (resv_id) {
  const option = {
    url: resvUrl,
    headers,
    jar,
    form: {
      act: 'resv_leave',
      type: '2',
      resv_id,
      _nocache: new Date().valueOf()
    }
  }
  return new Promise((resolve, reject) => {
    if (resv_id === '') {
      console.log(new Date().toLocaleString(), '不需签退')
      resolve()
      return
    }
    request.get(option, (error, response, _data) => {
      if (!error && response.statusCode === 200) {
        const data = JSON.parse(_data)
        console.log(new Date().toLocaleString(), data.msg)
        resolve()
      } else {
        reject(error)
      }
    })
  })
}

module.exports = {
  login,
  logout,
  checkResv,
  setResv,
  signInResv,
  signOutResv
}
