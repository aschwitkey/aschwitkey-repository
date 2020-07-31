# aschwitkey-repository
aschwitkey asch platform test
asch-frontend-2修改：
1、文件：src\utils\constants.js 
2、文件：src\utils\asch.js    
3、文件：src\utils\asch-v2.js  
4、文件：src\utils\api.js    
5、文件：src\store\actions.js
6、页面：src\pages\councilDetail.vue
7、src\i18n\zh\index.js

后台修改：
1、合约：src\contract\council.js
2、接口：src\interface\council.js
3、模型：src\model\council_transaction.js
4、src\model\council_vote.js
5、src\model\council_member.js

数据库修改：
---修改council_votes表中voter字段长度为250（投票人全部写在这里）,添加字段sign  int默认1（1：未生效，0：生效），添加字段type 默认0（0:添加成员;1:删除成员）
---council_transaction表添加字段signId varchar（250）
-- council_members 添加字段 status 状态为0 不可用

asch-core修改：
1、注册合约：node_modules\asch-core\src\runtime.js
2：asch-core/src/utils/calculate-fee.js
