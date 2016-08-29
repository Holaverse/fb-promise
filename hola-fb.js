/* file: hola-fb.js
 *
 * brief: facebook javascript sdk wrapper
 *
 * author: johnny <johnny.yin@holaverse.com>
 *
 * created: 2016.8.18
 *
 */

/*
 * @class HolaFB
 * Facebook javascript sdk 封装。
 *
 */
var HolaFB = function() {
};


HolaFB.FRIEND_SHARE = 0;
HolaFB.FRIEND_NONIFICATIONS = 1;
HolaFB.FRIEND_REQUEST = 2;
HolaFB.FRIEND_SCORE = 3;

HolaFB.friendCache = {
  me: {},
  user: {},
  permissions: [],
  friends: [],
  invitable_friends: [],
  apprequests: [],
  scores: [],
  games: [],
  reRequests: {}
};

/*
 * @method setServerUrl
 * 设置项目url地址
 * @param {String} url
 *
 */
HolaFB.prototype.setServerUrl = function(url) {
  this.server_url = url;
}

/*
 * @method setAppNamespace
 * 设置项目在facebook的命名空间，设置之后，应用在facebook的url为//www.facebook.com/appcenter/<name>
 * @param {String} name 项目名称
 */
HolaFB.prototype.setAppNamespace = function(name) {
  this.appNamespace = name;
  this.appCenterURL = '//www.facebook.com/appcenter/' + name;
} 

HolaFB.prototype._getFriendCacheData = function(endpoint, options) {
  if(endpoint) {
    var url = '/';
    if(endpoint == 'me') {
      url += endpoint;
    } else if(endpoint == 'scores') {
      url += this.appId + '/' + endpoint;
    } else {
      url += 'me/' + endpoint;
    }
    return new Promise(function(resolve, reject) {
        FB.api(url, options, function(response) {
          if( !response.error ) {
            HolaFB.friendCache[endpoint] = response.data ? response.data : response;
            resolve(response);
          } else {
            reject('getFriendCacheData', endpoint, response);
          }
        });
    });
  } else {
    var that = this;
    return that.getMe()
      .then(function() {
        return that.getPermissions();
      })
      .then(function() {
        return that.getFriends();
      })
      .then(function() {
        return that.getInvitableFriends();
      })
      .then(function() {
        return that.getScores();
      });
  }
};

/*
 * @method init
 * 初始化Facebook javascript sdk
 * @param {Object} options 初始化选项
 * options.version sdk api版本号
 * options.appId facebook项目编号
 *
 */
HolaFB.prototype.init = function(options) {
  if(!options || !options.appId) {
    throw new Error('no app id');
  }
  if(!options.version) {
    throw new Error('no sdk version');
  }
  
  this.appId = options.appId;
  FB.init({
    appId      : options.appId,
    frictionlessRequests: true,
    status: true,
    version    : options.version || 'v2.7'
  });

  FB.Canvas.setDoneLoading();
  
  this.subscribe('auth.authResponseChange', this._onAuthResponseChange.bind(this));
  this.subscribe('auth.statusChange', this._onStatusChange.bind(this));
};

/*
 * @method getLoginStatus 
 * 获取登陆状态
 * @return {Promise} Promise对象
 */
HolaFB.prototype.getLoginStatus = function() {
  return new Promise(function(resolve, reject) {
    FB.getLoginStatus(function(response) {
      resolve(response);
    });
  }); 
};

/*
 * @method getMe
 * 获取登陆者个人信息
 * @param {Object} options 信息选项
 * @return {Promise} Promise对象
 */
HolaFB.prototype.getMe = function(options) {
  var that = this;
  options = options || {fields: 'id,name,first_name,picture.width(120).height(120)'};

  return new Promise(function(resolve, reject) {
    that._getFriendCacheData('me', options)
    .then(function(response) {
      resolve(response);
    }).catch(function(error) {
      reject(error);
    });
  });
};

/*
 * @method getPermissions
 * 获取应用权限
 * @return {Promise} Promise对象
 */
HolaFB.prototype.getPermissions = function() {
  var that = this;
  return new Promise(function(resolve, reject) {
    that._getFriendCacheData('permissions')
    .then(function(response) {
      resolve(response);
    }).catch(function(error) {
      reject(error);
    });
  });
};

