
from PyQt5.QtWidgets import QApplication
from PyQt5 import QtCore, QtWidgets

import sys

from ExcelUtil.ExcelTool import ExcelTool
from UI.window import Ui_MainWindow
from Util.cLog import Log
from Util.toolConfig import *


def initUI(ui):
    loadConfig()
    _translate = QtCore.QCoreApplication.translate
    ui.comboBox.addItem("Json:只导出一份")
    ui.comboBox.addItem("Json:一张xlsx导出一份")
    ui.comboBox.addItem("Json:每个类一份")
    ui.comboBox.addItem("Txt:只导出一份")
    ui.comboBox.addItem("Txt:一张xlsx导出一份")
    ui.comboBox.addItem("Txt:每个类一份")
    ui.edit_excel.setPlainText(_translate("MainWindow", getConfig("表格Excel路径")))
    ui.edit_path.setPlainText(_translate("MainWindow", getConfig("导出文件路径")))
    ui.comboBox.setCurrentIndex((int)(getConfig("生成格式")))
    # ui.edit_type.setPlainText(_translate("MainWindow", getConfig("生成格式")))
    ui.edit_codepath.setPlainText(_translate("MainWindow", getConfig("代码生成路径")))

if __name__ == '__main__':
    app = QApplication(sys.argv)
    mainWindow = QtWidgets.QMainWindow()
    ui = Ui_MainWindow()
    ui.setupUi(mainWindow)
    initUI(ui)
    mainWindow.show()
    Log.ui = ui
    excelTool = ExcelTool(ui)
    Log.log("欢迎使用")
    app.exec_()