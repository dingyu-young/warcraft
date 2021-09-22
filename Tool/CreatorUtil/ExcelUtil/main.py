# coding=UTF-8

from PyQt5.QtWidgets import *
from PyQt5 import QtCore, QtGui, QtWidgets

import sys

from ExcelUtil.ExcelTool import ExcelTool
from ExcelUtil.qtui.window import Ui_MainWindow


if __name__ == '__main__':
    app = QApplication(sys.argv)

    mainWindow = QtWidgets.QMainWindow()
    ui = Ui_MainWindow()
    ui.setupUi(mainWindow)
    mainWindow.show()
    excelTool = ExcelTool(ui)
    app.exec_()

