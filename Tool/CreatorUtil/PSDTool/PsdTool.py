import json

from psd_tools import PSDImage
import re
import os.path

from PSDTool.Node import PSDInfo, Node
from Util.cLog import Log
from Util.ioUitl import createDir, writeToFile



def readPsd(psdPath="F:\\MyWork\\Config\\psd\\", name="我的职级1.psd", isall=False):
    psdFile = r'' + psdPath + name

    if not os.path.exists(psdFile):
        Log.logError("psd路径不存在:", psdPath + name)
        return
    Log.log("开始导出PSD")

    psdName = name.split(".")[0]
    savePath = psdPath + psdName
    jsonPath = savePath + "\\json"
    imgPath = savePath + "\\img"
    createDir(jsonPath)
    createDir(imgPath)
    Log.log("导出图片路径:", imgPath)
    psd = PSDImage.open(psdFile)
    psd.compose().save(imgPath + "\\exportpsd.png")
    # psd.composite().save(imgPath + "\\exportpsd.png")
    PSDInfo.width = psd.size[0]
    PSDInfo.height = psd.size[1]
    psddata = psd.descendants()
    psdNode = Node(None)
    nodeList = [psdNode]
    imgList = ["exportpsd"]

    dataList = list(psddata)
    for layer in dataList:
        if not isall and not layer.visible:
            continue
        if layer.height == 0 or layer.height == 0:
            continue
        layer.name = layer.name.replace(' ', '')
        node = Node(layer)
        if node.type == "cc.Sprite":
            reg = re.compile(r'[/:\'\"\\/|*&^%$@!()?<>,.‘“？，。：]')
            node.src = reg.sub("", node.src)
            name = imgPath + ('\\%s.png' % (node.src))
            try:
                layer.compose().save(name)
                imgList.append(node.src)
            except BaseException as e:
                Log.logError("图层",layer.name,"导出失败")
            # layer.composite().save(name)
        if node.type != "cc.Node":
            nodeList.append(node)
    saveNode(nodeList, imgList, jsonPath)


def saveNode(list, img, jsonpath):
    data = {}
    for i in range(len(list)):
        data[str(i)] = list[i].getJson()
    data["imgList"] = img
    j = json.dumps(data, ensure_ascii=False)
    writeToFile(j, jsonpath, "psdnode", "json")
    Log.logSuccess("PSD图片导出成功")


class PSDTool:

    def onClick(self,psdPath,psdName,allpsd):
        if not psdPath.endswith("\\"):
            psdPath = psdPath + "\\"
        psdName = psdName.split(".")[0]
        readPsd(psdPath, psdName + ".psd", allpsd == 1)
