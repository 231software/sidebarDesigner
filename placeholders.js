//新增内置计数器时一定要云replacement里面检查下if那些
let tpscounter=[];
let papipath=null;
let onlinePlayers=0;
let allEntities=0;
let localAPIs=[];
if(File.exists("plugins\\lib\\BEPlaceholderAPI-JS.js")){
	//papipath=__dirname.match(/(.+)nodejs\\sidebardesigner/)[1]+"lib\\BEPlaceholderAPI-JS";
	papipath=__dirname.replace(/nodejs\\sidebardesigner/,"lib\\BEPlaceholderAPI-JS");
	//冗余措施，找不到的时候发出提示
}else if(!ll.listPlugins().includes("BEPlaceholderAPI")){
	logger.info("BEPlaceholderAPI的依赖库未正确加载，sidebarDesigner可能会加载失败，请检查lib/BEPlaceholderAPI-JS.js是否存在")
}

mc.listen("onTick",()=>{
	localAPIs.forEach((currentFunction)=>{
		currentFunction();
	})
})
mc.listen("onServerStarted",()=>{
	if(new tps().plugin()==null){localAPIs.push(calculateTPS)}
	if(new entities().plugin()==null){localAPIs.push(calculateEntities)}
	if(new online().plugin()==null){localAPIs.push(calculateOnlinePlayers)}
})

function calculateTPS(){
	tpscounter.push(new Date().getTime());
	if(tpscounter.length>100){
		tpscounter.shift();
	}	
}
function calculateEntities(){
	allEntities=mc.getAllEntities().length;
}
function calculateOnlinePlayers(){
	let realOnlinePlayers=0;
	mc.getOnlinePlayers().forEach((player)=>{
		if(!player.isSimulatedPlayer()){
			realOnlinePlayers++;
		}
	})
	onlinePlayers=realOnlinePlayers;
}

function profTpsCounter(){
	let i;
	let tps;
	
	if(tpscounter.length>20){
		//log(tpscounter.length)
		for(i=tpscounter.length-1;i>=0;i--){
			if(tpscounter[tpscounter.length-1]-tpscounter[i]<1030 && tpscounter[tpscounter.length-1]-tpscounter[i-1]>=1030){
				return tpscounter.length-1-i;
			}
		}
	}
	else{
		return 20;
	}
}
class tps{
	constructor(){
		let i = 0;
		const availabletpsplugins=["QueryTPS","BEPlaceholderAPI","Cleaner","dynamicPlayerLim"];
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
				tpsfunc=require(papipath).PAPI;
				return tpsfunc.getValue("server_tps");
			}
			case "Cleaner": {
				tpsfunc=ll.import("Cleaner", "GetCurrentTPS");
				return tpsfunc();
			}
			case "dynamicPlayerLim": {
				tpsfunc=ll.import("dynamicPlayerLim", "currentTps");
				return tpsfunc();
			}
			default:{
				return profTpsCounter();
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
				tpsfunc=require(papipath).PAPI;
				return tpsfunc.getValue("server_tps");
			}
			case "Cleaner": {
				tpsfunc=ll.import("Cleaner", "GetAverageTPS");
				return tpsfunc();
			}
			case "dynamicPlayerLim": {
				tpsfunc=ll.import("dynamicPlayerLim", "currentTps");
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
class mspt{
	constructor(){
		let i;
		const availableplugins=["QueryTPS","BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let msptfunc;
		switch(this.type){
			case "QueryTPS": {
				msptfunc=ll.import("QueryTPS", "GetMSPT");
				return msptfunc();
			}
			case "BEPlaceholderAPI": {
				msptfunc=require(papipath).PAPI;
				return msptfunc.getValue("server_mspt");
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
class version{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValue("server_version");
			}
			default:{
				return mc.BDSVersion();
			}
		}
	}
	plugin(){
		return this.type;
	}
}
class protocol{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValue("server_protocol_version");
			}
			default:{
				return mc.getServerProtocolVersion();
			}
		}
	}
	plugin(){
		return this.type;
	}
}
class entities{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValue("server_total_entities");
			}
			default:{
				return allEntities;
			}
		}
	}
	plugin(){
		return this.type;
	}
}
class uptime{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValue("server_uptime");
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
class online{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValue("server_online");
			}
			default:{
				return onlinePlayers;
			}
		}
	}
	plugin(){
		return this.type;
	}
}
class max_players{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValue("server_max_players");
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
class levelName{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValue("server_world_name");
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
class levelSeed{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValue("server_seed");
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
class levelDifficulty{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValue("server_difficulty");
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
class port{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValue("server_port");
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
class port6{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValue("server_port_v6");
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
class bdsram{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValue("server_ram_bds_used");
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
class ram{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValue("server_ram_used");
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
class ramFree{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValue("server_ram_free");
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
class ramTotal{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValue("server_ram_max");
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
class speed{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(player){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return getfunc.getValueByPlayer("player_name",player);
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
class playerBedPos{
	constructor(){
		let i;
		const availableplugins=["BEPlaceholderAPI"];
		for(i=0;i<availableplugins.length;i++){
			if(ll.listPlugins().includes(availableplugins[i])){
				this.type=availableplugins[i];
				break;
			}
		}
	}
	get(player){
		let getfunc;
		switch(this.type){
			case "BEPlaceholderAPI": {
				getfunc=require(papipath).PAPI;
				return {
					x:getfunc.getValueByPlayer("player_bed_x",player),
					y:getfunc.getValueByPlayer("player_bed_y",player),
					y:getfunc.getValueByPlayer("player_bed_z",player)
				}
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
module.exports={
    tps,
    mspt,
    version,
    protocol,
    entities,
    uptime,
    online,
    max_players,
    levelName,
    levelSeed,
    levelDifficulty,
    port,
    port6,
    bdsram,
    ram,
    ramFree,
    ramTotal,
    speed,
    playerBedPos
}