import json

from UI.TkGui import TkGui
import time

#日志类
class Log:
    ui: TkGui
    index: int = 0
    logList = []

    @staticmethod
    def log(*args):
        text=""
        for val in args:
            text += json.dumps(val,ensure_ascii=False)
        Log.addLog(text, "")

    @staticmethod
    def logError(*args):
        text=""
        for val in args:
            text += json.dumps(val,ensure_ascii=False)
        Log.addLog(text, "red")

    @staticmethod
    def logSuccess(*args):
        text=""
        for val in args:
            text += json.dumps(val,ensure_ascii=False)
        Log.addLog(text, "green")

    # 日志输出,添加节点
    @staticmethod
    def addLog(text, type):
        if not hasattr(Log, "ui") or Log.ui == None :
            print(text)
            return
        timestr = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        text = timestr + ": " + text + "\n"
        Log.ui.addLog(text,type)


