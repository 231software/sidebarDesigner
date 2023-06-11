let conf=require("./config").conf;//分成ss库的时候，ss自己需要一个配置文件来存储自定义占位符

let gmoney=require("./money");
let tps=require("./placeholders").tps;
let mspt=require("./placeholders").mspt;
let version=require("./placeholders").version;
let protocol=require("./placeholders").protocol;
let entities=require("./placeholders").entities;
let uptime=require("./placeholders").uptime;
let online=require("./placeholders").online;
let max_players=require("./placeholders").max_players;
let levelName=require("./placeholders").levelName;
let levelSeed=require("./placeholders").levelSeed;
let levelDifficulty=require("./placeholders").levelDifficulty;
let port=require("./placeholders").port;
let port6=require("./placeholders").port6;
let bdsram=require("./placeholders").bdsram;
let ram=require("./placeholders").ram;
let ramFree=require("./placeholders").ramFree;
let ramTotal=require("./placeholders").ramTotal;
let speed=require("./placeholders").speed;
let playerBedPos=require("./placeholders").playerBedPos;

let placeholder_money;
if(conf.get("economy_type")=="disabled"){
	placeholder_money={get:()=>{}}
}
else{
	placeholder_money=new gmoney(conf.get("economy_type"))
}


function replace(str,player){//函数拿走的时候带上前面所有的import
	let i;
	let replaced="";
	replaced=str
	.replace(/\$time/,`${(system.getTimeObj().h-system.getTimeObj().h%10)/10}${system.getTimeObj().h%10}:${(system.getTimeObj().m-system.getTimeObj().m%10)/10}${system.getTimeObj().m%10}`)
	.replace(/\$ping/,`${player.getDevice().lastPing}`)
	.replace(/\$avgping/,`${player.getDevice().avgPing}`).replace(/\$averageping/,`${player.getDevice().avgPing}`)
	.replace(/\$pkls/,`${player.getDevice().lastPacketLoss}`).replace(/\$packetloss/,`${player.getDevice().lastPacketLoss}`)
	.replace(/\$avgpkls/,`${player.getDevice().avgPacketLoss}`).replace(/\$averagepacketloss/,`${player.getDevice().avgPacketLoss}`)
	.replace(/\$cos/,`${player.getDevice().os}`).replace(/\$clientos/,`${player.getDevice().cliensos}`)
	.replace(/\$cid/,`${player.getDevice().clientId}`).replace(/\$clientid/,`${player.getDevice().clientId}`)
	.replace(/\$name/g,player.name)
	.replace(/\$facing/g,directionstr(player))
	.replace(/\$gametime/g,gametimestr())
	.replace(/\$weather/g,weatherstr())
	.replace(/\$cip/g,player.ip).replace(/\$clientip/g,player.ip)
	.replace(/\$biome/g,player.getBiomeName())
	.replace(/\$uuid/g,player.uuid)
	.replace(/\$xuid/g,player.xuid)
	.replace(/\$realname/g,player.realName)
	.replace(/\$fpx/g,player.pos.x).replace(/\$fpy/g,player.pos.y).replace(/\$fpz/g,player.pos.z)
	.replace(/\$entities/g,new entities().get())
	.replace(/\$online/g,new online().get())
	.replace(/\$currenttps/g,new tps().currentTps()).replace(/\$tps/g,new tps().currentTps())
	.replace(/\$money/g,placeholder_money.get(player));
	if(new mspt().type!=null){//类迁移过来的时候，记得把i声明成局部变量
		replaced=replaced.replace(/\$mspt/g,new mspt().get());
	}
	else{
		replaced=replaced.replace(/\$mspt/g,"");
	}
	if(new tps().type!=null){
		replaced=replaced.replace(/\$averagetps/g,new tps().averageTps());
	}
	else{
		replaced=replaced.replace(/\$averagetps/g,"");
	}
	if(new version().type!=null){
		replaced=replaced.replace(/\$version/g,new version().get());
	}
	else{
		replaced=replaced.replace(/\$version/g,"");
	}
	if(new protocol().type!=null){
		replaced=replaced.replace(/\$protocol/g,new protocol().get());
	}
	else{
		replaced=replaced.replace(/\$protocol/g,"");
	}
	if(new uptime().type!=null){
		replaced=replaced.replace(/\$uptime/g,new uptime().get());
	}
	else{
		replaced=replaced.replace(/\$uptime/g,"");
	}
	if(new max_players().type!=null){
		replaced=replaced.replace(/\$onlinemax/g,new max_players().get());
	}
	else{
		replaced=replaced.replace(/\$onlinemax/g,"");
	}
	if(new levelName().type!=null){
		replaced=replaced.replace(/\$levelname/g,new levelName().get());
	}
	else{
		replaced=replaced.replace(/\$levelname/g,"");
	}
	/*if(new speed().type!=null){
		replaced=replaced.replace(/\$speed/g,new speed().get(player));
	}
	else{
		replaced=replaced.replace(/\$speed/g,"");
	}*/
	/*if(new playerBedPos().type!=null){
		replaced=replaced.replace(/\$bedx/g,new playerBedPos().get(player).x);
	}
	else{
		replaced=replaced.replace(/\$bedx/g,"");
	}
	if(new playerBedPos().type!=null){
		replaced=replaced.replace(/\$bedy/g,new playerBedPos().get(player).y);
	}
	else{
		replaced=replaced.replace(/\$bedy/g,"");
	}
	if(new playerBedPos().type!=null){
		replaced=replaced.replace(/\$bedz/g,new playerBedPos().get(player).z);
	}
	else{
		replaced=replaced.replace(/\$bedz/g,"");
	}*/
	
	if(player.isOP()&&new levelSeed().type!=null){
		replaced=replaced.replace(/\$levelseed/g,new levelSeed().get());
	}
	else{
		replaced=replaced.replace(/\$levelseed/g,"无权限");
	}
	if(player.isOP()&&new levelDifficulty().type!=null){
		let difficulty = new levelDifficulty().get();
		switch(difficulty){
			case "0":replaced=replaced.replace(/\$leveldifficulty/g,"普通");break;
			case "1":replaced=replaced.replace(/\$leveldifficulty/g,"简单");break;
			case "2":replaced=replaced.replace(/\$leveldifficulty/g,"普通");break;
			case "3":replaced=replaced.replace(/\$leveldifficulty/g,"困难");break;
			default:replaced=replaced.replace(/\$leveldifficulty/g,"其他");break;
		}
	}
	else{
		replaced=replaced.replace(/\$leveldifficulty/g,"无权限");
	}
	if(player.isOP()&&new bdsram().type!=null){
		replaced=replaced.replace(/\$bdsram/g,new bdsram().get());
	}
	else{
		replaced=replaced.replace(/\$bdsram/g,"无权限");
	}
	if(player.isOP()&&new ramFree().type!=null){
		replaced=replaced.replace(/\$ramfree/g,new ramFree().get());
	}
	else{
		replaced=replaced.replace(/\$ramfree/g,"无权限");
	}
	if(player.isOP()&&new ramTotal().type!=null){
		replaced=replaced.replace(/\$ramtotal/g,new ramTotal().get());
	}
	else{
		replaced=replaced.replace(/\$ramtotal/g,"无权限");
	}
	if(player.isOP()&&new ram().type!=null){
		replaced=replaced.replace(/\$ram/g,new ram().get());
	}
	else{
		replaced=replaced.replace(/\$ram/g,"无权限");
	}
	if(player.isOP()&&new port6().type!=null){
		replaced=replaced.replace(/\$port6/g,new port6().get());
	}
	else{
		replaced=replaced.replace(/\$port6/g,"无权限");
	}
	if(player.isOP()&&new port().type!=null){
		replaced=replaced.replace(/\$port/g,new port().get());
	}
	else{
		replaced=replaced.replace(/\$port/g,"无权限");
	}
	/*
	1把所有括号里的内容提取成数组
	2把括号里的内容和括号拼接起来形成要替换的整个字符串
	3处理括号里的内容形成数组
	4依据数组下标依次替换
	*/
	if(player.isOP()){
		let codearr=replaced.match(/<eval>(.+?)<\/eval>/gi)//
		if(codearr!=null){
			codearr.forEach((currentValue,index)=>{
				let code = currentValue.replace("<eval>","").replace("</eval>","");
				try{
					replaced=replaced.replace("<eval>"+code+"</eval>",eval(code));
				}
				catch(err){
					replaced=replaced.replace("<eval>"+code+"</eval>","eval语法错误");
				}
			})			
		}
	}
	conf.get("custom_placeholders").forEach((currentValue)=>{
		switch(currentValue.type){
			case "scoreboard":{
				if(!(!player.isOP()&&currentValue.perm)){
					replaced=replaced.replaceAll("$"+currentValue.placeholder,player.getScore(currentValue.scoreobj))
				}
				else{
					replaced=replaced.replaceAll("$"+currentValue.placeholder,"无权限");
				}
				break;
			}
			case "eval":{
				if(!(!player.isOP()&&currentValue.perm)){
					try{
						replaced=replaced.replaceAll("$"+currentValue.placeholder,eval(currentValue.eval))
					}
					catch(err){
						replaced=replaced.replaceAll("$"+currentValue.placeholder,"语法错误")
					}
				}
				else{
					replaced=replaced.replaceAll("$"+currentValue.placeholder,"无权限");
				}
				break;
			}
		}
	})
	return replaced;
}
function directionstr(player){
	let direction_array = ["北", "东", "南", "西"];
	return direction_array[player.direction.toFacing()];
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
	let weather_array = ["§r§a晴朗", "§r§9下雨", "§r雷雨"];
	return weather_array[weather()];
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
module.exports=replace;