/*
 * @method hasPermission
 * 查询是否拥有某个应用权限
 * @param {String} permission 权限字符串
 * @return {Boolean} 是否拥有某个应用权限 
 */
HolaFB.prototype.hasPermission = function(permission) {
  var friendCache = HolaFB.friendCache;
  for( var i in friendCache.permissions ) {
    if(
      friendCache.permissions[i].permission == permission
      && friendCache.permissions[i].status == 'granted' )
      return true;
  }
  return false;
};

/*
 * @method getFriends
 * 获取已安装应用的好友列表
 * @param {Object} options 列表选项 
 * @return {Promise} Promise对象 
 */
HolaFB.prototype.getFriends = function(options) {
  var that = this;
  options = options || {fields: 'id,name,first_name,picture.width(120).height(120)',limit: 8};
  return new Promise(function(resolve, reject) {
    that._getFriendCacheData('friends', options)
    .then(function(response) {
      resolve(response);
    })
    .catch(function(error) {
      reject(error);
    });
  });
};

/*
 * @method getInvitableFriends
 * 获取未安装应用的好友列表
 * @param {Object} options 列表选项 
 * @return {Promise} Promise对象 
 */
HolaFB.prototype.getInvitableFriends = function(options) {
  var that = this;
  options = options || {fields: 'name,first_name,picture',limit: 8};
  return new Promise(function(resolve, reject) {
    that._getFriendCacheData('invitable_friends', options)
    .then(function(response) {
      resolve(response);
    })
    .catch(function(error) {
      reject(error);
    });
  });
};

/*
 * @method getScores
 * 获取好友分数排行榜
 * @param {Object} options 列表选项 
 * @return {Promise} Promise对象 
 */
HolaFB.prototype.getScores = function(options) {
  var that = this;
  options = options || {fields: 'score,user.fields(first_name,name,picture.width(120).height(120))'};
  return new Promise(function(resolve, reject) {
    that._getFriendCacheData('scores', options)
    .then(function(response) {
      resolve(response);
    })
    .catch(function(error) {
      reject(error);  
    });
  }); 
};

/*
 * @method login 
 * 用户登陆
 * @param {Object} options 登陆选项 
 * @return {Promise} Promise对象 
 */
HolaFB.prototype.login = function(options) {
  return new Promise(function(resolve, reject) {
      FB.login(function(response){
        resolve(response);
      }, options);
  });
};

/*
 * @method logout
 * 用户登出
 */
HolaFB.prototype.logout = FB.logout;

/*
 * @method share
 * 调起分享对话框
 */
HolaFB.prototype.share = function() {
  return new Promise(function(resolve, reject) {
    FB.ui({
      method: 'share',
      href: 'http://apps.facebook.com/' + this.appNamespace + '/share.php'
    }, function(response){
      resolve(response);
    });
  });
};

HolaFB.prototype.like = function() {
  return new Promise(function(resolve, reject) {
    FB.api(
      '/me/og.likes',
      'post', 
      {
        object: 'http://techcrunch.com/2013/02/06/facebook-launches-developers-live-video-channel-to-keep-its-developer-ecosystem-up-to-date/',
        privacy: {'value': 'SELF'},
      },
      function(response){
        if(!response){
          reject('Error occured.');
        } else if(response.error) {
          reject('Error occured.' + response.error);
        } else {
          resolve(response);
        }
      }
    );
  });
}

/*
 * @method feed
 * 调起动态发布对话框
 * @param {Object} options 发布选项
 * options.link 链接
 * options.caption 标题
 * @return {Promise} Promise对象
 */
HolaFB.prototype.feed = function(options) {
  options = options || {};
  options.method = 'feed';
  return new Promise(function(resolve, reject) {
    FB.ui(options, function(response){
      if(!response || response.error){
        reject(response ? response.error : "feed failed");
      } else {
        resolve(response);
      }
    });
  });
}

/*
 * @method apiFeed
 * 静默分享
 * @param {Object} options 分享选项
 * 选项配置参考https://developers.facebook.com/docs/graph-api/reference/v2.7/user/feed
 * @return {Promise} Promise对象
 */
HolaFB.prototype.apiFeed = function(options) {
  var to = options.to || 'me';
  return new Promise(function(resolve, reject) {
    FB.api(
      to + "/feed",
      "POST",
      {
        "message": option.message || "",
        "link": option.link || "",
        "caption": option.caption || "",
        "picture": option.picture || "" 
      }, function(response){
      if(!response || response.error){
        reject(response ? response.error : "feed failed");
      } else {
        resolve(response);
      }
    });
  });
}

