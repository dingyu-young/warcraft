from os import path
import os

config = {}


# 加载配置
def loadConfig():
    # p = path.abspath('.')
    # print(p)
    filePath='AConfig\\config.txt'
    if not os.path.exists(r'' + filePath):
        return
    with open(filePath, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
        list = text.split("\n")
        for val in list:
            t = val.split("=")
            config[t[0]] = t[1]


# 读取配置
def getConfig(str):
    if str not in config:
        return ""
    return config[str]
