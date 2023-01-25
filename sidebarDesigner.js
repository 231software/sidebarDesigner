//infomotd的那些对接插件的类迁移过来
//把玩家文件写成数组
//然后加入玩家自行编写侧边栏，ui设计颜色的部分只在这个功能禁用的时候启用
//ui设计颜色的部分分成几个部分，玩家
//显示玩家内容的部分要跟进修改
const llversion = ll.requireVersion(2,9,2)?[0,3,0,Version.Dev]:[0,3,0]
ll.registerPlugin("sidebarDesigner", "让玩家自行设计motd", llversion,{Author:"小鼠同学"});
const individualcontents=new JsonConfigFile("plugins\\sidebarDesigner\\playerContents.json");
const conf=new JsonConfigFile("plugins\\sidebarDesigner\\config.json");
let playerobjfortitle;
let i=0,j=0,k=0;
let colortext=["§0黑色","§1深蓝色","§2深绿色","§3湖蓝色","§4深红色","§5紫色","§6金色","§7灰色","§8深灰色","§9蓝色","§a绿色","§b天蓝色","§c红色","§d粉红色","§e黄色","§f白色","§g硬币金"];
individualcontents.init("data",[]);
conf.init("fps",5);
conf.init("default",[
	{
		title:"欢迎语",
		type:"text",
		display:true,
		warp:true,
		animation:{
			type:"alt",
			contents:[
				{
					time:1,
					contents:"输入/sidebar自定义此侧边栏",
					color:"g"
				},
				{
					time:4,
					contents:"输入/sidebar自定义此侧边栏",
					color:"f"
				}
			]
		}
	}
]);
conf.init("title",{
	type:"text",
	animation:{
		type:"roll",
		contents:[
			{
				time:2,
				contents:"§f欢迎您的加入",
				color:"f",
				length:3,
				shake:true,
				pause:3
			}
		]
	}
})
conf.init("templates",[
	{
		type:"text",
		title:"欢迎语",
		display:true,
		warp:true,
		animation:{
			type:"alt",
			contents:[
				{
					time:2,
					contents:"输入/sidebar自定义此侧边栏",
					color:"f"
				}
			]
		}
	},
	{
		type:"text",
		title:"tps",
		display:true,
		warp:true,
		animation:{
			type:"alt",
			contents:[
				{
					time:2,
					contents:"tps:$currenttps",
					color:"f"
				}
			]
		}
	},
	{
		type:"text",
		title:"世界时间",
		display:true,
		warp:true,
		animation:{
			type:"alt",
			contents:[
				{
					time:2,
					contents:"世界时间:$gametime",
					color:"f"
				}
			]
		}
	},
	{
		type:"text",
		title:"时间",
		display:true,
		warp:true,
		animation:{
			type:"alt",
			contents:[
				{
					time:2,
					contents:"时间:$time",
					color:"f"
				}
			]
		}
	},
	{
		type:"text",
		title:"天气",
		display:true,
		warp:true,
		animation:{
			type:"alt",
			contents:[
				{
					time:2,
					contents:"天气$weather",
					color:"f"
				}
			]
		}
	},
	{
		type:"text",
		title:"朝向",
		display:true,
		warp:true,
		animation:{
			type:"alt",
			contents:[
				{
					time:2,
					contents:"朝向:$facing",
					color:"f"
				}
			]
		}
	}

])
class tps{
	constructor(){
		let i = 0;
		const availabletpsplugins=["QueryTPS","BEPlaceholderAPI","Cleaner"];
		for(i=0;i<availabletpsplugins.length;i++){
			if(ll.listPlugins().includes(availabletpsplugins[i])){
				this.type=availabletpsplugins[i];
				break;
			}
		}
	}
	currentTps(){
		let tpsfunc;
		switch(this.type){
			case "QueryTPS": {
				tpsfunc=ll.import("QueryTPS", "GetCurrentTPS");
				return tpsfunc();
			}
			case "BEPlaceholderAPI": {
				tpsfunc=require('./lib/BEPlaceholderAPI-JS').PAPI;
				return tpsfunc.getValue("server_tps");
			}
			case "Cleaner": {
				tpsfunc=ll.import("Cleaner", "GetCurrentTPS");
				return tpsfunc();
			}
			default:{
				return null;
			}
		}
	}
	averageTps(){
		let tpsfunc;
		switch(this.type){
			case "QueryTPS": {
				tpsfunc=ll.import("QueryTPS", "GetAverageTPS");
				return tpsfunc();
			}
			case "BEPlaceholderAPI": {
				tpsfunc=require('./lib/BEPlaceholderAPI-JS').PAPI;
				return tpsfunc.getValue("server_tps");
			}
			case "Cleaner": {
				tpsfunc=ll.import("Cleaner", "GetAverageTPS");
				return tpsfunc();
			}
			default:{
				return null;
			}
		}
	}
	plugin(){
		return this.type;
	}
}
let maincmd = mc.newCommand("sidebar","自定义您的侧边栏",PermType.Any);
maincmd.overload();
maincmd.setCallback(function(cmd,origin,output,results){
	mainform(origin.player);
})
maincmd.setup();
sendsidebar();
mc.listen("onPreJoin",function(player){
	playerobjfortitle=player;
	individualcontents.reload()
	if(getIFromPref(player.uuid)==null){//找不到玩家的信息
		if(individualcontents.get(player.uuid)!=null){//在根目录中找到了未迁移玩家的信息
			log(`玩家${player.name}的数据未迁移！正在迁移该玩家的数据`);
			let write = individualcontents.get("data");
			write.push({
				uuid:player.uuid,
				name:individualcontents.get(player.uuid).name,
				display:individualcontents.get(player.uuid).display,
				contents:[]
			});
			
			individualcontents.get(player.uuid).contents.forEach((currentValue,index)=>{
				//log(write[write.length-1].name);
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
					write[write.length-1].contents[index].animation.contents.push({time:1,contents:currentValue1,color:currentValue.color});
				})
				
			})
			individualcontents.set("data",write);
		}
		else{
			let write = individualcontents.get("data");
			write.push({ 
				uuid:player.uuid,
				name:player.name,
				display:true,
				contents:conf.get("default")
			});
			individualcontents.set("data",write);				
		}
	
	}
})
mc.listen("onLeft",(player)=>{
	playerobjfortitle = mc.getOnlinePlayers()[0];
})

