let conf=require("./config").conf;
let getIFromTemp=require("./config").getIFromTemp;
let individualcontents=require("./playerdata").individualcontents;
let getIFromPref=require("./playerdata").getIFromPref;
let getIFromContents=require("./playerdata").getIFromContents;
let RefreshPrefIndexCache=require("./playerdata").RefreshPrefIndexCache;
const colortext=["§0黑色","§1深蓝色","§2深绿色","§3湖蓝色","§4深红色","§5紫色","§6金色","§7灰色","§8深灰色","§9蓝色","§a绿色","§b天蓝色","§c红色","§d粉红色","§e黄色","§f白色","§g硬币金"];
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
	fm.addButton("全局偏好");
	//fm.addButton("更改项目的颜色")
	player.sendForm(fm,(player,id)=>{
		if(id!=null){
			switch(id){
				case 0:{//总开关
					let write=individualcontents.get("data")
					write[getIFromPref(player.uuid)].display = !write[getIFromPref(player.uuid)].display;
					individualcontents.set("data",write);
					RefreshPrefIndexCache()
					break;
				}
				case 1:{
					playermanageitems(player);
					break;
				}
				case 2:{
					playerGlobalPref(player);
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
function playerGlobalPref(player){
	let fm=mc.newCustomForm();
	fm.setTitle("全局偏好");
	if(!conf.get("force_title_display")){
		fm.addSwitch("显示标题",(individualcontents.get("data")[getIFromPref(player.uuid)].display_title));
	}
	else{
		fm.addSwitch("标题已被强制显示,此项无效",(individualcontents.get("data")[getIFromPref(player.uuid)].display_title));
	}
	player.sendForm(fm,(player,data)=>{
		if(data){
			let write=individualcontents.get("data")
			write[getIFromPref(player.uuid)].display_title = data[0];
			individualcontents.set("data",write);
			RefreshPrefIndexCache()
		}
		mainform(player);
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
				RefreshPrefIndexCache()
				
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
				RefreshPrefIndexCache()
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
			else if(individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,data[0])]!=null){
				player.sendModalForm("参数错误","标题已存在，请重新填写","继续","继续",(player,result)=>{
					playerEditTitle(player,title);
				});				
			}
			else{
				let write=individualcontents.get("data");
				write[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].title=data[0];
				individualcontents.set("data",write);	
				RefreshPrefIndexCache()
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
				if(individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,title)].animation.contents.length<=1){
					player.sendModalForm("已经没有什么好删除的了","只剩下一个内容了，不能再删除了","继续","继续",()=>{
						playereditanimation(player,title);
					});
				}
				else{
					playerDelAnimation(player,title);
				}
				
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
			RefreshPrefIndexCache()
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
			RefreshPrefIndexCache()
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
			RefreshPrefIndexCache()
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
			RefreshPrefIndexCache()
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
			RefreshPrefIndexCache()
			if(!errors){
				playereditanimation(player,title);
			}
		}
		else{
			playereditanimation(player,title);
		}
	})	
}

function newitem(player){
	let fm=mc.newSimpleForm();
	let fm1=mc.newCustomForm();
	let expnewitem=[];//写到配置文件里
	conf.get("templates").forEach((currentValue)=>{
		expnewitem.push(currentValue.title);
	})
	let itemtoadd=["自定义内容"];
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
			if(id==0){
				playerChooseNewItemAnimation(player);
			}
			else{
				let write=individualcontents.get("data");
				let writecontents=conf.get("templates")[getIFromTemp(itemtoadd[id])];
				write[getIFromPref(player.uuid)].contents.push(writecontents);
				individualcontents.set("data",write);
				RefreshPrefIndexCache()
				//playersetnewitem(player);				
			}

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
			RefreshPrefIndexCache()
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
		RefreshPrefIndexCache()
		playercustomorder(player);
	})	
	
}
function playerChooseNewItemAnimation(player){
	let fm=mc.newSimpleForm();
	fm.setTitle("选择一种动画");
	fm.setContent(" ");
	fm.addButton("轮播");
	fm.addButton("滚动");
	player.sendForm(fm,(player,id)=>{
		switch(id){
			case 0:playerCustomNewItem_alt(player);break;
			case 1:playerCustomNewItem_roll(player);break;
			case 2:break;
			default:newitem(player);
		}
	})
}
function playerCustomNewItem_alt(player){
	let i;
	//individualcontents.get("data")[getIFromPref(player.uuid)].contents
	let fm=mc.newCustomForm();
	fm.setTitle("自定义这一项");
	fm.addInput("标题","标题");
	fm.addInput("停留时间","停留时间");
	fm.addInput("内容","内容");
	fm.addDropdown("默认颜色",colortext,15);
	player.sendForm(fm,(player,data)=>{
		if(data!=null){
			let write=individualcontents.get("data");
			let error=[false,false,false,false],errors=false;
			let newLine={
				title:"无标题",
				type:"text",
				display:true,
				warp:false,
				animation:{
					type:"alt",
					contents:[
						{
							time:1,
							contents:"未指定",
							color:"f"
						}
					]
				}
			};
			if(data[0]!=""){
				if(individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,data[0])]!=null){
					error[0]="exist";
				}
				else{
					newLine.title=data[0];
				}
			}
			else{
				error[0]="empty";
			}

			if(data[1]!=""){
				if(!Number.isSafeInteger(Number(data[1]))){
					error[1]="notsafe"
				}
				else{
					newLine.animation.contents[0].time=Number(data[1]);
				}
				
			}
			if(data[2]==""){
				error[2]=true;
			}
			else{
				newLine.animation.contents[0].contents=data[2];
			}
			newLine.animation.contents[0].color=numtocolor(data[3]);
			write[getIFromPref(player.uuid)].contents.push(newLine);
			for(i=0;i<error.length-1;i++){
				if(error[i]!=false){
					let errortext="以下参数不正确\n";
					if(error[0]=="empty"){
						errortext=errortext+"标题不能为空\n";
					}
					else if(error[0]=="exist"){
						errortext=errortext+"标题已存在\n"
					}
					if(error[1]=="empty"){
						errortext=errortext+"停留时间不能为空\n";
					}
					else if(error[1]=="notsafe"){
						errortext=errortext+"停留时间格式不正确\n";
					}
					if(error[2]){
						errortext=errortext+"内容不能为空\n";
					}
					player.sendModalForm("参数错误",errortext,"继续","继续",(player,result)=>{
						playerCustomNewItem_alt(player);
					})
					errors=true;
					break;
				}
			}
			if(!errors){
				individualcontents.set("data",write);
				RefreshPrefIndexCache()
				playerChooseNewItemAnimation(player);
			}
			
		}
		else{
			playerChooseNewItemAnimation(player);
		}
	})
}
function playerCustomNewItem_roll(player){
	let i;
	//individualcontents.get("data")[getIFromPref(player.uuid)].contents
	let fm=mc.newCustomForm();
	fm.setTitle("自定义这一项");
	fm.addInput("标题","标题");
	fm.addInput("长度限制","长度限制");
	fm.addInput("内容","内容");
	fm.addInput("停留时间","停留时间");
	fm.addSwitch("摇摆",false)
	player.sendForm(fm,(player,data)=>{
		if(data!=null){
			let write=individualcontents.get("data");
			let error=[false,false,false,false,false],errors=false;
			let newLine={
				title:"无标题",
				type:"text",
				display:true,
				warp:false,
				animation:{
					type:"roll",
					contents:[
						{
							time:1,
							contents:"未指定",
							color:"f",
							length: 1,
							shake: true,
							pause: 0
						}
					]
				}
			};
			if(data[0]!=""){
				if(individualcontents.get("data")[getIFromPref(player.uuid)].contents[getIFromContents(player,data[0])]!=null){
					error[0]="exist";
				}
				else{
					newLine.title=data[0];
				}
			}
			else{
				error[0]="empty";
			}

			if(data[1]!=""){
				if(!Number.isSafeInteger(Number(data[1]))){
					error[1]="notsafe"
				}
				else{
					newLine.animation.contents[0].length=Number(data[1]);
				}
				
			}
			if(data[2]==""){
				error[2]=true;
			}
			else{
				newLine.animation.contents[0].contents=data[2];
			}
			if(data[3]!=""){
				if(!Number.isSafeInteger(Number(data[3]))){
					error[3]="notsafe"
				}
				else{
					newLine.animation.contents[0].pause=Number(data[3]);
				}
				
			}
			newLine.animation.contents[0].shake=data[4];
			write[getIFromPref(player.uuid)].contents.push(newLine);
			for(i=0;i<error.length-1;i++){
				if(error[i]!=false){
					let errortext="以下参数不正确\n";
					if(error[0]=="empty"){
						errortext=errortext+"标题不能为空\n";
					}
					else if(error[0]=="exist"){
						errortext=errortext+"标题已存在\n"
					}
					if(error[1]=="empty"){
						errortext=errortext+"长度限制不能为空\n";
					}
					else if(error[1]=="notsafe"){
						errortext=errortext+"长度限制格式不正确\n";
					}
					if(error[2]){
						errortext=errortext+"内容不能为空\n";
					}
					if(error[3]=="empty"){
						errortext=errortext+"停留时间不能为空\n";
					}
					else if(error[3]=="notsafe"){
						errortext=errortext+"停留时间格式不正确\n";
					}
					player.sendModalForm("参数错误",errortext,"继续","继续",(player,result)=>{
						playerCustomNewItem_roll(player);
					})
					errors=true;
					break;
				}
			}
			if(!errors){
				individualcontents.set("data",write);
				RefreshPrefIndexCache()
				playerChooseNewItemAnimation(player);
			}
			
		}
		else{
			playerChooseNewItemAnimation(player);
		}
	})
}

//ui结束


function colortonum(str){
	let color_array = "0123456789abcdefg";
	if (str.length === 1) {
		let index = color_array.indexOf(str);
		if (index !== -1) {
			return index;
		}
	}
}
function numtocolor(num){
	let color_array = "0123456789abcdefg";
	return color_array[num];
}
module.exports={
    mainform,
    numtocolor,
    colortonum
}