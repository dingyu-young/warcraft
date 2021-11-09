import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;


@ccclass()
export class BMFontTool extends cc.Component {
    @property(cc.Node)
    fonts: cc.Node = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property
    fileName: string = "bmfont";

    @property({tooltip: "字体大小,需和text中字体一样"})
    fontSize: number = 20;

    @property({tooltip: "行高,需和text中字体一样"})
    fontHeight: number = 20;

    imgWidth: number = 512;

    protected onLoad(): void {
        this.node.getChildByName("btn").on("click", this.CreateBmFont, this);
    }


    protected start(): void {
        this.Init();
    }

    Init() {
        let charList: string[] = [];
        for (let i = 0; i < this.fonts.children.length; i++) {
            let font = this.fonts.children[i];
            if(!font.active){
                continue;
            }
            let text = font.getComponent(cc.Label).string;
            for (let j = 0; j < text.length; j++) {
                let char = text[j];
                if (!char || char == " " || charList.includes(char)) {//重复字符跳过
                    continue;
                }
                charList.push(char);
                let node = cc.instantiate(font);
                node.y = 0;
                node.zIndex = char.charCodeAt(0);
                node.getComponent(cc.Label).string = char;
                node.getComponent(cc.Label)["_forceUpdateRenderData"]();
                this.content.addChild(node);
            }
        }

        let layout = this.content.getComponent(cc.Layout);
        layout.type = cc.Layout.Type.HORIZONTAL;
        layout.updateLayout();
        let maxWidth = this.content.width + 10;//图片最大宽度
        let i = 2;
        while (maxWidth > 1024){
            maxWidth = maxWidth / i;
            i++;
        }
        this.imgWidth = Math.round(maxWidth);
        if (i > 2) {
            layout.type = cc.Layout.Type.GRID;
            this.content.width = this.imgWidth;
            layout.updateLayout();
        }
    }

    CreateBmFont() {
        //保存截图图片
        this.ScreenShot(this.content);
        //生成.fnt文件
        setTimeout(()=>{
            this.CreateFntFile();
        },0.1)

    }

    CreateFntFile() {
        let fnt = "";
        let width = this.content.width;
        let height = this.content.height;

        fnt += `info face=\"宋体\" size=${this.fontSize} bold=0 italic=0 charset=\"\" unicode=1 stretchH=100 smooth=1 aa=1 padding=0,0,0,0 spacing=1,1 outline=0\r\n`
        fnt += `common lineHeight=${this.fontHeight} base=${this.fontSize} scaleW=${this.content.width} scaleH=${this.content.height} pages=1 packed=0 alphaChnl=1 redChnl=0 greenChnl=0 blueChnl=0\r\n`
        fnt += `page id=0 file="${this.fileName}.png"\r\n`;
        fnt += `chars count=${this.content.children.length}\r\n`;

        for (let i = 0; i < this.content.children.length; i++) {
            let node = this.content.children[i];
            let char = node.getComponent(cc.Label).string;
            let ascii = char.charCodeAt(0);//ASCII码;
            let pos = node.getPosition();
            let w = node.width;//字符宽度
            let h = node.height;//字符高度
            let x = width / 2 + (pos.x - w / 2);//字符在图片中位置x
            let y = height / 2 - (pos.y + h / 2);//字符在图片中位置y
            fnt+=`char id=${ascii} x=${x.toFixed(1)} y=${y.toFixed(1)} width=${w.toFixed(1)} height=${h.toFixed(1)} xoffset=0 yoffset=-5 xadvance=${w.toFixed(1)} page=0 chnl=0\r\n`;
        }
        // cc.log("fnt内容:",fnt);
        this.saveForBrowser(fnt,this.fileName);
    }

    //截图并保存或下载图片
    ScreenShot(shotNode: cc.Node = null, call: Function = null) {
        let width = 0;
        let height = 0;
        let camera = cc.Camera.main;
        if (!shotNode) {
            let size = cc.winSize;
            width = size.width;
            height = size.height;
        } else {
            camera = shotNode.getComponent(cc.Camera);
            if (!camera)
                camera = shotNode.addComponent(cc.Camera);
            width = shotNode.width;
            height = shotNode.height;
        }
        let texture = new cc.RenderTexture();
        let gl = cc.game["_renderContext"];
        texture.initWithSize(width, height, gl.STENCIL_INDEX8);
        camera.zoomRatio = cc.winSize.height / height;
        camera.targetTexture = texture;
        if (shotNode) {
            shotNode.scaleY *= -1;
        } else {
            cc.Canvas.instance.node.scaleY *= -1;
        }
        camera.render(shotNode);
        if (shotNode) {
            shotNode.scaleY *= -1;
        } else {
            cc.Canvas.instance.node.scaleY *= -1
        }
        camera.targetTexture = null;

        let picData: Uint8Array = texture.readPixels();
        //截图完成后 删除照相机组件
        if (shotNode) {
            shotNode.removeComponent(cc.Camera);
        }
        //浏览器,直接调用下载
        if (cc.sys.isBrowser) {
            let canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            let context = canvas.getContext('2d');
            let imageData = context.createImageData(width, height);
            imageData.data.set(picData);
            context.putImageData(imageData, 0, 0);
            const base64 = canvas.toDataURL();
            const href = base64.replace(/^data:image[^;]*/, "data:image/octet-stream");
            // document.location.href = href;/
            //创建一个下载标签
            let link: HTMLElement = document.createElement('a');
            link.setAttribute("href", href);
            link.setAttribute("download", `${this.fileName}.png`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            //下载
            link.click();
            document.body.removeChild(link);
            cc.log("截图保存成功");
            return;
        }
        let sharePath = [jsb.fileUtils.getWritablePath(), this.fileName].join("");
        cc.log("图片保存路径:", sharePath);
        //如果有存在这个路径,则删除路径,再创建路径
        if (!jsb.fileUtils.isDirectoryExist(sharePath)) {
            if (!jsb.fileUtils.createDirectory(sharePath)) {
                cc.log("InitShareFile createDirectory(%s) fail", sharePath);
                return;
            }
        }

        let savePath = sharePath + "/" + this.fileName + '.png';
        cc.log("截图保存成功", savePath);
        let success = jsb.saveImageData(picData, texture.width, texture.height, savePath);
        if (success) {
            if (call) {
                call(savePath, texture);
            }
        } else {
            cc.log("截图失败")
        }
    }


    // 保存字符串内容到文件。
    // 效果相当于从浏览器下载了一个文件到本地。
    // textToWrite - 要保存的文件内容
    // fileNameToSaveAs - 要保存的文件名
    saveForBrowser(textToWrite, fileName) {
        if (cc.sys.isBrowser) {
            let textFileAsBlob = new Blob([textToWrite], {type: 'application/json'});
            let downloadLink = document.createElement("a");
            downloadLink.download = fileName + ".fnt";
            downloadLink.innerHTML = "Download File";
            if (window["webkitURL"] != null) {
                downloadLink.href = window["webkitURL"].createObjectURL(textFileAsBlob);
            } else {
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                downloadLink.onclick = fileName;
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
            }
            downloadLink.click();
            cc.log("fnt文件生成成功")
        }
    }


}