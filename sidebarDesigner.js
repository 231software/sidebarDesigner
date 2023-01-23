//infomotd的那些对接插件的类迁移过来
//把玩家文件写成数组
//然后加入玩家自行编写侧边栏，ui设计颜色的部分只在这个功能禁用的时候启用
//ui设计颜色的部分分成几个部分，玩家
//显示玩家内容的部分要跟进修改
ll.registerPlugin("sidebarDesigner", "让玩家自行设计motd", [0, 1, 0]);
const individualcontents=new JsonConfigFile("plugins\\sidebarDesigner\\playerContents.json");
const conf=new JsonConfigFile("plugins\\sidebarDesigner\\config.json");
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
				contents:"欢迎您的加入",
				color:"f"
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
		const availabletpsplugins=["QueryTPS","BEPlaceholderAPI"];
		let i;
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
	individualcontents.reload()
	if(getIFromPref(player.uuid)==null){
		let write = individualcontents.get("data");
		write.push({ 
			uuid:player.uuid,
			name:player.name,
			display:true,
			contents:conf.get("default")
		});
		individualcontents.set("data",write);		
	}

})


function sendsidebar(){
	let displaycontents = [];
	let frameorder=0;
	setInterval(()=>{
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
						}

						/*let infocontents=individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].contents;
						for(k=0;j<infocontents.length;j++){
							infocontents[j]=replace(infocontents[j]);

							infocontents[j]="§"+individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].color+infocontents[j];
						}
						displaycontents=displaycontents.concat(infocontents);*/
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
			let sidebartitle="";
			switch(conf.get("title").animation.type){
				case "alt":{
					let altcurrent=conf.get("title").animation.contents[frameorder%conf.get("title").animation.contents.length];
					sidebartitle="§"+altcurrent.color+altcurrent.contents;
					break;
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
	fm.addButton("排序");
	fm.addButton("选择要显示的项目")
	//fm.addButton("更改项目的颜色")
	player.sendForm(fm,(player,id)=>{
		if(id!=null){
			switch(id){
				case 0:{
					let write=individualcontents.get("data")
					write[getIFromPref(player.uuid)].display = !write[getIFromPref(player.uuid)].display;
					individualcontents.set("data",write);
					break;
				}
				case 1:playercustomorder(player);break;
				case 2:playercustomdisplay(player);break;
				//case 3:playercustomcolor(player);break;
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
	fm.addButton("增加一个项目")
	fm.addButton("删除一个项目")
	player.sendForm(fm,(player,id)=>{	
		if(id!=null){
			if(id<individualcontents.get("data")[getIFromPref(player.uuid)].contents.length-1){
				let write=individualcontents.get("data");
				let ex=write[getIFromPref(player.uuid)].contents[id+1];
				write[getIFromPref(player.uuid)].contents[id+1]=write[getIFromPref(player.uuid)].contents[id];
				write[getIFromPref(player.uuid)].contents[id]=ex;
				individualcontents.set("data",write);
				playercustomorder(player);
			}else if(id==individualcontents.get("data")[getIFromPref(player.uuid)].contents.length){
				newitem(player);
			}else if(id==individualcontents.get("data")[getIFromPref(player.uuid)].contents.length+1){
				deleteitem(player);
			}		
			else{
				playercustomorder(player);
			}
		}
		else{
			mainform(player);
		}
	})
}
function playercustomdisplay(player){
	let fm=mc.newCustomForm();
	fm.setTitle("设置要显示的项目")
	let cachedcontents={};
	for(i=0;i<individualcontents.get("data")[getIFromPref(player.uuid)].contents.length;i++){
		fm.addSwitch(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].title,individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].display)
		/*for(j=0;j<individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].contents.length;j++){
			fm.addSwitch(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].contents[j]);//for列出玩家的侧边栏
		}*/
	}
	player.sendForm(fm,(player,data)=>{
		if(data!=null){
			let write=individualcontents.get("data")
			data.forEach((currentValue,index)=>{
				write[getIFromPref(player.uuid)].contents[index].display=currentValue;
			})
			individualcontents.set("data",write)	
			
		}
		mainform(player);
	})
}
function playercustomcolor(player){
	let fm=mc.newCustomForm();
	fm.setTitle("选择每个项目的颜色")
	for(i=0;i<individualcontents.get("data")[getIFromPref(player.uuid)].contents.length;i++){
		fm.addDropdown(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].title,colortext,colortonum(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].color))
		//fm.addSwitch(individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].title,individualcontents.get("data")[getIFromPref(player.uuid)].contents[i].display)
	}
	player.sendForm(fm,(player,data)=>{
		if(data!=null){
			let write=individualcontents.get("data")[getIFromPref(player.uuid)]
			data.forEach((currentValue,index)=>{
				write.contents[index].color=numtocolor(currentValue);
			})
			individualcontents.set(player.uuid,write);
		}else{
			mainform(player);
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
			playercustomorder(player);
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
			playercustomorder(player);
		}
		else{
			playercustomorder(player);
		}
	})
}
function playersetnewitem(player){
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
function replace(str,player){
	let replaced="";
	replaced=str.replace(/\$time/,`${(system.getTimeObj().h-system.getTimeObj().h%10)/10}${system.getTimeObj().h%10}:${(system.getTimeObj().m-system.getTimeObj().m%10)/10}${system.getTimeObj().m%10}`)
	.replace(/\$ping/,`${player.getDevice().lastPing}`)
	.replace(/\$name/g,player.name)
	.replace(/\$facing/g,directionstr(player)+"§r")
	.replace(/\$gametime/g,gametimestr()+"§r")
	.replace(/\$weather/g,weatherstr()+"§r");
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
function colorrollslice(currentValue,order){
	let i;
	let motd = "";
	let rollarr=[],color=[""];
	let fcut=0,fcutarr=0,fcutonstr=0,bcut=0,bcutarr=0,bcutonstr=0,forlength=0;
	connect = "§r"+replace(currentValue.contents);
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
		if(connect.slice(i,i+2).match(/§./)!=null){
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
	motd=motd+"§r";
	return motd;
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
