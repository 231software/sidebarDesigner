
//分离时，由于这个individualcontents和conf都是对象，直接把他们的相关声明拿到其他地方，然后在这里导入这两个对象就行
let conf=require("./config").conf;
let individualcontents=require("./playerdata").individualcontents;
let getIFromPref=require("./playerdata").getIFromPref;
let RefreshPrefIndexCache=require("./playerdata").RefreshPrefIndexCache;
let replace=require("./replacement");
let rollAniFrame=require("./rollAnimations");
let mainform=require("./ui").mainform;
let debugMode=false;

//指令注册
let maincmd = mc.newCommand("sidebar","自定义您的侧边栏",PermType.Any);
maincmd.setEnum("debug",["debug"])
maincmd.mandatory("debug",ParamType.Enum,"debug")
maincmd.overload();
maincmd.overload(["debug"])
maincmd.setCallback(function(cmd,origin,output,results){
	if(results.debug=="debug"){//切换debug，仅op可用
		if(origin.type==0){
			if(!origin.player.isOP()){
				origin.player.tell("请将当前帐号设置为服务器管理员后再执行此子命令")
				return;
			}
		}
		debugMode=!debugMode;log("切换debug模式");return;
	}
	mainform(origin.player);
})
maincmd.setup();

sendsidebar();



//玩家进服监听
//开启debug模式后不会初始化假人的信息，必须先开启debug后上线假人
mc.listen("onPreJoin",playerJoinExec);
mc.listen("onJoin",playerJoinExec);
function playerJoinExec(player){
	if(player.isSimulatedPlayer()&&debugMode==false){return;}//玩家是模拟玩家时直接跳过
	playerobjfortitle=player;
	individualcontents.reload()
	if(getIFromPref(player.uuid)==null){//找不到玩家的信息
		if(individualcontents.get(player.uuid)!=null){//在根目录中找到了未迁移玩家的信息
			//迁移玩家的信息，将来可以迁移到playerdata里面，当成一个方法来用
			log(`玩家${player.name}的数据未迁移！正在迁移该玩家的数据`);
			let write = individualcontents.get("data");
			write.push({
				uuid:player.uuid,
				name:individualcontents.get(player.uuid).name,
				display:individualcontents.get(player.uuid).display,
				display_title:true,
				contents:[]
			});
			individualcontents.get(player.uuid).contents.forEach((currentValue,index)=>{
				write[write.length-1].contents.push({
					title:currentValue.title,
					type:"text",
					display:currentValue.display,
					warp:currentValue.warp,
					animation:{
						type:"alt",
						contents:[]
					}
				})
				
				currentValue.contents.forEach((currentValue1)=>{
					write[write.length-1].contents[index].animation.contents.push({
						time:1,
						contents:currentValue1,
						color:currentValue.color
					});
				})
				
			})
			individualcontents.set("data",write);
			individualcontents.delete(player.uuid);	
			RefreshPrefIndexCache()
		}
		else{//玩家初次进服，初始化
			let write = individualcontents.get("data");
			write.push({ 
				uuid:player.uuid,
				name:player.name,
				display:true,
				contents:conf.get("default"),
				display_title:true
			});
			individualcontents.set("data",write);
			RefreshPrefIndexCache()			
		}
	
	}
}
//最后处理并发送侧边栏
async function sendsidebar(){
	let displaycontents = [];
	let frameorder=0;
	//性能测试
	let oldtime,newtime;
	
	setInterval(()=>{
		if(debugMode){oldtime=new Date().getTime()}//启动发送侧边栏线程计时起点
		let i,j;
		frameorder++;//frameorder过大可能会溢出
		let catchedcontents=individualcontents.get("data")
		//通过递归将压力分担到每刻上
		let onlineplayers=mc.getOnlinePlayers();
		send2Player(0)
		function send2Player(index){//优化建议：把getIFromPref缓存
			if(onlineplayers[index]==null){return;}
			setTimeout(()=>{send2Player(index+1);},60)
			let player=onlineplayers[index]
			if(player.isSimulatedPlayer()&&!debugMode){return;}//跳过假人，debug模式下此项无效
			let playerdata=catchedcontents[getIFromPref(player.uuid)];// playerdata: 玩家在playerContents.json中的数据
			if(playerdata==null){return;}//没有当前玩家数据时直接跳过
			displaycontents = [];
			for(i=0;i<playerdata.contents.length;i++){
				if(playerdata.contents[i].type=="text"&&playerdata.contents[i].display){
					switch(playerdata.contents[i].animation.type){//做成单独的模块
						case "alt":{
							let altcurrent=playerdata.contents[i].animation.contents[frameorder%playerdata.contents[i].animation.contents.length];
							altcurrent.contents=replace(altcurrent.contents,player);
							displaycontents.push("§"+altcurrent.color+altcurrent.contents);	
							break;
						}
						case "roll":{
							displaycontents.push(rollAniFrame(playerdata.contents[i].animation.contents,frameorder,player));
						}
					}
				}
			}
			//标题动画
			let sidebartitle="";
			if(playerdata.display_title||conf.get("force_title_display")){
				switch(conf.get("title").animation.type){
					case "alt":{
						let altcurrent=conf.get("title").animation.contents[frameorder%conf.get("title").animation.contents.length];
						sidebartitle="§"+altcurrent.color+altcurrent.contents;
						break;
					}
					case "roll":{
						sidebartitle=rollAniFrame(conf.get("title").animation.contents,frameorder,player);
					}
				}					
			}
			else{
				sidebartitle=" "
			}
			//刷新玩家侧边栏
			player.removeSidebar()
			if(playerdata.display){
				player.setSidebar(sidebartitle,JSON.parse(convertbar(displaycontents)),0);
			}
		}
		if(debugMode){newtime=new Date().getTime();log("启动发送侧边栏线程耗时"+(newtime-oldtime).toString())}//启动发送侧边栏线程计时终点
	},1000/conf.get("fps"));	
}
function convertbar(contents){//没有模块化的意义
	let str="";
	str = str + '\{';
	contents.forEach(function (currentValue,index){
		str = str + '\"' + currentValue + '\":' + index.toString();
		if(index!=contents.length-1){
			str = str + ","
		}
	})
	str = str + '\}'
	return str;
}

const llversion = ll.requireVersion(2,9,2)?[1,0,0,Version.Beta]:[1,0,0]
ll.registerPlugin("sidebarDesigner", "让玩家自行设计侧边栏", llversion,{Author:"Minimouse48"});