function sendsidebar(){
	let displaycontents = [];
	let frameorder=0;
	setInterval(()=>{
		let i;
		frameorder++;
		mc.getOnlinePlayers().forEach((player)=>{
			displaycontents = [];
			for(i=0;i<individualcontents.get("data")[getIFromPref(player.uuid)].contents.length;i++){
				if(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].type=="text"){
					if(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].display){
						switch(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].animation.type){
							case "alt":{
								let altcurrent=individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].animation.contents[frameorder%individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].animation.contents.length];
								altcurrent.contents=replace(altcurrent.contents,player);
								//log(altcurrent.contents);
								//log(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i]);
								displaycontents.push("§"+altcurrent.color+altcurrent.contents);	
								break;
							}
							case "roll":{
								displaycontents.push(rollAniFrame(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].animation.contents,frameorder,player));
							}
						}
					}
				}
				/*else if(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].type=="money"){
					if(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].display){
						let infocontents=individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].contents;
						for(j=0;j<infocontents.length;j++){
							if(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].mode=="scoreboard"){
								infocontents[j]=infocontents[j].replace(/\$money/,`${mc.getScoreObjective(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].name).getScore(player)}`)
							}
							else if(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].mode=="llmoney"){
								infocontents[j]=infocontents[j].replace(/\$money/,`${player.getMoney()}`)
							}
							infocontents[j]="§"+individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].color+infocontents[j];
						}
						displaycontents=displaycontents.concat(infocontents);
					}
				}*/
			}
			//log(displaycontents);
			//log(convertbar(displaycontents));
			//标题动画
			let sidebartitle="";
			switch(conf.get("title").animation.type){
				case "alt":{
					let altcurrent=conf.get("title").animation.contents[frameorder%conf.get("title").animation.contents.length];
					sidebartitle="§"+altcurrent.color+altcurrent.contents;
					break;
				}
				case "roll":{
					//log(rollAniFrame(conf.get("title").animation.contents,frameorder,playerobjfortitle));
					sidebartitle=rollAniFrame(conf.get("title").animation.contents,frameorder,player);
				}
			}
			player.removeSidebar()
			if(individualcontents.get("data")[getIFromPref(player.uuid)].display){
				player.setSidebar(sidebartitle,JSON.parse(convertbar(displaycontents)),0);
			}
		});

	},1000/conf.get("fps"));	
}
//以下是图形ui
function mainform(player){
	let fm=mc.newSimpleForm();
	fm.setTitle("侧边栏设置")
	fm.setContent(" ");
	if(individualcontents.get("data")[getIFromPref(player.uuid)].display){
		fm.addButton("关闭侧边栏")
	}else{
		fm.addButton("打开侧边栏")
	}
	fm.addButton("管理项目");
	//fm.addButton("更改项目的颜色")
	player.sendForm(fm,(player,id)=>{
		if(id!=null){
			switch(id){
				case 0:{//总开关
					let write=individualcontents.get("data")
					write[getIFromPref(player.uuid)].display = !write[getIFromPref(player.uuid)].display;
					individualcontents.set("data",write);
					break;
				}
				case 1:{
					playermanageitems(player);
					break;
				}
				//case 3:playercustomcolor(player);break;
			}
		}
	})
}
function playermanageitems(player){
	let fm=mc.newSimpleForm();
	fm.setTitle("管理项目");
	fm.setContent(" ");
	fm.addButton("增加一个项目");
	fm.addButton("删除一个项目");
	fm.addButton("管理已添加的项目");
	player.sendForm(fm,(player,id)=>{
		switch(id){
			case 0:{
				newitem(player);
				break;
			}
			case 1:{
				deleteitem(player);
				break;
			}
			case 2:{
				playercustomitems(player);
				break;
			}
			default:{
				mainform(player);
			}
		}
	})
}
function playercustomitems(player){
	let fm=mc.newSimpleForm();
	fm.setTitle("管理已添加的项目");
	fm.setContent(" ");	
	fm.addButton("排序");
	fm.addButton("编辑指定的项目");
	player.sendForm(fm,(player,id)=>{
		switch(id){
			case 0:{
				playercustomorder(player);
				break;
			}
			case 1:playeredititem(player);break;
			default:{
				playermanageitems(player);
			}
		}
	})
}

