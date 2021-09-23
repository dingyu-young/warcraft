from UI.window import Ui_MainWindow
from PyQt5 import QtCore, QtGui, QtWidgets
import time

class Log:
    ui: Ui_MainWindow
    index: int = 0
    logList = []

    @staticmethod
    def log(*args):
        text = " ".join(args)
        Log.addLog(text, "#000000")

    @staticmethod
    def logError(*args):
        text = " ".join(args)
        Log.addLog(text, "#ff0000")

    @staticmethod
    def logSuccess(*args):
        text = " ".join(args)
        Log.addLog(text, "#00ff00")

    # 日志输出,添加节点
    @staticmethod
    def addLog(text, type):
        if Log.index > 20:
            Log.clearLog()
        timestr = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        text = timestr + ":\n" + text
        if Log.index < len(Log.logList):
            logNode = Log.logList[Log.index]
        else:
            logNode = Log.newNode()
        logNode.show()
        Log.ui.log_layout.addWidget(logNode)
        Log.ui.scroll.setWidget(Log.ui.contents)
        Log.index += 1
        lable = '<span style=" color: %s;">%s</span>' % (type, text)
        logNode.setText('%s' % (lable))

    @staticmethod
    def clearLog():
        for i in range(0,10):
            n1 = Log.logList[i]
            n2 = Log.logList[i+10]
            n1.setText(n2.text())
            n2.hide()
            n1.show()
        # for node in Log.logList:
        #     node.hide()
        Log.index = 10
        Log.ui.scroll.setWidget(Log.ui.contents)

    @staticmethod
    def newNode():
        logNode = QtWidgets.QLabel(Log.ui.verticalLayoutWidget)
        logNode.setEnabled(True)
        logNode.setMinimumSize(QtCore.QSize(290, 20))
        logNode.setMaximumSize(QtCore.QSize(290, 40))
        logNode.setWordWrap(True)
        font = QtGui.QFont()
        font.setFamily("宋体")
        font.setPointSize(10)
        logNode.setFont(font)
        logNode.setLayoutDirection(QtCore.Qt.LeftToRight)
        Log.logList.append(logNode)
        return logNode