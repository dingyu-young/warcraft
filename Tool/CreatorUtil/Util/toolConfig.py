from os import path

config = {}

#加载配置
def loadConfig():
    # p = path.abspath('.')
    # print(p)
    with open('AConfig\\config.txt', 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
        list = text.split("\n")
        for val in list:
            t = val.split("=")
            config[t[0]] = t[1]
#读取配置
def getConfig(str):
    return config[str]