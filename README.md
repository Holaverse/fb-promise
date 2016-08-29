# fb-promise

# Usage
```javascript
holaFB.init({version: "v2.7", appId:"xxxxxxxxxxxxxx"});
holaFB.login()
.then(function(resp) {
  return holaFB.getInvitableFriends();
})
.catch(function(err) {
  console.log(err);
})
```
# API
### 设置项目url地址
HolaFB.prototype.setServerUrl(url)

### 设置项目在facebook的命名空间，设置之后，应用在facebook的url为//www.facebook.com/appcenter/<name>
HolaFB.prototype.setAppNamespace(name)

### 初始化Facebook javascript sdk
HolaFB.prototype.init(options)

### 获取登陆状态
HolaFB.prototype.getLoginStatus()

### 获取登陆者个人信息
HolaFB.prototype.getMe(options)

### 获取应用权限
HolaFB.prototype.getPermissions()

### 查询是否拥有某个应用权限
HolaFB.prototype.hasPermission(permission)

### 获取已安装应用的好友列表
HolaFB.prototype.getFriends(options)

### 获取未安装应用的好友列表
HolaFB.prototype.getInvitableFriends(options)

### 获取好友分数排行榜
HolaFB.prototype.getScores(options)

### 用户登陆
HolaFB.prototype.login(options)

### 用户登出
HolaFB.prototype.logout()

### 调起分享对话框
HolaFB.prototype.share()

### 调起动态发布对话框
HolaFB.prototype.feed(options)

### 静默分享
HolaFB.prototype.apiFeed(options)

### 调起发送对话框,发送消息到对方的聊天对话框
HolaFB.prototype.send(url)

### 向某用户发送一条通知
HolaFB.prototype.sendNotification(to, options)

### 发送分数，只有超过最高分才会被resolve,否则被reject
HolaFB.prototype.sendScore(score)

### 调起挑战对话框
HolaFB.prototype.sendChallenge(to, message, turn)

### 游戏请求
HolaFB.prototype.apiAppRequests(to, options)

### 通过图谱API发送挑战
HolaFB.prototype.apiChallenge(to, message, turn)

### 通过图谱API发送邀请
HolaFB.prototype.apiInvite(to, message)

### 通过图谱API发送推荐
HolaFB.prototype.apiRecommend(to, message)

### 获取游戏请求信息
HolaFB.prototype.getRequestInfo(id) 

### 删除游戏请求
HolaFB.prototype.deleteRequest(id, callback)

### 调起发送对话框,发送消息到对方的聊天对话框
HolaFB.prototype.send(url) 

