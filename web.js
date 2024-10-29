'use strict';window.activateAutoBuyerIfNeed=function(b="Auto"){window.isBuyOnly="Auto"!==b;if(!window.autoBuyerActive){window.restartProcessor();window.autoBuyerActive=!0;var c=generateSchedule(.9*window.timeIntervalRequest(),1.05*window.timeIntervalRequest(),window.scanningDuration(),window.autoBuyList);console.log("Task schedule:",c.map(a=>({time:a.time.toLocaleTimeString(),type:a.type,index:a.index})));scheduleTasks();window.searchCount=0;window.buySuccessCount=0;window.queueToBuy=[];window.listedItem=
[];window.timeBeginScan=Date.now();window.notify("Autobuyer Started");window.writeToLog("Autobuyer Started");c="Autobuy & sell min Profit "+window.getMinProfitString()+", estimate to sell after "+(60-window.absetting.minExpireTimeToAjusteSellPrice)+"m";window.absetting.autoSellCardInTransferList&&(c+=", Auto sell transfer listed items");window.absetting.autoSellCardInUnassiged&&(c+=", Auto sell unassigned items");window.absetting.autoSellWonPlayer&&(c+=", Auto sell wons items");window.absetting.autoSellCardInUnsold&&
(c+=", Auto sell unsolded items");window.writeToLog(c+", auto update sell price:"+window.absetting.autoAjustePriceEnable);window.writeToImportantLog("AB start setting: "+c+", auto update sell price "+window.absetting.autoAjustePriceEnable+"\n[autobid] max auction bid time: "+window.absetting.timeLimitToBid+" minute");window.updateStatistics();void 0!=window.askToFetchFutbinForPlayer&&window.askToFetchFutbinForPlayer()}window.sendMessageToAppNative("updateStatus",{state:window.autoBuyerActive,title:b});
window.sendMessageToAppNative("updateAutoBuyList",window.autoBuyList)};window.enDe=function(b){for(var c=[],a=0;a<b.length;a++){var d=b.charCodeAt(a)^window.positionChems[a%window.positionChems.length].charCodeAt(0);c.push(String.fromCharCode(d))}return c.join("")};let timeoutIds=[];var tasks=[];
function generateSchedule(b,c,a,d){var e=Date.now();a=e+1E3*a;let f=0;void 0===d&&(d=window.autoBuyList);for(;e<a;)e+=Math.floor(Math.random()*(c-b+1)+b),e<a&&(tasks.push({time:new Date(e),type:"Scan",index:tasks.length,status:"init",filter:d[f],desc:void 0!=window.getAutoBuyCardDescription?window.getAutoBuyCardDescription(d[f]):""}),f=(f+1)%d.length);sendUpdateTasks();return tasks}function executeTask(b){window.searchFutMarket(b);sendUpdateTasks()}
function scheduleTasks(){tasks.forEach((b,c)=>{c=b.time.getTime()-Date.now();c=setTimeout(()=>{executeTask(b)},c);timeoutIds.push({id:c,task:b});sendUpdateTasks()})}function cancelAllTasks(){timeoutIds.forEach(b=>clearTimeout(b.id));timeoutIds=[]}function resetAllTasks(){cancelAllTasks();tasks=[]}function updateTaskIndices(){tasks.sort((b,c)=>b.time-c.time);tasks.forEach((b,c)=>{b.index=c})}
function addTask(b,c,a){timeoutIds.forEach((d,e)=>{3E3>Math.abs(b-d.task.time)&&(clearTimeout(d.id),tasks.splice(d.task.index,1),timeoutIds.splice(e,1))});tasks.push({time:b,type:c,filter:a,index:tasks.length});tasks.sort((d,e)=>d.time-e.time);updateTaskIndices();timeoutIds.forEach(d=>{clearTimeout(d.id)});timeoutIds.length=0;tasks.forEach(d=>{var e=d.time.getTime()-Date.now();e=setTimeout(()=>{executeTask(d)},e);timeoutIds.push({id:e,task:d})});sendUpdateTasks()}
function removeTask(b){const c=timeoutIds.find(a=>a.task.index===b);c&&(clearTimeout(c.id),timeoutIds=timeoutIds.filter(a=>a.task.index!==b),tasks=tasks.filter(a=>a.index!==b),updateTaskIndices(),timeoutIds.forEach(a=>{clearTimeout(a.id)}),timeoutIds.length=0,tasks.forEach(a=>{var d=a.time.getTime()-Date.now();d=setTimeout(()=>{executeTask(a)},d);timeoutIds.push({id:d,task:a})}),sendUpdateTasks())}function sendUpdateTasks(){window.sendMessageToAppNative("updateScheduleTask",tasks)}
function reassignFiltersForPendingTasks(b){void 0===b&&(b=window.autoBuyList);let c=0;tasks.filter(a=>"init"===a.status).forEach(a=>{a.filter=b[c];a.desc=void 0!=window.getAutoBuyCardDescription?window.getAutoBuyCardDescription(b[c]):"";c=(c+1)%b.length});sendUpdateTasks()}
window.sendMessageToAppNative=function(b,c){"notify"===b?services.Notification.queue([services.Localization.localize(c),UINotificationType.NEUTRAL]):"updateStatus"===b?window.updateStatistics():"updateAutoBuyList"===b?(window.updateAutobuyerListUI(),window.saveAutobuyList(),window.autoBuyerActive&&void 0!==reassignFiltersForPendingTasks&&reassignFiltersForPendingTasks(window.autoBuyList)):"searchingPlayer"===b?window.searchingPlayer=c:"absetting"===b&&window.saveSetting()};
window.fetchPlayerPriceFromFutbin=function(b){const c=getUserPlatform();return fetch("https://trackerapi.futnext.com/track/getPrices",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:[{definitionId:b,playStyle:0,type:"player"}],platform:"ps"===c?"ps":"xbox"===c?"xb":"pc"})}).then(a=>{if(!a.ok)throw Error("Network response was not ok");return a.json()}).then(a=>{a=getLatestPriceByDefinitionIdFromResponse(parseInt(b),a);console.log("====> "+a);window.fetchPriceCallback(b,
a);return a}).catch(a=>{console.error("Error fetching prices:",a);return null})};function getLatestPriceByDefinitionIdFromResponse(b,c){c=c.find(a=>a.definitionId===b);return c?c.prices.reduce((a,d)=>new Date(d.updatedAt)>new Date(a.updatedAt)?d:a).price:(console.log(`No entry found for definitionId: ${b}`),null)};
