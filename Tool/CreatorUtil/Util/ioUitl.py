# coding=UTF-8
import json
import os.path
from pypinyin import lazy_pinyin

# 写入文件
from Util.cLog import Log


def writeToFile(data, filePath, fileName, type):
    if not os.path.exists(r'' + filePath):
        Log.log("创建文件目录:",filePath)
        os.makedirs(r'' + filePath)
    path = r'' + filePath + "\\" + fileName + "." + type
    with open(path, 'w', encoding='utf-8', errors='ignore') as f:
        f.write(data)

def createDir(path):
    if not os.path.exists(r'' + path):
        Log.log("创建文件目录:",path)
        os.makedirs(r'' + path)

# 获取json字符串
def getJsonStr(jsonObj):
    # return  json.dumps(jsonObj,indent=4,ensure_ascii=False)
    return  json.dumps(jsonObj,ensure_ascii=False)

#  读取代码模板
def readTemplate(path):
    if not os.path.exists(r"AConfig\\" + path):
        Log.logError("ts代码的模板文件不存在","AConfig\\",path)
        return None
    with open(r"AConfig\\" + path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()


# 获取中文转拼音
def getEnglish(name):
    list = lazy_pinyin(name)
    str = ""
    for val in list:
        str += val
    return str