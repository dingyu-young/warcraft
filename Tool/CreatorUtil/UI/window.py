# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'window.ui'
#
# Created by: PyQt5 UI code generator 5.15.4
#
# WARNING: Any manual changes made to this file will be lost when pyuic5 is
# run again.  Do not edit this file unless you know what you are doing.


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_MainWindow(object):
    def setupUi(self, MainWindow):
        MainWindow.setObjectName("MainWindow")
        MainWindow.resize(1011, 695)
        self.centralwidget = QtWidgets.QWidget(MainWindow)
        self.centralwidget.setObjectName("centralwidget")
        self.horizontalLayoutWidget = QtWidgets.QWidget(self.centralwidget)
        self.horizontalLayoutWidget.setGeometry(QtCore.QRect(30, 10, 271, 55))
        self.horizontalLayoutWidget.setObjectName("horizontalLayoutWidget")
        self.layout_excel = QtWidgets.QHBoxLayout(self.horizontalLayoutWidget)
        self.layout_excel.setSizeConstraint(QtWidgets.QLayout.SetDefaultConstraint)
        self.layout_excel.setContentsMargins(0, 10, 0, 10)
        self.layout_excel.setObjectName("layout_excel")
        self.label = QtWidgets.QLabel(self.horizontalLayoutWidget)
        font = QtGui.QFont()
        font.setFamily("Adobe Arabic")
        font.setPointSize(16)
        self.label.setFont(font)
        self.label.setObjectName("label")
        self.layout_excel.addWidget(self.label)
        self.edit_excel = QtWidgets.QPlainTextEdit(self.horizontalLayoutWidget)
        self.edit_excel.setMinimumSize(QtCore.QSize(150, 35))
        font = QtGui.QFont()
        font.setFamily("Adobe Arabic")
        font.setPointSize(15)
        font.setBold(True)
        font.setWeight(75)
        self.edit_excel.setFont(font)
        self.edit_excel.setObjectName("edit_excel")
        self.layout_excel.addWidget(self.edit_excel)
        self.horizontalLayoutWidget_2 = QtWidgets.QWidget(self.centralwidget)
        self.horizontalLayoutWidget_2.setGeometry(QtCore.QRect(30, 60, 271, 55))
        self.horizontalLayoutWidget_2.setObjectName("horizontalLayoutWidget_2")
        self.layout_path = QtWidgets.QHBoxLayout(self.horizontalLayoutWidget_2)
        self.layout_path.setSizeConstraint(QtWidgets.QLayout.SetDefaultConstraint)
        self.layout_path.setContentsMargins(0, 10, 0, 10)
        self.layout_path.setObjectName("layout_path")
        self.label_2 = QtWidgets.QLabel(self.horizontalLayoutWidget_2)
        font = QtGui.QFont()
        font.setFamily("Adobe Arabic")
        font.setPointSize(16)
        self.label_2.setFont(font)
        self.label_2.setObjectName("label_2")
        self.layout_path.addWidget(self.label_2)
        self.edit_path = QtWidgets.QPlainTextEdit(self.horizontalLayoutWidget_2)
        self.edit_path.setMinimumSize(QtCore.QSize(150, 35))
        font = QtGui.QFont()
        font.setFamily("Adobe Arabic")
        font.setPointSize(15)
        font.setBold(True)
        font.setWeight(75)
        self.edit_path.setFont(font)
        self.edit_path.setObjectName("edit_path")
        self.layout_path.addWidget(self.edit_path)
        self.horizontalLayoutWidget_3 = QtWidgets.QWidget(self.centralwidget)
        self.horizontalLayoutWidget_3.setGeometry(QtCore.QRect(30, 160, 271, 51))
        self.horizontalLayoutWidget_3.setObjectName("horizontalLayoutWidget_3")
        self.layout_type = QtWidgets.QHBoxLayout(self.horizontalLayoutWidget_3)
        self.layout_type.setSizeConstraint(QtWidgets.QLayout.SetDefaultConstraint)
        self.layout_type.setContentsMargins(0, 10, 0, 10)
        self.layout_type.setObjectName("layout_type")
        self.label_3 = QtWidgets.QLabel(self.horizontalLayoutWidget_3)
        self.label_3.setMaximumSize(QtCore.QSize(80, 16777215))
        font = QtGui.QFont()
        font.setFamily("Adobe Arabic")
        font.setPointSize(16)
        self.label_3.setFont(font)
        self.label_3.setObjectName("label_3")
        self.layout_type.addWidget(self.label_3)
        self.comboBox = QtWidgets.QComboBox(self.horizontalLayoutWidget_3)
        self.comboBox.setMinimumSize(QtCore.QSize(0, 30))
        self.comboBox.setObjectName("comboBox")
        self.layout_type.addWidget(self.comboBox)
        self.horizontalLayoutWidget_4 = QtWidgets.QWidget(self.centralwidget)
        self.horizontalLayoutWidget_4.setGeometry(QtCore.QRect(30, 110, 271, 60))
        self.horizontalLayoutWidget_4.setObjectName("horizontalLayoutWidget_4")
        self.layout_codepath = QtWidgets.QHBoxLayout(self.horizontalLayoutWidget_4)
        self.layout_codepath.setSizeConstraint(QtWidgets.QLayout.SetDefaultConstraint)
        self.layout_codepath.setContentsMargins(0, 10, 0, 10)
        self.layout_codepath.setObjectName("layout_codepath")
        self.label_4 = QtWidgets.QLabel(self.horizontalLayoutWidget_4)
        font = QtGui.QFont()
        font.setFamily("Adobe Arabic")
        font.setPointSize(16)
        self.label_4.setFont(font)
        self.label_4.setObjectName("label_4")
        self.layout_codepath.addWidget(self.label_4)
        self.edit_codepath = QtWidgets.QPlainTextEdit(self.horizontalLayoutWidget_4)
        self.edit_codepath.setMinimumSize(QtCore.QSize(150, 35))
        font = QtGui.QFont()
        font.setFamily("Adobe Arabic")
        font.setPointSize(15)
        font.setBold(True)
        font.setWeight(75)
        self.edit_codepath.setFont(font)
        self.edit_codepath.setObjectName("edit_codepath")
        self.layout_codepath.addWidget(self.edit_codepath)
        self.scroll = QtWidgets.QScrollArea(self.centralwidget)
        self.scroll.setGeometry(QtCore.QRect(660, 10, 320, 411))
        self.scroll.setContextMenuPolicy(QtCore.Qt.ActionsContextMenu)
        self.scroll.setWidgetResizable(True)
        self.scroll.setObjectName("scroll")
        self.contents = QtWidgets.QWidget()
        self.contents.setEnabled(True)
        self.contents.setGeometry(QtCore.QRect(0, 0, 301, 1200))
        self.contents.setMinimumSize(QtCore.QSize(200, 1200))
        self.contents.setContextMenuPolicy(QtCore.Qt.CustomContextMenu)
        self.contents.setObjectName("contents")
        self.verticalLayoutWidget = QtWidgets.QWidget(self.contents)
        self.verticalLayoutWidget.setGeometry(QtCore.QRect(10, 20, 281, 51))
        self.verticalLayoutWidget.setObjectName("verticalLayoutWidget")
        self.log_layout = QtWidgets.QVBoxLayout(self.verticalLayoutWidget)
        self.log_layout.setSizeConstraint(QtWidgets.QLayout.SetFixedSize)
        self.log_layout.setContentsMargins(0, 0, 0, 0)
        self.log_layout.setObjectName("log_layout")
        self.log_3 = QtWidgets.QLabel(self.verticalLayoutWidget)
        self.log_3.setEnabled(True)
        self.log_3.setMinimumSize(QtCore.QSize(200, 20))
        self.log_3.setMaximumSize(QtCore.QSize(200, 40))
        font = QtGui.QFont()
        font.setFamily("宋体")
        font.setPointSize(12)
        self.log_3.setFont(font)
        self.log_3.setLayoutDirection(QtCore.Qt.LeftToRight)
        self.log_3.setScaledContents(False)
        self.log_3.setWordWrap(True)
        self.log_3.setObjectName("log_3")
        self.log_layout.addWidget(self.log_3)
        self.scroll.setWidget(self.contents)
        self.btn_excel = QtWidgets.QPushButton(self.centralwidget)
        self.btn_excel.setGeometry(QtCore.QRect(340, 20, 81, 31))
        font = QtGui.QFont()
        font.setFamily("方正粗圆简体")
        font.setPointSize(12)
        self.btn_excel.setFont(font)
        self.btn_excel.setObjectName("btn_excel")
        self.btn_psd = QtWidgets.QPushButton(self.centralwidget)
        self.btn_psd.setGeometry(QtCore.QRect(340, 70, 81, 31))
        font = QtGui.QFont()
        font.setFamily("方正粗圆简体")
        font.setPointSize(12)
        self.btn_psd.setFont(font)
        self.btn_psd.setObjectName("btn_psd")
        MainWindow.setCentralWidget(self.centralwidget)
        self.statusbar = QtWidgets.QStatusBar(MainWindow)
        self.statusbar.setObjectName("statusbar")
        MainWindow.setStatusBar(self.statusbar)
        self.menubar = QtWidgets.QMenuBar(MainWindow)
        self.menubar.setGeometry(QtCore.QRect(0, 0, 1011, 23))
        self.menubar.setObjectName("menubar")
        self.menuBy_dingyu = QtWidgets.QMenu(self.menubar)
        self.menuBy_dingyu.setObjectName("menuBy_dingyu")
        MainWindow.setMenuBar(self.menubar)
        self.menubar.addAction(self.menuBy_dingyu.menuAction())

        self.retranslateUi(MainWindow)
        QtCore.QMetaObject.connectSlotsByName(MainWindow)

    def retranslateUi(self, MainWindow):
        _translate = QtCore.QCoreApplication.translate
        MainWindow.setWindowTitle(_translate("MainWindow", "MainWindow"))
        self.label.setText(_translate("MainWindow", "表格路径"))
        self.edit_excel.setPlainText(_translate("MainWindow", "D:Work"))
        self.label_2.setText(_translate("MainWindow", "生成路径"))
        self.edit_path.setPlainText(_translate("MainWindow", "D:Work"))
        self.label_3.setText(_translate("MainWindow", "导出格式"))
        self.label_4.setText(_translate("MainWindow", "代码路径"))
        self.edit_codepath.setPlainText(_translate("MainWindow", "D:Work"))
        self.log_3.setText(_translate("MainWindow", "日志:"))
        self.btn_excel.setText(_translate("MainWindow", "导出表格"))
        self.btn_psd.setText(_translate("MainWindow", "导出PSD"))
        self.menuBy_dingyu.setTitle(_translate("MainWindow", "By-dingyu"))