function playercustomorder(player){
	let fm=mc.newSimpleForm();
	fm.setTitle("管理已添加的项目");
	fm.setContent("点击项目将其下移");
	individualcontents.get("data")[getIFromPref(player.uuid)].contents.forEach((currentValue,index)=>{
		fm.addButton(individualcontents.get("data")[getIFromPref(player.uuid)].contents[index].title);
	})
	player.sendForm(fm,(player,id)=>{	
		if(id!=null){
			if(id<individualcontents.get("data")[getIFromPref(player.uuid)].contents.length-1){
				let write=individualcontents.get("data");
				let ex=write[getIFromPref(player.uuid)].contents[id+1];
				write[getIFromPref(player.uuid)].contents[id+1]=write[getIFromPref(player.uuid)].contents[id];
				write[getIFromPref(player.uuid)].contents[id]=ex;
				individualcontents.set("data",write);
				playercustomorder(player);
			}	
			else{
				playercustomorder(player);
			}
		}
		else{
			playercustomitems(player);
		}
	})
}
function playeredititem(player){
	let fm=mc.newSimpleForm();
	fm.setTitle("编辑指定的项目");
	fm.setContent("选择一个项目来个性化");
	individualcontents.get("data")[getIFromPref(player.uuid)].contents.forEach((currentValue,index)=>{
		fm.addButton(individualcontents.get("data")[getIFromPref(player.uuid)].contents[index].title);
	})
	player.sendForm(fm,(player,id)=>{
		if(id!=null){
			playercustomdisplay(player,individualcontents.get("data")[getIFromPref(player.uuid)].contents[id].title)
		}
		else{
			playercustomitems(player);
		}		
			
	})	
}
function playercustomdisplay(player,title){
	let fm=mc.newSimpleForm();
	fm.setTitle("设置 "+title+" 的属性");
	fm.setContent(" ");
	fm.addButton("修改标题");
	if(individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].display){
		fm.addButton("关闭显示");
	}
	else{
		fm.addButton("开启显示");
	}
	fm.addButton("编辑动画和内容");
	player.sendForm(fm,(player,id)=>{
		switch(id){
			case 0:playerEditTitle(player,title);break;
			case 1:{
				let write=individualcontents.get("data");
				write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].display=!write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].display;
				individualcontents.set("data",write);
				playercustomdisplay(player,title);
				break;
			}
			case 2:{
				playereditanimation(player,title);
				break;
			}
			default:{
				playeredititem(player);
			}
		}
	})
}
function playerEditTitle(player,title){
	let fm=mc.newCustomForm();
	fm.setTitle("设置 "+title+" 的标题");
	fm.addInput("标题："," ",individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].title);
	player.sendForm(fm,(player,data)=>{
		if(data!=null){
			if(data[0]==""){
				player.sendModalForm("参数错误","标题不能为空，请重新填写","继续","继续",(player,result)=>{
					playerEditTitle(player,title);
				});
			}
			else{
				let write=individualcontents.get("data");
				write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].title=data[0];
				individualcontents.set("data",write);	
				playercustomdisplay(player,data[0]);					
			}
		}
		else{
			playercustomdisplay(player,title);
		}
	})
}
function playereditanimation(player,title){
	let fm=mc.newSimpleForm();
	fm.setTitle("设置 "+title+" 的动画和内容");
	fm.setContent("点击一个内容组元素来修改它的内容");
	fm.addButton("新增一个内容组元素");
	fm.addButton("移除一个内容组元素");
	individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents.forEach((currentValue,index)=>{
		fm.addButton(currentValue.contents);
	})
	player.sendForm(fm,(player,id)=>{
		if(id!=null){
			if(id==0){//新增
				switch(individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.type){
					case "alt":playerNewAnimation_alt(player,title);break;
					case "roll":playerNewAnimation_roll(player,title);break;
				}
			}
			else if(id==1){//删除
				playerDelAnimation(player,title);
				/*switch(individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.type){
					case "roll":playerDelAnimation(player,title);break;
				}*/
			}
			else{
				switch(individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.type){
					case "alt":playereditanimation_alt(player,title,id-2);break;
					case "roll":playerEditAnimation_roll(player,title,id-2);break;
				}				
			}
		}
		else{
			playercustomdisplay(player,title);
		}
	})
}
function playerNewAnimation_alt(player,title){
	let i;
	let fm=mc.newCustomForm();
	fm.setTitle("设置 "+title+" 的动画和内容");
	fm.addInput("停留时间","停留时间");
	fm.addInput("内容","内容");
	fm.addDropdown("默认颜色",colortext,15);
	player.sendForm(fm,(player,data)=>{
		if(data!=null){
			let write=individualcontents.get("data");
			let error=[false,false,false],errors=false;
			let newAnimation={time:1,contents:"未指定",color:"f"};
			if(data[0]!=""){
				if(!Number.isSafeInteger(Number(data[0]))){
					error[0]="notsafe"
				}
				else{
					newAnimation.time=Number(data[0]);
				}
				
			}
			if(data[1]==""){
				error[1]=true;
			}
			else{
				newAnimation.contents=data[1];
			}
			newAnimation.color=numtocolor(data[2]);
			write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents.push(newAnimation);
			for(i=0;i<error.length-1;i++){
				if(error[i]!=false){
					let errortext="以下参数不正确\n";
					if(error[0]=="empty"){
						errortext=errortext+"停留时间不能为空\n";
					}
					else if(error[0]=="notsafe"){
						errortext=errortext+"停留时间格式不正确\n";
					}
					if(error[1]){
						errortext=errortext+"内容不能为空\n";
					}
					player.sendModalForm("参数错误",errortext,"继续","继续",(player,result)=>{
						playereditanimation_alt(player,title,write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents.length-1);
					})
					errors=true;
					break;
				}
				
			}
			individualcontents.set("data",write);
			if(!errors){
				individualcontents.reload();
				playereditanimation(player,title);
			}
			
		}
		else{
			playereditanimation(player,title);
		}
	})
}
function playereditanimation_alt(player,title,id){
	let i;
	let fm=mc.newCustomForm();
	fm.setTitle("设置 "+title+" 的动画和内容");
	fm.addInput("停留时间"," ",individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].time.toString());
	fm.addInput("内容"," ",individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].contents);
	fm.addDropdown("默认颜色",colortext,colortonum(individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].color));
	player.sendForm(fm,(player,data)=>{
		if(data!=null){
			let write=individualcontents.get("data");
			let error=[false,false,false],errors=false;
			if(data[0]==""){
				error[0]="empty";
			}
			else if(!Number.isSafeInteger(Number(data[0]))){
				error[0]="notsafe"
			}
			else{
				write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].time=Number(data[0]);
			}
			if(data[1]==""){
				error[1]=true;
			}
			
			else{
				write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].contents=data[1];
			}
			write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].color=numtocolor(data[2]);
			for(i=0;i<error.length-1;i++){
				if(error[i]!=false){
					let errortext="以下参数不正确\n";
					if(error[0]=="empty"){
						errortext=errortext+"停留时间不能为空\n";
					}
					else if(error[0]=="notsafe"){
						errortext=errortext+"停留时间格式不正确\n";
					}
					if(error[1]){
						errortext=errortext+"内容不能为空\n";
					}
					player.sendModalForm("参数错误",errortext,"继续","继续",(player,result)=>{
						playereditanimation_alt(player,title,id);
					})
					errors=true;
					break;
				}
				
			}
			individualcontents.set("data",write);
			if(!errors){
				individualcontents.reload();
				playereditanimation(player,title);
			}
			
		}
		else{
			playereditanimation(player,title);
		}
	})
}
function playerNewAnimation_roll(player,title){
	let i;
	let fm=mc.newCustomForm();
	fm.setTitle("设置 "+title+" 的新动画组件");	
	fm.addInput("长度限制","长度限制");
	fm.addSwitch("摇摆",false);
	fm.addInput("停留时间","停留时间");
	fm.addInput("内容","内容");
	player.sendForm(fm,(player,data)=>{
		if(data!=null){
			let write=individualcontents.get("data");
			let error=[false,false,false,false],errors=false;
			let newAnimation={length:1,shake:false,pause:0,contents:"未指定"};
			if(data[0]!=""){
				if(!Number.isSafeInteger(Number(data[0]))){
					error[0]="notsafe";
				}
				else{
					newAnimation.length=Number(data[0]);
				}
			}
			newAnimation.shake=data[1];
			if(data[2]!=""){
				if(!Number.isSafeInteger(Number(data[2]))){
					error[2]="notsafe";
				}
				else{
					newAnimation.pause=Number(data[2]);
				}				
			}
			if(data[3]!=""){
				newAnimation.contents=data[3];
			}
			write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents.push(newAnimation);
			for(i=0;i<error.length;i++){
				if(error[i]!=false){
					let errortext="以下参数不正确\n";
					if(error[0]=="notsafe"){
						errortext=errortext+"长度限制格式不正确\n";
					}
					if(error[2]=="notsafe"){
						errortext=errortext+"停留时间格式不正确\n";
					}
					player.sendModalForm("参数错误",errortext,"继续","继续",(player,result)=>{
						playerEditAnimation_roll(player,title,write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents.length-1);
					})
					errors=true;
					break;
				}
			}
			/*write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].length=Number(data[0]);
			write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].shake=data[1];
			write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].pause=Number(data[2]);
			write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].contents=data[3];*/
			individualcontents.set("data",write);
			if(!errors){
				playereditanimation(player,title);
			}
		}
		else{
			playereditanimation(player,title);
		}
	})	
}
function playerDelAnimation(player,title){
	let fm=mc.newSimpleForm();
	fm.setTitle("从 "+title+" 中删除一个动画组件")
	fm.setContent(" ");
	individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents.forEach((currentValue,index)=>{
		fm.addButton(currentValue.contents);
	})
	player.sendForm(fm,(player,id)=>{
		if(id!=null){
			let write=individualcontents.get("data");
			write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents.splice(id,1);
			individualcontents.set("data",write);
			playereditanimation(player,title);		
		}
		else{
			playereditanimation(player,title);	
		}

	})
}
function playerEditAnimation_roll(player,title,id){
	let i;
	let fm=mc.newCustomForm();
	fm.setTitle("设置 "+title+" 的动画和内容");	
	fm.addInput("长度限制"," ",individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].length.toString());
	fm.addSwitch("摇摆",individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].shake);
	fm.addInput("停留时间"," ",individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].pause.toString());
	fm.addInput("内容"," ",individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].contents);
	player.sendForm(fm,(player,data)=>{
		if(data!=null){
			let write=individualcontents.get("data");
			let error=[false,false,false,false],errors=false;
			if(data[0]!=""){
				if(!Number.isSafeInteger(Number(data[0]))){
					error[0]="notsafe";
				}
				else{
					write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].length=Number(data[0]);
				}
			}
			write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].shake=data[1];
			if(data[2]!=""){
				if(!Number.isSafeInteger(Number(data[2]))){
					error[2]="notsafe";
				}
				else{
					write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].pause=Number(data[2]);
				}				
			}			
			if(data[3]!=""){
				write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents[id].contents=data[3];
			}
			for(i=0;i<error.length;i++){
				//log(error)
				if(error[i]!=false){
					let errortext="以下参数不正确\n";
					if(error[0]=="notsafe"){
						errortext=errortext+"长度限制格式不正确\n";
					}
					if(error[2]=="notsafe"){
						errortext=errortext+"停留时间格式不正确\n";
					}
					player.sendModalForm("参数错误",errortext,"继续","继续",(player,result)=>{
						playerEditAnimation_roll(player,title,id);
					})
					errors=true;
					break;
				}
			}
			individualcontents.set("data",write);
			if(!errors){
				playereditanimation(player,title);
			}
		}
		else{
			playereditanimation(player,title);
		}
	})	
}
function convertbar(contents){
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
function newitem(player){
	let fm=mc.newSimpleForm();
	let fm1=mc.newCustomForm();
	let expnewitem=[];//写到配置文件里
	conf.get("templates").forEach((currentValue)=>{
		expnewitem.push(currentValue.title);
	})
	let itemtoadd=["自定义内容（开发中）"];
	fm.setTitle("增加一个项目")
	fm.setContent("选择一个预设来开始")
	fm.addButton("自定义内容");
	expnewitem.forEach((currentValue,index)=>{
		let add=true;
		individualcontents.get("data")[getIFromPref(player.uuid)].contents.forEach((currentValue1,index)=>{
			if(currentValue1.title==currentValue){
				add=false;				
				return;
			}
		})
		if(add){
			fm.addButton(currentValue);
			itemtoadd.push(currentValue)
		}
	})
	player.sendForm(fm,(player,id)=>{
		if(id!=null){
			let write=individualcontents.get("data");
			let writecontents=conf.get("templates")[getIFromTemp(itemtoadd[id])];
			write[getIFromPref(player.uuid)].contents.push(writecontents);
			individualcontents.set("data",write);
			//playersetnewitem(player);
		}else{
			playermanageitems(player);
		}
	})
}
function deleteitem(player){
	let fm=mc.newSimpleForm();
	fm.setTitle("删除一个项目");
	fm.setContent("以下是所有已添加的项目");
	for(i=0;i<individualcontents.get("data")[getIFromPref(player.uuid)].contents.length;i++){
		fm.addButton(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].title)
	}
	player.sendForm(fm,(player,id)=>{
		if(id!=null){
			let write=individualcontents.get("data");
			write[getIFromPref(player.uuid)].contents.splice(id,1);
			individualcontents.set("data",write)
			playermanageitems(player);
		}
		else{
			playermanageitems(player);
		}
	})
}
function playerSetNewItem(player){
	let write=individualcontents.get("data");
	let fm=mc.newCustomForm();
	fm.setTitle("自定义这个新项目");
	fm.addDropdown("颜色",colortext,15)
	player.sendForm(fm,(player,data)=>{
		write[getIFromPref(player.uuid)].contents[write[getIFromPref(player.uuid)].contents.length-1].color=numtocolor(data[0]);
		individualcontents.set("data",write[getIFromPref(player.uuid)]);
		playercustomorder(player);
	})	
	
}
function getIFromPref(uuid){
	let prefarr = individualcontents.get("data");
	let i=0;
	for(i=0;i<prefarr.length;i++){
		if(prefarr[i].uuid==uuid){
			return i;
		}
	}
	return null;
}
function getIFromTemp(title){
	let temparr = conf.get("templates");
	let i=0;
	for(i=0;i<temparr.length;i++){
		if(temparr[i].title==title){
			return i;
		}
	}
	return null;
}
function getIFromContents(player,title){
	let contentsarr = individualcontents.get("data")[getIFromPref(player.uuid)].contents;
	let i=0;
	for(i=0;i<contentsarr.length;i++){
		if(contentsarr[i].title==title){
			return i;
		}
	}
	return null;
}
function replace(str,player){
	let replaced="";
	replaced=str.replace(/\$time/,`${(system.getTimeObj().h-system.getTimeObj().h%10)/10}${system.getTimeObj().h%10}:${(system.getTimeObj().m-system.getTimeObj().m%10)/10}${system.getTimeObj().m%10}`)
	.replace(/\$ping/,`${player.getDevice().lastPing}`)
	.replace(/\$name/g,player.name)
	.replace(/\$facing/g,directionstr(player))
	.replace(/\$gametime/g,gametimestr())
	.replace(/\$weather/g,weatherstr());
	if(new tps().type!=null){//类迁移过来的时候，记得把i声明成局部变量
		replaced=replaced.replace(/\$currenttps/g,new tps().currentTps());
	}
	else{
		replaced=replaced.replace(/\$currenttps/g,"");
	}
	if(new tps().type!=null){
		replaced=replaced.replace(/\$averagetps/g,new tps().averageTps());
	}
	else{
		replaced=replaced.replace(/\$averagetps/g,"");
	}
	return replaced;
}
function animate(){

}
function rollAniFrame(contents,order,player){//只是决定了在哪切
	//同时需要迁移的函数：collorrollslice，cleanstr，removeColorCode，joinconnect
	let framecounts=[];
	let framecount=0,line;
	let totalframes=0;
	let i;
	let movingframes;
	let cut=0;
	let currentFrameOnLine;
	for(i=0;i<contents.length;i++){
		framecount=0;
		movingframes=removeColorCode(replace(contents[i].contents,player)).length-contents[i].length+1;
		//log(contents)
		//log(movingframes);
		if(contents[i].pause>1){
			framecount+=(contents[i].pause-1)*2;
		}
		if(contents[i].shake){
			framecount+=movingframes-1+contents[i].pause-1;
			//log("shake-framecount:",framecount,"movingframes:",movingframes)
		}
		//log(framecount);
		framecount=framecount+movingframes;
		//log(movingframes);
		//log("framecount:",framecount);
		//log(framecount);
		framecounts.push(framecount);
		
	}
	framecounts.forEach((currentValue)=>{
		totalframes+=currentValue;
	})
	//log("totalframes:",totalframes);
	let forlength=0;
	//log(framecounts.length);
	//log(contents.length);
	for(i=0;i<framecounts.length;i++){
		forlength+=framecounts[i];
		//log("framecounts:",framecounts);
		//log("forlength:",forlength);
		//log("当前帧:",order%totalframes)
		if(forlength-1>=order%totalframes){
			line=i;
			break;
		}
	}
	//当前帧在这一行上是第几帧
	//framecounts[line]是这一行上一共有几帧
	//log("line:",line)
	currentFrameOnLine=framecounts[line]-(forlength-order%totalframes);
	//log("currentFrameOnLine:",currentFrameOnLine);
	if(currentFrameOnLine>=0&&currentFrameOnLine<=contents[line].pause-2){
		cut=0;
		//log("位置前面的pause")
	}
	else if(currentFrameOnLine>=contents[line].pause-1&&currentFrameOnLine<=contents[line].pause-1+removeColorCode(replace(contents[line].contents,player)).length-contents[line].length){
		cut=currentFrameOnLine-(contents[line].pause-1);
		//log("位置中间部分")
	}
	//后面的pause
	else if(currentFrameOnLine>=contents[line].pause+removeColorCode(replace(contents[line].contents,player)).length-contents[line].length && currentFrameOnLine<=(contents[line].pause-1)*2+removeColorCode(replace(contents[line].contents,player)).length-contents[line].length){
		cut=removeColorCode(replace(contents[line].contents,player)).length-contents[line].length;
		//log("位置pause后面的");
	}
	else if(contents[line].shake  &&  currentFrameOnLine>(contents[line].pause-1)*2+removeColorCode(replace(contents[line].contents,player)).length-contents[line].length  &&  currentFrameOnLine<=(contents[line].pause-1)*2+removeColorCode(replace(contents[line].contents,player)).length-contents[line].length+removeColorCode(replace(contents[line].contents,player)).length-contents[line].length){
		cut=(removeColorCode(replace(contents[line].contents,player)).length-contents[line].length+1)-(currentFrameOnLine-((contents[line].pause-1)*2+removeColorCode(replace(contents[line].contents,player)).length-contents[line].length))-1//-(contents[line].pause-1) //
		//log((contents[line].pause-1)*2+removeColorCode(contents[i].contents).length-contents[i].length+removeColorCode(contents[i].contents).length-contents[i].length-1)-(currentFrameOnLine-((contents[line].pause-1)*2+removeColorCode(contents[i].contents).length-contents[i].length))
		//log((contents[line].pause-1)*2+removeColorCode(contents[i].contents).length-contents[i].length+removeColorCode(contents[i].contents).length-contents[i].length-1);
		//log(currentFrameOnLine-((contents[line].pause-1)*2+removeColorCode(contents[i].contents).length-contents[i].length));
		//log("位置shake");//
		//log("cut:",cut);
	}
	else if(currentFrameOnLine>(contents[line].pause-1)*2+removeColorCode(replace(contents[line].contents,player)).length-contents[i].length+removeColorCode(replace(contents[line].contents,player)).length-contents[i].length-1){
		cut=0;
		//log("位置shake-pause")//少一个
	}
	//log(contents[line].contents);
	//log(colorrollslice({contents:contents[line].contents,length:contents[i].length},cut,player));/
	//log("--------------------------------")
	return colorrollslice({contents:contents[line].contents,length:contents[i].length},cut,player);
}
function colorrollslice(currentValue,order,player){
	//log(currentValue);
	let i;
	let motd = "";
	let rollarr=[],color=[""];
	let fcut=0,fcutarr=0,fcutonstr=0,bcut=0,bcutarr=0,bcutonstr=0,forlength=0;
	connect = "§r"+replace(currentValue.contents,player);//算法决定了这里必须加颜色代码
	//log(connect);
	rollarr = cleanstr(connect.split(/§./g));
	//log(rollarr);
	fcut=order%(joinconnect(rollarr).length-currentValue.length+1);//记录前后切点
	bcut=fcut+currentValue.length;//这里的两个currentValue是配置文件的长度！
	//log(joinconnect(rollarr).slice(fcut,bcut));
	forlength=0;
	for(i=0;i<rollarr.length;i++){//找到前切点所在的字符串和该相对字符串的切点位置
		forlength+=rollarr[i].length;
		if(forlength>fcut){
			fcutarr=i;
			fcutonstr=rollarr[i].length-(forlength-fcut);
			break;
		}						
	}
	forlength=0;
	for(i=0;i<rollarr.length;i++){//找到后切点所在的字符串和相对该字符串的切点位置
		forlength+=rollarr[i].length;
		if(forlength>=bcut){
			bcutarr=i;
			bcutonstr=rollarr[i].length-(forlength-bcut);
			break;
		}						
	}
	for(i=0;i<=connect.length-2;i++){
		if(connect.slice(i,i+2).match(/§./)!=null){//这里的2是因为颜色代码的长度是2
			color[color.length-1]=color[color.length-1]+connect.slice(i,i+2).match(/§./)[0];
			i++;
		}
		else{
			color.push("");
		}
		//log(connect.slice(i,i+2));
	}
	color=cleanstr(color);
	//log(color);
	//log(rollarr[fcutarr].slice(fcutonstr));
	//log(rollarr[bcutarr].slice(0,bcutonstr))
	if(fcutarr!=bcutarr){
		motd = motd + color[fcutarr] + rollarr[fcutarr].slice(fcutonstr);
		for(i=fcutarr+1;i<=bcutarr-1;i++){
			motd = motd + color[i] + rollarr[i];
		}
		if(fcutarr!=bcutarr){
			motd = motd + color[bcutarr] + rollarr[bcutarr].slice(0,bcutonstr);//issue#1问题就出在这了，如果前后切点位于同一字符串，那么就会直接读取开头字符串的值，不对后字符串作处理，那么后字串的处理就不会进行，于是就会看到第一个字符串直接到头
		}		
	}
	else{
		motd = motd + color[fcutarr] + rollarr[fcutarr].slice(fcutonstr,bcutonstr)
	}

	/*else{//这个就是前后切点位于同一字符串的情况，所以直接对motd字符串本身处理，而尽量不再去读取之前的变量
		motd = motd.slice(0,bcutonstr);
	}*/
	//log("colorrollslice:",motd);
	return motd;
}
function removeColorCode(str){
	return joinconnect(cleanstr(str.split(/§./g)));
}
function cleanstr(arr){
	let arr1 = [];
	arr.forEach((currentValue)=>{
		if(currentValue!=""&&currentValue!=null){
			arr1.push(currentValue);
		}
	})
	return arr1;
}
function joinconnect(arr){
	let str = "";
	arr.forEach((currentValue)=>{
		str=str+currentValue;
	});
	return str;
}
function directionstr(player){
	let str="";
	switch(player.direction.toFacing()){
		case 0:return "北";
		case 1:return "东";
		case 2:return "南";
		case 3:return "西";
	}
}
function weather(){
	let weather;
	weather = mc.runcmdEx("weather query");
	if(weather.output=="Weather state is: clear"){
		return 0
	}
	else if(weather.output=="Weather state is: rain"){
		return 1;
	}
	else if(weather.output=="Weather state is: thunder"){
		return 2;
	}
}
function weatherstr(){
	let str = "";
	switch(weather()){
		case 0:str="§r§a晴朗";break;
		case 1:str="§r§9下雨";break;
		case 2:str="§r雷雨";break;
	}	
	return str;
}
function gametime(){
	let timenum=0;
	let time;
	let timestr;
	let timestatus;
	let timeobj={hour:0,minute:0}
	timenum=0;
	time = mc.runcmdEx("time query daytime");
	timestr = time.output.match(/\d/g);
	timestr.forEach((currentValue)=>{
		timenum = timenum*10;
		timenum = timenum + Number(currentValue);		
	})
	timeobj.hour=(timenum-timenum%1000)/1000+6
	if(timeobj.hour>=24){timeobj.hour-=24;}
	timeobj.minute=(timenum%1000*3-timenum%1000*3%50)/50;
	return timeobj;
}
function gametimestr(){
	let timecolor="";
	switch (gametime().hour){
		case 3:case 21:timecolor="8";break;
		case 22:case 23:case 0:case 1:case 2:timecolor="0";break;
		case 20:case 4:timecolor="1";break;
		case 5:timecolor="9";break;
		case 6:case 18:case 19:timecolor="3";break;
		case 16:case 17:case 7:timecolor="6";break;
		case 8:timecolor="e";break;
		case 9:case 10:case 11:case 12:case 13:case 14:case 15:timecolor="b";break;
	}
	return "§r§"+timecolor+(gametime().hour-gametime().hour%10)/10+gametime().hour%10+":"+(gametime().minute-gametime().minute%10)/10+gametime().minute%10+"§r";
}
function colortonum(str){
	switch(str){
		case "0":return 0;break;
		case "1":return 1;break;
		case "2":return 2;break;
		case "3":return 3;break;
		case "4":return 4;break;	
		case "5":return 5;break;
		case "6":return 6;break;
		case "7":return 7;break;
		case "8":return 8;break;
		case "9":return 9;break;
		case "a":return 10;break;
		case "b":return 11;break;
		case "c":return 12;break;
		case "d":return 13;break;
		case "e":return 14;break;
		case "f":return 15;break;	
		case "g":return 16;break;
	}
}
function numtocolor(num){
	switch(num){
		case 0:return "0";break;
		case 1:return "1";break;
		case 2:return "2";break;
		case 3:return "3";break;
		case 4:return "4";break;	
		case 5:return "5";break;
		case 6:return "6";break;
		case 7:return "7";break;
		case 8:return "8";break;
		case 9:return "9";break;
		case 10:return "a";break;
		case 11:return "b";break;
		case 12:return "c";break;
		case 13:return "d";break;
		case 14:return "e";break;
		case 15:return "f";break;
		case 16:return "g";break;
	}
}
//群系名称
//天气
//不显示标题
