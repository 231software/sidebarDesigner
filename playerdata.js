//玩家配置文件这里要拿走后面的两个更新的函数
//监听进服的初始化也要拿走
const individualcontents=new JsonConfigFile("plugins\\sidebarDesigner\\playerContents.json");
const currentIndivPrefVersion=2;//更新玩家数据版本时，中间的初始化和后面的版本识别也要改
individualcontents.init("data",[]);
let indivPrefVersion = checkIndivPrefVersion();

indivPrefVersion.forEach((currentValue)=>{
	updateIndivPrefVersion(currentValue,currentIndivPrefVersion)//individualcontents.get("data")[getIFromPref(player.uuid)]
})

/** 
 * @param {Object} PrefIndexCache 预存储玩家uuid对应数组索引，加速getIFromPref函数
*/
let PrefIndexCache={}
RefreshPrefIndexCache()


//这里一会也要拿走
function checkIndivPrefVersion() {//更新玩家配置文件时，开头的版本常量，中间的玩家数据初始化也要更新
	let version = [];
	let trial;
	let i=0;
	individualcontents.get("data").forEach((currentValue)=>{
		check:{
			if(currentValue.display_title==null){
				version.push({uuid:currentValue.uuid,version:1});
				break check;
			}
		}
	})
	//输出哪些玩家没有更新配置文件
	if(version.length!=0){
		let playerToUpdate="";
		version.forEach((currentValue)=>{
			playerToUpdate=playerToUpdate + individualcontents.get("data")[getIFromPref(currentValue.uuid)].name+":"+currentValue.version+"\n"
		})
		log("以下玩家的配置文件协议过期：\n"+playerToUpdate+"将尝试更新他们的配置文件");			
	}
	return version;
}	
function updateIndivPrefVersion(currentVersion,target){
	let current=currentVersion.version;
	let write;
	while(current<target){
		switch(current){
			case 1:{
				write=individualcontents.get("data");
				write[getIFromPref(currentVersion.uuid)].display_title=true;
				individualcontents.set("data",write);
				RefreshPrefIndexCache()
				current++;
				break;
			}
			default:{
				current++;
				break;
			}
		}
	}
}
function getIFromPref(uuid){
	if(PrefIndexCache[uuid]!=undefined){
		return PrefIndexCache[uuid];
	}
	return null;
}
/**
 * @param {function} RefreshPrefIndexCache playerContents.json在文件内容改变时，刷新PrefIndexCache
 */
async function RefreshPrefIndexCache(){
	let prefarr=individualcontents.get("data")
	for(let i in prefarr){
		PrefIndexCache[prefarr[i].uuid]=i
	}
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
module.exports={
	individualcontents,
	getIFromContents,
	getIFromPref,
	RefreshPrefIndexCache
}