/* 
 * @method send
 * 调起发送对话框,发送消息到对方的聊天对话框
 *
 * @param {String} url 需要分享的链接
 *
 * @return {Promise} Promise对象 
 */
HolaFB.prototype.send = function(url) {
  return new Promise(function(resolve, reject) {
    FB.ui({
      method: 'send',
      link: url,
    }, function(response) {
      if(!response || response.error){
        reject(response ? response.error : "feed failed");
      } else {
        resolve(response);
      }
    });
  });
}

/*
 * @method sendNotification
 * 向某用户发送一条通知
 * @parem {String} to 必填，目标用户的user id，不能是自己
 * @param {options} 通知选项
 * options.template {String} 必填，通知文字描述
 * options.href 目标链接
 * 选项配置参考 https://developers.facebook.com/docs/games/services/appnotifications
 * @return Promise对象
 */
HolaFB.prototype.sendNotification = function(to, options) {
  if(!options || !to || !options.template){
    throw new Error("invalid parameter");
  }
  
  return new Promise(function(resolve, reject) {
    FB.api(
      '/' + to + '/notifications',
      'POST',
      options,
      function(response) {
        if(!response || response.error){
          reject(response ? response.error : 'send notification failed')
        } else {
          resolve(response);
        }
      }
    )
  });
}

/*
HolaFB.prototype.sendBrag = function(caption, name, picture) {
  return new Promise(function(resolve, reject) {
    FB.ui({ method: 'feed',
      caption: caption,
      picture: picture,
      name: name || 'Checkout my greatness game!'
    }, function() {
      resolve();
    });
  });
};
*/

/*
 * @method sendScore
 * 发送分数，只有超过最高分才会被resolve,否则被reject
 * @param {Number} score 分数
 *
 * @return Promise对象
 */
HolaFB.prototype.sendScore = function(score) {
  return new Promise(function(resolve, reject) {
    // Check current score, post new one only if it's higher
    FB.api('/me/scores', function(response) {
      // Score will be returned in a JSON array with 1 element. Refer to the Graph
      // API documentation below for more information:
      // https://developers.facebook.com/docs/graph-api/reference/app/scores
      if( response.data &&
        response.data[0] &&
        response.data[0].score >= score ) {
        reject('Lower score not posted to Facebook', score, response);
      }
      else {
        FB.api('/me/scores', 'post', { score: score }, function(response) {
          if( response.error ) {
            reject('sendScore failed', score, response);
          } else {
            resolve();
          }
        });
      }
    });
  });
}

/*
 * 调起挑战对话框
 * @param {String} to 被挑战者user id
 * @param {String} message 挑战信息
 * @param {Boolean} turn 回合制游戏
 *
 * @return {Promise} Promise对象
 */
HolaFB.prototype.sendChallenge = function(to, message, turn) {
  var options = {
    method: 'apprequests'
  };
  if(to) options.to = to;
  if(message) options.message = message;
  if(turn) options.action_type = 'turn';
  return new Promise(function(resolve, reject) {
    FB.ui(options, function(response) {
      resolve(response);
    });
  });
}

/*
 * @method apiAppRequests
 * 游戏请求
 * @param {String} to 被请求者user id
 * @param: {option}
 * option.action_type: enum{SEND, ASKFOR, TURN, GIFT, INVITE, RECOMMEND}, 请求对象类型
 * option.data: {String}, 作为请求对象的补充信息，最长255字节
 * option.from: {String}, 发送者ID
 * option.message: {String}, 必填,请求的信息
 * option.object_id {String}, 开放图谱对象ID
 *
 * @return {Promise} Promise对象
 * 参考https://developers.facebook.com/docs/graph-api/reference/user/apprequests/
 *
 */
HolaFB.prototype.apiAppRequests = function(to, option) {
  if(!to || !option) {
    throw new Error("invalid param");
  }
  if(option.action_type) {
    var at = option.action_type.toLowerCase();
    if((at == "send" || at == "askfor") && !option.object_id){
      throw new Error("invalid param, object_id needed");
    }
  }
  return new Promise(function(resolve, reject){
    FB.api(
    "/" + to + "/apprequests",
    option,
    function(response){
      if (response && !response.error){
        resolve(response);
      } else {
        reject();
      }
    });
  });
}

