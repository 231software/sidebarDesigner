let replace=require("./replacement");
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
	let newLength=removeColorCode(replace(contents[line].contents,player)).length;
	if(currentFrameOnLine>=0&&currentFrameOnLine<=contents[line].pause-2){
		cut=0;
		//log("位置前面的pause")
	}
	else if(currentFrameOnLine>=contents[line].pause-1&&currentFrameOnLine<=contents[line].pause-1+newLength-contents[line].length){
		cut=currentFrameOnLine-(contents[line].pause-1);
		//log("位置中间部分")
	}
	//后面的pause
	else if(currentFrameOnLine>=contents[line].pause+newLength-contents[line].length && currentFrameOnLine<=(contents[line].pause-1)*2+newLength-contents[line].length){
		cut=newLength-contents[line].length;
		//log("位置pause后面的");
	}
	else if(contents[line].shake  &&  currentFrameOnLine>(contents[line].pause-1)*2+newLength-contents[line].length  &&  currentFrameOnLine<=(contents[line].pause-1)*2+newLength-contents[line].length+newLength-contents[line].length){
		cut=(newLength-contents[line].length+1)-(currentFrameOnLine-((contents[line].pause-1)*2+newLength-contents[line].length))-1//-(contents[line].pause-1) //
		//log((contents[line].pause-1)*2+removeColorCode(contents[i].contents).length-contents[i].length+removeColorCode(contents[i].contents).length-contents[i].length-1)-(currentFrameOnLine-((contents[line].pause-1)*2+removeColorCode(contents[i].contents).length-contents[i].length))
		//log((contents[line].pause-1)*2+removeColorCode(contents[i].contents).length-contents[i].length+removeColorCode(contents[i].contents).length-contents[i].length-1);
		//log(currentFrameOnLine-((contents[line].pause-1)*2+removeColorCode(contents[i].contents).length-contents[i].length));
		//log("位置shake");//
		//log("cut:",cut);
	}
	else if(currentFrameOnLine>(contents[line].pause-1)*2+newLength-contents[i].length+newLength-contents[i].length-1){
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
	let connect = "§r"+replace(currentValue.contents,player);//算法决定了这里必须加颜色代码
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
module.exports=rollAniFrame;