/*
 * @method apiChallenge
 * 通过图谱API发送挑战
 * @param {String} to 被挑战者user id
 * @param {String} message 挑战信息
 * @param {Boolean} turn 是否回合制游戏
 *
 * @return {Promise} Promise对象
 */
HolaFB.prototype.apiChallenge = function(to, message, turn) {
  var options = {};
  if(message) options.message = message;
  if(turn) options.action_type = 'turn';
  
  return this.apiAppRequests(to, options);
}

/*
 * @method apiInvite
 * 通过图谱API发送邀请
 * @param {to} 被邀请者user id
 * @param {message} 邀请信息
 *
 * @return {Promise} Promise对象
 */
//TODO
HolaFB.prototype.apiInvite = function(to, message) {
  var options = {};
  if(message) options.message = message;
  options.action_type = "invite";
  
  return this.apiAppRequests(to, options); 
}

/*
 * @method apiRecommend
 * 通过图谱API发送推荐
 * @param {String} to 被推荐者user id
 * @param {String} message 推荐信息 
 *
 * @return {Promise} Promise对象
 */
HolaFB.prototype.apiRecommend = function(to, message) {
  var options = {};
  if(message) options.message = message;
  options.action_type = "recommend";

  return this.apiAppRequests(to, options);
}

/*
 * @method getRequestInfo 
 * 获取游戏请求信息
 * @param {String} id apiAppRequests的promise中返回的request id 
 *
 * @return {Promise} Promise对象
 */
HolaFB.prototype.getRequestInfo = function(id){
  return new Promise(function(resolve, reject) {
    FB.api(String(id), {fields: 'from{id,name,picture}' }, function(response){
      if( response.error ) {
        reject(response.error);
        return;
      }
      resolve(response);
    });
  });
}

/*
 * @method deleteRequest
 * 删除游戏请求
 * @param {String} id apiAppRequests的promise中返回的request id 
 * @param {Function} 删除后的回调函数
 *
 * @return {Promise} Promise对象
 */
HolaFB.prototype.deleteRequest = function(id, callback) {
  return new Promise(function(resolve, reject) {
    FB.api(String(id), 'delete', function(response){
      if( response.error ) {
        rejecgt(response.error)
        return;
      }
      resolve(response);
    });
  });
}

//achievement
HolaFB.prototype.registerAchievement = function(id) {
  return new Promise(function(resolve, reject) {
    if(!id || typeof id !== 'string'){
      reject('invalid achievement id');
    }
  });
}

HolaFB.prototype.sendAchivement = function(id) {
  return new Promise(function(resolve, reject) {
    if(!id || typeof id !== 'string'){
      reject('invalid achievement id');
    }
    FB.api(
      "/me/achievements",
      "POST",
      {
        "achievement": id
      },
      function (response) {
        if (response && !response.error) {
          resolve(response);
          return;
        }
        reject(response && response.error);
      });
  });
}

HolaFB.prototype.getMyAchievement = function() {
  return new Promise(function(resolve, reject) {
    FB.api(
    "/me/achievements",
    function (response) {
      if (response && !response.error) {
          resolve(response);
          return;
      }
      reject(response && response.error);
    });
  });
}

/////////////////////////////////////////
//core
HolaFB.prototype.subscribe = function(id, callback) {
  FB.Event.subscribe(id, callback);
};

/////////////////////////////////////////
//canvas
HolaFB.prototype.setUrlHandler = function(handler) {
  FB.Canvas.setUrlHandler(handler);
};

////////////////////////////////////////
//private callback
HolaFB.prototype._onAuthResponseChange = function(response) {
  console.log('_onAuthResponseChange', response);
  if( response.status == 'connected' ) {
    this.getPermissions();
  }
}

HolaFB.prototype._onStatusChange = function(response) {
  console.log('_onStatusChange', response);
  if( response.status != 'connected' ) {
    this.login();
  } else {
  }
}

/////////////////////////////////////////
//app events
HolaFB.prototype.logEvent = function(eventName, valueToSum, parameters) {
  return FB.AppEvents.logEvent(events, valueToSum, parameters);
  
}

HolaFB.prototype.logPurchase = function(purcaseAmount, currency, parameters) {
  return FB.AppEvents.logPurchase(purcaseAmount, currency, parameters);
}

window.holaFB = new HolaFB;

